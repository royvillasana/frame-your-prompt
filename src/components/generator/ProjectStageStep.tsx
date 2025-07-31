import { useState } from "react";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

interface ProjectStageStepProps {
  context: {
    industry?: string;
    productType?: string;
    companySize?: string;
    projectDescription?: string;
  };
  onNext: (stage: string) => void;
  onBack: () => void;
}

const projectStages = [
  {
    id: "research",
    name: "Research",
    description: "Understanding user needs and market landscape"
  },
  {
    id: "ideation",
    name: "Ideation",
    description: "Generating and exploring ideas"
  },
  {
    id: "prototyping",
    name: "Prototyping",
    description: "Creating early versions of the product"
  },
  {
    id: "testing",
    name: "Testing",
    description: "Validating with users and gathering feedback"
  },
  {
    id: "development",
    name: "Development",
    description: "Building the final product"
  }
];

export const ProjectStageStep = ({ context, onNext, onBack }: ProjectStageStepProps) => {
  const [selectedStage, setSelectedStage] = useState<string>("");

  // Safely get context values with fallbacks
  const contextInfo = [
    context?.industry,
    context?.productType,
    context?.companySize
  ].filter(Boolean).join(" • ") || "No additional context provided";

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
            <strong>Context:</strong> {contextInfo}
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
                isSelected={selectedStage === stage.id}
                onClick={() => setSelectedStage(stage.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={() => onNext(selectedStage)}
            disabled={!selectedStage}
          >
            Next <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};

export default ProjectStageStep;