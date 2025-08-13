import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowBuilder } from '@/components/workflow/WorkflowBuilder';
import { AdvancedPromptEditor } from '@/components/prompt/AdvancedPromptEditor';
import { CollaborationPanel } from '@/components/collaboration/CollaborationPanel';
import { 
  Workflow, 
  WorkflowStage, 
  FrameworkType, 
  AIConfiguration,
  AIResponse,
  Project,
  Collaborator,
  ProjectComment,
  ProjectVersion,
  PromptTemplate
} from '@/types';
import { frameworkLibrary } from '@/lib/framework-library';
import { contextManager } from '@/lib/context-store';
import { promptEngine } from '@/lib/prompt-engine';
import { recommendationsEngine } from '@/lib/recommendations-engine';
import { 
  Play, 
  Settings, 
  Share2, 
  Download, 
  Save,
  Users,
  Sparkles,
  Eye,
  Code,
  MessageSquare
} from 'lucide-react';

export const WorkflowStudio: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const workflowId = undefined; // Could be extracted from URL params if needed
  // State management
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('builder');
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);

  // Mock data - in real app, this would come from APIs
  useEffect(() => {
    // Load workflow and project data
    const mockWorkflow: Workflow = {
      id: workflowId || 'workflow-1',
      name: 'User Research & Validation Workflow',
      description: 'Complete design thinking workflow for user research and validation',
      frameworkType: 'design-thinking',
      stages: [
        {
          id: 'stage-1',
          frameworkStageId: 'empathize',
          order: 1,
          isCompleted: false,
          isSkipped: false,
          customizations: {}
        },
        {
          id: 'stage-2',
          frameworkStageId: 'define',
          order: 2,
          isCompleted: false,
          isSkipped: false,
          customizations: {}
        }
      ],
      contextChain: [],
      metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        completedStages: 0,
        totalStages: 5,
        estimatedDuration: '4-6 weeks'
      },
      settings: {
        allowStageSkipping: true,
        autoGenerateContext: true,
        contextSummaryLength: 'medium'
      }
    };

    const mockProject: Project = {
      id: projectId,
      name: 'Mobile Banking App Redesign',
      description: 'Redesigning the mobile banking experience for Gen Z users',
      status: 'in-progress',
      owner: {
        id: 'user-1',
        email: 'owner@example.com',
        name: 'Project Owner'
      },
      collaborators: [
        {
          id: 'collab-1',
          email: 'designer@example.com',
          name: 'UX Designer',
          role: 'editor',
          invitedAt: new Date(),
          acceptedAt: new Date()
        }
      ],
      workflows: [mockWorkflow],
      metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        totalPromptsGenerated: 15,
        frameworksUsed: ['design-thinking'],
        totalWorkflows: 1,
        completedWorkflows: 0,
        estimatedDuration: '4-6 weeks',
        tags: ['mobile', 'banking', 'gen-z']
      },
      settings: {
        isPublic: false,
        allowComments: true,
        requireApproval: false,
        exportFormats: ['pdf', 'csv']
      },
      context: {
        businessGoals: ['Increase user engagement', 'Improve conversion rates'],
        targetAudience: 'Gen Z users aged 18-25',
        constraints: ['Must work on older devices', 'WCAG compliance required'],
        resources: ['Design system', 'User research database']
      }
    };

    setWorkflow(mockWorkflow);
    setProject(mockProject);
    setCollaborators(mockProject.collaborators);
  }, [projectId, workflowId]);

  // Workflow execution
  const handleExecuteStage = useCallback(async (stageId: string) => {
    if (!workflow) return;

    setIsExecuting(true);
    setActiveStage(stageId);

    try {
      // Get stage and framework information
      const stage = workflow.stages.find(s => s.id === stageId);
      const framework = frameworkLibrary[workflow.frameworkType];
      const frameworkStage = framework?.stages.find(s => s.id === stage?.frameworkStageId);

      if (!stage || !frameworkStage) {
        throw new Error('Stage not found');
      }

      // Get context from previous stages
      const completedStages = workflow.stages
        .filter(s => s.isCompleted && s.order < stage.order)
        .map(s => s.frameworkStageId);
      
      const context = contextManager.getContextForStage(stageId, completedStages);

      // Get recommendations for tools and templates
      const toolRecommendations = recommendationsEngine.recommendTools(
        stage.frameworkStageId,
        workflow.frameworkType,
        { currentFramework: workflow.frameworkType, completedStages }
      );

      // For demo purposes, simulate AI execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark stage as completed
      const updatedStages = workflow.stages.map(s =>
        s.id === stageId ? { ...s, isCompleted: true } : s
      );

      setWorkflow(prev => prev ? {
        ...prev,
        stages: updatedStages,
        metadata: {
          ...prev.metadata,
          completedStages: prev.metadata.completedStages + 1,
          modifiedAt: new Date()
        }
      } : null);

    } catch (error) {
      console.error('Error executing stage:', error);
    } finally {
      setIsExecuting(false);
      setActiveStage(null);
    }
  }, [workflow]);

  // Collaboration handlers
  const handleInviteCollaborator = useCallback((email: string, role: any) => {
    const newCollaborator: Collaborator = {
      id: `collab-${Date.now()}`,
      email,
      role,
      invitedAt: new Date()
    };
    setCollaborators(prev => [...prev, newCollaborator]);
  }, []);

  const handleAddComment = useCallback((comment: any) => {
    const newComment: ProjectComment = {
      ...comment,
      id: `comment-${Date.now()}`,
      createdAt: new Date()
    };
    setComments(prev => [...prev, newComment]);
  }, []);

  // AI Configuration
  const defaultAIConfig: AIConfiguration = {
    provider: 'openai',
    model: 'gpt-4',
    parameters: {
      temperature: 0.7,
      maxTokens: 2000
    }
  };

  const handleExecutePrompt = async (prompt: string, config: AIConfiguration): Promise<AIResponse> => {
    // Mock AI response
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      content: `Generated response for: ${prompt.substring(0, 100)}...`,
      tokensUsed: 150,
      processingTime: 1500,
      model: config.model,
      metadata: {
        requestId: `req-${Date.now()}`,
        timestamp: new Date(),
        method: 'instruction-tuning'
      }
    };
  };

  if (!workflow || !project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-2xl font-bold">{workflow.name}</h1>
            <p className="text-muted-foreground">{project.name}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Main Workspace */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b">
              <TabsList className="h-auto p-2">
                <TabsTrigger value="builder" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Workflow Builder
                </TabsTrigger>
                <TabsTrigger value="prompt" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Prompt Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto">
              <TabsContent value="builder" className="h-full p-6">
                <WorkflowBuilder
                  workflow={workflow}
                  onUpdateWorkflow={setWorkflow}
                  onExecuteStage={handleExecuteStage}
                  isExecuting={isExecuting}
                />
              </TabsContent>

              <TabsContent value="prompt" className="h-full p-6">
                <AdvancedPromptEditor
                  context={contextManager.buildContextChain(
                    workflow.stages
                      .filter(s => s.isCompleted)
                      .map(s => s.frameworkStageId)
                  )}
                  frameworkType={workflow.frameworkType}
                  stageId={activeStage || undefined}
                  onExecute={handleExecutePrompt}
                  mode="stage-bound"
                />
              </TabsContent>

              <TabsContent value="preview" className="h-full p-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Progress</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Completed Stages</span>
                              <span>{workflow.metadata.completedStages}/{workflow.metadata.totalStages}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ 
                                  width: `${(workflow.metadata.completedStages / workflow.metadata.totalStages) * 100}%` 
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Framework</h4>
                          <p className="text-sm text-muted-foreground">
                            {frameworkLibrary[workflow.frameworkType]?.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {frameworkLibrary[workflow.frameworkType]?.description}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-2">Generated Artifacts</h4>
                        <div className="space-y-2">
                          {workflow.stages
                            .filter(stage => stage.artifact)
                            .map(stage => (
                              <div key={stage.id} className="p-3 border rounded">
                                <h5 className="font-medium">{stage.artifact?.metadata.toolUsed}</h5>
                                <p className="text-sm text-muted-foreground">
                                  {stage.artifact?.summary}
                                </p>
                              </div>
                            ))}
                          {workflow.stages.filter(s => s.artifact).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No artifacts generated yet. Execute workflow stages to create artifacts.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Collaboration Sidebar */}
        <div className="w-80 border-l bg-muted/50">
          <CollaborationPanel
            projectId={project.id}
            collaborators={collaborators}
            comments={comments}
            versions={versions}
            currentUserRole="owner"
            onInviteCollaborator={handleInviteCollaborator}
            onUpdateCollaboratorRole={(id, role) => {
              setCollaborators(prev => prev.map(c => 
                c.id === id ? { ...c, role } : c
              ));
            }}
            onRemoveCollaborator={(id) => {
              setCollaborators(prev => prev.filter(c => c.id !== id));
            }}
            onAddComment={handleAddComment}
            onResolveComment={(id) => {
              setComments(prev => prev.map(c => 
                c.id === id ? { ...c, resolved: true } : c
              ));
            }}
            onDeleteComment={(id) => {
              setComments(prev => prev.filter(c => c.id !== id));
            }}
          />
        </div>
      </div>
    </div>
  );
};