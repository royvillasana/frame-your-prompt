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
    stages: ["Empatizar", "Definir", "Idear", "Prototipar", "Testear", "Implementar"]
  },
  {
    id: "double-diamond",
    name: "Double Diamond",
    description: "Proceso de divergencia y convergencia en dos fases",
    tooltip: "Metodología del Design Council que alterna entre explorar y enfocar",
    stages: ["Descubrir", "Definir", "Desarrollar", "Entregar"]
  },
  {
    id: "lean-ux",
    name: "Lean UX",
    description: "Enfoque ágil con ciclos rápidos de experimentación",
    tooltip: "Metodología que combina design thinking con desarrollo ágil para iteraciones rápidas",
    stages: ["Pensar", "Hacer", "Verificar"]
  },
  {
    id: "google-design-sprint",
    name: "Google Design Sprint",
    description: "Sprint de innovación estructurado de 5 días",
    tooltip: "Metodología de Google para resolver problemas y validar ideas en una semana",
    stages: ["Entender (Lunes)", "Idear (Martes)", "Decidir (Miércoles)", "Prototipar (Jueves)", "Testear (Viernes)"]
  },
  {
    id: "human-centered-design",
    name: "Human-Centered Design",
    description: "Proceso de diseño impulsado por la empatía y la ética",
    tooltip: "Enfoque que pone las necesidades humanas en el centro del proceso de diseño",
    stages: ["Investigación", "Ideación", "Prototipado", "Implementación"]
  },
  {
    id: "jobs-to-be-done",
    name: "Jobs To Be Done (JTBD)",
    description: "Se enfoca en el 'trabajo' que el usuario quiere realizar",
    tooltip: "Framework que entiende las motivaciones y necesidades subyacentes de los usuarios",
    stages: ["Definir el trabajo", "Mapear el proceso", "Identificar oportunidades", "Diseñar soluciones"]
  },
  {
    id: "agile-ux",
    name: "Agile UX",
    description: "UX integrado dentro del desarrollo Ágil",
    tooltip: "Metodología que integra principios UX con sprints y desarrollo ágil",
    stages: ["Sprint Planning UX", "Design Sprint", "Validación", "Iteración"]
  },
  {
    id: "ux-lifecycle",
    name: "UX Lifecycle",
    description: "Enfoque académico y estructurado",
    tooltip: "Metodología completa y sistemática para proyectos de UX complejos",
    stages: ["Análisis", "Diseño", "Desarrollo", "Evaluación", "Implementación"]
  },
  {
    id: "ux-honeycomb",
    name: "UX Honeycomb",
    description: "Modelo heurístico para la calidad UX",
    tooltip: "Framework de Peter Morville para evaluar la experiencia de usuario",
    stages: ["Útil", "Usable", "Deseable", "Accesible", "Creíble", "Encontrable", "Valioso"]
  },
  {
    id: "user-centered-design",
    name: "User-Centered Design",
    description: "Diseño centrado en usuarios basado en ISO 9241-210",
    tooltip: "Estándar internacional para el diseño centrado en el usuario",
    stages: ["Contexto de uso", "Requisitos", "Diseño", "Evaluación"]
  },
  {
    id: "heart-framework",
    name: "HEART Framework",
    description: "Modelo de métricas UX de Google",
    tooltip: "Framework para medir la experiencia de usuario a través de métricas específicas",
    stages: ["Happiness", "Engagement", "Adoption", "Retention", "Task Success"]
  },
  {
    id: "hooked-model",
    name: "Hooked Model",
    description: "Diseño conductual para productos que crean hábitos",
    tooltip: "Framework de Nir Eyal para crear productos que generen engagement",
    stages: ["Trigger", "Action", "Variable Reward", "Investment"]
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
      return "design-thinking"; // Excelente para empatizar e investigar
    case "ideation":
      return "design-thinking"; // Ideal para la fase de ideación
    case "design":
      return "lean-ux"; // Perfecto para iteraciones rápidas
    case "testing":
      return "google-design-sprint"; // Excelente para testing rápido
    case "implementation":
      return "agile-ux"; // Ideal para integrar UX con desarrollo
    case "strategy":
      return "jobs-to-be-done"; // Perfecto para entender necesidades
    case "metrics":
      return "heart-framework"; // Específico para métricas UX
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
      return "Para testing, Google Design Sprint facilita ciclos rápidos de validación de prototipos.";
    case "implementation":
      return "Para implementación, Agile UX integra perfectamente UX con el desarrollo ágil.";
    case "strategy":
      return "Para estrategia, Jobs To Be Done ayuda a entender las motivaciones reales de los usuarios.";
    case "metrics":
      return "Para métricas, HEART Framework proporciona un modelo estructurado para medir la experiencia de usuario.";
    default:
      return "Design Thinking es ideal para comenzar con un enfoque centrado en el usuario.";
  }
};

const getFrameworkStageMapping = (projectStage: string, frameworkId: string): string => {
  const mappings: { [key: string]: { [key: string]: string } } = {
    "design-thinking": {
      "research": "Empatizar",
      "ideation": "Idear", 
      "design": "Prototipar",
      "testing": "Testear",
      "implementation": "Implementar"
    },
    "double-diamond": {
      "research": "Descubrir",
      "ideation": "Definir",
      "design": "Desarrollar",
      "testing": "Desarrollar", 
      "implementation": "Entregar"
    },
    "lean-ux": {
      "research": "Pensar",
      "ideation": "Pensar",
      "design": "Hacer",
      "testing": "Verificar",
      "implementation": "Verificar"
    },
    "google-design-sprint": {
      "research": "Entender (Lunes)",
      "ideation": "Idear (Martes)",
      "design": "Prototipar (Jueves)",
      "testing": "Testear (Viernes)",
      "implementation": "Decidir (Miércoles)"
    },
    "human-centered-design": {
      "research": "Investigación",
      "ideation": "Ideación",
      "design": "Prototipado",
      "testing": "Investigación",
      "implementation": "Implementación"
    },
    "jobs-to-be-done": {
      "research": "Definir el trabajo",
      "ideation": "Identificar oportunidades",
      "design": "Diseñar soluciones",
      "testing": "Mapear el proceso",
      "implementation": "Diseñar soluciones"
    },
    "agile-ux": {
      "research": "Sprint Planning UX",
      "ideation": "Design Sprint",
      "design": "Design Sprint",
      "testing": "Validación",
      "implementation": "Iteración"
    },
    "ux-lifecycle": {
      "research": "Análisis",
      "ideation": "Análisis",
      "design": "Diseño",
      "testing": "Evaluación",
      "implementation": "Implementación"
    },
    "ux-honeycomb": {
      "research": "Útil",
      "ideation": "Deseable",
      "design": "Usable",
      "testing": "Accesible",
      "implementation": "Valioso"
    },
    "user-centered-design": {
      "research": "Contexto de uso",
      "ideation": "Requisitos",
      "design": "Diseño",
      "testing": "Evaluación",
      "implementation": "Diseño"
    },
    "heart-framework": {
      "research": "Happiness",
      "ideation": "Engagement",
      "design": "Adoption",
      "testing": "Task Success",
      "implementation": "Retention"
    },
    "hooked-model": {
      "research": "Trigger",
      "ideation": "Action",
      "design": "Variable Reward",
      "testing": "Investment",
      "implementation": "Trigger"
    }
  };

  return mappings[frameworkId]?.[projectStage] || "";
};

export const FrameworkStep = ({ context, projectStage, onNext, onBack }: FrameworkStepProps) => {
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  
  const recommendedFramework = getRecommendedFramework(projectStage);
  const currentFramework = frameworks.find(f => f.id === selectedFramework);

  const handleFrameworkSelect = (frameworkId: string) => {
    setSelectedFramework(frameworkId);
    
    // Auto-select the corresponding framework stage based on project stage
    if (frameworkId !== "none") {
      const mappedStage = getFrameworkStageMapping(projectStage, frameworkId);
      setSelectedStage(mappedStage);
    } else {
      setSelectedStage(""); // Reset stage when framework changes to "none"
    }
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
            <p className="text-sm text-muted-foreground mb-3">
              Basado en tu etapa de proyecto ({projectStage}), hemos preseleccionado la etapa más apropiada.
            </p>
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