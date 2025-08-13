import { StageArtifact, ContextSummary } from '@/types';

export interface ContextStore {
  artifacts: Map<string, StageArtifact>;
  summaries: Map<string, ContextSummary>;
  workflowContext: Map<string, any>;
}

export class WorkflowContextManager {
  private store: ContextStore;

  constructor() {
    this.store = {
      artifacts: new Map(),
      summaries: new Map(),
      workflowContext: new Map()
    };
  }

  // Artifact Management
  storeArtifact(stageId: string, artifact: StageArtifact): void {
    this.store.artifacts.set(stageId, artifact);
    this.generateContextSummary(stageId, artifact);
  }

  getArtifact(stageId: string): StageArtifact | undefined {
    return this.store.artifacts.get(stageId);
  }

  getAllArtifacts(): StageArtifact[] {
    return Array.from(this.store.artifacts.values());
  }

  // Context Summary Generation
  private async generateContextSummary(stageId: string, artifact: StageArtifact): Promise<void> {
    // Extract key insights from the artifact
    const keyInsights = this.extractKeyInsights(artifact.content);
    const actionableItems = this.extractActionableItems(artifact.content);

    const summary: ContextSummary = {
      id: `summary-${stageId}`,
      sourceStageId: stageId,
      summary: this.createSummary(artifact.content, 'medium'),
      keyInsights,
      actionableItems,
      method: 'automatic',
      length: 'medium',
      createdAt: new Date()
    };

    this.store.summaries.set(stageId, summary);
  }

  private extractKeyInsights(content: string): string[] {
    // Simple extraction logic - in production, this could use AI
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const insights: string[] = [];

    // Look for key phrases that indicate insights
    const insightIndicators = [
      'key finding',
      'important',
      'discovered',
      'revealed',
      'insight',
      'pattern',
      'trend'
    ];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (insightIndicators.some(indicator => lowerSentence.includes(indicator))) {
        insights.push(sentence.trim());
      }
    });

    return insights.slice(0, 5); // Limit to top 5 insights
  }

  private extractActionableItems(content: string): string[] {
    // Look for action-oriented phrases
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const actions: string[] = [];

    const actionIndicators = [
      'should',
      'need to',
      'must',
      'recommend',
      'suggest',
      'next step',
      'action',
      'implement'
    ];

    sentences.forEach(sentence => {
      const lowerSentence = sentence.toLowerCase();
      if (actionIndicators.some(indicator => lowerSentence.includes(indicator))) {
        actions.push(sentence.trim());
      }
    });

    return actions.slice(0, 3); // Limit to top 3 actions
  }

  private createSummary(content: string, length: 'short' | 'medium' | 'long'): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let targetLength: number;
    switch (length) {
      case 'short':
        targetLength = Math.min(2, sentences.length);
        break;
      case 'medium':
        targetLength = Math.min(4, sentences.length);
        break;
      case 'long':
        targetLength = Math.min(8, sentences.length);
        break;
    }

    // Simple summarization - take first N sentences
    // In production, this could use AI for better summarization
    return sentences.slice(0, targetLength).join('. ') + '.';
  }

  // Context Chaining
  buildContextChain(workflowStages: string[]): string {
    const contextParts: string[] = [];

    workflowStages.forEach(stageId => {
      const summary = this.store.summaries.get(stageId);
      if (summary) {
        contextParts.push(`Stage ${stageId}: ${summary.summary}`);
        
        if (summary.keyInsights.length > 0) {
          contextParts.push(`Key insights: ${summary.keyInsights.join('; ')}`);
        }
      }
    });

    return contextParts.join('\n\n');
  }

  getContextForStage(stageId: string, priorStages: string[]): string {
    const relevantContext: string[] = [];

    priorStages.forEach(priorStageId => {
      const summary = this.store.summaries.get(priorStageId);
      if (summary) {
        relevantContext.push(`From ${priorStageId}: ${summary.summary}`);
      }
    });

    return relevantContext.join('\n');
  }

  // Workflow Context Management
  setWorkflowContext(key: string, value: any): void {
    this.store.workflowContext.set(key, value);
  }

  getWorkflowContext(key: string): any {
    return this.store.workflowContext.get(key);
  }

  getAllWorkflowContext(): Record<string, any> {
    return Object.fromEntries(this.store.workflowContext);
  }

  // Persistence
  exportContext(): string {
    return JSON.stringify({
      artifacts: Array.from(this.store.artifacts.entries()),
      summaries: Array.from(this.store.summaries.entries()),
      workflowContext: Array.from(this.store.workflowContext.entries())
    });
  }

  importContext(contextData: string): void {
    try {
      const data = JSON.parse(contextData);
      
      this.store.artifacts = new Map(data.artifacts || []);
      this.store.summaries = new Map(data.summaries || []);
      this.store.workflowContext = new Map(data.workflowContext || []);
    } catch (error) {
      console.error('Failed to import context data:', error);
    }
  }

  // Cleanup
  clearWorkflowContext(): void {
    this.store.artifacts.clear();
    this.store.summaries.clear();
    this.store.workflowContext.clear();
  }

  removeStageContext(stageId: string): void {
    this.store.artifacts.delete(stageId);
    this.store.summaries.delete(stageId);
  }
}

// Global context manager instance
export const contextManager = new WorkflowContextManager();