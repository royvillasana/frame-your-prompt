import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, Sparkles, RefreshCw, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

const PromptDetail = () => {
  const { promptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: toastHook } = useToast();
  const [prompt, setPrompt] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    if (user && promptId) {
      loadPromptDetails();
    }
  }, [user, promptId]);

  const loadPromptDetails = async () => {
    try {
      // Cargar prompt
      const { data: promptData, error: promptError } = await supabase
        .from('generated_prompts')
        .select('*')
        .eq('id', promptId)
        .eq('user_id', user?.id)
        .single();

      if (promptError) throw promptError;
      setPrompt(promptData);

      // Cargar proyecto asociado
      if (promptData.project_id) {
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', promptData.project_id)
          .single();

        if (projectError) throw projectError;
        setProject(projectData);
      }
    } catch (error: any) {
      toast.error("Error al cargar los detalles del prompt");
      console.error(error);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.original_prompt);
    toastHook({
      title: "¡Copiado!",
      description: "Prompt copiado al portapapeles.",
    });
  };

  const generateAIResponse = async () => {
    if (!prompt.original_prompt) return;
    
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: prompt.original_prompt,
          projectContext: prompt.project_context,
          selectedFramework: prompt.selected_framework,
          frameworkStage: prompt.framework_stage,
          selectedTool: prompt.selected_tool,
          aiModel: "gpt-4o-mini",
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Error en la función de Supabase');
      }

      if (data?.error) {
        console.error('AI API error:', data.error);
        throw new Error(data.error);
      }
      
      // Actualizar el prompt con la nueva respuesta
      const { error: updateError } = await supabase
        .from('generated_prompts')
        .update({ ai_response: data.aiResponse })
        .eq('id', promptId);

      if (updateError) throw updateError;

      setPrompt({ ...prompt, ai_response: data.aiResponse });
      toast.success("AI response generated!");
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMessage = error.message || "Error generating AI response";
      
      if (errorMessage.includes("Could not generate AI response")) {
        toast.error("⚠️ AI services temporarily unavailable", {
          description: "Free AI services are busy. Try with a premium model (requires API key) or try again later.",
          action: {
            label: "Configure API Key",
            onClick: () => navigate('/profile')
          }
        });
      } else if (errorMessage.includes("API key not configured")) {
        toast.error("You must configure an API key in your profile to use this function.", {
          action: {
            label: "Go to Profile",
            onClick: () => navigate('/profile')
          }
        });
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const iteratePrompt = () => {
    navigate('/generator', {
      state: {
        iterateFrom: prompt,
        projectContext: prompt.project_context,
        selectedFramework: prompt.selected_framework,
        frameworkStage: prompt.framework_stage,
        selectedTool: prompt.selected_tool
      }
    });
  };

  const deletePrompt = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este prompt? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('generated_prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Prompt eliminado exitosamente");
      
      // Regresar al proyecto o perfil
      if (project) {
        navigate(`/project/${project.id}`);
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      toast.error("Error al eliminar el prompt");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cargando prompt...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Prompt no encontrado</h1>
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
            onClick={() => project ? navigate(`/project/${project.id}`) : navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {project ? `Volver a ${project.name}` : 'Volver al perfil'}
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Detalle del Prompt</h1>
              {project && (
                <p className="text-muted-foreground text-lg mb-4">Proyecto: {project.name}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(prompt.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">{prompt.selected_framework}</Badge>
                <Badge variant="outline">{prompt.framework_stage}</Badge>
                <Badge variant="outline">{prompt.selected_tool}</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={iteratePrompt} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={deletePrompt}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Prompt Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Prompt Original</CardTitle>
            <CardDescription>
              El prompt generado específicamente para tu proyecto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <Textarea 
                value={prompt.original_prompt}
                readOnly
                className="min-h-[200px] bg-transparent border-0 p-0 resize-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyToClipboard} variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
              <Button 
                onClick={generateAIResponse} 
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingAI ? "Generando..." : prompt.ai_response ? "Regenerar IA" : "Usar Prompt"}
              </Button>
              <Button onClick={iteratePrompt} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Iterar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Response */}
        {prompt.ai_response && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Respuesta de IA</CardTitle>
                <Button 
                  onClick={() => navigate('/chat', { 
                    state: { 
                      initialPrompt: prompt.original_prompt, 
                      initialResponse: prompt.ai_response,
                      projectContext: prompt.project_context 
                    } 
                  })}
                  size="sm"
                  className="ml-auto"
                >
                  Continuar en Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border">
                <div className="bg-background/50 p-4 rounded-md max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm">{prompt.ai_response}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PromptDetail;