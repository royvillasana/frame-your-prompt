-- Update the check_and_update_ai_usage function to support all AI models
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
    -- Registered users get different limits based on model type
    -- Premium models (require API key) get unlimited usage for registered users
    -- Free models get unlimited usage for registered users
    CASE p_ai_model
      -- OpenAI Models
      WHEN 'gpt-4o-mini' THEN v_daily_limit := 999999;
      WHEN 'gpt-4o' THEN v_daily_limit := 999999;
      WHEN 'gpt-4.1' THEN v_daily_limit := 999999;
      WHEN 'gpt-4.1-mini' THEN v_daily_limit := 999999;
      -- Google Gemini Models
      WHEN 'gemini-1.5-flash' THEN v_daily_limit := 999999;
      WHEN 'gemini-1.5-pro' THEN v_daily_limit := 999999;
      WHEN 'gemini-2.0-flash' THEN v_daily_limit := 999999;
      WHEN 'gemini-2.5-flash' THEN v_daily_limit := 999999;
      WHEN 'gemini-2.5-pro' THEN v_daily_limit := 999999;
      -- Anthropic Claude Models
      WHEN 'claude-3-haiku' THEN v_daily_limit := 999999;
      WHEN 'claude-3.5-haiku' THEN v_daily_limit := 999999;
      WHEN 'claude-3.5-sonnet' THEN v_daily_limit := 999999;
      WHEN 'claude-3.7-sonnet' THEN v_daily_limit := 999999;
      WHEN 'claude-sonnet-4' THEN v_daily_limit := 999999;
      WHEN 'claude-opus-4' THEN v_daily_limit := 999999;
      -- Default for any new models
      ELSE v_daily_limit := 999999;
    END CASE;
  ELSE
    -- Non-registered users get 50 prompts per month for all models
    v_daily_limit := 50;
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