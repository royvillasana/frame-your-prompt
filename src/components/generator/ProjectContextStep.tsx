import { useState } from "react";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ProjectContextStepProps {
  onNext: (context: ProjectContext) => void;
}

export interface ProjectContext {
  industry: string;
  productType: string;
  companySize: string;
  productScope: string;
  userProfile: string;
}

const industries = [
  { id: "healthtech", name: "HealthTech", description: "Aplicaciones y plataformas relacionadas con salud y bienestar", tooltip: "Incluye telemedicina, fitness apps, registro médico digital, etc." },
  { id: "fintech", name: "FinTech", description: "Servicios financieros digitales y tecnología bancaria", tooltip: "Apps de pagos, inversión, créditos, wallets digitales, etc." },
  { id: "edtech", name: "EdTech", description: "Plataformas educativas y herramientas de aprendizaje", tooltip: "LMS, cursos online, herramientas para estudiantes, etc." },
  { id: "ecommerce", name: "E-commerce", description: "Comercio electrónico y marketplace", tooltip: "Tiendas online, marketplaces, plataformas de venta, etc." },
  { id: "saas", name: "SaaS", description: "Software como servicio para empresas", tooltip: "Herramientas B2B, software empresarial, productividad, etc." },
  { id: "other", name: "Otro", description: "Otras industrias no listadas", tooltip: "Gaming, travel, real estate, food & beverage, etc." }
];

const productTypes = [
  { id: "mobile", name: "App Móvil", description: "Aplicación nativa o híbrida para dispositivos móviles", tooltip: "iOS, Android, React Native, Flutter, etc." },
  { id: "web", name: "Aplicación Web", description: "Aplicación web progresiva o SPA", tooltip: "React, Vue, Angular, aplicaciones de navegador" },
  { id: "website", name: "Sitio Web", description: "Sitio web corporativo o informativo", tooltip: "Landing pages, sitios corporativos, blogs, etc." },
  { id: "platform", name: "Plataforma", description: "Sistema completo con múltiples funcionalidades", tooltip: "Ecosistemas complejos, dashboards, CRM, etc." }
];

const companySizes = [
  { id: "startup", name: "Startup", description: "Empresa emergente con equipo pequeño", tooltip: "1-20 empleados, producto en desarrollo inicial" },
  { id: "small", name: "Pequeña", description: "Empresa establecida con equipo reducido", tooltip: "21-50 empleados, producto en crecimiento" },
  { id: "medium", name: "Mediana", description: "Empresa en crecimiento con múltiples equipos", tooltip: "51-200 empleados, producto establecido" },
  { id: "large", name: "Grande", description: "Empresa consolidada con múltiples productos", tooltip: "201+ empleados, múltiples líneas de producto" }
];

export const ProjectContextStep = ({ onNext }: ProjectContextStepProps) => {
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedProductType, setSelectedProductType] = useState("");
  const [selectedCompanySize, setSelectedCompanySize] = useState("");

  const canProceed = selectedIndustry && selectedProductType && selectedCompanySize;

  const handleNext = () => {
    if (canProceed) {
      onNext({
        industry: selectedIndustry,
        productType: selectedProductType,
        companySize: selectedCompanySize,
        productScope: "national", // Default value
        userProfile: "b2c" // Default value
      });
    }
  };

  return (
    <StepCard
      step={1}
      totalSteps={4}
      title="Contexto del Proyecto"
      description="Cuéntanos sobre tu proyecto para generar prompts más relevantes"
    >
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">¿En qué industria trabajas?</h3>
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
          <h3 className="font-semibold mb-3">¿Qué tipo de producto estás desarrollando?</h3>
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
          <h3 className="font-semibold mb-3">¿Cuál es el tamaño de tu empresa?</h3>
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

        <div className="flex justify-end pt-4">
          <Button onClick={handleNext} disabled={!canProceed} size="lg">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};