-- Add project context and basic info fields to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS document_content TEXT,
ADD COLUMN IF NOT EXISTS framework_stage TEXT;

-- Update existing prompts to use project-level data if available
UPDATE public.generated_prompts gp
SET 
  project_context = jsonb_build_object(
    'productType', p.product_type,
    'industry', p.industry,
    'targetAudience', p.target_audience,
    'projectDescription', p.project_description,
    'documentContent', p.document_content
  )
FROM public.projects p
WHERE gp.project_id = p.id;

-- Update RLS policies to allow updating the new fields
CREATE POLICY "Users can update their project context"
ON public.projects
FOR UPDATE
USING (auth.uid() = user_id);
