import { useState, useEffect } from "react";
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
  aiRecommendations?: {
    recommendedFramework?: string;
    recommendedTool?: string;
    reasoning?: string;
  };
  initialFramework?: string;
  initialFrameworkStage?: string;
}

const frameworks = [
  {
    id: "design-thinking",
    name: "Design Thinking",
    description: "User-centered process with 5 iterative stages",
    tooltip: "Methodology that prioritizes user empathy to create innovative solutions",
    stages: ["Empathize", "Define", "Ideate", "Prototype", "Test", "Implement"]
  },
  {
    id: "double-diamond",
    name: "Double Diamond",
    description: "Divergence and convergence process in two phases",
    tooltip: "Design Council methodology that alternates between exploring and focusing",
    stages: ["Discover", "Define", "Develop", "Deliver"]
  },
  {
    id: "lean-ux",
    name: "Lean UX",
    description: "Agile approach with rapid experimentation cycles",
    tooltip: "Methodology that combines design thinking with agile development for rapid iterations",
    stages: ["Think", "Make", "Check"]
  },
  {
    id: "google-design-sprint",
    name: "Google Design Sprint",
    description: "5-day structured innovation sprint",
    tooltip: "Google methodology to solve problems and validate ideas in one week",
    stages: ["Understand (Mon)", "Ideate (Tue)", "Decide (Wed)", "Prototype (Thu)", "Test (Fri)"]
  },
  {
    id: "human-centered-design",
    name: "Human-Centered Design",
    description: "Design process driven by empathy and ethics",
    tooltip: "Approach that puts human needs at the center of the design process",
    stages: ["Research", "Ideation", "Prototyping", "Implementation"]
  },
  {
    id: "jobs-to-be-done",
    name: "Jobs To Be Done (JTBD)",
    description: "Focuses on the 'job' the user wants to accomplish",
    tooltip: "Framework that understands the underlying motivations and needs of users",
    stages: ["Define the job", "Map the process", "Identify opportunities", "Design solutions"]
  },
  {
    id: "agile-ux",
    name: "Agile UX",
    description: "UX integrated within Agile development",
    tooltip: "Methodology that integrates UX principles with sprints and agile development",
    stages: ["UX Sprint Planning", "Design Sprint", "Validation", "Iteration"]
  },
  {
    id: "ux-lifecycle",
    name: "UX Lifecycle",
    description: "Academic and structured approach",
    tooltip: "Complete and systematic methodology for complex UX projects",
    stages: ["Analysis", "Design", "Development", "Evaluation", "Implementation"]
  },
  {
    id: "ux-honeycomb",
    name: "UX Honeycomb",
    description: "Heuristic model for UX quality",
    tooltip: "Peter Morville's framework for evaluating user experience",
    stages: ["Useful", "Usable", "Desirable", "Accessible", "Credible", "Findable", "Valuable"]
  },
  {
    id: "user-centered-design",
    name: "User-Centered Design",
    description: "User-centered design based on ISO 9241-210",
    tooltip: "International standard for user-centered design",
    stages: ["Context of use", "Requirements", "Design", "Evaluation"]
  },
  {
    id: "heart-framework",
    name: "HEART Framework",
    description: "Google's UX metrics model",
    tooltip: "Framework for measuring user experience through specific metrics",
    stages: ["Happiness", "Engagement", "Adoption", "Retention", "Task Success"]
  },
  {
    id: "hooked-model",
    name: "Hooked Model",
    description: "Behavioral design for habit-forming products",
    tooltip: "Nir Eyal's framework for creating engaging products",
    stages: ["Trigger", "Action", "Variable Reward", "Investment"]
  },
  {
    id: "none",
    name: "No framework",
    description: "We work freely without specific methodology",
    tooltip: "We'll help suggest the most suitable framework for your situation",
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
      return "For the research stage, we recommend Design Thinking for its focus on empathy and user understanding.";
    case "ideation":
      return "For idea generation, Design Thinking offers specific tools for creative ideation.";
    case "design":
      return "For design, Lean UX allows rapid iterations and continuous concept validation.";
    case "testing":
      return "For testing, Google Design Sprint facilitates rapid prototype validation cycles.";
    case "implementation":
      return "For implementation, Agile UX perfectly integrates UX with agile development.";
    case "strategy":
      return "For strategy, Jobs To Be Done helps understand users' real motivations.";
    case "metrics":
      return "For metrics, HEART Framework provides a structured model for measuring user experience.";
    default:
      return "Design Thinking is ideal for starting with a user-centered approach.";
  }
};

const getFrameworkStageMapping = (projectStage: string, frameworkId: string): string => {
  const mappings: { [key: string]: { [key: string]: string } } = {
    "design-thinking": {
      "research": "Empathize",
      "ideation": "Ideate", 
      "design": "Prototype",
      "testing": "Test",
      "implementation": "Implement"
    },
    "double-diamond": {
      "research": "Discover",
      "ideation": "Define",
      "design": "Develop",
      "testing": "Develop", 
      "implementation": "Deliver"
    },
    "lean-ux": {
      "research": "Think",
      "ideation": "Think",
      "design": "Make",
      "testing": "Check",
      "implementation": "Check"
    },
    "google-design-sprint": {
      "research": "Understand (Mon)",
      "ideation": "Ideate (Tue)",
      "design": "Prototype (Thu)",
      "testing": "Test (Fri)",
      "implementation": "Decide (Wed)"
    },
    "human-centered-design": {
      "research": "Research",
      "ideation": "Ideation",
      "design": "Prototyping",
      "testing": "Research",
      "implementation": "Implementation"
    },
    "jobs-to-be-done": {
      "research": "Define the job",
      "ideation": "Identify opportunities",
      "design": "Design solutions",
      "testing": "Map the process",
      "implementation": "Design solutions"
    },
    "agile-ux": {
      "research": "UX Sprint Planning",
      "ideation": "Design Sprint",
      "design": "Design Sprint",
      "testing": "Validation",
      "implementation": "Iteration"
    },
    "ux-lifecycle": {
      "research": "Analysis",
      "ideation": "Analysis",
      "design": "Design",
      "testing": "Evaluation",
      "implementation": "Implementation"
    },
    "ux-honeycomb": {
      "research": "Useful",
      "ideation": "Desirable",
      "design": "Usable",
      "testing": "Accessible",
      "implementation": "Valuable"
    },
    "user-centered-design": {
      "research": "Context of use",
      "ideation": "Requirements",
      "design": "Design",
      "testing": "Evaluation",
      "implementation": "Design"
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

export const FrameworkStep = ({ context, projectStage, onNext, onBack, aiRecommendations, initialFramework, initialFrameworkStage }: FrameworkStepProps) => {
  const [selectedFramework, setSelectedFramework] = useState(initialFramework || aiRecommendations?.recommendedFramework || "");
  const [selectedStage, setSelectedStage] = useState(initialFrameworkStage || "");
  
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

  // Auto-select stage when framework is preselected by AI or from previous prompt
  useEffect(() => {
    if (initialFrameworkStage) {
      // Use the framework stage from previous prompt (highest priority)
      setSelectedStage(initialFrameworkStage);
    } else if (aiRecommendations?.recommendedFramework && aiRecommendations.recommendedFramework !== "none") {
      // Fall back to AI recommendation mapping
      const mappedStage = getFrameworkStageMapping(projectStage, aiRecommendations.recommendedFramework);
      setSelectedStage(mappedStage);
    }
  }, [aiRecommendations, projectStage, initialFrameworkStage]);

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
      title="UX Framework"
      description="Do you use any specific UX methodology in your project?"
    >
      <div className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Project:</strong> {context.industry} • {context.productType} • Stage: {projectStage}
          </p>
        </div>

        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertDescription>
            <strong>Recommendation:</strong> {getRecommendationText(projectStage)}
          </AlertDescription>
        </Alert>

        <div>
          <h3 className="font-semibold mb-3">What UX framework do you use?</h3>
          <div className="grid gap-3">
            {frameworks.map((framework) => (
              <OptionCard
                key={framework.id}
                title={framework.name}
                description={framework.description}
                tooltip={framework.tooltip}
                badge={framework.id === initialFramework ? "Previously Used" :
                       framework.id === aiRecommendations?.recommendedFramework ? "AI Recommended" : 
                       framework.id === recommendedFramework ? "Recommended" : undefined}
                isSelected={selectedFramework === framework.id}
                onClick={() => handleFrameworkSelect(framework.id)}
              />
            ))}
          </div>
        </div>

        {currentFramework && currentFramework.stages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">What stage of {currentFramework.name} are you in?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Based on your project stage ({projectStage}), we have preselected the most appropriate stage.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentFramework.stages.map((stage, index) => (
                <OptionCard
                  key={stage}
                  title={stage}
                  description={`Stage ${index + 1} of ${currentFramework.name} framework`}
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
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!canProceed} size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};