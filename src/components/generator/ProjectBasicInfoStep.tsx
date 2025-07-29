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
  industry: string;
  productType: string;
  companySize: string;
  targetAudience: string;
}

const industries = [
  { id: "healthtech", name: "HealthTech", description: "Health and wellness related applications and platforms", tooltip: "Includes telemedicine, fitness apps, digital medical records, etc." },
  { id: "fintech", name: "FinTech", description: "Digital financial services and banking technology", tooltip: "Payment apps, investment, credit, digital wallets, etc." },
  { id: "edtech", name: "EdTech", description: "Educational platforms and learning tools", tooltip: "LMS, online courses, student tools, etc." },
  { id: "ecommerce", name: "E-commerce", description: "Electronic commerce and marketplace", tooltip: "Online stores, marketplaces, sales platforms, etc." },
  { id: "saas", name: "SaaS", description: "Software as a service for businesses", tooltip: "B2B tools, business software, productivity, etc." },
  { id: "other", name: "Other", description: "Other industries not listed", tooltip: "Gaming, travel, real estate, food & beverage, etc." }
];

const productTypes = [
  { id: "mobile", name: "Mobile App", description: "Native or hybrid application for mobile devices", tooltip: "iOS, Android, React Native, Flutter, etc." },
  { id: "web", name: "Web Application", description: "Progressive web app or SPA", tooltip: "React, Vue, Angular, browser applications" },
  { id: "website", name: "Website", description: "Corporate or informational website", tooltip: "Landing pages, corporate sites, blogs, etc." },
  { id: "platform", name: "Platform", description: "Complete system with multiple functionalities", tooltip: "Complex ecosystems, dashboards, CRM, etc." }
];

const companySizes = [
  { id: "startup", name: "Startup", description: "Emerging company with small team", tooltip: "1-20 employees, product in initial development" },
  { id: "small", name: "Small", description: "Established company with reduced team", tooltip: "21-50 employees, growing product" },
  { id: "medium", name: "Medium", description: "Growing company with multiple teams", tooltip: "51-200 employees, established product" },
  { id: "large", name: "Large", description: "Consolidated company with multiple products", tooltip: "201+ employees, multiple product lines" }
];

export const ProjectBasicInfoStep = ({ onNext, initialInfo }: ProjectBasicInfoStepProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedCompanySize, setSelectedCompanySize] = useState("");
  const [targetAudience, setTargetAudience] = useState("");

  // Pre-fill form with initial info if provided
  useEffect(() => {
    if (initialInfo) {
      setSelectedIndustry(initialInfo.industry || "");
      setSelectedProductType(initialInfo.productType || "");
      setSelectedCompanySize(initialInfo.companySize || "");
      setTargetAudience(initialInfo.targetAudience || "");
    }
  }, [initialInfo]);

  const canProceed = selectedIndustry && selectedProductType && selectedCompanySize && targetAudience;

  const handleNext = () => {
    if (canProceed) {
      onNext({
        industry: selectedIndustry,
        productType: selectedProductType,
        companySize: selectedCompanySize,
        targetAudience: targetAudience,
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
          <h3 className="font-semibold mb-3">What industry do you work in?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {industries.map((industry) => (
              <OptionCard
                key={industry.id}
                title={industry.name}
                description={industry.description}
                tooltip={industry.tooltip}
                isSelected={selectedIndustry === industry.id}
                onClick={() => setSelectedIndustry(industry.id)}
              />
            ))}
          </div>
        </div>

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

        <div>
          <h3 className="font-semibold mb-3">What is the size of your company?</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {companySizes.map((size) => (
              <OptionCard
                key={size.id}
                title={size.name}
                description={size.description}
                tooltip={size.tooltip}
                isSelected={selectedCompanySize === size.id}
                onClick={() => setSelectedCompanySize(size.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="target-audience" className="font-semibold">Who is your target audience?</Label>
          <p className="text-sm text-muted-foreground mb-2">Describe your ideal user or customer. This will help tailor the AI response.</p>
          <Textarea
            id="target-audience"
            placeholder="e.g., Young professionals aged 25-35 who are interested in personal finance..."
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            rows={4}
          />
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