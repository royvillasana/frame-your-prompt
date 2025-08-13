import { UXFramework, FrameworkType, FrameworkStage, UXTool } from '@/types/framework';

// Design Thinking Framework
const designThinkingStages: FrameworkStage[] = [
  {
    id: 'empathize',
    name: 'Empathize',
    description: 'Understand the user and their needs through research and observation',
    purpose: 'Gain empathetic insights into user problems and motivations',
    order: 1,
    recommendedDuration: '1-2 weeks',
    inputRequirements: ['Target user groups', 'Research questions'],
    expectedOutputs: ['User insights', 'Empathy maps', 'Research findings'],
    tools: [
      {
        id: 'user-interviews',
        name: 'User Interviews',
        description: 'One-on-one conversations to understand user needs',
        category: 'Research',
        difficulty: 'beginner',
        estimatedTime: '2-4 hours per interview',
        artifacts: ['Interview transcripts', 'Key insights', 'Quotes']
      },
      {
        id: 'surveys',
        name: 'Surveys',
        description: 'Quantitative data collection from larger user groups',
        category: 'Research',
        difficulty: 'beginner',
        estimatedTime: '1-2 days',
        artifacts: ['Survey responses', 'Statistical analysis', 'Trends']
      },
      {
        id: 'observations',
        name: 'Observations',
        description: 'Direct observation of users in their natural environment',
        category: 'Research',
        difficulty: 'intermediate',
        estimatedTime: '3-5 hours per session',
        artifacts: ['Observation notes', 'Behavior patterns', 'Context insights']
      }
    ]
  },
  {
    id: 'define',
    name: 'Define',
    description: 'Synthesize observations into a clear problem statement',
    purpose: 'Create a focused problem definition based on user insights',
    order: 2,
    recommendedDuration: '3-5 days',
    inputRequirements: ['Research findings', 'User insights'],
    expectedOutputs: ['Problem statement', 'Personas', 'Journey maps'],
    tools: [
      {
        id: 'affinity-mapping',
        name: 'Affinity Mapping',
        description: 'Group related insights to identify patterns',
        category: 'Synthesis',
        difficulty: 'intermediate',
        estimatedTime: '2-3 hours',
        artifacts: ['Insight clusters', 'Themes', 'Patterns']
      },
      {
        id: 'personas',
        name: 'Personas',
        description: 'Create representative user archetypes',
        category: 'Synthesis',
        difficulty: 'intermediate',
        estimatedTime: '4-6 hours',
        artifacts: ['Persona profiles', 'User goals', 'Pain points']
      },
      {
        id: 'journey-maps',
        name: 'Journey Maps',
        description: 'Visualize user experience across touchpoints',
        category: 'Synthesis',
        difficulty: 'advanced',
        estimatedTime: '6-8 hours',
        artifacts: ['Journey visualization', 'Touchpoints', 'Emotions']
      }
    ]
  },
  {
    id: 'ideate',
    name: 'Ideate',
    description: 'Generate creative solutions to the defined problem',
    purpose: 'Explore a wide range of solution possibilities',
    order: 3,
    recommendedDuration: '1 week',
    inputRequirements: ['Problem statement', 'User personas'],
    expectedOutputs: ['Solution concepts', 'Ideas list', 'Selection criteria'],
    tools: [
      {
        id: 'brainstorming',
        name: 'Brainstorming',
        description: 'Generate many ideas quickly without judgment',
        category: 'Ideation',
        difficulty: 'beginner',
        estimatedTime: '1-2 hours',
        artifacts: ['Ideas list', 'Concept sketches', 'Variations']
      },
      {
        id: 'scamper',
        name: 'SCAMPER',
        description: 'Systematic creative thinking technique',
        category: 'Ideation',
        difficulty: 'intermediate',
        estimatedTime: '2-3 hours',
        artifacts: ['Modified concepts', 'Alternative approaches', 'Innovations']
      },
      {
        id: 'how-might-we',
        name: 'How Might We',
        description: 'Frame challenges as opportunities for innovation',
        category: 'Ideation',
        difficulty: 'beginner',
        estimatedTime: '1 hour',
        artifacts: ['HMW questions', 'Opportunity areas', 'Focus areas']
      }
    ]
  },
  {
    id: 'prototype',
    name: 'Prototype',
    description: 'Build tangible representations of ideas',
    purpose: 'Make ideas tangible for testing and iteration',
    order: 4,
    recommendedDuration: '1-2 weeks',
    inputRequirements: ['Selected concepts', 'Design requirements'],
    expectedOutputs: ['Prototype artifacts', 'Design specifications', 'Test scenarios'],
    tools: [
      {
        id: 'sketching',
        name: 'Sketching',
        description: 'Quick visual representations of ideas',
        category: 'Prototyping',
        difficulty: 'beginner',
        estimatedTime: '2-4 hours',
        artifacts: ['Concept sketches', 'Wireframes', 'Layouts']
      },
      {
        id: 'wireframes',
        name: 'Wireframes',
        description: 'Low-fidelity structural blueprints',
        category: 'Prototyping',
        difficulty: 'intermediate',
        estimatedTime: '1-2 days',
        artifacts: ['Wireframe sets', 'User flows', 'Information architecture']
      },
      {
        id: 'mockups',
        name: 'Mockups',
        description: 'High-fidelity visual designs',
        category: 'Prototyping',
        difficulty: 'advanced',
        estimatedTime: '3-5 days',
        artifacts: ['Visual designs', 'Style guides', 'Assets']
      }
    ]
  },
  {
    id: 'test',
    name: 'Test',
    description: 'Validate prototypes with real users',
    purpose: 'Learn what works and what needs improvement',
    order: 5,
    recommendedDuration: '1 week',
    inputRequirements: ['Prototypes', 'Test scenarios', 'Success metrics'],
    expectedOutputs: ['Test results', 'User feedback', 'Iteration plan'],
    tools: [
      {
        id: 'usability-tests',
        name: 'Usability Tests',
        description: 'Observe users interacting with prototypes',
        category: 'Testing',
        difficulty: 'intermediate',
        estimatedTime: '2-3 hours per session',
        artifacts: ['Test recordings', 'Success metrics', 'Issues list']
      },
      {
        id: 'ab-tests',
        name: 'A/B Tests',
        description: 'Compare different solution variations',
        category: 'Testing',
        difficulty: 'advanced',
        estimatedTime: '1-2 weeks',
        artifacts: ['Statistical results', 'Performance data', 'Winning variants']
      },
      {
        id: 'analytics-review',
        name: 'Analytics Review',
        description: 'Analyze user behavior data',
        category: 'Testing',
        difficulty: 'intermediate',
        estimatedTime: '4-6 hours',
        artifacts: ['Behavior insights', 'Usage patterns', 'Performance metrics']
      }
    ]
  }
];

// Double Diamond Framework
const doubleDiamondStages: FrameworkStage[] = [
  {
    id: 'discover',
    name: 'Discover',
    description: 'Explore and understand the problem space',
    purpose: 'Gather insights and identify opportunities',
    order: 1,
    recommendedDuration: '2-3 weeks',
    inputRequirements: ['Initial brief', 'Stakeholder requirements'],
    expectedOutputs: ['Research insights', 'Problem understanding', 'Opportunity areas'],
    tools: [
      {
        id: 'stakeholder-interviews',
        name: 'Stakeholder Interviews',
        description: 'Understand business context and constraints',
        category: 'Research',
        difficulty: 'beginner',
        estimatedTime: '1-2 hours per interview',
        artifacts: ['Stakeholder insights', 'Requirements', 'Constraints']
      },
      {
        id: 'contextual-inquiry',
        name: 'Contextual Inquiry',
        description: 'Observe users in their natural environment',
        category: 'Research',
        difficulty: 'intermediate',
        estimatedTime: '4-6 hours per session',
        artifacts: ['Contextual insights', 'Environment factors', 'Workflow understanding']
      }
    ]
  },
  {
    id: 'define',
    name: 'Define',
    description: 'Synthesize insights into a clear brief',
    purpose: 'Converge on the right problem to solve',
    order: 2,
    recommendedDuration: '1 week',
    inputRequirements: ['Research insights', 'Discovery findings'],
    expectedOutputs: ['Design brief', 'Problem statement', 'Success criteria'],
    tools: [
      {
        id: 'synthesis-workshops',
        name: 'Synthesis Workshops',
        description: 'Collaborative analysis of research findings',
        category: 'Synthesis',
        difficulty: 'intermediate',
        estimatedTime: '4-6 hours',
        artifacts: ['Insight themes', 'Key findings', 'Problem areas']
      },
      {
        id: 'problem-framing',
        name: 'Problem Framing',
        description: 'Define the core problem to address',
        category: 'Synthesis',
        difficulty: 'intermediate',
        estimatedTime: '2-3 hours',
        artifacts: ['Problem statement', 'Success metrics', 'Scope definition']
      }
    ]
  },
  {
    id: 'develop',
    name: 'Develop',
    description: 'Generate and explore solution concepts',
    purpose: 'Explore multiple solution approaches',
    order: 3,
    recommendedDuration: '2-3 weeks',
    inputRequirements: ['Design brief', 'Problem statement'],
    expectedOutputs: ['Solution concepts', 'Prototypes', 'Design decisions'],
    tools: [
      {
        id: 'concept-sketches',
        name: 'Concept Sketches',
        description: 'Visual exploration of solution ideas',
        category: 'Ideation',
        difficulty: 'beginner',
        estimatedTime: '4-8 hours',
        artifacts: ['Concept sketches', 'Idea variations', 'Visual concepts']
      },
      {
        id: 'prototyping',
        name: 'Prototyping',
        description: 'Build testable solution representations',
        category: 'Prototyping',
        difficulty: 'intermediate',
        estimatedTime: '1-2 weeks',
        artifacts: ['Prototypes', 'Interaction flows', 'Design specifications']
      }
    ]
  },
  {
    id: 'deliver',
    name: 'Deliver',
    description: 'Test and refine the solution',
    purpose: 'Validate and implement the final solution',
    order: 4,
    recommendedDuration: '2-4 weeks',
    inputRequirements: ['Solution prototypes', 'Test scenarios'],
    expectedOutputs: ['Validated solution', 'Implementation plan', 'Success metrics'],
    tools: [
      {
        id: 'pilot-testing',
        name: 'Pilot Testing',
        description: 'Test solution with real users in real context',
        category: 'Testing',
        difficulty: 'advanced',
        estimatedTime: '1-2 weeks',
        artifacts: ['Test results', 'User feedback', 'Performance data']
      },
      {
        id: 'implementation-plans',
        name: 'Implementation Plans',
        description: 'Define how solution will be built and deployed',
        category: 'Planning',
        difficulty: 'intermediate',
        estimatedTime: '3-5 days',
        artifacts: ['Implementation roadmap', 'Resource requirements', 'Timeline']
      }
    ]
  }
];

export const designThinking: UXFramework = {
  id: 'design-thinking',
  name: 'Design Thinking',
  description: 'Human-centered approach to innovation that integrates the needs of people, possibilities of technology, and requirements for business success',
  category: 'process',
  stages: designThinkingStages,
  totalDuration: '6-10 weeks',
  bestUseCases: ['Product innovation', 'Service design', 'Complex problem solving'],
  complexity: 'intermediate'
};

export const doubleDiamond: UXFramework = {
  id: 'double-diamond',
  name: 'Double Diamond',
  description: 'Four-phase design process that diverges to explore an issue widely, then converges on solutions',
  category: 'process',
  stages: doubleDiamondStages,
  totalDuration: '8-12 weeks',
  bestUseCases: ['Strategic design projects', 'Service design', 'Innovation projects'],
  complexity: 'intermediate'
};

// Initialize other frameworks with placeholder data for now
export const frameworkLibrary: Record<FrameworkType, UXFramework> = {
  'design-thinking': designThinking,
  'double-diamond': doubleDiamond,
  'google-design-sprint': {
    id: 'google-design-sprint',
    name: 'Google Design Sprint',
    description: 'Five-day process for answering critical business questions through design, prototyping, and testing',
    category: 'process',
    stages: [], // TODO: Implement full stages
    totalDuration: '1 week',
    bestUseCases: ['Rapid validation', 'New product features', 'Critical decisions'],
    complexity: 'advanced'
  },
  'human-centered-design': {
    id: 'human-centered-design',
    name: 'Human-Centered Design',
    description: 'Design approach that puts human needs, capabilities, and ways of behaving first',
    category: 'process',
    stages: [], // TODO: Implement full stages
    totalDuration: '4-8 weeks',
    bestUseCases: ['Social impact projects', 'Complex systems', 'Inclusive design'],
    complexity: 'intermediate'
  },
  'jobs-to-be-done': {
    id: 'jobs-to-be-done',
    name: 'Jobs-to-Be-Done',
    description: 'Framework for understanding customer motivation and creating solutions',
    category: 'process',
    stages: [], // TODO: Implement full stages
    totalDuration: '3-6 weeks',
    bestUseCases: ['Product strategy', 'Market research', 'Innovation'],
    complexity: 'advanced'
  },
  'lean-ux': {
    id: 'lean-ux',
    name: 'Lean UX',
    description: 'Iterative approach focused on rapid experimentation and learning',
    category: 'process',
    stages: [], // TODO: Implement full stages
    totalDuration: 'Ongoing sprints',
    bestUseCases: ['Agile environments', 'Startup products', 'Continuous improvement'],
    complexity: 'intermediate'
  },
  'agile-ux': {
    id: 'agile-ux',
    name: 'Agile UX',
    description: 'UX approach that fits within agile development methodologies',
    category: 'process',
    stages: [], // TODO: Implement full stages
    totalDuration: 'Sprint-based',
    bestUseCases: ['Software development', 'Iterative products', 'Cross-functional teams'],
    complexity: 'advanced'
  },
  'heart': {
    id: 'heart',
    name: 'HEART Framework',
    description: 'User-centered metrics framework for measuring user experience',
    category: 'metrics',
    stages: [], // TODO: Implement full stages
    totalDuration: 'Ongoing measurement',
    bestUseCases: ['UX metrics', 'Product analytics', 'Performance tracking'],
    complexity: 'advanced'
  },
  'hooked-model': {
    id: 'hooked-model',
    name: 'Hooked Model',
    description: 'Four-step process for building habit-forming products',
    category: 'behavioral',
    stages: [], // TODO: Implement full stages
    totalDuration: '2-4 weeks',
    bestUseCases: ['Habit formation', 'User engagement', 'Product stickiness'],
    complexity: 'intermediate'
  }
};