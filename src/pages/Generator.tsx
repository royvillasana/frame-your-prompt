import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Save, Download, Sparkles, RotateCcw, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProjectContextStep, ProjectContext } from "@/components/generator/ProjectContextStep";
import { ProjectStageStep } from "@/components/generator/ProjectStageStep";
import { FrameworkStep } from "@/components/generator/FrameworkStep";
import { ToolSelectionStep } from "@/components/generator/ToolSelectionStep";
import { ProjectSelectionStep } from "@/components/generator/ProjectSelectionStep";
import { UsageLimitCard } from "@/components/generator/UsageLimitCard";
import { LoadingPromptGeneration } from "@/components/generator/LoadingPromptGeneration";

import { useAIUsage } from "@/hooks/useAIUsage";

type Step = "project" | "context" | "stage" | "framework" | "tool" | "result";

const Generator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshUsage } = useAIUsage();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("project");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [projectStage, setProjectStage] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [frameworkStage, setFrameworkStage] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedAIModel] = useState("gpt-4o-mini");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if coming from chat with result data
    const state = location.state as {
      showResult?: boolean;
      generatedPrompt?: string;
      aiResponse?: string;
      projectContext?: ProjectContext;
      iterateFrom?: any;
      selectedFramework?: string;
      frameworkStage?: string;
      selectedTool?: string;
    };

    if (state?.showResult && state?.generatedPrompt && state?.projectContext) {
      setCurrentStep("result");
      setGeneratedPrompt(state.generatedPrompt);
      setProjectContext(state.projectContext);
      if (state.aiResponse) {
        setAiResponse(state.aiResponse);
      }
    } else if (state?.iterateFrom) {
      // Handle iteration from existing prompt
      setProjectContext(state.projectContext);
      setSelectedFramework(state.selectedFramework || "");
      setFrameworkStage(state.frameworkStage || "");
      setSelectedTool(state.selectedTool || "");
      setGeneratedPrompt(state.iterateFrom.original_prompt || "");
      if (state.iterateFrom.ai_response) {
        setAiResponse(state.iterateFrom.ai_response);
      }
      setCurrentStep("result");
    }
  }, [user, navigate, location.state]);

  const handleContextComplete = (context: ProjectContext) => {
    setProjectContext(context);
    setCurrentStep("stage");
  };

  const handleStageComplete = (stage: string) => {
    setProjectStage(stage);
    setCurrentStep("framework");
  };

  const handleFrameworkComplete = (framework: string, stage: string) => {
    setSelectedFramework(framework);
    setFrameworkStage(stage);
    setCurrentStep("tool");
  };

  const handleToolComplete = async (tool: string) => {
    setSelectedTool(tool);
    await generatePrompt(tool);
    setCurrentStep("result");
  };

  const generateAIResponse = async () => {
    if (!generatedPrompt) return;
    
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: generatedPrompt,
          projectContext,
          selectedFramework,
          frameworkStage,
          selectedTool,
          aiModel: selectedAIModel,
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
      
      setAiResponse(data.aiResponse);
      refreshUsage(); // Refresh usage data after successful AI response
      sonnerToast.success("¡Respuesta generada con IA!");
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMessage = error.message || "Error al generar respuesta con IA";
      
      // Check for specific AI service errors and provide helpful messages
      if (errorMessage.includes("No se pudo generar respuesta con IA")) {
        sonnerToast.error("⚠️ Servicios de IA temporalmente no disponibles", {
          description: "Los servicios gratuitos de IA están ocupados. Intenta con un modelo premium (requiere API key) o prueba más tarde.",
          action: {
            label: "Configurar API Key",
            onClick: () => navigate('/profile')
          }
        });
      } else if (errorMessage.includes("exceeded your current quota")) {
        sonnerToast.error("Tu API key de OpenAI ha excedido la cuota. Revisa tu plan y facturación en OpenAI.");
      } else if (errorMessage.includes("API key no configurada")) {
        sonnerToast.error("Debes configurar una API key en tu perfil para usar esta función.", {
          action: {
            label: "Ir a Perfil",
            onClick: () => navigate('/profile')
          }
        });
      } else if (errorMessage.includes("límite diario")) {
        sonnerToast.error("Has alcanzado el límite diario para este modelo de IA. Prueba con otro modelo o vuelve mañana.");
      } else {
        sonnerToast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generatePrompt = async (tool: string) => {
    if (!projectContext) return;

    // Start loading state
    setIsGeneratingPrompt(true);
    setGeneratedPrompt("");

    // Determine framework and stage text
    let frameworkText = "";
    let stageText = "";
    
    if (selectedFramework !== "none" && frameworkStage) {
      frameworkText = selectedFramework;
      stageText = frameworkStage;
    } else {
      frameworkText = "metodología libre";
      stageText = projectStage;
    }

    // Create a meta-prompt to generate the actual UX prompt
    const metaPrompt = `Actúa como un experto UX Designer y especialista en prompts de IA. Tu tarea es generar un prompt detallado y específico para ayudar a un UX Designer que está trabajando en la etapa de "${stageText}" del framework ${frameworkText}, específicamente con ${tool}.

Contexto del proyecto:
- Industria: ${projectContext.industry}
- Tipo de empresa: ${projectContext.companySize}
- Producto: ${projectContext.productType}
- Alcance: ${projectContext.productScope}
- Audiencia objetivo: ${projectContext.userProfile}

INSTRUCCIONES CRÍTICAS:
1. Genera un prompt COMPLETO y ESPECÍFICO que el UX Designer pueda usar directamente con una IA
2. El prompt debe estar adaptado específicamente a la industria ${projectContext.industry} y al tipo de producto ${projectContext.productType}
3. Debe incluir preguntas específicas, metodologías aplicables y entregables concretos para la etapa ${stageText}
4. El prompt debe ser práctico y orientado a resultados tangibles
5. Incluye aspectos específicos de ${tool} relevantes para ${frameworkText}
6. Adapta el lenguaje y enfoque según el tamaño de empresa: ${projectContext.companySize}

Genera SOLO el prompt final que el UX Designer usará, sin explicaciones adicionales ni introducciones. El prompt debe comenzar directamente con instrucciones claras para la IA que lo recibirá.`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: metaPrompt,
          projectContext,
          selectedFramework,
          frameworkStage,
          selectedTool: tool,
          aiModel: "gpt-4o-mini", // Use OpenAI for prompt generation
        }
      });

      if (error) {
        console.error('Error generating prompt:', error);
        throw new Error(error.message || 'Error al generar el prompt');
      }

      if (data?.error) {
        throw new Error(data.error);
      }
      
      setGeneratedPrompt(data.aiResponse);
      
      toast({
        title: "¡Prompt Generado con IA!",
        description: "Tu prompt personalizado ha sido creado específicamente para tu proyecto.",
      });
    } catch (error: any) {
      console.error('Error generating prompt:', error);
      
      // Fallback to basic prompt structure if AI generation fails
      const fallbackPrompt = `Como UX Designer trabajando en la etapa de "${stageText}" del framework ${frameworkText}, necesito ayuda con ${tool}.

Contexto del proyecto:
- Industria: ${projectContext.industry}
- Tipo de empresa: ${projectContext.companySize}
- Producto: ${projectContext.productType}
- Alcance: ${projectContext.productScope}
- Audiencia objetivo: ${projectContext.userProfile}

Utilizando capacidades de IA, ayúdame a:

1. Generar 5 preguntas específicas para guiar mi proceso de ${tool} en este contexto
2. Sugerir 3 enfoques innovadores que aprovechen las características únicas de mi industria
3. Identificar 4 métricas clave que debería considerar para evaluar el éxito
4. Recomendar 2 herramientas complementarias que potencien este proceso
5. Proporcionar un checklist de 6 puntos críticos a validar antes de avanzar a la siguiente etapa

Asegúrate de que todas las recomendaciones estén alineadas con las mejores prácticas de ${frameworkText} y sean aplicables a ${projectContext.companySize} en ${projectContext.industry} que desarrolla ${projectContext.productType} con alcance ${projectContext.productScope}.`;

      setGeneratedPrompt(fallbackPrompt);
      
      toast({
        title: "Prompt Generado (Modo Básico)",
        description: "Se generó un prompt básico. La IA no está disponible temporalmente.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "¡Copiado!",
      description: "Prompt copiado al portapapeles.",
    });
  };

  const handleNewProject = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          name,
          description,
          selected_framework: "Por definir"
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentProject(data);
      setCurrentStep("context");
      sonnerToast.success("Proyecto creado exitosamente");
    } catch (error: any) {
      sonnerToast.error("Error al crear el proyecto");
      console.error(error);
    }
  };

  const handleExistingProject = (project: any) => {
    setCurrentProject(project);
    // If project has context from previous prompts, we can pre-fill some data
    setSelectedFramework(project.selected_framework);
    setCurrentStep("context");
  };

  const savePromptToProject = async () => {
    if (!currentProject || !generatedPrompt) return;

    try {
      const { error } = await supabase
        .from('generated_prompts')
        .insert({
          user_id: user?.id,
          project_id: currentProject.id,
          project_context: projectContext as any,
          selected_framework: selectedFramework,
          framework_stage: frameworkStage,
          selected_tool: selectedTool,
          original_prompt: generatedPrompt,
          ai_response: aiResponse
        });

      if (error) throw error;

      // Update project framework if it changed
      if (selectedFramework !== currentProject.selected_framework) {
        await supabase
          .from('projects')
          .update({ selected_framework: selectedFramework })
          .eq('id', currentProject.id);
      }

      sonnerToast.success("Prompt guardado en el proyecto");
    } catch (error: any) {
      sonnerToast.error("Error al guardar el prompt");
      console.error(error);
    }
  };

  const resetGenerator = () => {
    setCurrentStep("project");
    setCurrentProject(null);
    setProjectContext(null);
    setProjectStage("");
    setSelectedFramework("");
    setFrameworkStage("");
    setSelectedTool("");
    setGeneratedPrompt("");
    setAiResponse("");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "project":
        return (
          <ProjectSelectionStep 
            onNewProject={handleNewProject}
            onExistingProject={handleExistingProject}
          />
        );
      case "context":
        return <ProjectContextStep onNext={handleContextComplete} />;
      case "stage":
        return (
          <ProjectStageStep 
            context={projectContext!} 
            onNext={handleStageComplete}
            onBack={() => setCurrentStep("context")}
          />
        );
      case "framework":
        return (
          <FrameworkStep 
            context={projectContext!}
            projectStage={projectStage}
            onNext={handleFrameworkComplete}
            onBack={() => setCurrentStep("stage")}
          />
        );
      case "tool":
        return (
          <ToolSelectionStep 
            context={projectContext!}
            projectStage={projectStage}
            framework={selectedFramework}
            frameworkStage={frameworkStage}
            onGenerate={handleToolComplete}
            onBack={() => setCurrentStep("framework")}
          />
        );
      case "result":
        return (
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle>¡Prompt Generado!</CardTitle>
              <CardDescription>
                Tu prompt personalizado está listo para usar con ChatGPT, Claude u otras herramientas de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Textarea 
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="min-h-[200px] bg-transparent border-0 p-0 resize-none"
                  placeholder="Tu prompt generado aparecerá aquí..."
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
                  {isGeneratingAI ? "Generando..." : "Usar Prompt"}
                </Button>
                <Button onClick={() => generatePrompt(selectedTool)} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerar
                </Button>
                <Button onClick={savePromptToProject} variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar
                </Button>
                <Button onClick={resetGenerator} variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Nuevo Prompt
                </Button>
                <Button 
                  onClick={() => navigate('/prompt-library')} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Library className="h-4 w-4" />
                  Ver Biblioteca
                </Button>
              </div>

              {aiResponse && (
                <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">Respuesta de IA</h3>
                    <Button 
                      onClick={() => navigate('/chat', { 
                        state: { 
                          initialPrompt: generatedPrompt, 
                          initialResponse: aiResponse,
                          projectContext 
                        } 
                      })}
                      size="sm"
                      className="ml-auto"
                    >
                      Continuar en Chat
                    </Button>
                  </div>
                  <div className="bg-background/50 p-4 rounded-md max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm">{aiResponse}</div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{projectContext?.industry}</Badge>
                  <Badge variant="outline">{projectContext?.productType}</Badge>
                  <Badge variant="outline">{projectStage}</Badge>
                  {selectedFramework !== "none" && (
                    <>
                      <Badge variant="secondary">{selectedFramework}</Badge>
                      <Badge variant="outline">{frameworkStage}</Badge>
                    </>
                  )}
                  <Badge variant="outline">{selectedTool}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      {/* Loading Overlay */}
      <LoadingPromptGeneration 
        isLoading={isGeneratingPrompt}
        framework={selectedFramework}
        tool={selectedTool}
        industry={projectContext?.industry || ""}
      />
      
      <div className="container px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Generador de Prompts</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Genera prompts de IA personalizados para UX siguiendo un proceso paso a paso
          </p>
        </div>

        <div className="mb-8">
          <UsageLimitCard />
        </div>

        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Generator;