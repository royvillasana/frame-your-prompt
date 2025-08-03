import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

interface AITool {
  id: string;
  name: string;
  description: string;
}

interface AIToolCategory {
  [key: string]: {
    tools: AITool[];
    description: string;
  };
  default: {
    tools: AITool[];
    description: string;
  };
}

// AI Tools data structure mapped from AI_Tools_for_UX_Design_Thinking.md
const AI_TOOLS: AIToolCategory = {
  // Lean UX - Think
  'proto-personas': {
    description: 'Create quick, assumption-based personas to guide early design decisions.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Helps create and organize proto-personas with customizable templates and sticky notes.' },
      { id: 'figma', name: 'FigJam AI', description: 'Generates interactive proto-personas with visual elements and connections.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Automatically creates proto-personas from existing user data and research.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps generate realistic user details and characteristics for proto-personas.' }
    ]
  },

  // Design Thinking - Empathize
  'personas': {
    description: 'Create detailed user personas to better understand your target audience.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Creates visual persona templates with customizable attributes and layouts.' },
      { id: 'figma', name: 'FigJam AI', description: 'Generates interactive personas with visual elements and relationships.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Automatically creates detailed personas from user research data.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps develop realistic user personas with detailed characteristics and goals.' }
    ]
  },
  'journey-map': {
    description: 'Map out user journeys to identify pain points and opportunities.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Helps create and visualize user journey maps with sticky notes and connections.' },
      { id: 'figma', name: 'FigJam AI', description: 'Generates interactive journey maps with user pain points and opportunities.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Automatically creates journey maps from user research data.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps identify key journey stages and touchpoints based on user research.' }
    ]
  },
  'interviews': {
    description: 'Conduct and analyze user interviews to gather qualitative insights.',
    tools: [
      { id: 'otter', name: 'Otter.ai', description: 'Transcribes and summarizes interviews using NLP.' },
      { id: 'dovetail', name: 'Dovetail', description: 'Clusters qualitative data and detects themes.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Synthesizes empathy maps and identifies pain points.' },
      { id: 'monkeylearn', name: 'MonkeyLearn', description: 'Performs sentiment analysis on textual data.' }
    ]
  },
  'empathy-maps': {
    description: 'Visualize user attitudes and behaviors to build empathy.',
    tools: [
      { id: 'otter', name: 'Otter.ai', description: 'Transcribes and summarizes interviews using NLP.' },
      { id: 'dovetail', name: 'Dovetail', description: 'Clusters qualitative data and detects themes.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Synthesizes empathy maps and identifies pain points.' },
      { id: 'monkeylearn', name: 'MonkeyLearn', description: 'Performs sentiment analysis on textual data.' }
    ]
  },
  'field-studies': {
    description: 'Observe users in their natural environment.',
    tools: [
      { id: 'otter', name: 'Otter.ai', description: 'Transcribes and summarizes field notes using NLP.' },
      { id: 'dovetail', name: 'Dovetail', description: 'Organizes and analyzes field study observations.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Identifies patterns and insights from field data.' },
      { id: 'monkeylearn', name: 'MonkeyLearn', description: 'Analyzes qualitative data from field notes.' }
    ]
  },
  'diary-studies': {
    description: 'Gather longitudinal data about user behaviors and experiences.',
    tools: [
      { id: 'otter', name: 'Otter.ai', description: 'Transcribes and summarizes diary entries.' },
      { id: 'dovetail', name: 'Dovetail', description: 'Analyzes patterns across diary study data.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Identifies trends and insights from diary entries.' },
      { id: 'monkeylearn', name: 'MonkeyLearn', description: 'Performs sentiment analysis on diary content.' }
    ]
  },
  'contextual-inquiry': {
    description: 'Observe and interview users in their natural context.',
    tools: [
      { id: 'otter', name: 'Otter.ai', description: 'Transcribes and summarizes contextual inquiry sessions.' },
      { id: 'dovetail', name: 'Dovetail', description: 'Organizes and analyzes contextual inquiry data.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Synthesizes findings from contextual inquiries.' },
      { id: 'monkeylearn', name: 'MonkeyLearn', description: 'Analyzes qualitative data from observations.' }
    ]
  },

  // Design Thinking - Define
  'problem-statement': {
    description: 'Define clear problem statements to focus your design efforts.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Clusters sticky notes into affinity groups.' },
      { id: 'figma', name: 'FigJam AI', description: 'Generates Point-of-View and Problem Statements.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Synthesizes user needs into problem statements.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps write clear and concise problem statements.' }
    ]
  },
  'hmw': {
    description: 'Generate "How Might We" questions to explore potential solutions.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Clusters sticky notes into HMW questions.' },
      { id: 'figma', name: 'FigJam AI', description: 'Generates and organizes HMW questions.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Converts user needs into HMW questions.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps brainstorm and refine HMW questions.' }
    ]
  },
  'pov': {
    description: 'Create Point of View statements to guide your design process.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Clusters insights into POV statements.' },
      { id: 'figma', name: 'FigJam AI', description: 'Generates Point-of-View statements from research.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Synthesizes user needs into POV statements.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps craft clear and insightful POV statements.' }
    ]
  },
  'affinity-diagram': {
    description: 'Organize and synthesize research findings into meaningful groups.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Clusters sticky notes into affinity groups.' },
      { id: 'figma', name: 'FigJam AI', description: 'Helps create digital affinity diagrams with team collaboration.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Automatically groups related research findings.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps identify patterns and themes in research data.' }
    ]
  },

  // Design Thinking - Ideate
  'brainstorming': {
    description: 'Generate creative ideas and solutions.',
    tools: [
      { id: 'miro', name: 'Miro AI', description: 'Facilitates virtual brainstorming with digital sticky notes and idea clustering.' },
      { id: 'figma', name: 'FigJam AI', description: 'Enables collaborative brainstorming with templates and voting features.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Suggests brainstorming prompts and groups related ideas automatically.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Generates creative ideas and helps expand on initial concepts.' }
    ]
  },
  'scamper': {
    description: 'Use SCAMPER technique to generate innovative ideas.',
    tools: [
      { id: 'chatgpt', name: 'ChatGPT', description: 'Facilitates SCAMPER ideation and Crazy 8s idea expansion.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Clusters ideas and suggests opportunity areas.' },
      { id: 'ideanote', name: 'Ideanote', description: 'Helps manage and develop ideas using SCAMPER.' },
      { id: 'miro', name: 'Miro AI', description: 'Provides SCAMPER templates and visual idea organization.' }
    ]
  },
  'storyboarding': {
    description: 'Visualize user stories and scenarios.',
    tools: [
      { id: 'figma', name: 'Figma AI', description: 'Generates storyboard frames and layouts.' },
      { id: 'storyboardthat', name: 'Storyboard That AI', description: 'Creates custom storyboards with characters and scenes.' },
      { id: 'miro', name: 'Miro AI', description: 'Helps structure user stories and scenarios visually.' },
      { id: 'chatgpt', name: 'ChatGPT', description: 'Helps write user stories and scenario descriptions.' }
    ]
  },
  'wireframing': {
    description: 'Create low-fidelity layouts for your designs.',
    tools: [
      { id: 'figma', name: 'Figma AI', description: 'Generates wireframes from text descriptions.' },
      { id: 'uizard', name: 'Uizard', description: 'Transforms text descriptions into interactive wireframes.' },
      { id: 'magician', name: 'Magician for Figma', description: 'Suggests design completions inside Figma.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'Helps create wireframes based on user needs.' }
    ]
  },
  'prototyping': {
    description: 'Create interactive prototypes to test your designs.',
    tools: [
      { id: 'figma', name: 'Figma AI', description: 'Transforms wireframes into interactive prototypes.' },
      { id: 'framer', name: 'Framer AI', description: 'Generates responsive prototypes with AI.' },
      { id: 'uizard', name: 'Uizard', description: 'Turns sketches into interactive prototypes.' },
      { id: 'protoio', name: 'Proto.io', description: 'Quickly builds and tests interactive prototypes.' }
    ]
  },

  // Fallback for any tool not explicitly listed
  'default': {
    description: 'AI assistance for your UX work.',
    tools: [
      { id: 'chatgpt', name: 'ChatGPT', description: 'General AI assistance for UX tasks and questions.' },
      { id: 'miro', name: 'Miro AI', description: 'Visual collaboration and whiteboarding.' },
      { id: 'figma', name: 'Figma AI', description: 'AI-powered design assistance.' },
      { id: 'uxpilot', name: 'UX Pilot', description: 'AI-powered UX research and design assistance.' }
    ]
  }
} as const;

interface AIToolSelectorProps {
  uxToolId: string;
  selectedTool: string | null;
  onSelectTool: (toolId: string) => void;
  className?: string;
}

export const AIToolSelector: React.FC<AIToolSelectorProps> = ({
  uxToolId,
  selectedTool,
  onSelectTool,
  className = '',
}) => {
  // Use the specific tool data if available, otherwise fall back to default
  const toolData = AI_TOOLS[uxToolId as keyof typeof AI_TOOLS] || AI_TOOLS.default;
  const isLoading = false; // We always have default tools now
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Select the AI Tool that you want to use</CardTitle>
          <CardDescription>Loading available AI tools...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }


  
  const { tools, description } = toolData;

  return (
    <Card className={`rounded-lg border bg-card text-card-foreground shadow-sm mb-6 ${className}`}>
      <CardHeader className="flex flex-col space-y-1.5 p-6">
        <CardTitle className="text-2xl font-semibold leading-none tracking-tight">AI Assistant</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => {
            const isSelected = selectedTool === tool.id;
            return (
              <Button
                key={tool.id}
                variant="outline"
                className={`
                  justify-start gap-2 whitespace-normal rounded-lg text-sm font-medium
                  h-auto p-4 text-left group transition-all
                  ${isSelected 
                    ? 'bg-primary text-primary-foreground shadow-medium hover:shadow-strong border-primary' 
                    : 'border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-primary/50'
                  }
                `}
                onClick={() => onSelectTool(tool.id)}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center w-full justify-between mb-2">
                    <span className="font-medium">{tool.name}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm">{tool.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className={`text-sm ${
                    isSelected ? 'text-primary-foreground/90' : 'text-muted-foreground'
                  } line-clamp-2`}>
                    {tool.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIToolSelector;
