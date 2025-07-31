-- Add missing columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS product_type TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS project_description TEXT,
ADD COLUMN IF NOT EXISTS document_content TEXT,
ADD COLUMN IF NOT EXISTS selected_framework TEXT,
ADD COLUMN IF NOT EXISTS framework_stage TEXT;

-- Set default values for existing rows
UPDATE public.projects
SET 
  product_type = COALESCE(product_type, ''),
  industry = COALESCE(industry, ''),
  target_audience = COALESCE(target_audience, ''),
  project_description = COALESCE(project_description, ''),
  document_content = COALESCE(document_content, ''),
  selected_framework = COALESCE(selected_framework, 'None'),
  framework_stage = COALESCE(framework_stage, '');

-- Add any necessary constraints
ALTER TABLE public.projects ALTER COLUMN selected_framework SET DEFAULT 'None';
