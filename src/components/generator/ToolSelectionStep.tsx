import { useState } from "react";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ProjectContext } from "./ProjectContextStep";

interface ToolSelectionStepProps {
  context: ProjectContext;
  projectStage: string;
  framework: string;
  frameworkStage: string;
  onGenerate: (tool: string) => void;
  onBack: () => void;
}

const getToolsByFrameworkAndStage = (framework: string, stage: string) => {
  const toolMap: { [key: string]: { [key: string]: any[] } } = {
    "design-thinking": {
      "Empathize": [
        { id: "interviews", name: "User Interviews", description: "Deep conversations with users to understand needs", tooltip: "Qualitative technique to get direct insights from users" },
        { id: "empathy-map", name: "Empathy Map", description: "Visualization of what the user thinks, feels, sees and does", tooltip: "Visual tool to synthesize observations about users" },
        { id: "personas", name: "Personas", description: "User archetypes based on research", tooltip: "Fictional representations of real users based on data" },
        { id: "journey-map", name: "User Journey Map", description: "Visualization of the complete user experience", tooltip: "Mapping of all touchpoints in the user experience" }
      ],
      "Definir": [
        { id: "problem-statement", name: "Declaración del Problema", description: "Definición clara y concisa del problema a resolver", tooltip: "Formulación específica del desafío centrado en el usuario" },
        { id: "hmw", name: "¿Cómo Podríamos...?", description: "Preguntas que reformulan problemas como oportunidades", tooltip: "Técnica para convertir problemas en oportunidades de diseño" },
        { id: "pov", name: "Punto de Vista", description: "Perspectiva específica sobre el usuario y sus necesidades", tooltip: "Declaración que combina usuario, necesidad y insight" }
      ],
      "Idear": [
        { id: "brainstorming", name: "Lluvia de Ideas", description: "Generación libre de ideas sin restricciones", tooltip: "Técnica grupal para generar gran cantidad de ideas creativas" },
        { id: "crazy-8s", name: "Crazy 8s", description: "8 ideas en 8 minutos para forzar la creatividad", tooltip: "Ejercicio de sketching rápido para generar ideas diversas" },
        { id: "scamper", name: "SCAMPER", description: "Técnica sistemática para modificar ideas existentes", tooltip: "Sustituir, Combinar, Adaptar, Modificar, Poner otros usos, Eliminar, Reorganizar" }
      ],
      "Prototipar": [
        { id: "sketches", name: "Sketches", description: "Dibujos rápidos para explorar ideas", tooltip: "Representaciones visuales rápidas de conceptos" },
        { id: "wireframes", name: "Wireframes", description: "Estructura básica de interfaces sin diseño visual", tooltip: "Esquemas que muestran disposición de elementos sin estilo" },
        { id: "mockups", name: "Mockups", description: "Representaciones visuales de alta fidelidad", tooltip: "Diseños detallados que muestran apariencia final" }
      ],
      "Testear": [
        { id: "usability-testing", name: "Test de Usabilidad", description: "Evaluación de la facilidad de uso con usuarios reales", tooltip: "Observación directa de usuarios interactuando con el producto" },
        { id: "ab-testing", name: "A/B Testing", description: "Comparación de dos versiones para ver cuál funciona mejor", tooltip: "Método estadístico para comparar efectividad de variantes" }
      ]
    },
    "lean-ux": {
      "Pensar": [
        { id: "assumptions", name: "Mapeo de Suposiciones", description: "Identificación de creencias sobre usuarios y negocio", tooltip: "Documentación de hipótesis que necesitan validación" },
        { id: "proto-personas", name: "Proto-Personas", description: "Personas iniciales basadas en suposiciones", tooltip: "Versiones tempranas de personas antes de investigación formal" }
      ],
      "Hacer": [
        { id: "mvp", name: "MVP Design", description: "Diseño de producto mínimo viable", tooltip: "Versión más simple que permite aprender sobre usuarios" },
        { id: "wireframes", name: "Wireframes", description: "Estructura básica de interfaces", tooltip: "Esquemas de layout sin elementos visuales detallados" }
      ],
      "Verificar": [
        { id: "user-testing", name: "Testing de Usuario", description: "Validación rápida con usuarios reales", tooltip: "Pruebas ágiles para validar hipótesis de diseño" },
        { id: "analytics", name: "Análisis de Métricas", description: "Evaluación de datos de comportamiento", tooltip: "Interpretación de datos cuantitativos sobre uso del producto" }
      ]
    },
    "double-diamond": {
      "Descubrir": [
        { id: "user-research", name: "Investigación de Usuario", description: "Exploración amplia del espacio del problema", tooltip: "Métodos diversos para entender contexto y necesidades" },
        { id: "market-analysis", name: "Análisis de Mercado", description: "Evaluación del landscape competitivo", tooltip: "Investigación sobre competitors y oportunidades de mercado" }
      ],
      "Definir": [
        { id: "problem-definition", name: "Definición del Problema", description: "Síntesis de hallazgos en problema específico", tooltip: "Convergencia de insights en problema claro y accionable" },
        { id: "design-brief", name: "Brief de Diseño", description: "Documento que guía el proceso de diseño", tooltip: "Especificaciones claras sobre qué diseñar y por qué" }
      ],
      "Desarrollar": [
        { id: "concept-development", name: "Desarrollo de Conceptos", description: "Exploración de múltiples soluciones", tooltip: "Generación y refinamiento de ideas de solución" },
        { id: "prototyping", name: "Prototipado", description: "Creación de versiones tempranas de la solución", tooltip: "Construcción de representaciones tangibles de ideas" }
      ],
      "Entregar": [
        { id: "final-design", name: "Diseño Final", description: "Refinamiento hasta versión lista para implementar", tooltip: "Solución completamente especificada y validada" },
        { id: "implementation", name: "Implementación", description: "Traspaso a desarrollo y lanzamiento", tooltip: "Handoff técnico y supervisión de construcción" }
      ]
    }
  };

  return toolMap[framework]?.[stage] || [];
};

const getSuggestedTools = (projectStage: string) => {
  const suggestions: { [key: string]: any[] } = {
    "research": [
      { id: "interviews", name: "Entrevistas de Usuario", description: "Ideal para entender necesidades profundas", tooltip: "La base de cualquier buen proceso UX" },
      { id: "surveys", name: "Encuestas", description: "Para recoger datos de muchos usuarios", tooltip: "Método cuantitativo para validar hipótesis" },
      { id: "analytics", name: "Análisis de Datos", description: "Insights basados en comportamiento actual", tooltip: "Datos objetivos sobre cómo los usuarios usan productos existentes" }
    ],
    "ideation": [
      { id: "brainstorming", name: "Lluvia de Ideas", description: "Generación libre de conceptos", tooltip: "Técnica fundamental para explorar posibilidades" },
      { id: "hmw", name: "¿Cómo Podríamos...?", description: "Reformulación de problemas como oportunidades", tooltip: "Convierte desafíos en preguntas accionables" }
    ],
    "design": [
      { id: "wireframes", name: "Wireframes", description: "Estructura básica de interfaces", tooltip: "Fundación de cualquier diseño digital" },
      { id: "prototyping", name: "Prototipado", description: "Versiones interactivas de ideas", tooltip: "Permite probar ideas antes de desarrollar" }
    ],
    "testing": [
      { id: "usability-testing", name: "Test de Usabilidad", description: "Validación con usuarios reales", tooltip: "La mejor forma de saber si tu diseño funciona" },
      { id: "ab-testing", name: "A/B Testing", description: "Comparación de alternativas", tooltip: "Método científico para optimizar decisiones" }
    ],
    "implementation": [
      { id: "design-handoff", name: "Handoff de Diseño", description: "Especificaciones para desarrollo", tooltip: "Comunicación clara entre diseño y desarrollo" },
      { id: "qa-testing", name: "QA Testing", description: "Validación de implementación", tooltip: "Asegurar que el producto final cumple especificaciones" }
    ]
  };

  return suggestions[projectStage] || [];
};

export const ToolSelectionStep = ({ context, projectStage, framework, frameworkStage, onGenerate, onBack }: ToolSelectionStepProps) => {
  const [selectedTool, setSelectedTool] = useState("");

  const tools = framework !== "none" 
    ? getToolsByFrameworkAndStage(framework, frameworkStage)
    : getSuggestedTools(projectStage);

  const handleGenerate = () => {
    if (selectedTool) {
      onGenerate(selectedTool);
    }
  };

  return (
    <StepCard
      step={4}
      totalSteps={4}
      title="UX Tool"
      description="Select the tool for which you want to generate AI prompts"
    >
      <div className="space-y-6">
        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Contexto:</strong> {context.industry} • {context.productType} • {projectStage} 
            {framework !== "none" && ` • ${framework} (${frameworkStage})`}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">
            {framework !== "none" 
              ? `Herramientas recomendadas para ${frameworkStage}` 
              : `Herramientas recomendadas para ${projectStage}`
            }
          </h3>
          <div className="grid gap-3">
            {tools.map((tool) => (
              <OptionCard
                key={tool.id}
                title={tool.name}
                description={tool.description}
                tooltip={tool.tooltip}
                isSelected={selectedTool === tool.id}
                onClick={() => setSelectedTool(tool.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          <Button onClick={handleGenerate} disabled={!selectedTool} size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Generar Prompts
          </Button>
        </div>
      </div>
    </StepCard>
  );
};