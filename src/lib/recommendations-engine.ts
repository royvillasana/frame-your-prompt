import { AIRecommendation, FrameworkType, UXTool, PromptTemplate, Workflow, StageArtifact } from '@/types';
import { frameworkLibrary } from './framework-library';
import { promptEngine } from './prompt-engine';

export interface RecommendationContext {
  currentFramework?: FrameworkType;
  currentStage?: string;
  completedStages: string[];
  projectContext?: {
    domain: string;
    complexity: 'simple' | 'medium' | 'complex';
    timeline: 'tight' | 'moderate' | 'flexible';
    teamSize: 'solo' | 'small' | 'large';
  };
  userHistory?: {
    preferredMethods: string[];
    skillLevel: 'beginner' | 'intermediate' | 'expert';
    pastFrameworks: FrameworkType[];
  };
}

export class RecommendationsEngine {
  
  // Framework Recommendations
  recommendFramework(context: RecommendationContext): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    if (!context.projectContext) {
      return this.getDefaultFrameworkRecommendations();
    }

    const { domain, complexity, timeline, teamSize } = context.projectContext;

    // Recommend based on project characteristics
    if (timeline === 'tight') {
      recommendations.push({
        type: 'stage',
        title: 'Google Design Sprint',
        description: 'Perfect for tight timelines - get results in just 5 days',
        confidence: 0.9,
        rationale: 'Google Design Sprint is specifically designed for rapid decision-making and validation within a week',
        targetId: 'google-design-sprint',
        category: 'framework',
        estimatedImpact: 'high'
      });
    }

    if (complexity === 'complex' || domain.includes('enterprise')) {
      recommendations.push({
        type: 'stage',
        title: 'Double Diamond',
        description: 'Comprehensive approach for complex problems',
        confidence: 0.85,
        rationale: 'Double Diamond provides thorough exploration and definition phases ideal for complex challenges',
        targetId: 'double-diamond',
        category: 'framework',
        estimatedImpact: 'high'
      });
    }

    if (teamSize === 'large' || domain.includes('agile')) {
      recommendations.push({
        type: 'stage',
        title: 'Agile UX',
        description: 'Integrates seamlessly with development cycles',
        confidence: 0.8,
        rationale: 'Agile UX is designed for cross-functional teams and iterative development',
        targetId: 'agile-ux',
        category: 'framework',
        estimatedImpact: 'medium'
      });
    }

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Stage Recommendations
  recommendNextStage(workflow: Workflow, context: RecommendationContext): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const framework = frameworkLibrary[workflow.frameworkType];
    
    if (!framework) return recommendations;

    const completedStageIds = workflow.stages
      .filter(stage => stage.isCompleted)
      .map(stage => stage.frameworkStageId);

    const nextStages = framework.stages.filter(stage => 
      !completedStageIds.includes(stage.id) &&
      this.arePrerequisitesMet(stage, completedStageIds, framework.stages)
    );

    nextStages.forEach(stage => {
      const confidence = this.calculateStageConfidence(stage, context);
      
      recommendations.push({
        type: 'stage',
        title: `Next: ${stage.name}`,
        description: stage.description,
        confidence,
        rationale: this.generateStageRationale(stage, context),
        targetId: stage.id,
        category: 'next-stage',
        estimatedImpact: this.estimateStageImpact(stage, context)
      });
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Tool Recommendations
  recommendTools(stageId: string, frameworkType: FrameworkType, context: RecommendationContext): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const framework = frameworkLibrary[frameworkType];
    const stage = framework?.stages.find(s => s.id === stageId);

    if (!stage) return recommendations;

    // Score tools based on context
    stage.tools.forEach(tool => {
      const confidence = this.calculateToolConfidence(tool, context);
      
      if (confidence > 0.3) { // Only recommend tools with reasonable confidence
        recommendations.push({
          type: 'tool',
          title: tool.name,
          description: tool.description,
          confidence,
          rationale: this.generateToolRationale(tool, context),
          targetId: tool.id,
          category: tool.category,
          estimatedImpact: this.mapDifficultyToImpact(tool.difficulty)
        });
      }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Template Recommendations
  recommendPromptTemplates(toolId: string, context: RecommendationContext): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const templates = promptEngine.getUXPromptTemplates();

    // Find templates relevant to the tool or context
    templates.forEach(template => {
      const relevanceScore = this.calculateTemplateRelevance(template, toolId, context);
      
      if (relevanceScore > 0.4) {
        recommendations.push({
          type: 'template',
          title: template.name,
          description: template.description,
          confidence: relevanceScore,
          rationale: `This template is well-suited for ${template.category.toLowerCase()} activities`,
          targetId: template.id,
          category: template.category,
          estimatedImpact: 'medium'
        });
      }
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Method Recommendations
  recommendPromptMethods(templateId: string, context: RecommendationContext): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];
    const userLevel = context.userHistory?.skillLevel || 'intermediate';

    const methodRecommendations = [
      {
        method: 'instruction-tuning',
        confidence: 0.8,
        rationale: 'Provides clear, structured guidance for UX tasks'
      },
      {
        method: 'few-shot',
        confidence: userLevel === 'beginner' ? 0.9 : 0.7,
        rationale: 'Examples help understand expected output format'
      },
      {
        method: 'chain-of-thought',
        confidence: userLevel === 'expert' ? 0.8 : 0.6,
        rationale: 'Step-by-step reasoning for complex problems'
      },
      {
        method: 'zero-shot',
        confidence: userLevel === 'expert' ? 0.7 : 0.4,
        rationale: 'Direct approach for experienced practitioners'
      }
    ];

    methodRecommendations.forEach(({ method, confidence, rationale }) => {
      recommendations.push({
        type: 'method',
        title: method.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: `Use ${method} prompting approach`,
        confidence,
        rationale,
        targetId: method,
        category: 'prompt-method',
        estimatedImpact: 'medium'
      });
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  }

  // Contextual Recommendations Based on Artifacts
  recommendBasedOnArtifacts(artifacts: StageArtifact[]): AIRecommendation[] {
    const recommendations: AIRecommendation[] = [];

    if (artifacts.length === 0) {
      return [{
        type: 'stage',
        title: 'Start with Research',
        description: 'Begin by understanding your users through interviews or surveys',
        confidence: 0.9,
        rationale: 'User research is the foundation of good UX design',
        targetId: 'empathize',
        category: 'getting-started',
        estimatedImpact: 'high'
      }];
    }

    // Analyze artifacts for patterns
    const researchArtifacts = artifacts.filter(a => 
      a.content.toLowerCase().includes('user') || 
      a.content.toLowerCase().includes('research')
    );

    const prototypeArtifacts = artifacts.filter(a =>
      a.content.toLowerCase().includes('prototype') ||
      a.content.toLowerCase().includes('design')
    );

    // Recommend next logical steps
    if (researchArtifacts.length > 0 && prototypeArtifacts.length === 0) {
      recommendations.push({
        type: 'stage',
        title: 'Move to Prototyping',
        description: 'You have good research insights - time to create tangible solutions',
        confidence: 0.85,
        rationale: 'Research phase appears complete, prototyping is the logical next step',
        targetId: 'prototype',
        category: 'progression',
        estimatedImpact: 'high'
      });
    }

    if (prototypeArtifacts.length > 0) {
      recommendations.push({
        type: 'stage',
        title: 'Validate with Testing',
        description: 'Test your prototypes with real users to validate assumptions',
        confidence: 0.8,
        rationale: 'Prototypes are ready for user validation',
        targetId: 'test',
        category: 'validation',
        estimatedImpact: 'high'
      });
    }

    return recommendations;
  }

  // Helper Methods
  private getDefaultFrameworkRecommendations(): AIRecommendation[] {
    return [
      {
        type: 'stage',
        title: 'Design Thinking',
        description: 'Great starting point for human-centered innovation',
        confidence: 0.8,
        rationale: 'Most versatile framework suitable for various project types',
        targetId: 'design-thinking',
        category: 'framework',
        estimatedImpact: 'high'
      },
      {
        type: 'stage',
        title: 'Double Diamond',
        description: 'Structured approach for thorough problem exploration',
        confidence: 0.7,
        rationale: 'Provides clear divergent and convergent thinking phases',
        targetId: 'double-diamond',
        category: 'framework',
        estimatedImpact: 'medium'
      }
    ];
  }

  private arePrerequisitesMet(stage: any, completedStages: string[], allStages: any[]): boolean {
    // Simple logic: stages must be completed in order for now
    const stageIndex = allStages.findIndex(s => s.id === stage.id);
    const prerequisiteStages = allStages.slice(0, stageIndex);
    
    return prerequisiteStages.every(prereq => completedStages.includes(prereq.id));
  }

  private calculateStageConfidence(stage: any, context: RecommendationContext): number {
    let confidence = 0.7; // Base confidence

    // Adjust based on user history
    if (context.userHistory?.skillLevel === 'beginner' && stage.order === 1) {
      confidence += 0.2; // Boost first stages for beginners
    }

    // Adjust based on stage requirements
    if (stage.inputRequirements?.length > context.completedStages.length) {
      confidence -= 0.3; // Lower confidence if requirements not met
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private calculateToolConfidence(tool: UXTool, context: RecommendationContext): number {
    let confidence = 0.6; // Base confidence

    const userLevel = context.userHistory?.skillLevel || 'intermediate';
    
    // Adjust based on tool difficulty and user skill
    if (tool.difficulty === 'beginner' && userLevel === 'beginner') confidence += 0.3;
    if (tool.difficulty === 'advanced' && userLevel === 'expert') confidence += 0.2;
    if (tool.difficulty === 'advanced' && userLevel === 'beginner') confidence -= 0.4;

    // Adjust based on project timeline
    if (context.projectContext?.timeline === 'tight') {
      const timeEstimate = tool.estimatedTime.toLowerCase();
      if (timeEstimate.includes('hour')) confidence += 0.2;
      if (timeEstimate.includes('week')) confidence -= 0.3;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  private calculateTemplateRelevance(template: PromptTemplate, toolId: string, context: RecommendationContext): number {
    let relevance = 0.4; // Base relevance

    // Check if template tags match tool or context
    const toolLower = toolId.toLowerCase();
    const hasRelevantTags = template.tags.some(tag => 
      toolLower.includes(tag) || tag.includes(toolLower.split('-')[0])
    );

    if (hasRelevantTags) relevance += 0.3;

    // Adjust based on user preferences
    const preferredMethods = context.userHistory?.preferredMethods || [];
    if (preferredMethods.includes(template.method)) relevance += 0.2;

    return Math.max(0.1, Math.min(1.0, relevance));
  }

  private generateStageRationale(stage: any, context: RecommendationContext): string {
    const reasons = [];

    if (stage.order === 1) {
      reasons.push('This is the logical starting point');
    } else {
      reasons.push('Previous stages provide the necessary foundation');
    }

    if (stage.expectedOutputs?.length > 0) {
      reasons.push(`Will produce ${stage.expectedOutputs.length} key deliverables`);
    }

    if (context.projectContext?.timeline === 'tight' && stage.recommendedDuration.includes('day')) {
      reasons.push('Fits within your timeline constraints');
    }

    return reasons.join('. ') + '.';
  }

  private generateToolRationale(tool: UXTool, context: RecommendationContext): string {
    const reasons = [];

    reasons.push(`${tool.category} tool for ${tool.difficulty} level`);
    
    if (tool.estimatedTime) {
      reasons.push(`Estimated time: ${tool.estimatedTime}`);
    }

    if (tool.artifacts.length > 0) {
      reasons.push(`Produces ${tool.artifacts.length} useful artifacts`);
    }

    return reasons.join('. ') + '.';
  }

  private estimateStageImpact(stage: any, context: RecommendationContext): 'low' | 'medium' | 'high' {
    if (stage.order <= 2) return 'high'; // Early stages are high impact
    if (stage.expectedOutputs?.length >= 3) return 'high';
    if (stage.expectedOutputs?.length >= 1) return 'medium';
    return 'low';
  }

  private mapDifficultyToImpact(difficulty: string): 'low' | 'medium' | 'high' {
    switch (difficulty) {
      case 'advanced': return 'high';
      case 'intermediate': return 'medium';
      default: return 'low';
    }
  }
}

export const recommendationsEngine = new RecommendationsEngine();