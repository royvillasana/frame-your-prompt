import { FrameworkType, UXTool } from './framework';

export type PromptEngineeringMethod = 
  | 'zero-shot'
  | 'few-shot'
  | 'chain-of-thought'
  | 'instruction-tuning'
  | 'role-playing'
  | 'step-by-step';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: PromptVariable[];
  method: PromptEngineeringMethod;
  examples?: string[];
  category: string;
  tags: string[];
}

export interface PromptVariable {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'context';
  required: boolean;
  description: string;
  defaultValue?: any;
  options?: string[];
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface StageArtifact {
  id: string;
  stageId: string;
  content: string;
  summary: string;
  metadata: {
    toolUsed: string;
    method: PromptEngineeringMethod;
    createdAt: Date;
    modifiedAt: Date;
    version: number;
  };
  rawPrompt: string;
  aiResponse: string;
  userEdits?: string[];
}

export interface WorkflowStage {
  id: string;
  frameworkStageId: string;
  order: number;
  selectedTool?: UXTool;
  promptTemplate?: PromptTemplate;
  artifact?: StageArtifact;
  isCompleted: boolean;
  isSkipped: boolean;
  customizations: {
    name?: string;
    description?: string;
    estimatedTime?: string;
  };
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  frameworkType: FrameworkType;
  stages: WorkflowStage[];
  contextChain: string[];
  metadata: {
    createdAt: Date;
    modifiedAt: Date;
    completedStages: number;
    totalStages: number;
    estimatedDuration: string;
    actualDuration?: string;
  };
  settings: {
    allowStageSkipping: boolean;
    autoGenerateContext: boolean;
    contextSummaryLength: 'short' | 'medium' | 'long';
  };
}

export interface WorkflowExecution {
  workflowId: string;
  currentStageId: string;
  contextStore: Record<string, any>;
  progress: {
    completedStages: string[];
    currentStage: string;
    nextStages: string[];
  };
}