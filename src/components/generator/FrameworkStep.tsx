import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StepCard } from "./StepCard";
import { OptionCard } from "./OptionCard";
import { Button } from "@/components/ui/button";
import { getUXToolsForStage } from "@/lib/aiTools";
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
  // Map project stages to the most suitable frameworks
  const stageToFramework: Record<string, string> = {
    // Early stage - user research and problem definition
    'research': 'design-thinking',     // Best for deep user understanding
    'discovery': 'design-thinking',    // Great for initial exploration
    'empathy': 'design-thinking',      // Focus on user needs
    
    // Ideation and concept development
    'ideation': 'double-diamond',      // Structured approach to ideation
    'define': 'double-diamond',        // Clear problem definition
    'concept': 'google-design-sprint', // Fast concept development
    
    // Design and prototyping
    'design': 'lean-ux',              // Rapid iterations
    'prototype': 'google-design-sprint', // Quick prototyping
    'wireframe': 'lean-ux',            // Lean approach to design
    
    // Testing and validation
    'testing': 'google-design-sprint', // Fast validation cycles
    'validate': 'google-design-sprint',
    'usability': 'google-design-sprint',
    
    // Implementation and development
    'implementation': 'agile-ux',      // Integrates with development
    'development': 'agile-ux',
    'build': 'agile-ux',
    
    // Strategy and planning
    'strategy': 'jobs-to-be-done',     // Focus on user needs
    'planning': 'jobs-to-be-done',
    'roadmap': 'jobs-to-be-done',
    
    // Metrics and analytics
    'metrics': 'heart-framework',      // Structured measurement
    'analytics': 'heart-framework',
    'measure': 'heart-framework',
    
    // Default fallback
    'default': 'design-thinking'       // Good all-around framework
  };
  
  // Convert to lowercase and remove any extra whitespace
  const normalizedStage = projectStage?.toLowerCase().trim() || '';
  
  // Find the best matching framework for the stage
  for (const [stage, framework] of Object.entries(stageToFramework)) {
    if (normalizedStage.includes(stage)) {
      return framework;
    }
  }
  
  // Fallback to default if no match found
  return stageToFramework.default;
};

const getRecommendationText = (projectStage: string) => {
  // Convert to lowercase and trim whitespace for consistent matching
  const normalizedStage = projectStage?.toLowerCase().trim() || '';
  
  // Map stages to their corresponding recommendation texts
  const recommendationTexts: Record<string, string> = {
    // Research and Discovery
    'research': 'For research, we recommend Design Thinking as it emphasizes empathy and deep user understanding through methods like user interviews and observations.',
    'discovery': 'In the discovery phase, Design Thinking helps uncover user needs and pain points through its human-centered approach.',
    'empathy': 'For building empathy, Design Thinking provides tools like empathy maps and user personas to better understand your users.',
    
    // Ideation and Definition
    'ideation': 'For ideation, the Double Diamond framework offers a structured approach to divergent and convergent thinking, helping generate and refine ideas effectively.',
    'define': 'To define your problem space, the Double Diamond framework provides clear methods for synthesis and problem framing.',
    'concept': 'For concept development, Google Design Sprint offers a time-boxed approach to quickly develop and test ideas.',
    
    // Design and Prototyping
    'design': 'For design work, Lean UX promotes rapid iterations and continuous validation, perfect for agile environments.',
    'prototype': 'For prototyping, Google Design Sprint provides a structured 5-day process to go from problem to tested prototype.',
    'wireframe': 'For wireframing, Lean UX helps focus on the user experience before diving into high-fidelity designs.',
    
    // Testing and Validation
    'testing': 'For testing, Google Design Sprint offers rapid validation cycles to quickly test assumptions with real users.',
    'validate': 'For validation, Google Design Sprint provides methods to test prototypes and gather user feedback efficiently.',
    'usability': 'For usability testing, Google Design Sprint includes specific techniques to evaluate and improve your designs.',
    
    // Implementation
    'implementation': 'For implementation, Agile UX integrates seamlessly with development workflows, ensuring design and development stay aligned.',
    'development': 'During development, Agile UX helps maintain design quality while keeping up with agile development cycles.',
    'build': 'When building your product, Agile UX ensures user experience remains a priority throughout the development process.',
    
    // Strategy
    'strategy': 'For strategy development, Jobs To Be Done helps focus on the underlying needs and motivations of your users.',
    'planning': 'For planning, Jobs To Be Done provides a framework to understand what users are trying to accomplish.',
    'roadmap': 'For roadmap planning, Jobs To Be Done helps prioritize features based on real user needs and desired outcomes.',
    
    // Metrics and Analytics
    'metrics': 'For measuring user experience, the HEART Framework provides a structured approach to track key metrics across different dimensions.',
    'analytics': 'For analytics, the HEART Framework helps measure user experience in a meaningful and actionable way.',
    'measure': 'For measurement, the HEART Framework offers a comprehensive way to track user experience metrics.',
    
    // Default
    'default': 'Design Thinking provides a solid foundation for any UX project with its user-centered approach and flexible framework.'
  };
  
  // Find the most specific matching text
  for (const [stage, text] of Object.entries(recommendationTexts)) {
    if (normalizedStage.includes(stage)) {
      return text;
    }
  }
  
  // Return default if no specific match found
  return recommendationTexts.default;
};

// Type definitions for better type safety
type ProjectStage = 'research' | 'ideation' | 'design' | 'testing' | 'implementation';
type FrameworkId = 'design-thinking' | 'double-diamond' | 'lean-ux' | 'google-design-sprint' | 
  'human-centered-design' | 'jobs-to-be-done' | 'agile-ux' | 'ux-lifecycle' | 
  'ux-honeycomb' | 'user-centered-design' | 'heart-framework' | 'hooked-model';

// Define all possible framework stages for better validation
export const frameworkStages: Record<FrameworkId, string[]> = {
  'design-thinking': ['Empathize', 'Define', 'Ideate', 'Prototype', 'Test', 'Implement'],
  'double-diamond': ['Discover', 'Define', 'Develop', 'Deliver'],
  'lean-ux': ['Think', 'Make', 'Check'],
  'google-design-sprint': ['Understand (Mon)', 'Ideate (Tue)', 'Decide (Wed)', 'Prototype (Thu)', 'Test (Fri)'],
  'human-centered-design': ['Research', 'Ideation', 'Prototyping', 'Implementation'],
  'jobs-to-be-done': ['Define the job', 'Map the process', 'Identify opportunities', 'Design solutions'],
  'agile-ux': ['UX Sprint Planning', 'Design Sprint', 'Validation', 'Iteration'],
  'ux-lifecycle': ['Analysis', 'Design', 'Development', 'Evaluation', 'Implementation'],
  'ux-honeycomb': ['Useful', 'Usable', 'Desirable', 'Accessible', 'Findable', 'Credible', 'Valuable'],
  'user-centered-design': ['Context of use', 'Requirements', 'Design', 'Evaluation'],
  'heart-framework': ['Happiness', 'Engagement', 'Adoption', 'Retention', 'Task Success'],
  'hooked-model': ['Trigger', 'Action', 'Variable Reward', 'Investment']
};

/**
 * Maps a project stage to a UX framework stage based on the selected framework
 * @param projectStage The current project stage (research, ideation, etc.)
 * @param frameworkId The ID of the selected UX framework
 * @returns The corresponding UX framework stage
 */
const getFrameworkStageMapping = (projectStage: ProjectStage, frameworkId: FrameworkId): string => {
  // Define the mapping from project stages to UX framework stages for each framework
  const frameworkMappings: Record<FrameworkId, Record<string, string[]>> = {
    'design-thinking': {
      'research': ['Empathize', 'Define'],
      'ideation': ['Ideate'],
      'prototyping': ['Prototype'],
      'testing': ['Test'],
      'development': ['Implement']
    },
    'double-diamond': {
      'research': ['Discover', 'Define'],
      'ideation': ['Define'],
      'prototyping': ['Develop'],
      'development': ['Deliver']
    },
    'lean-ux': {
      'research': ['Think'],
      'ideation': ['Think'],
      'prototyping': ['Make'],
      'testing': ['Check']
    },
    'google-design-sprint': {
      'research': ['Understand'],
      'ideation': ['Ideate', 'Decide'],
      'prototyping': ['Prototype'],
      'testing': ['Test']
    },
    'human-centered-design': {
      'research': ['Research'],
      'ideation': ['Ideation'],
      'prototyping': ['Prototyping'],
      'development': ['Implementation']
    },
    'jtbd': {
      'research': ['Job Discovery', 'Job Mapping'],
      'ideation': ['Solution Ideation'],
      'testing': ['Validation']
    },
    'agile-ux': {
      'research': ['Backlog'],
      'ideation': ['Backlog'],
      'prototyping': ['Design'],
      'testing': ['Test'],
      'development': ['Release']
    },
    'ux-lifecycle': {
      'research': ['Analysis'],
      'ideation': ['Analysis'],
      'prototyping': ['Design'],
      'development': ['Implementation', 'Deployment'],
      'testing': ['Evaluation']
    },
    'ucd-iso-9241': {
      'research': ['Understand Context', 'Specify Requirements'],
      'ideation': ['Specify Requirements'],
      'prototyping': ['Create Design'],
      'testing': ['Evaluate']
    },
    'hooked-model': {
      'research': ['Trigger'],
      'ideation': ['Trigger'],
      'prototyping': ['Action'],
      'testing': ['Variable Reward'],
      'development': ['Investment']
    },
    'heart-framework': {
      'testing': ['HEART Framework']
    },
    'ux-honeycomb': {
      'research': ['UX Honeycomb'],
      'testing': ['UX Honeycomb']
    }
  };

  // Get the mapping for the current framework
  const frameworkMapping = frameworkMappings[frameworkId];
  if (!frameworkMapping) return '';

  // Get the matching stages for the current project stage
  const matchingStages = frameworkMapping[projectStage];
  
  // Return the first matching stage, or empty string if none found
  return matchingStages && matchingStages.length > 0 ? matchingStages[0] : '';
};

// Validation function to ensure all frameworks have complete stage mappings
export const validateFrameworkStageMappings = () => {
  const projectStages: ProjectStage[] = ['research', 'ideation', 'design', 'testing', 'implementation'];
  const frameworkIds = Object.keys(frameworkStages) as FrameworkId[];
  
  const results = {
    missingMappings: [] as Array<{framework: string, stage: string}>,
    invalidMappings: [] as Array<{framework: string, stage: string, mappedStage: string}>,
    summary: {
      totalFrameworks: frameworkIds.length,
      totalStages: projectStages.length * frameworkIds.length,
      validatedMappings: 0
    }
  };

  // Check each framework and stage
  frameworkIds.forEach(frameworkId => {
    projectStages.forEach(projectStage => {
      const mappedStage = getFrameworkStageMapping(projectStage, frameworkId);
      
      if (!mappedStage) {
        results.missingMappings.push({ framework: frameworkId, stage: projectStage });
      } else if (!frameworkStages[frameworkId].includes(mappedStage)) {
        results.invalidMappings.push({
          framework: frameworkId,
          stage: projectStage,
          mappedStage
        });
      } else {
        results.summary.validatedMappings++;
      }
    });
  });

  return results;
};

// Uncomment to run validation
// const validation = validateFrameworkStageMappings();
// console.log('Framework Stage Mapping Validation:', validation);

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
  const [uxTools, setUxTools] = useState<Record<string, string[]>>({});
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

  // Load UX tools for a specific framework and stage
  const loadUXTools = useCallback(async (framework: string, stage: string) => {
    if (!framework || !stage) return;
    
    try {
      const tools = await getUXToolsForStage(stage, framework);
      setUxTools(prev => ({
        ...prev,
        [`${framework}-${stage}`]: tools
      }));
    } catch (error) {
      console.error('Error loading UX tools:', error);
    }
  }, []);

  const handleFrameworkSelect = (frameworkId: string) => {
    const isExpanding = selectedFramework !== frameworkId;
    
    // Toggle expanded state
    setExpandedFrameworks(prev => ({
      ...prev,
      [frameworkId]: isExpanding
    }));
    
    const newFramework = isExpanding ? frameworkId : '';
    setSelectedFramework(newFramework);
    
    if (newFramework && newFramework !== "none") {
      // Always map the current project stage to the new framework's stage
      const mappedStage = getMappedStage(newFramework);
      setSelectedStage(mappedStage || '');
      
      // Load UX tools when a framework is selected
      if (mappedStage) {
        loadUXTools(newFramework, mappedStage);
      }
    } else {
      setSelectedStage("");
    }
  };
  
  // Helper function to normalize stage names for comparison
  const normalizeStageName = (name: string): string => {
    if (!name) return '';
    // Remove special characters, extra spaces, and convert to lowercase
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')  // Remove special characters
      .replace(/\s+/g, ' ')          // Replace multiple spaces with single space
      .trim();
  };

  // Helper function to check if a stage should be highlighted as recommended
  const isRecommendedStage = (frameworkId: string, stage: string): boolean => {
    if (!projectStage || !frameworkId || !stage) return false;
    
    // Get the mapped stage for the current project stage and framework
    const mappedStage = getFrameworkStageMapping(projectStage, frameworkId);
    if (!mappedStage) return false;
    
    // Normalize both stage names for comparison
    const normalizedMapped = normalizeStageName(mappedStage);
    const normalizedCurrent = normalizeStageName(stage);
    
    // Check for direct match first
    if (normalizedMapped === normalizedCurrent) return true;
    
    // Check for partial matches (either contains or is contained by)
    if (normalizedMapped.includes(normalizedCurrent) || 
        normalizedCurrent.includes(normalizedMapped)) {
      return true;
    }
    
    // Special case handling for specific frameworks
    const framework = frameworks.find(f => f.id === frameworkId);
    if (framework) {
      // For frameworks with numbered stages, check if this is the first stage
      const stageIndex = framework.stages.findIndex(s => 
        normalizeStageName(s) === normalizedCurrent
      );
      
      // If this is the first stage and we couldn't find a match, it's likely the recommended one
      if (stageIndex === 0 && framework.stages.length > 0) {
        return true;
      }
    }
    
    return false;
  };

  // Get the mapped stage for the current project stage and framework
  const getMappedStage = useCallback((frameworkId: string): string => {
    if (!projectStage || !frameworkId || frameworkId === 'none') return '';
    return getFrameworkStageMapping(projectStage as ProjectStage, frameworkId as FrameworkId) || '';
  }, [projectStage]);

  // Initialize stage based on initial props
  useEffect(() => {
    if (selectedFramework) {
      if (initialFrameworkStage) {
        setSelectedStage(initialFrameworkStage);
      } else {
        // Always map the project stage to the framework stage when initializing
        const mappedStage = getMappedStage(selectedFramework);
        if (mappedStage) {
          setSelectedStage(mappedStage);
        }
      }
    }
  }, [selectedFramework, initialFrameworkStage, getMappedStage]);

  // Update selected stage when project stage or framework changes
  useEffect(() => {
    if (selectedFramework && selectedFramework !== 'none' && projectStage) {
      const mappedStage = getMappedStage(selectedFramework);
      if (mappedStage && mappedStage !== selectedStage) {
        setSelectedStage(mappedStage);
      }
    }
  }, [projectStage, selectedFramework, selectedStage, getMappedStage]);

  // Load UX tools when stage changes
  useEffect(() => {
    if (selectedFramework && selectedStage) {
      loadUXTools(selectedFramework, selectedStage);
    }
  }, [selectedStage, selectedFramework, loadUXTools]);

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
                                      {isRecommendedStage(framework.id, stage) && (
                                        <div className="mt-1 w-full text-center">
                                          <span className="text-xs text-muted-foreground">
                                            Recommended
                                          </span>
                                        </div>
                                      )}
                                      {/* UX tools list has been removed from the stage button as per user request */}
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