-- Add perplexity_api_key column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN perplexity_api_key TEXT;