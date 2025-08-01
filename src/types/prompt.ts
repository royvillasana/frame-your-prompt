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
  projectId?: string;
  platform?: string;
  notes?: string;
  tags?: string[];
  variables?: PromptVariable[];
  isPublic?: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
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
