import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectDashboard } from '@/components/project/ProjectDashboard';
import { AIIntegrationSettings } from '@/components/settings/AIIntegrationSettings';
import { 
  Project, 
  FrameworkType, 
  Workflow, 
  AIConfiguration,
  AIRecommendation 
} from '@/types';
import { frameworkLibrary } from '@/lib/framework-library';
import { recommendationsEngine } from '@/lib/recommendations-engine';
import { 
  Plus, 
  Zap, 
  Settings, 
  Lightbulb,
  TrendingUp,
  Users,
  Clock,
  Star
} from 'lucide-react';

export const GeneratorV3: React.FC = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'settings'>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [aiConfigurations, setAiConfigurations] = useState<AIConfiguration[]>([]);

  // Load initial data
  useEffect(() => {
    loadProjects();
    loadRecommendations();
    loadAIConfigurations();
  }, []);

  const loadProjects = async () => {
    // Mock data - in real app, this would come from API
    const mockProjects: Project[] = [
      {
        id: 'project-1',
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
        workflows: [],
        metadata: {
          createdAt: new Date('2024-01-15'),
          modifiedAt: new Date(),
          totalPromptsGenerated: 25,
          frameworksUsed: ['design-thinking', 'google-design-sprint'],
          totalWorkflows: 3,
          completedWorkflows: 1,
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
      },
      {
        id: 'project-2',
        name: 'E-commerce Checkout Flow',
        description: 'Optimizing the checkout experience to reduce cart abandonment',
        status: 'completed',
        owner: {
          id: 'user-1',
          email: 'owner@example.com',
          name: 'Project Owner'
        },
        collaborators: [],
        workflows: [],
        metadata: {
          createdAt: new Date('2024-02-01'),
          modifiedAt: new Date('2024-02-28'),
          totalPromptsGenerated: 45,
          frameworksUsed: ['lean-ux', 'heart'],
          totalWorkflows: 2,
          completedWorkflows: 2,
          estimatedDuration: '3 weeks',
          tags: ['e-commerce', 'conversion', 'checkout']
        },
        settings: {
          isPublic: true,
          allowComments: true,
          requireApproval: false,
          exportFormats: ['pdf']
        },
        context: {
          businessGoals: ['Reduce cart abandonment', 'Increase revenue'],
          targetAudience: 'Online shoppers',
          constraints: ['Must integrate with existing payment systems'],
          resources: ['Analytics data', 'User feedback']
        }
      }
    ];

    setProjects(mockProjects);
  };

  const loadRecommendations = async () => {
    // Get framework recommendations for new projects
    const frameworkRecs = recommendationsEngine.recommendFramework({
      projectContext: {
        domain: 'general',
        complexity: 'medium',
        timeline: 'moderate',
        teamSize: 'small'
      },
      userHistory: {
        preferredMethods: ['instruction-tuning'],
        skillLevel: 'intermediate',
        pastFrameworks: ['design-thinking']
      },
      completedStages: []
    });

    setRecommendations(frameworkRecs);
  };

  const loadAIConfigurations = async () => {
    // Mock AI configurations
    const mockConfigs: AIConfiguration[] = [
      {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'sk-...',
        parameters: {
          temperature: 0.7,
          maxTokens: 2000,
          topP: 1,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      }
    ];

    setAiConfigurations(mockConfigs);
  };

  const handleCreateProject = () => {
    setActiveView('create');
  };

  const handleOpenProject = (projectId: string) => {
    // Navigate to the new Workflow Studio
    navigate(`/workflow-studio/${projectId}`);
  };

  const handleCreateNewProject = (frameworkType: FrameworkType) => {
    const newProject: Project = {
      id: `project-${Date.now()}`,
      name: 'New Project',
      description: '',
      status: 'draft',
      owner: {
        id: 'current-user',
        email: 'user@example.com',
        name: 'Current User'
      },
      collaborators: [],
      workflows: [{
        id: `workflow-${Date.now()}`,
        name: 'Main Workflow',
        description: `${frameworkLibrary[frameworkType]?.name} workflow`,
        frameworkType,
        stages: frameworkLibrary[frameworkType]?.stages.map((stage, index) => ({
          id: `stage-${index}`,
          frameworkStageId: stage.id,
          order: index + 1,
          isCompleted: false,
          isSkipped: false,
          customizations: {}
        })) || [],
        contextChain: [],
        metadata: {
          createdAt: new Date(),
          modifiedAt: new Date(),
          completedStages: 0,
          totalStages: frameworkLibrary[frameworkType]?.stages.length || 0,
          estimatedDuration: frameworkLibrary[frameworkType]?.totalDuration || '2-4 weeks'
        },
        settings: {
          allowStageSkipping: true,
          autoGenerateContext: true,
          contextSummaryLength: 'medium'
        }
      }],
      metadata: {
        createdAt: new Date(),
        modifiedAt: new Date(),
        totalPromptsGenerated: 0,
        frameworksUsed: [frameworkType],
        totalWorkflows: 1,
        completedWorkflows: 0,
        estimatedDuration: frameworkLibrary[frameworkType]?.totalDuration || '2-4 weeks',
        tags: []
      },
      settings: {
        isPublic: false,
        allowComments: true,
        requireApproval: false,
        exportFormats: ['pdf']
      },
      context: {
        businessGoals: [],
        targetAudience: '',
        constraints: [],
        resources: []
      }
    };

    setProjects(prev => [...prev, newProject]);
    handleOpenProject(newProject.id);
  };

  if (activeView === 'settings') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('dashboard')}
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>
        
        <AIIntegrationSettings
          configurations={aiConfigurations}
          onSaveConfiguration={(config) => {
            setAiConfigurations(prev => [...prev, config]);
          }}
          onDeleteConfiguration={(configId) => {
            setAiConfigurations(prev => prev.filter((_, i) => i.toString() !== configId));
          }}
          onTestConfiguration={async (config) => {
            // Mock test - in real app, this would make an actual API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            return Math.random() > 0.3; // 70% success rate for demo
          }}
        />
      </div>
    );
  }

  if (activeView === 'create') {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => setActiveView('dashboard')}
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Create New Project</h1>
        </div>

        <div className="space-y-6">
          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Recommended for You
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.slice(0, 4).map(rec => (
                    <Card key={rec.targetId} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(rec.confidence * 100)}% match
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {rec.description}
                        </p>
                        <Button 
                          size="sm" 
                          onClick={() => handleCreateNewProject(rec.targetId as FrameworkType)}
                        >
                          Start Project
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Frameworks */}
          <Card>
            <CardHeader>
              <CardTitle>Choose a Framework</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(frameworkLibrary).map(framework => (
                  <Card 
                    key={framework.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleCreateNewProject(framework.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium">{framework.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {framework.complexity}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {framework.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {framework.totalDuration}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <TrendingUp className="h-3 w-3" />
                            {framework.stages.length} stages
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {framework.bestUseCases.slice(0, 2).map(useCase => (
                            <Badge key={useCase} variant="secondary" className="text-xs">
                              {useCase}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">FramePromptly 3.0</h1>
          <p className="text-muted-foreground">
            Multi-framework AI-driven UX workflows
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setActiveView('settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={handleCreateProject}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">AI Prompts</p>
                <p className="text-xl font-bold">
                  {projects.reduce((sum, p) => sum + p.metadata.totalPromptsGenerated, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Frameworks</p>
                <p className="text-xl font-bold">
                  {Object.keys(frameworkLibrary).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collaborators</p>
                <p className="text-xl font-bold">
                  {projects.reduce((sum, p) => sum + p.collaborators.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-xl font-bold">
                  {projects.filter(p => p.status === 'in-progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Dashboard */}
      <ProjectDashboard
        projects={projects}
        onCreateProject={handleCreateProject}
        onOpenProject={handleOpenProject}
        onUpdateProject={(project) => {
          setProjects(prev => prev.map(p => p.id === project.id ? project : p));
        }}
        onDeleteProject={(projectId) => {
          setProjects(prev => prev.filter(p => p.id !== projectId));
        }}
      />
    </div>
  );
};