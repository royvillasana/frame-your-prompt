-- Actualizar la función para manejar límites mensuales en lugar de diarios
CREATE OR REPLACE FUNCTION public.check_and_update_ai_usage(p_user_id uuid, p_ai_model text, p_is_registered boolean DEFAULT true, p_has_api_key boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_usage INTEGER := 0;
  v_monthly_limit INTEGER := 50;
  v_can_use BOOLEAN := false;
  v_remaining INTEGER := 0;
  v_current_month TEXT;
BEGIN
  -- Get current year-month for tracking
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Set limit based on user type and registration status
  IF NOT p_is_registered THEN
    -- Non-registered users get very limited access
    v_monthly_limit := 2;
  ELSIF p_is_registered AND NOT p_has_api_key THEN
    -- Registered users without API key get limited access
    v_monthly_limit := 6;
  ELSE
    -- Registered users with API key get unlimited access
    v_monthly_limit := 999999;
  END IF;

  -- Get or create usage record for current month
  INSERT INTO public.ai_usage (user_id, ai_model, prompts_used, daily_limit, last_reset_date)
  VALUES (p_user_id, p_ai_model, 0, v_monthly_limit, CURRENT_DATE)
  ON CONFLICT (user_id, ai_model, last_reset_date)
  DO UPDATE SET 
    daily_limit = v_monthly_limit,
    updated_at = now()
  RETURNING prompts_used INTO v_current_usage;

  -- Reset usage if we're in a new month
  IF NOT EXISTS (
    SELECT 1 FROM public.ai_usage 
    WHERE user_id = p_user_id 
      AND ai_model = p_ai_model 
      AND TO_CHAR(last_reset_date, 'YYYY-MM') = v_current_month
  ) THEN
    -- Reset for new month
    UPDATE public.ai_usage 
    SET prompts_used = 0,
        daily_limit = v_monthly_limit,
        last_reset_date = CURRENT_DATE,
        updated_at = now()
    WHERE user_id = p_user_id 
      AND ai_model = p_ai_model;
    
    v_current_usage := 0;
  END IF;

  -- Check if user can still use this AI
  v_remaining := v_monthly_limit - v_current_usage;
  v_can_use := v_remaining > 0;

  -- If user can use, increment the counter
  IF v_can_use THEN
    UPDATE public.ai_usage 
    SET prompts_used = prompts_used + 1,
        updated_at = now()
    WHERE user_id = p_user_id 
      AND ai_model = p_ai_model 
      AND TO_CHAR(last_reset_date, 'YYYY-MM') = v_current_month;
    
    v_remaining := v_remaining - 1;
  END IF;

  RETURN jsonb_build_object(
    'can_use', v_can_use,
    'remaining', v_remaining,
    'monthly_limit', v_monthly_limit,
    'current_usage', CASE WHEN v_can_use THEN v_current_usage + 1 ELSE v_current_usage END,
    'user_type', CASE 
      WHEN NOT p_is_registered THEN 'guest'
      WHEN p_is_registered AND NOT p_has_api_key THEN 'registered_free'
      ELSE 'registered_premium'
    END,
    'reset_period', 'monthly'
  );
END;
$function$;

-- Actualizar la función de reset para ser mensual
CREATE OR REPLACE FUNCTION public.reset_monthly_ai_limits()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Reset counts for all users where the last reset month is not current month
  UPDATE public.ai_usage 
  SET prompts_used = 0, 
      last_reset_date = CURRENT_DATE,
      updated_at = now()
  WHERE TO_CHAR(last_reset_date, 'YYYY-MM') < TO_CHAR(CURRENT_DATE, 'YYYY-MM');
END;
$function$;