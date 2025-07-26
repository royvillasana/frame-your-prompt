import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MessageSquare, Calendar, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && projectId) {
      loadProjectDetails();
    }
  }, [user, projectId]);

  const loadProjectDetails = async () => {
    try {
      // Cargar proyecto
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', user?.id)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // Cargar prompts del proyecto
      const { data: promptsData, error: promptsError } = await supabase
        .from('generated_prompts')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (promptsError) throw promptsError;
      setPrompts(promptsData || []);
    } catch (error: any) {
      toast.error("Error al cargar los detalles del proyecto");
      console.error(error);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Proyecto eliminado exitosamente");
      navigate('/profile');
    } catch (error: any) {
      toast.error("Error al eliminar el proyecto");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cargando proyecto...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Proyecto no encontrado</h1>
          <Button onClick={() => navigate('/profile')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al perfil
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al perfil
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
              {project.description && (
                <p className="text-muted-foreground text-lg mb-4">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Última actualización: {new Date(project.updated_at).toLocaleDateString()}
                </div>
                <Badge variant="secondary">{project.selected_framework}</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/generator', { 
                  state: { 
                    projectId: project.id,
                    projectContext: JSON.parse(project.description || '{}')
                  } 
                })}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Prompt
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={deleteProject}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Prompts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prompts Generados</CardTitle>
                <CardDescription>
                  {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} creado{prompts.length !== 1 ? 's' : ''} en este proyecto
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {prompts.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No hay prompts creados en este proyecto aún</p>
                <Button 
                  onClick={() => navigate('/generator', { 
                    state: { 
                      projectId: project.id,
                      projectContext: JSON.parse(project.description || '{}')
                    } 
                  })}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear primer prompt
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {prompts.map((prompt) => (
                  <Card 
                    key={prompt.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/prompt/${prompt.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          <Badge variant="outline">{prompt.selected_framework}</Badge>
                          <Badge variant="secondary">{prompt.framework_stage}</Badge>
                          <Badge variant="outline">{prompt.selected_tool}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(prompt.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="bg-muted p-3 rounded-md mb-3">
                        <p className="text-sm line-clamp-3">{prompt.original_prompt}</p>
                      </div>
                      
                      {prompt.ai_response && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>Incluye respuesta de IA</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProjectDetail;