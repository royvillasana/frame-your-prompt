import { useState, useEffect } from "react";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ProjectBasicInfoStepProps {
  onNext: (info: ProjectBasicInfo) => void;
  initialInfo?: ProjectBasicInfo | null;
}

export interface ProjectBasicInfo {
  productType: string;
}

const productTypes = [
  { id: "mobile", name: "Mobile App", description: "Native or hybrid application for mobile devices", tooltip: "iOS, Android, React Native, Flutter, etc." },
  { id: "web", name: "Web Application", description: "Progressive web app or SPA", tooltip: "React, Vue, Angular, browser applications" },
  { id: "website", name: "Website", description: "Corporate or informational website", tooltip: "Landing pages, corporate sites, blogs, etc." },
  { id: "platform", name: "Platform", description: "Complete system with multiple functionalities", tooltip: "Complex ecosystems, dashboards, CRM, etc." }
];



export const ProjectBasicInfoStep = ({ onNext, initialInfo }: ProjectBasicInfoStepProps) => {
  const [selectedProductType, setSelectedProductType] = useState("");

  // Pre-fill form with initial info if provided
  useEffect(() => {
    if (initialInfo) {
      setSelectedProductType(initialInfo.productType || "");
    }
  }, [initialInfo]);

  const canProceed = selectedProductType;

  const handleNext = () => {
    if (canProceed) {
      onNext({
        productType: selectedProductType,
      });
    }
  };

  return (
    <StepCard
      step={1}
      totalSteps={5}
      title="Basic Project Information"
      description="Tell us about your project's industry and scope"
    >
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">What type of product are you developing?</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {productTypes.map((product) => (
              <OptionCard
                key={product.id}
                title={product.name}
                description={product.description}
                tooltip={product.tooltip}
                isSelected={selectedProductType === product.id}
                onClick={() => setSelectedProductType(product.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} disabled={!canProceed} size="lg">
            Continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};