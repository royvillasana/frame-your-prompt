import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Save, Download, Sparkles, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ProjectContextStep, ProjectContext } from "@/components/generator/ProjectContextStep";
import { ProjectStageStep } from "@/components/generator/ProjectStageStep";
import { FrameworkStep } from "@/components/generator/FrameworkStep";
import { ToolSelectionStep } from "@/components/generator/ToolSelectionStep";

type Step = "context" | "stage" | "framework" | "tool" | "result";

const Generator = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>("context");
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [projectStage, setProjectStage] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [frameworkStage, setFrameworkStage] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

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

  const generatePrompt = (tool: string) => {
    if (!projectContext) return;

    let basePrompt = `Genera 5 prompts específicos para ${tool.toLowerCase()}`;
    
    if (selectedFramework !== "none" && frameworkStage) {
      basePrompt += ` en la etapa ${frameworkStage} del framework ${selectedFramework}`;
    } else {
      basePrompt += ` para la etapa de ${projectStage} del proyecto`;
    }
    
    basePrompt += `. Esto es para una empresa ${projectContext.companySize.toLowerCase()} en el sector ${projectContext.industry}`;
    basePrompt += `, desarrollando un ${projectContext.productType.toLowerCase()}`;
    basePrompt += `. Los prompts deben ser específicos, accionables y listos para usar con herramientas de IA como ChatGPT o Claude.`;
    basePrompt += ` Incluye contexto específico de la industria y tipo de producto. Cada prompt debe generar resultados únicos y valiosos.`;

    setGeneratedPrompt(basePrompt);
    
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
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar
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
              </div>

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