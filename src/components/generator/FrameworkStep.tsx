import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Lightbulb, Info, ChevronDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectContext {
  industry?: string;
  productType?: string;
  companySize?: string;
  projectDescription?: string;
  [key: string]: any;
}

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
  recommendedFramework?: string;
  recommendedTool?: string;
  reasoning?: string;
  initialFramework?: string;
  initialFrameworkStage?: string;
}

// Stage descriptions for each framework
const stageDescriptions: Record<string, Record<string, string>> = {
  "design-thinking": {
    "Empathize": "Understand user needs through observation and engagement",
    "Define": "Clearly articulate the problem you're trying to solve",
    "Ideate": "Generate a wide range of creative solutions",
    "Prototype": "Create scaled-down versions of potential solutions",
    "Test": "Evaluate prototypes with real users",
    "Implement": "Develop and launch the final solution"
  },
  "double-diamond": {
    "Discover": "Explore the problem space through research",
    "Define": "Reframe and define the challenge",
    "Develop": "Develop potential solutions",
    "Deliver": "Test and refine solutions before full implementation"
  },
  "lean-ux": {
    "Think": "Formulate hypotheses and desired outcomes",
    "Make": "Create minimum viable products (MVPs)",
    "Check": "Gather feedback and validate assumptions"
  },
  "google-design-sprint": {
    "Understand (Mon)": "Dive into the problem space and user needs",
    "Ideate (Tue)": "Generate potential solutions",
    "Decide (Wed)": "Select the best solution to prototype",
    "Prototype (Thu)": "Create a realistic prototype",
    "Test (Fri)": "Validate with real users"
  },
  "human-centered-design": {
    "Research": "Understand user behaviors and needs",
    "Ideation": "Generate potential solutions",
    "Prototyping": "Create tangible representations",
    "Implementation": "Develop and launch the solution"
  },
  "jobs-to-be-done": {
    "Define the job": "Identify the core job to be done",
    "Map the process": "Understand the user's workflow",
    "Identify opportunities": "Find pain points and opportunities",
    "Design solutions": "Create solutions that help users complete their jobs"
  },
  "agile-ux": {
    "UX Sprint Planning": "Plan UX work for the sprint",
    "Design Sprint": "Rapidly prototype and test ideas",
    "Validation": "Test with users and gather feedback",
    "Iteration": "Refine based on feedback"
  },
  "ux-lifecycle": {
    "Analysis": "Research and analyze user needs",
    "Design": "Create user flows and interfaces",
    "Development": "Build the solution",
    "Evaluation": "Test with users",
    "Implementation": "Launch and monitor"
  },
  "ux-honeycomb": {
    "Useful": "Does it fulfill a need?",
    "Usable": "Is it easy to use?",
    "Desirable": "Is it engaging and appealing?",
    "Accessible": "Can everyone use it?",
    "Findable": "Can users find what they need?",
    "Credible": "Is it trustworthy?",
    "Valuable": "Does it provide value to the business?"
  },
  "user-centered-design": {
    "Context of use": "Understand the environment and users",
    "Requirements": "Define user and business needs",
    "Design": "Create solutions",
    "Evaluation": "Test with real users"
  },
  "heart-framework": {
    "Happiness": "User satisfaction and perceived ease of use",
    "Engagement": "Level of user involvement",
    "Adoption": "New users of a product or feature",
    "Retention": "Rate of user return over time",
    "Task Success": "Efficiency and completion rates"
  },
  "hooked-model": {
    "Trigger": "What prompts the user to action?",
    "Action": "The behavior done in anticipation of a reward",
    "Variable Reward": "The reward that satisfies the user's need",
    "Investment": "User puts something into the product"
  }
};

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

export const FrameworkStep = ({
  context = {},
  projectStage,
  onNext,
  onBack,
  aiRecommendations = {},
  initialFramework,
  initialFrameworkStage,
}: FrameworkStepProps) => {
  const [selectedFramework, setSelectedFramework] = useState<string>(initialFramework || '');
  const [selectedStage, setSelectedStage] = useState<string>(initialFrameworkStage || '');
  const [availableStages, setAvailableStages] = useState<any[]>([]);
  const [expandedFrameworks, setExpandedFrameworks] = useState<Record<string, boolean>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  // Initialize expanded state for frameworks
  useEffect(() => {
    if (initialFramework) {
      setExpandedFrameworks(prev => ({
        ...prev,
        [initialFramework]: true
      }));
    }
  }, [initialFramework]);

  const contextInfo = [
    context?.industry,
    context?.productType,
    projectStage ? `Stage: ${projectStage}` : ''
  ].filter(Boolean).join(" • ") || "No additional context";

  const recommendedFramework = getRecommendedFramework(projectStage);
  const currentFramework = frameworks.find(f => f.id === selectedFramework);

  const handleFrameworkSelect = (frameworkId: string) => {
    const isExpanding = selectedFramework !== frameworkId;
    
    // Toggle expanded state
    setExpandedFrameworks(prev => ({
      ...prev,
      [frameworkId]: isExpanding
    }));
    
    setSelectedFramework(isExpanding ? frameworkId : '');
    
    if (frameworkId !== "none" && isExpanding) {
      const mappedStage = getFrameworkStageMapping(projectStage, frameworkId);
      setSelectedStage(mappedStage);
    } else {
      setSelectedStage(""); 
    }
  };

  useEffect(() => {
    if (initialFrameworkStage) {
      setSelectedStage(initialFrameworkStage);
    } else if (aiRecommendations?.recommendedFramework && aiRecommendations.recommendedFramework !== "none") {
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
            <strong>Project:</strong> {contextInfo}
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
          <div className="space-y-4">
            {frameworks.map((framework) => (
              <motion.div 
                key={framework.id}
                className="overflow-hidden"
                initial={false}
                animate={{
                  backgroundColor: selectedFramework === framework.id ? 'rgba(24, 24, 27, 0.02)' : 'rgba(255, 255, 255, 0)'
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className={`rounded-lg border cursor-pointer p-4 ${selectedFramework === framework.id ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                  onClick={() => handleFrameworkSelect(framework.id)}
                  initial={false}
                  animate={{
                    borderColor: selectedFramework === framework.id ? 'hsl(222.2, 47.4%, 50%)' : 'hsl(240, 4.9%, 83.9%)',
                    backgroundColor: selectedFramework === framework.id ? 'rgba(24, 24, 27, 0.02)' : 'rgba(255, 255, 255, 0)'
                  }}
                  whileHover={{
                    borderColor: 'hsl(222.2, 47.4%, 50%, 0.5)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`flex items-center gap-2 ${selectedFramework === framework.id ? 'font-bold text-base' : 'font-medium text-sm'}`}>
                        {framework.name}
                        <motion.span
                          animate={{
                            rotate: expandedFrameworks[framework.id] ? 180 : 0
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.span>
                      </h4>
                      <p className="text-sm text-muted-foreground">{framework.description}</p>
                      {framework.tooltip && (
                        <p className="text-xs text-muted-foreground mt-1">{framework.tooltip}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {framework.id === initialFramework && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          Previously Used
                        </span>
                      )}
                      {framework.id === aiRecommendations?.recommendedFramework && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          AI Recommended
                        </span>
                      )}
                      {framework.id === recommendedFramework && framework.id !== aiRecommendations?.recommendedFramework && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
                
                <AnimatePresence>
                  {expandedFrameworks[framework.id] && framework.stages.length > 0 && (
                    <motion.div
                      className="px-4 pb-4"
                      initial="collapsed"
                      animate="open"
                      exit="collapsed"
                      variants={{
                        open: { opacity: 1, height: 'auto' },
                        collapsed: { opacity: 0, height: 0 }
                      }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <div className="pt-4 border-t">
                        <h4 className="text-sm font-medium mb-3">Select {framework.name} stage:</h4>
                        <div className="flex flex-wrap gap-3">
                          {framework.stages.map((stage) => (
                            <TooltipProvider key={stage}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-36 h-24 p-3 rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                                      selectedStage === stage
                                        ? 'border-primary bg-primary/10 text-foreground'
                                        : 'border-border hover:border-primary/50 hover:bg-muted/30'
                                    }`}
                                    onClick={() => setSelectedStage(stage)}
                                  >
                                    <div className="w-full">
                                      <div className="text-sm font-medium text-center line-clamp-2">
                                        {stage}
                                      </div>
                                      {stage === getFrameworkStageMapping(projectStage, framework.id) && (
                                        <div className="mt-1 w-full text-center">
                                          <span className="text-xs text-muted-foreground">
                                            Recommended
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="p-2">
                                    <div className="font-medium mb-1 flex items-center gap-1">
                                      <Info className="h-3.5 w-3.5" />
                                      {stage}
                                    </div>
                                    <p className="text-sm">
                                      {stageDescriptions[framework.id]?.[stage] || 
                                      'No description available for this stage.'}
                                    </p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>

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

export default FrameworkStep;