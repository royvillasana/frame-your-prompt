export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  selected_framework: string;
  created_at: string;
  updated_at: string;
}

export interface FrameworkStage {
  id: string;
  name: string;
  description?: string;
}

export interface UXFramework {
  id: string;
  name: string;
  description: string;
  stages: FrameworkStage[];
}

// UX Frameworks configuration
export const UX_FRAMEWORKS: UXFramework[] = [
  {
    id: "design-thinking",
    name: "Design Thinking",
    description: "Iterative, user-centered framework of 5 stages",
    stages: [
      { id: "empathize", name: "Empathize", description: "Understand user needs and context" },
      { id: "define", name: "Define", description: "Synthesize findings into actionable insights" },
      { id: "ideate", name: "Ideate", description: "Generate creative solutions" },
      { id: "prototype", name: "Prototype", description: "Build testable representations" },
      { id: "test", name: "Test", description: "Validate ideas with users" }
    ]
  },
  {
    id: "double-diamond",
    name: "Double Diamond", 
    description: "Diverge and converge approach with 4 phases",
    stages: [
      { id: "discover", name: "Discover", description: "Research and understand the problem" },
      { id: "define", name: "Define", description: "Synthesize insights into clear brief" },
      { id: "develop", name: "Develop", description: "Ideate and develop solutions" },
      { id: "deliver", name: "Deliver", description: "Test and refine final solution" }
    ]
  },
  {
    id: "lean-ux",
    name: "Lean UX",
    description: "Rapid experimentation and feedback cycles",
    stages: [
      { id: "think", name: "Think", description: "Form assumptions and hypotheses" },
      { id: "make", name: "Make", description: "Build minimum viable products" },
      { id: "check", name: "Check", description: "Measure and learn from feedback" }
    ]
  },
  {
    id: "google-design-sprint",
    name: "Google Design Sprint",
    description: "5-day structured innovation sprint",
    stages: [
      { id: "understand", name: "Understand (Mon)", description: "Map the problem and pick target" },
      { id: "ideate", name: "Ideate (Tue)", description: "Sketch solutions individually" },
      { id: "decide", name: "Decide (Wed)", description: "Choose the best solution" },
      { id: "prototype", name: "Prototype (Thu)", description: "Build realistic prototype" },
      { id: "test", name: "Test (Fri)", description: "Test with target customers" }
    ]
  }
];

export const getFrameworkById = (id: string): UXFramework | undefined => {
  return UX_FRAMEWORKS.find(framework => framework.id === id);
};

export const getStagesByFramework = (frameworkId: string): FrameworkStage[] => {
  const framework = getFrameworkById(frameworkId);
  return framework?.stages || [];
};