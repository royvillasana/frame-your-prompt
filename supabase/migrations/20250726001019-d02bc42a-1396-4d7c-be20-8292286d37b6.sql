-- Create table for tracking AI usage
CREATE TABLE public.ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  ai_model TEXT NOT NULL,
  prompts_used INTEGER NOT NULL DEFAULT 0,
  daily_limit INTEGER NOT NULL DEFAULT 5,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AI usage" 
ON public.ai_usage 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage" 
ON public.ai_usage 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI usage" 
ON public.ai_usage 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate records per user/model/date
CREATE UNIQUE INDEX idx_ai_usage_user_model_date 
ON public.ai_usage (user_id, ai_model, last_reset_date);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_ai_usage_updated_at
BEFORE UPDATE ON public.ai_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to reset daily limits
CREATE OR REPLACE FUNCTION reset_daily_ai_limits()
RETURNS void AS $$
BEGIN
  -- Reset counts for all users where the last reset date is not today
  UPDATE public.ai_usage 
  SET prompts_used = 0, 
      last_reset_date = CURRENT_DATE,
      updated_at = now()
  WHERE last_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Create function to check and update AI usage
CREATE OR REPLACE FUNCTION check_and_update_ai_usage(
  p_user_id UUID,
  p_ai_model TEXT,
  p_is_registered BOOLEAN DEFAULT true
)
RETURNS JSONB AS $$
DECLARE
  v_current_usage INTEGER := 0;
  v_daily_limit INTEGER := 5;
  v_can_use BOOLEAN := false;
  v_remaining INTEGER := 0;
BEGIN
  -- Set limit based on registration status
  IF p_is_registered THEN
    -- Registered users get higher limits based on AI model
    CASE p_ai_model
      WHEN 'gpt-4o-mini' THEN v_daily_limit := 50;
      WHEN 'gemini-1.5-flash' THEN v_daily_limit := 100;
      WHEN 'claude-3-haiku' THEN v_daily_limit := 30;
      ELSE v_daily_limit := 25;
    END CASE;
  ELSE
    -- Non-registered users get 5 prompts
    v_daily_limit := 5;
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
$$ LANGUAGE plpgsql SECURITY DEFINER;