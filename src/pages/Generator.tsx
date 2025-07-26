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
import { AIModelSelector } from "@/components/generator/AIModelSelector";
import { useAIUsage } from "@/hooks/useAIUsage";

type Step = "context" | "stage" | "framework" | "tool" | "result";

const Generator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshUsage } = useAIUsage();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("context");
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [projectStage, setProjectStage] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [frameworkStage, setFrameworkStage] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [selectedAIModel, setSelectedAIModel] = useState("gpt-3.5-turbo-free");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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

  const handleToolComplete = (tool: string) => {
    setSelectedTool(tool);
    generatePrompt(tool);
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
      
      // Check for specific API errors and provide helpful messages
      if (errorMessage.includes("exceeded your current quota")) {
        sonnerToast.error("Tu API key de OpenAI ha excedido la cuota. Revisa tu plan y facturación en OpenAI.");
      } else if (errorMessage.includes("API key no configurada")) {
        sonnerToast.error("Debes configurar una API key en tu perfil para usar esta función.", {
          action: {
            label: "Ir a Perfil",
            onClick: () => navigate('/profile')
          }
        });
      } else if (errorMessage.includes("Incorrect API key")) {
        sonnerToast.error("Tu API key es incorrecta. Verifica en tu perfil.");
      } else {
        sonnerToast.error(errorMessage);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generatePrompt = (tool: string) => {
    if (!projectContext) return;

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

    // Build the structured prompt
    const structuredPrompt = `Como UX Designer trabajando en la etapa de "${stageText}" del framework ${frameworkText}, necesito ayuda con ${tool}.

Contexto del proyecto:
- Industria: ${projectContext.industry}
- Tipo de empresa: ${projectContext.companySize}
- Producto: ${projectContext.productType}
- Alcance: ${projectContext.productScope}
- Audiencia objetivo: ${projectContext.userProfile}

Utilizando capacidades de IA (análisis de datos, síntesis de información, generación de contenido), ayúdame a:

1. Generar 5 preguntas específicas para guiar mi proceso de ${tool} en este contexto
2. Sugerir 3 enfoques innovadores que aprovechen las características únicas de mi industria
3. Identificar 4 métricas clave que debería considerar para evaluar el éxito
4. Recomendar 2 herramientas complementarias que potencien este proceso
5. Proporcionar un checklist de 6 puntos críticos a validar antes de avanzar a la siguiente etapa

Asegúrate de que todas las recomendaciones estén alineadas con las mejores prácticas de ${frameworkText} y sean aplicables a ${projectContext.companySize} en ${projectContext.industry} que desarrolla ${projectContext.productType} con alcance ${projectContext.productScope}.`;

    setGeneratedPrompt(structuredPrompt);
    
    toast({
      title: "¡Prompt Generado!",
      description: "Tu prompt personalizado está listo para usar.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "¡Copiado!",
      description: "Prompt copiado al portapapeles.",
    });
  };

  const resetGenerator = () => {
    setCurrentStep("context");
    setProjectContext(null);
    setProjectStage("");
    setSelectedFramework("");
    setFrameworkStage("");
    setSelectedTool("");
    setGeneratedPrompt("");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
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
              
              <AIModelSelector 
                selectedModel={selectedAIModel}
                onModelSelect={setSelectedAIModel}
                disabled={isGeneratingAI}
              />
              
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
                <Button variant="outline" size="sm">
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

        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Generator;