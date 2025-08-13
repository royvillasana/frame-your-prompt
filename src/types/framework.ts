export type FrameworkType = 
  | 'design-thinking'
  | 'double-diamond'
  | 'google-design-sprint'
  | 'human-centered-design'
  | 'jobs-to-be-done'
  | 'lean-ux'
  | 'agile-ux'
  | 'heart'
  | 'hooked-model';

export interface UXTool {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  artifacts: string[];
}

export interface FrameworkStage {
  id: string;
  name: string;
  description: string;
  purpose: string;
  order: number;
  tools: UXTool[];
  recommendedDuration: string;
  inputRequirements: string[];
  expectedOutputs: string[];
}

export interface UXFramework {
  id: FrameworkType;
  name: string;
  description: string;
  category: 'process' | 'metrics' | 'behavioral';
  stages: FrameworkStage[];
  totalDuration: string;
  bestUseCases: string[];
  complexity: 'beginner' | 'intermediate' | 'advanced';
}

export interface FrameworkLibrary {
  frameworks: Record<FrameworkType, UXFramework>;
  getFramework: (type: FrameworkType) => UXFramework;
  getStage: (frameworkType: FrameworkType, stageId: string) => FrameworkStage | null;
  getTool: (frameworkType: FrameworkType, stageId: string, toolId: string) => UXTool | null;
  searchTools: (query: string) => UXTool[];
}