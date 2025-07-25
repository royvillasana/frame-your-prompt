import { useState } from "react";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { ProjectContext } from "./ProjectContextStep";

interface ProjectStageStepProps {
  context: ProjectContext;
  onNext: (stage: string) => void;
  onBack: () => void;
}

const projectStages = [
  {
    id: "research",
    name: "Investigación",
    description: "Estamos investigando el problema y entendiendo a los usuarios",
    tooltip: "User research, market analysis, problem definition",
    badge: "Inicio"
  },
  {
    id: "ideation",
    name: "Ideación",
    description: "Generando ideas y conceptos para la solución",
    tooltip: "Brainstorming, concept development, solution exploration",
    badge: "Creativo"
  },
  {
    id: "design",
    name: "Diseño",
    description: "Creando wireframes, prototipos y diseños",
    tooltip: "Wireframing, prototyping, visual design, interaction design",
    badge: "Visual"
  },
  {
    id: "testing",
    name: "Testing",
    description: "Validando diseños con usuarios reales",
    tooltip: "Usability testing, A/B testing, user feedback collection",
    badge: "Validación"
  },
  {
    id: "implementation",
    name: "Implementación",
    description: "Desarrollando y lanzando el producto",
    tooltip: "Development handoff, QA, launch preparation",
    badge: "Lanzamiento"
  }
];

export const ProjectStageStep = ({ context, onNext, onBack }: ProjectStageStepProps) => {
  const [selectedStage, setSelectedStage] = useState("");

  const handleNext = () => {
    if (selectedStage) {
      onNext(selectedStage);
    }
  };

  return (
    <StepCard
      step={2}
      totalSteps={4}
      title="Etapa del Proyecto"
      description="¿En qué etapa se encuentra actualmente tu proyecto?"
    >
      <div className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Contexto:</strong> {context.industry} • {context.productType} • {context.companySize}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Selecciona la etapa actual de tu proyecto</h3>
          <div className="grid gap-3">
            {projectStages.map((stage) => (
              <OptionCard
                key={stage.id}
                title={stage.name}
                description={stage.description}
                tooltip={stage.tooltip}
                badge={stage.badge}
                isSelected={selectedStage === stage.id}
                onClick={() => setSelectedStage(stage.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={handleNext} disabled={!selectedStage} size="lg">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};