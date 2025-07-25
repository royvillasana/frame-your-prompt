import { useState } from "react";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Lightbulb } from "lucide-react";
import { ProjectContext } from "./ProjectContextStep";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FrameworkStepProps {
  context: ProjectContext;
  projectStage: string;
  onNext: (framework: string, stage: string) => void;
  onBack: () => void;
}

const frameworks = [
  {
    id: "design-thinking",
    name: "Design Thinking",
    description: "Proceso centrado en el usuario con 5 etapas iterativas",
    tooltip: "Metodología que prioriza la empatía con el usuario para crear soluciones innovadoras",
    stages: ["Empatizar", "Definir", "Idear", "Prototipar", "Testear"]
  },
  {
    id: "lean-ux",
    name: "Lean UX",
    description: "Enfoque ágil con ciclos rápidos de experimentación",
    tooltip: "Metodología que combina design thinking con desarrollo ágil para iteraciones rápidas",
    stages: ["Pensar", "Hacer", "Verificar"]
  },
  {
    id: "double-diamond",
    name: "Double Diamond",
    description: "Proceso de divergencia y convergencia en dos fases",
    tooltip: "Metodología del Design Council que alterna entre explorar y enfocar",
    stages: ["Descubrir", "Definir", "Desarrollar", "Entregar"]
  },
  {
    id: "none",
    name: "No uso framework",
    description: "Trabajamos de forma libre sin metodología específica",
    tooltip: "Te ayudaremos a sugerir el framework más adecuado para tu situación",
    stages: []
  }
];

const getRecommendedFramework = (projectStage: string) => {
  switch (projectStage) {
    case "research":
      return "design-thinking";
    case "ideation":
      return "design-thinking";
    case "design":
      return "lean-ux";
    case "testing":
      return "lean-ux";
    case "implementation":
      return "double-diamond";
    default:
      return "design-thinking";
  }
};

const getRecommendationText = (projectStage: string) => {
  switch (projectStage) {
    case "research":
      return "Para la etapa de investigación, recomendamos Design Thinking por su enfoque en empatía y comprensión del usuario.";
    case "ideation":
      return "Para la generación de ideas, Design Thinking ofrece herramientas específicas para la ideación creativa.";
    case "design":
      return "Para el diseño, Lean UX permite iteraciones rápidas y validación continua de conceptos.";
    case "testing":
      return "Para testing, Lean UX facilita ciclos rápidos de experimentación y mejora.";
    case "implementation":
      return "Para implementación, Double Diamond asegura una entrega estructurada y bien definida.";
    default:
      return "Design Thinking es ideal para comenzar con un enfoque centrado en el usuario.";
  }
};

export const FrameworkStep = ({ context, projectStage, onNext, onBack }: FrameworkStepProps) => {
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  
  const recommendedFramework = getRecommendedFramework(projectStage);
  const currentFramework = frameworks.find(f => f.id === selectedFramework);

  const handleFrameworkSelect = (frameworkId: string) => {
    setSelectedFramework(frameworkId);
    setSelectedStage(""); // Reset stage when framework changes
  };

  const handleNext = () => {
    if (selectedFramework && (selectedFramework === "none" || selectedStage)) {
      onNext(selectedFramework, selectedStage);
    }
  };

  const canProceed = selectedFramework && (selectedFramework === "none" || selectedStage);

  return (
    <StepCard
      step={3}
      totalSteps={4}
      title="Framework UX"
      description="¿Utilizas alguna metodología UX específica en tu proyecto?"
    >
      <div className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Proyecto:</strong> {context.industry} • {context.productType} • Etapa: {projectStage}
          </p>
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Recomendación:</strong> {getRecommendationText(projectStage)}
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="font-semibold mb-3">¿Qué framework UX utilizas?</h3>
          <div className="grid gap-3">
            {frameworks.map((framework) => (
              <OptionCard
                key={framework.id}
                title={framework.name}
                description={framework.description}
                tooltip={framework.tooltip}
                badge={framework.id === recommendedFramework ? "Recomendado" : undefined}
                isSelected={selectedFramework === framework.id}
                onClick={() => handleFrameworkSelect(framework.id)}
              />
            ))}
          </div>
        </div>

        {currentFramework && currentFramework.stages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">¿En qué etapa del {currentFramework.name} estás?</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentFramework.stages.map((stage, index) => (
                <OptionCard
                  key={stage}
                  title={stage}
                  description={`Etapa ${index + 1} del framework ${currentFramework.name}`}
                  isSelected={selectedStage === stage}
                  onClick={() => setSelectedStage(stage)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={handleNext} disabled={!canProceed} size="lg">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};