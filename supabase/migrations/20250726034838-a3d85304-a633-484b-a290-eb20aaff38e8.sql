-- Update the AI usage check function to include only the working models
CREATE OR REPLACE FUNCTION public.check_and_update_ai_usage(p_user_id uuid, p_ai_model text, p_is_registered boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_usage INTEGER := 0;
  v_daily_limit INTEGER := 50;
  v_can_use BOOLEAN := false;
  v_remaining INTEGER := 0;
BEGIN
  -- Set limit based on registration status and model type
  IF p_is_registered THEN
    -- Registered users get higher limits for free models, unlimited for premium
    CASE p_ai_model
      -- Free working model
      WHEN 'llama-3.1-8b' THEN v_daily_limit := 100;
      
      -- Premium models (with API keys)
      WHEN 'gpt-4o-mini' THEN v_daily_limit := 999999;
      WHEN 'llama-3.1-sonar-small-128k-online' THEN v_daily_limit := 50;
      
      -- Default for any new models
      ELSE v_daily_limit := 999999;
    END CASE;
  ELSE
    -- Non-registered users get basic limits for free models
    CASE p_ai_model
      -- Free working model
      WHEN 'llama-3.1-8b' THEN v_daily_limit := 50;
      
      -- Premium models not available for non-registered
      ELSE v_daily_limit := 0;
    END CASE;
  END IF;

  -- Get or create usage record for today
  INSERT INTO public.ai_usage (user_id, ai_model, prompts_used, daily_limit, last_reset_date)
  VALUES (p_user_id, p_ai_model, 0, v_daily_limit, CURRENT_DATE)
  ON CONFLICT (user_id, ai_model, last_reset_date)
  DO UPDATE SET 
    daily_limit = v_daily_limit,
    updated_at = now()
  RETURNING prompts_used INTO v_current_usage;

  -- Check if user can still use this AI
  v_remaining := v_daily_limit - v_current_usage;
  v_can_use := v_remaining > 0;

  -- If user can use, increment the counter
  IF v_can_use THEN
    UPDATE public.ai_usage 
    SET prompts_used = prompts_used + 1,
        updated_at = now()
    WHERE user_id = p_user_id 
      AND ai_model = p_ai_model 
      AND last_reset_date = CURRENT_DATE;
    
    v_remaining := v_remaining - 1;
  END IF;

  RETURN jsonb_build_object(
    'can_use', v_can_use,
    'remaining', v_remaining,
    'daily_limit', v_daily_limit,
    'current_usage', CASE WHEN v_can_use THEN v_current_usage + 1 ELSE v_current_usage END
  );
END;
$function$;