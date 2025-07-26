import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Calendar, Settings, Trash2, Edit3 } from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { Project, getFrameworkById, getStagesByFramework } from "@/types/project";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PromptsByStage {
  [stageId: string]: any[];
}

export const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  // Removed getProjectPrompts hook to avoid dependency loops
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("");
  const [promptsByStage, setPromptsByStage] = useState<PromptsByStage>({});

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        console.log('No projectId provided');
        return;
      }

      console.log('Loading project with ID:', projectId);
      
      try {
        // Load project details
        console.log('Making Supabase query for project...');
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        console.log('Supabase response:', { projectData, projectError });

        if (projectError) {
          console.error('Error loading project:', projectError);
          toast({
            title: "Error",
            description: `Project not found: ${projectError.message}`,
            variant: "destructive",
          });
          navigate('/profile');
          return;
        }

        setProject(projectData);

        // Load prompts directly in this component to avoid dependency issues
        console.log('Loading prompts for project:', projectId);
        const { data: prompts, error: promptsError } = await supabase
          .from('generated_prompts')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        console.log('Prompts loaded:', { promptsCount: prompts?.length || 0, promptsError });

        if (promptsError) {
          console.error('Error loading prompts:', promptsError);
        }

        // Organize prompts by stage
        const organized: PromptsByStage = {};
        (prompts || []).forEach(prompt => {
          const stage = prompt.framework_stage?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized';
          if (!organized[stage]) {
            organized[stage] = [];
          }
          organized[stage].push(prompt);
        });

        setPromptsByStage(organized);

        // Set default selected stage to the stage of the most recent prompt, or first stage of framework
        const framework = getFrameworkById(projectData.selected_framework);
        if (framework?.stages.length) {
          // Find the most recent prompt to determine default stage
          const allPrompts = (prompts || []).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          const mostRecentPrompt = allPrompts[0];
          
          if (mostRecentPrompt) {
            // Get the stage ID from the most recent prompt
            const recentStageId = mostRecentPrompt.framework_stage?.toLowerCase().replace(/\s+/g, '-') || '';
            const stageExists = framework.stages.find(stage => stage.id === recentStageId);
            setSelectedStage(stageExists ? recentStageId : framework.stages[0].id);
          } else {
            // No prompts exist, use first stage
            setSelectedStage(framework.stages[0].id);
          }
        }

      } catch (error) {
        console.error('Error loading project:', error);
        toast({
          title: "Error",
          description: "Failed to load project",
          variant: "destructive",
        });
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId, navigate, toast]); // Removed getProjectPrompts dependency

  const deletePrompt = async (promptId: string) => {
    try {
      const { error } = await supabase
        .from('generated_prompts')
        .delete()
        .eq('id', promptId);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete prompt",
          variant: "destructive",
        });
        return;
      }

      // Refresh prompts directly instead of using getProjectPrompts
      const { data: prompts, error: promptsError } = await supabase
        .from('generated_prompts')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: false });

      if (promptsError) {
        console.error('Error refreshing prompts:', promptsError);
        return;
      }

      // Reorganize prompts by stage
      const organized: PromptsByStage = {};
      (prompts || []).forEach(prompt => {
        const stage = prompt.framework_stage?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized';
        if (!organized[stage]) {
          organized[stage] = [];
        }
        organized[stage].push(prompt);
      });

      setPromptsByStage(organized);
      
      toast({
        title: "Success",
        description: "Prompt deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-12 bg-muted rounded w-3/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <Button onClick={() => navigate('/profile')} className="mt-4">
            Go back to profile
          </Button>
        </div>
      </div>
    );
  }

  const framework = getFrameworkById(project.selected_framework);
  const stages = getStagesByFramework(project.selected_framework);
  const selectedStagePrompts = promptsByStage[selectedStage] || [];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <Badge variant="secondary">{framework?.name}</Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mb-2">{project.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Updated {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true })}</span>
            </div>
            <span>•</span>
            <span>{Object.values(promptsByStage).flat().length} prompts total</span>
          </div>
        </div>
        <Button
          onClick={() => navigate(`/generator?project=${project.id}&framework=${project.selected_framework}`)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {/* Framework Stages Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Framework Stages</CardTitle>
          <CardDescription>
            Navigate through the {framework?.name} stages to manage your prompts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {stages.map((stage, index) => {
              const stagePrompts = promptsByStage[stage.id] || [];
              const isSelected = selectedStage === stage.id;
              
              return (
                <Button
                  key={stage.id}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => setSelectedStage(stage.id)}
                  className="flex items-center gap-2 relative"
                >
                  <span>{index + 1}. {stage.name}</span>
                  {stagePrompts.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                      {stagePrompts.length}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Stage Content */}
      {selectedStage && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {stages.find(s => s.id === selectedStage)?.name}
                  <Badge variant="outline">{selectedStagePrompts.length} prompts</Badge>
                </CardTitle>
                <CardDescription>
                  {stages.find(s => s.id === selectedStage)?.description}
                </CardDescription>
              </div>
              <Button
                onClick={() => navigate(`/generator?project=${project.id}&framework=${project.selected_framework}&stage=${selectedStage}`)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Prompt
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedStagePrompts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  No prompts created for this stage yet.
                </div>
                <Button
                  onClick={() => navigate(`/generator?project=${project.id}&framework=${project.selected_framework}&stage=${selectedStage}`)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create First Prompt
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {selectedStagePrompts.map((prompt) => (
                  <Card key={prompt.id} className="relative group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="text-xs">
                              {prompt.selected_tool}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(prompt.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {prompt.original_prompt}
                          </p>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/generator?edit=${prompt.id}`)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deletePrompt(prompt.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    {prompt.ai_response && (
                      <CardContent className="pt-0">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <p className="text-sm line-clamp-4">{prompt.ai_response}</p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};