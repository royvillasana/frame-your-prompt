export interface PromptVariable {
  id?: string;
  name: string;
  description?: string;
  defaultValue?: string;
  isRequired: boolean;
}

export interface CustomPrompt {
  id?: string;
  title: string;
  content: string;
  project_id?: string;  // Now matches the TEXT type in the database
  platform?: string;
  notes?: string;
  tags?: string[];
  variables?: PromptVariable[];
  is_public?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export const PLATFORMS = [
  'OpenAI',
  'Anthropic',
  'Google AI',
  'Hugging Face',
  'Custom',
  'Other'
] as const;

export type PlatformType = typeof PLATFORMS[number];
