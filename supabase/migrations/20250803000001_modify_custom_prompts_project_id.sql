-- Make project_id optional and change its type to TEXT
ALTER TABLE public.custom_prompts 
  DROP CONSTRAINT IF EXISTS custom_prompts_project_id_fkey,
  ALTER COLUMN project_id TYPE TEXT,
  ALTER COLUMN project_id DROP NOT NULL,
  ALTER COLUMN project_id SET DEFAULT 'custom_prompt';

-- Update the index to work with TEXT
DROP INDEX IF EXISTS idx_custom_prompts_project_id;
CREATE INDEX idx_custom_prompts_project_id ON public.custom_prompts(project_id);
