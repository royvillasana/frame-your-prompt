import { useState, useEffect } from "react";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ProjectContext {
  industry?: string;
  productType?: string;
  companySize?: string;
  projectDescription?: string;
  [key: string]: any;
}

interface ToolSelectionStepProps {
  context: {
    industry?: string;
    productType?: string;
    companySize?: string;
    projectDescription?: string;
    [key: string]: any;
  };
  projectStage: string;
  framework: string;
  frameworkStage: string;
  onNext: (tool: string) => void;
  onBack: () => void;
  aiRecommendations?: {
    recommendedFramework?: string;
    recommendedTool?: string;
    reasoning?: string;
  };
  recommendedFramework?: string;
  recommendedTool?: string;
  reasoning?: string;
}

// Common tool sets that can be reused across frameworks
const commonTools = {
  research: [
    { id: "interviews", name: "User Interviews", description: "Deep conversations with users to understand needs", tooltip: "Qualitative technique to get direct insights from users" },
    { id: "surveys", name: "Surveys", description: "Structured questions to gather quantitative data", tooltip: "Method to collect data from many users efficiently" },
    { id: "observation", name: "User Observation", description: "Watching users interact in their natural environment", tooltip: "Provides authentic behavioral insights beyond self-reported data" },
    { id: "personas", name: "Personas", description: "User archetypes based on research", tooltip: "Fictional representations of real users based on data" },
    { id: "empathy-map", name: "Empathy Map", description: "Visualization of user thoughts and feelings", tooltip: "Visual tool to synthesize observations about users" },
    { id: "journey-map", name: "User Journey Map", description: "Visualization of the complete user experience", tooltip: "Mapping of all touchpoints in the user experience" }
  ],
  define: [
    { id: "problem-statement", name: "Problem Statement", description: "Clear and concise definition of the problem to solve", tooltip: "Specific formulation of the user-centered challenge" },
    { id: "hmw", name: "How Might We...?", description: "Questions that reframe problems as opportunities", tooltip: "Technique to convert problems into design opportunities" },
    { id: "pov", name: "Point of View", description: "Specific perspective on the user and their needs", tooltip: "Statement combining user, need and insight" },
    { id: "user-stories", name: "User Stories", description: "Short descriptions of features from user's perspective", tooltip: "Helps align development with user needs" },
    { id: "job-stories", name: "Job Stories", description: "Framing needs as jobs to be done", tooltip: "Helps understand user motivations and context" }
  ],
  ideate: [
    { id: "brainstorming", name: "Brainstorming", description: "Free generation of ideas without restrictions", tooltip: "Group technique to generate many creative ideas" },
    { id: "crazy-8s", name: "Crazy 8s", description: "8 ideas in 8 minutes to force creativity", tooltip: "Quick sketching exercise to generate diverse ideas" },
    { id: "scamper", name: "SCAMPER", description: "Systematic technique to modify existing ideas", tooltip: "Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Rearrange" },
    { id: "mind-mapping", name: "Mind Mapping", description: "Visual representation of ideas and relationships", tooltip: "Helps explore and organize thoughts" },
    { id: "storyboarding", name: "Storyboarding", description: "Visual storytelling of user experiences", tooltip: "Helps visualize user flows and scenarios" }
  ],
  prototype: [
    { id: "sketches", name: "Sketches", description: "Quick drawings to explore ideas", tooltip: "Fast visual representations of concepts" },
    { id: "wireframes", name: "Wireframes", description: "Basic interface structure without visual design", tooltip: "Layouts showing element arrangement without styling" },
    { id: "mockups", name: "Mockups", description: "High-fidelity visual representations", tooltip: "Detailed designs showing final appearance" },
    { id: "interactive-prototype", name: "Interactive Prototype", description: "Clickable simulation of the final product", tooltip: "Allows for realistic user testing" },
    { id: "paper-prototype", name: "Paper Prototype", description: "Low-fidelity physical prototype", tooltip: "Quick and easy way to test concepts" }
  ],
  test: [
    { id: "usability-testing", name: "Usability Testing", description: "Evaluation of ease of use with real users", tooltip: "Direct observation of users interacting with the product" },
    { id: "ab-testing", name: "A/B Testing", description: "Comparison of two versions to see which works better", tooltip: "Statistical method to compare effectiveness of variants" },
    { id: "heuristic-evaluation", name: "Heuristic Evaluation", description: "Expert review against usability principles", tooltip: "Identifies usability issues before user testing" },
    { id: "accessibility-audit", name: "Accessibility Audit", description: "Evaluation against accessibility standards", tooltip: "Ensures product is usable by people with disabilities" },
    { id: "analytics-review", name: "Analytics Review", description: "Analysis of user behavior data", tooltip: "Reveals how users actually interact with the product" }
  ],
  implement: [
    { id: "design-system", name: "Design System", description: "Collection of reusable components and guidelines", tooltip: "Ensures consistency across the product" },
    { id: "style-guide", name: "Style Guide", description: "Documentation of visual design standards", tooltip: "Maintains brand consistency" },
    { id: "component-library", name: "Component Library", description: "Reusable UI components", tooltip: "Speeds up development and ensures consistency" },
    { id: "handoff-docs", name: "Handoff Documentation", description: "Specifications for developers", tooltip: "Bridges the gap between design and development" },
    { id: "qa-checklist", name: "QA Checklist", description: "List of items to verify before launch", tooltip: "Ensures quality before release" }
  ]
};

const getToolsByFrameworkAndStage = (framework: string, stage: string) => {
  // Map framework stages to common tool categories
  const stageMappings: { [key: string]: { [key: string]: string[] } } = {
    "design-thinking": {
      "Empathize": ["research"],
      "Define": ["define"],
      "Ideate": ["ideate"],
      "Prototype": ["prototype"],
      "Test": ["test"],
      "Implement": ["implement"]
    },
    "double-diamond": {
      "Discover": ["research"],
      "Define": ["define"],
      "Develop": ["ideate", "prototype"],
      "Deliver": ["test", "implement"]
    },
    "lean-ux": {
      "Think": ["research", "define"],
      "Make": ["ideate", "prototype"],
      "Check": ["test"]
    },
    "google-design-sprint": {
      "Understand": ["research"],
      "Ideate": ["ideate"],
      "Decide": ["define"],
      "Prototype": ["prototype"],
      "Test": ["test"]
    },
    "human-centered-design": {
      "Research": ["research"],
      "Ideation": ["ideate"],
      "Prototyping": ["prototype"],
      "Implementation": ["implement"]
    },
    "jobs-to-be-done": {
      "Define the job": ["research"],
      "Map the process": ["research", "define"],
      "Identify opportunities": ["define", "ideate"],
      "Design solutions": ["prototype", "test"]
    },
    "agile-ux": {
      "UX Sprint Planning": ["research", "define"],
      "Design Sprint": ["ideate", "prototype"],
      "Validation": ["test"],
      "Iteration": ["implement"]
    },
    "ux-lifecycle": {
      "Analysis": ["research"],
      "Design": ["define", "ideate"],
      "Development": ["prototype"],
      "Evaluation": ["test"],
      "Implementation": ["implement"]
    },
    "ux-honeycomb": {
      "Useful": ["research", "define"],
      "Usable": ["prototype", "test"],
      "Desirable": ["ideate", "prototype"],
      "Accessible": ["test", "implement"],
      "Findable": ["define", "prototype"],
      "Credible": ["test"],
      "Valuable": ["test", "implement"]
    },
    "user-centered-design": {
      "Context of use": ["research"],
      "Requirements": ["define"],
      "Design": ["ideate", "prototype"],
      "Evaluation": ["test"]
    },
    "heart-framework": {
      "Happiness": ["research", "test"],
      "Engagement": ["research", "test"],
      "Adoption": ["test", "implement"],
      "Retention": ["test", "implement"],
      "Task Success": ["test"]
    },
    "hooked-model": {
      "Trigger": ["research", "define"],
      "Action": ["ideate", "prototype"],
      "Variable Reward": ["ideate", "test"],
      "Investment": ["test", "implement"]
    }
  };

  // Get the tool categories for this framework and stage
  const toolCategories = stageMappings[framework]?.[stage] || [];
  
  // If no mapping found, return empty array
  if (toolCategories.length === 0) return [];
  
  // Get all tools from the mapped categories and remove duplicates
  const tools = toolCategories.flatMap(category => commonTools[category] || []);
  
  // Remove duplicates by id
  const uniqueTools = Array.from(new Map(tools.map(tool => [tool.id, tool])).values());
  
  return uniqueTools;
};

// Validation function to ensure all frameworks and stages have tool mappings
const validateToolMappings = () => {
  const allFrameworks = [
    "design-thinking", "double-diamond", "lean-ux", "google-design-sprint",
    "human-centered-design", "jobs-to-be-done", "agile-ux", "ux-lifecycle",
    "ux-honeycomb", "user-centered-design", "heart-framework", "hooked-model"
  ];

  const stageMappings = {
    "design-thinking": ["Empathize", "Define", "Ideate", "Prototype", "Test", "Implement"],
    "double-diamond": ["Discover", "Define", "Develop", "Deliver"],
    "lean-ux": ["Think", "Make", "Check"],
    "google-design-sprint": ["Understand", "Ideate", "Decide", "Prototype", "Test"],
    "human-centered-design": ["Research", "Ideation", "Prototyping", "Implementation"],
    "jobs-to-be-done": ["Define the job", "Map the process", "Identify opportunities", "Design solutions"],
    "agile-ux": ["UX Sprint Planning", "Design Sprint", "Validation", "Iteration"],
    "ux-lifecycle": ["Analysis", "Design", "Development", "Evaluation", "Implementation"],
    "ux-honeycomb": ["Useful", "Usable", "Desirable", "Accessible", "Findable", "Credible", "Valuable"],
    "user-centered-design": ["Context of use", "Requirements", "Design", "Evaluation"],
    "heart-framework": ["Happiness", "Engagement", "Adoption", "Retention", "Task Success"],
    "hooked-model": ["Trigger", "Action", "Variable Reward", "Investment"]
  };

  const errors: string[] = [];
  const warnings: string[] = [];
  const results: {[key: string]: any} = {};

  // Check each framework
  allFrameworks.forEach(framework => {
    const stages = stageMappings[framework] || [];
    const frameworkResults: {[key: string]: any} = {};
    
    if (stages.length === 0) {
      errors.push(`No stages defined for framework: ${framework}`);
      return;
    }

    // Check each stage
    stages.forEach(stage => {
      const tools = getToolsByFrameworkAndStage(framework, stage);
      frameworkResults[stage] = {
        toolCount: tools.length,
        tools: tools.map((t: any) => t.name)
      };

      if (tools.length === 0) {
        warnings.push(`No tools found for ${framework} - ${stage}`);
      } else if (tools.length < 2) {
        warnings.push(`Only ${tools.length} tools found for ${framework} - ${stage}`);
      }
    });

    results[framework] = frameworkResults;
  });

  return {
    errors,
    warnings,
    results,
    summary: {
      frameworks: allFrameworks.length,
      totalStages: Object.values(stageMappings).reduce((sum, stages) => sum + stages.length, 0),
      frameworksWithErrors: errors.length > 0 ? errors.filter(e => e.includes('No stages defined')).length : 0,
      stagesWithWarnings: warnings.length
    }
  };
};

// Uncomment to run validation
// const validation = validateToolMappings();
// console.log('Tool Mapping Validation:', validation);

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

export const ToolSelectionStep = ({
  context = {},
  projectStage,
  framework,
  frameworkStage,
  onNext,
  onBack,
  aiRecommendations = {}
}: ToolSelectionStepProps) => {
  const [selectedTool, setSelectedTool] = useState<string>("");

  // Safely get context values with fallbacks
  const contextInfo = [
    context?.industry,
    context?.productType,
    projectStage,
    framework !== "none" && framework,
    frameworkStage && framework !== "none" ? `(${frameworkStage})` : ''
  ].filter(Boolean).join(" • ") || "No additional context";

  const tools = framework !== "none" 
    ? getToolsByFrameworkAndStage(framework, frameworkStage)
    : getSuggestedTools(projectStage);

  const handleNext = () => {
    if (selectedTool) {
      onNext(selectedTool);
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
            <strong>Context:</strong> {contextInfo}
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
                isSelected={selectedTool === tool.id}
                onClick={() => setSelectedTool(tool.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            onClick={handleNext}
            disabled={!selectedTool}
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </StepCard>
  );
};

export default ToolSelectionStep;