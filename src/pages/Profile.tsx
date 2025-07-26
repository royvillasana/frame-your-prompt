import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, FolderOpen, Calendar, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadProjects();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || "");
        setOpenaiApiKey(data.openai_api_key || "");
      }
    } catch (error: any) {
      toast.error("Error al cargar el perfil");
      console.error(error);
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          openai_api_key: openaiApiKey,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Perfil actualizado exitosamente");
    } catch (error: any) {
      toast.error("Error al actualizar el perfil");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
    } finally {
      setProjectsLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cargando perfil...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>
              Configura tu información personal y API key de OpenAI
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nombre para mostrar</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">
                  API Key de OpenAI
                  <span className="text-sm text-muted-foreground ml-2">
                    (Requerida para generar respuestas con IA)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="openaiApiKey"
                    type={showApiKey ? "text" : "password"}
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Obtén tu API key en{" "}
                  <a 
                    href="https://platform.openai.com/api-keys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    platform.openai.com/api-keys
                  </a>
                </p>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sección de Proyectos */}
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Proyectos</CardTitle>
                <CardDescription>
                  Gestiona todos tus proyectos de UX y sus prompts generados
                </CardDescription>
              </div>
              <Button 
                onClick={() => navigate('/generator')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {projectsLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Cargando proyectos...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tienes proyectos creados aún</p>
                <Button 
                  onClick={() => navigate('/generator')}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear mi primer proyecto
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/project/${project.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{project.name}</h3>
                          {project.description && (
                            <p className="text-muted-foreground text-sm mb-3">{project.description}</p>
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
                            <div className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                              {project.selected_framework}
                            </div>
                          </div>
                        </div>
                      </div>
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

export default Profile;