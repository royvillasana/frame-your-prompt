import { PromptEngineeringMethod } from './workflow';

export type AIProvider = 'openai' | 'anthropic' | 'google' | 'custom';

export interface AIConfiguration {
  provider: AIProvider;
  apiKey?: string;
  endpoint?: string;
  model: string;
  parameters: AIParameters;
}

export interface AIParameters {
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface AIRequest {
  prompt: string;
  method: PromptEngineeringMethod;
  context?: string[];
  variables: Record<string, any>;
  configuration: AIConfiguration;
  metadata: {
    frameworkType: string;
    stageId: string;
    toolId: string;
    projectId: string;
  };
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  processingTime: number;
  model: string;
  confidence?: number;
  suggestions?: string[];
  metadata: {
    requestId: string;
    timestamp: Date;
    method: PromptEngineeringMethod;
  };
}

export interface AIRecommendation {
  type: 'stage' | 'tool' | 'template' | 'method';
  title: string;
  description: string;
  confidence: number;
  rationale: string;
  targetId: string;
  category: string;
  estimatedImpact: 'low' | 'medium' | 'high';
}

export interface AIUsageMetrics {
  totalRequests: number;
  totalTokens: number;
  averageResponseTime: number;
  successRate: number;
  costEstimate: number;
  period: {
    start: Date;
    end: Date;
  };
  byProvider: Record<AIProvider, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export interface ContextSummary {
  id: string;
  sourceStageId: string;
  summary: string;
  keyInsights: string[];
  actionableItems: string[];
  method: 'automatic' | 'manual';
  length: 'short' | 'medium' | 'long';
  createdAt: Date;
}