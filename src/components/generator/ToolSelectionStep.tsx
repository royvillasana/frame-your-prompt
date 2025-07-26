import { useState, useEffect } from "react";
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
  aiRecommendations?: {
    recommendedFramework?: string;
    recommendedTool?: string;
    reasoning?: string;
  };
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
      "Define": [
        { id: "problem-statement", name: "Problem Statement", description: "Clear and concise definition of the problem to solve", tooltip: "Specific formulation of the user-centered challenge" },
        { id: "hmw", name: "How Might We...?", description: "Questions that reframe problems as opportunities", tooltip: "Technique to convert problems into design opportunities" },
        { id: "pov", name: "Point of View", description: "Specific perspective on the user and their needs", tooltip: "Statement combining user, need and insight" }
      ],
      "Ideate": [
        { id: "brainstorming", name: "Brainstorming", description: "Free generation of ideas without restrictions", tooltip: "Group technique to generate many creative ideas" },
        { id: "crazy-8s", name: "Crazy 8s", description: "8 ideas in 8 minutes to force creativity", tooltip: "Quick sketching exercise to generate diverse ideas" },
        { id: "scamper", name: "SCAMPER", description: "Systematic technique to modify existing ideas", tooltip: "Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Rearrange" }
      ],
      "Prototype": [
        { id: "sketches", name: "Sketches", description: "Quick drawings to explore ideas", tooltip: "Fast visual representations of concepts" },
        { id: "wireframes", name: "Wireframes", description: "Basic interface structure without visual design", tooltip: "Layouts showing element arrangement without styling" },
        { id: "mockups", name: "Mockups", description: "High-fidelity visual representations", tooltip: "Detailed designs showing final appearance" }
      ],
      "Test": [
        { id: "usability-testing", name: "Usability Testing", description: "Evaluation of ease of use with real users", tooltip: "Direct observation of users interacting with the product" },
        { id: "ab-testing", name: "A/B Testing", description: "Comparison of two versions to see which works better", tooltip: "Statistical method to compare effectiveness of variants" }
      ]
    },
    "lean-ux": {
      "Think": [
        { id: "assumptions", name: "Assumption Mapping", description: "Identification of beliefs about users and business", tooltip: "Documentation of hypotheses that need validation" },
        { id: "proto-personas", name: "Proto-Personas", description: "Initial personas based on assumptions", tooltip: "Early versions of personas before formal research" }
      ],
      "Make": [
        { id: "mvp", name: "MVP Design", description: "Minimum viable product design", tooltip: "Simplest version that allows learning about users" },
        { id: "wireframes", name: "Wireframes", description: "Basic interface structure", tooltip: "Layout schemes without detailed visual elements" }
      ],
      "Check": [
        { id: "user-testing", name: "User Testing", description: "Quick validation with real users", tooltip: "Agile testing to validate design hypotheses" },
        { id: "analytics", name: "Metrics Analysis", description: "Evaluation of behavioral data", tooltip: "Interpretation of quantitative data about product usage" }
      ]
    },
    "double-diamond": {
      "Discover": [
        { id: "user-research", name: "User Research", description: "Broad exploration of the problem space", tooltip: "Diverse methods to understand context and needs" },
        { id: "market-analysis", name: "Market Analysis", description: "Evaluation of competitive landscape", tooltip: "Research on competitors and market opportunities" }
      ],
      "Define": [
        { id: "problem-definition", name: "Problem Definition", description: "Synthesis of findings into specific problem", tooltip: "Convergence of insights into clear and actionable problem" },
        { id: "design-brief", name: "Design Brief", description: "Document that guides the design process", tooltip: "Clear specifications about what to design and why" }
      ],
      "Develop": [
        { id: "concept-development", name: "Concept Development", description: "Exploration of multiple solutions", tooltip: "Generation and refinement of solution ideas" },
        { id: "prototyping", name: "Prototyping", description: "Creation of early versions of the solution", tooltip: "Building tangible representations of ideas" }
      ],
      "Deliver": [
        { id: "final-design", name: "Final Design", description: "Refinement to ready-for-implementation version", tooltip: "Fully specified and validated solution" },
        { id: "implementation", name: "Implementation", description: "Handoff to development and launch", tooltip: "Technical handoff and construction oversight" }
      ]
    }
  };

  return toolMap[framework]?.[stage] || [];
};

const getSuggestedTools = (projectStage: string) => {
  const suggestions: { [key: string]: any[] } = {
    "research": [
      { id: "interviews", name: "User Interviews", description: "Ideal for understanding deep needs", tooltip: "The foundation of any good UX process" },
      { id: "surveys", name: "Surveys", description: "To collect data from many users", tooltip: "Quantitative method to validate hypotheses" },
      { id: "analytics", name: "Data Analysis", description: "Insights based on current behavior", tooltip: "Objective data about how users use existing products" }
    ],
    "ideation": [
      { id: "brainstorming", name: "Brainstorming", description: "Free generation of concepts", tooltip: "Fundamental technique to explore possibilities" },
      { id: "hmw", name: "How Might We...?", description: "Reframe problems as opportunities", tooltip: "Converts challenges into actionable questions" }
    ],
    "design": [
      { id: "wireframes", name: "Wireframes", description: "Basic interface structure", tooltip: "Foundation of any digital design" },
      { id: "prototyping", name: "Prototyping", description: "Interactive versions of ideas", tooltip: "Allows testing ideas before development" }
    ],
    "testing": [
      { id: "usability-testing", name: "Usability Testing", description: "Validation with real users", tooltip: "The best way to know if your design works" },
      { id: "ab-testing", name: "A/B Testing", description: "Comparison of alternatives", tooltip: "Scientific method to optimize decisions" }
    ],
    "implementation": [
      { id: "design-handoff", name: "Design Handoff", description: "Specifications for development", tooltip: "Clear communication between design and development" },
      { id: "qa-testing", name: "QA Testing", description: "Implementation validation", tooltip: "Ensure final product meets specifications" }
    ]
  };

  return suggestions[projectStage] || [];
};

export const ToolSelectionStep = ({ context, projectStage, framework, frameworkStage, onGenerate, onBack, aiRecommendations }: ToolSelectionStepProps) => {
  const [selectedTool, setSelectedTool] = useState("");

  // Auto-select AI recommended tool
  useEffect(() => {
    if (aiRecommendations?.recommendedTool && selectedTool === "") {
      const tools = framework !== "none" 
        ? getToolsByFrameworkAndStage(framework, frameworkStage)
        : getSuggestedTools(projectStage);
      
      const recommendedTool = tools.find(tool => tool.name === aiRecommendations.recommendedTool);
      if (recommendedTool) {
        setSelectedTool(recommendedTool.id);
      }
    }
  }, [aiRecommendations, framework, frameworkStage, projectStage, selectedTool]);

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
            <strong>Context:</strong> {context.industry} • {context.productType} • {projectStage} 
            {framework !== "none" && ` • ${framework} (${frameworkStage})`}
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-3">
            {framework !== "none" 
              ? `Recommended tools for ${frameworkStage}` 
              : `Recommended tools for ${projectStage}`
            }
          </h3>
          <div className="grid gap-3">
            {tools.map((tool) => (
              <OptionCard
                key={tool.id}
                title={tool.name}
                description={tool.description}
                tooltip={tool.tooltip}
                badge={tool.name === aiRecommendations?.recommendedTool ? "AI Recommended" : undefined}
                isSelected={selectedTool === tool.id || (tool.name === aiRecommendations?.recommendedTool && selectedTool === "")}
                onClick={() => setSelectedTool(tool.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button onClick={onBack} variant="outline" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleGenerate} disabled={!selectedTool} size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Prompts
          </Button>
        </div>
      </div>
    </StepCard>
  );
};