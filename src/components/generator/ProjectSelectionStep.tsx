import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, Calendar, MessageSquare, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  selected_framework: string;
  updated_at: string;
  generated_prompts?: { count: number }[];
}

interface ProjectSelectionStepProps {
  onNewProject: (project: Project) => void;
  onExistingProject: (project: Project) => void;
  onCustomPrompt: () => void; // New prop for custom prompt flow
  skipToStage?: boolean; // New prop to control navigation
}

export const ProjectSelectionStep = ({ onNewProject, onExistingProject, onCustomPrompt, skipToStage = false }: ProjectSelectionStepProps) => {
  const { user } = useAuth();
  const [isNewProject, setIsNewProject] = useState<boolean | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          generated_prompts(count)
        `)
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast.error("Error loading projects");
      console.error(error);
    }
  };

  const handleNewProject = async () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectName,
          description: projectDescription,
          user_id: user?.id,
          selected_framework: "None" // Add a default value for selected_framework
        }])
        .select()
        .single();
    
      if (error) throw error;
      
      // Pass the skipToStage flag to the parent component
      const projectWithFlag = { ...data, skipToStage: false }; // New projects always start at basic info
      onNewProject(projectWithFlag);
    } catch (error: any) {
      toast.error("Error creating project");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isNewProject === null) {
    return (
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle>For which project will you generate prompts?</CardTitle>
          <CardDescription>
            Choose whether you want to create a new project or continue with an existing one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* New Project Card */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-blue-50 to-blue-50/50 border-2 border-blue-100 hover:border-blue-300 hover:scale-[1.02]"
              onClick={() => setIsNewProject(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">New Project</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Start fresh with a new project and generate prompts from scratch
                </p>
              </CardContent>
            </Card>

            {/* Custom Prompt Card - New Addition */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-green-50 to-green-50/50 border-2 border-green-100 hover:border-green-300 hover:scale-[1.02]"
              onClick={onCustomPrompt}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-green-600">
                    <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.375-9.375z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Custom Prompt</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Create a custom prompt with advanced variables and personalization
                </p>
              </CardContent>
            </Card>

            {/* Existing Project Card */}
            <Card 
              className="cursor-pointer hover:shadow-md transition-all duration-200 bg-gradient-to-br from-purple-50 to-purple-50/50 border-2 border-purple-100 hover:border-purple-300 hover:scale-[1.02]"
              onClick={() => setIsNewProject(false)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="bg-purple-100 p-3 rounded-full mb-4">
                  <FolderOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">Existing Project</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Continue working on a project you already have created
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isNewProject) {
    return (
      <Card className="bg-gradient-card shadow-medium">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>
            Define the name and description of your new UX project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="projectName">Project Name *</Label>
            <Input
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Ex: Mobile App Redesign, Customer Portal, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDescription">Tell us about your project</Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe your project objective and scope to recommend you the best framework"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => setIsNewProject(null)} 
              variant="outline"
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={handleNewProject}
              disabled={!projectName.trim() || loading}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-medium">
      <CardHeader>
        <CardTitle>Select Existing Project</CardTitle>
        <CardDescription>
          Choose an existing project to continue adding prompts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You don't have any projects created yet</p>
            <Button 
              onClick={() => setIsNewProject(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Create my first project
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                  onClick={() => {
                    // Match the structure used in the New Prompt button from ProjectDetail
                    onExistingProject({
                      id: project.id,
                      name: project.name,
                      description: project.description,
                      selected_framework: project.selected_framework,
                      product_type: project.product_type,
                      industry: project.industry,
                      target_audience: project.target_audience,
                      // Explicitly set skipToStage to true to match the New Prompt button behavior
                      skipToStage: true
                    });
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      {project.selected_framework && project.selected_framework !== "None" && (
                        <Badge variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {project.selected_framework}
                        </Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.updated_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {project.generated_prompts?.[0]?.count || 0} prompts
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={() => setIsNewProject(null)} 
                variant="outline"
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={() => setIsNewProject(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};