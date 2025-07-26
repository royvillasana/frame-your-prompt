import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FolderOpen, Calendar, MessageSquare } from "lucide-react";
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
  onNewProject: (name: string, description: string) => void;
  onExistingProject: (project: Project) => void;
}

export const ProjectSelectionStep = ({ onNewProject, onExistingProject }: ProjectSelectionStepProps) => {
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
      toast.error("Error al cargar los proyectos");
      console.error(error);
    }
  };

  const handleNewProject = () => {
    if (!projectName.trim()) {
      toast.error("El nombre del proyecto es requerido");
      return;
    }
    onNewProject(projectName, projectDescription);
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
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => setIsNewProject(true)}
            >
              <CardContent className="p-6 text-center">
                <Plus className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">New Project</h3>
                <p className="text-muted-foreground text-sm">
                  Create a project from scratch and configure all details
                </p>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
              onClick={() => setIsNewProject(false)}
            >
              <CardContent className="p-6 text-center">
                <FolderOpen className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Existing Project</h3>
                <p className="text-muted-foreground text-sm">
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
            <Label htmlFor="projectDescription">Descripción (Opcional)</Label>
            <Textarea
              id="projectDescription"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="Describe brevemente el objetivo y alcance de tu proyecto..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={() => setIsNewProject(null)} 
              variant="outline"
              className="flex-1"
            >
              Atrás
            </Button>
            <Button 
              onClick={handleNewProject}
              disabled={!projectName.trim()}
              className="flex-1"
            >
              Continuar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card shadow-medium">
      <CardHeader>
        <CardTitle>Seleccionar Proyecto Existente</CardTitle>
        <CardDescription>
          Elige un proyecto existente para continuar agregando prompts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No tienes proyectos creados aún</p>
            <Button 
              onClick={() => setIsNewProject(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Crear mi primer proyecto
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {projects.map((project) => (
                <Card 
                  key={project.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/50"
                  onClick={() => onExistingProject(project)}
                >
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
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
                      <div className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {project.selected_framework}
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
                Atrás
              </Button>
              <Button 
                onClick={() => setIsNewProject(true)}
                variant="outline"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};