// Framework types
export type {
  FrameworkType,
  UXTool,
  FrameworkStage,
  UXFramework,
  FrameworkLibrary
} from './framework';

// Workflow types
export type {
  PromptEngineeringMethod,
  PromptTemplate,
  PromptVariable,
  StageArtifact,
  WorkflowStage,
  Workflow,
  WorkflowExecution
} from './workflow';

// Project types
export type {
  ProjectStatus,
  CollaboratorRole,
  Collaborator,
  ProjectMetadata,
  Project,
  ProjectComment,
  ProjectVersion
} from './project';

// AI types
export type {
  AIProvider,
  AIConfiguration,
  AIParameters,
  AIRequest,
  AIResponse,
  AIRecommendation,
  AIUsageMetrics,
  ContextSummary
} from './ai';

// Legacy prompt type (for backward compatibility)
export type { Prompt } from './prompt';