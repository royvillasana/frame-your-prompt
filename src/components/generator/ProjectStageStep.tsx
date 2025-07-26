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
    name: "Research",
    description: "We are researching the problem and understanding users",
    tooltip: "User research, market analysis, problem definition",
    badge: "Beginning"
  },
  {
    id: "ideation",
    name: "Ideation",
    description: "Generating ideas and concepts for the solution",
    tooltip: "Brainstorming, concept development, solution exploration",
    badge: "Creative"
  },
  {
    id: "design",
    name: "Design",
    description: "Creating wireframes, prototypes and designs",
    tooltip: "Wireframing, prototyping, visual design, interaction design",
    badge: "Visual"
  },
  {
    id: "testing",
    name: "Testing",
    description: "Validating designs with real users",
    tooltip: "Usability testing, A/B testing, user feedback collection",
    badge: "Validation"
  },
  {
    id: "implementation",
    name: "Implementation",
    description: "Developing and launching the product",
    tooltip: "Development handoff, QA, launch preparation",
    badge: "Launch"
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
      title="Project Stage"
      description="What stage is your project currently in?"
    >
      <div className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Context:</strong> {context.industry} • {context.productType} • {context.companySize}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Select the current stage of your project</h3>
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
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!selectedStage} size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};