import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Bot, MessageSquare, Palette, FileText, Zap, ArrowRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: "design" | "general" | "productivity";
  icon: React.ReactNode;
  promptPrefix?: string;
  promptSuffix?: string;
  instructions?: string;
}

const aiModels: AIModel[] = [
  // Design Tools
  {
    id: "figma-make",
    name: "Figma Make",
    description: "AI-powered design assistant in Figma",
    category: "design",
    icon: <Palette className="h-5 w-5" />,
    promptPrefix: "As a Figma Make AI assistant, ",
    instructions: "Focus on visual design, components, and Figma-specific features"
  },
  {
    id: "figjam-ai",
    name: "Figjam AI",
    description: "AI for collaborative whiteboarding and ideation",
    category: "design",
    icon: <FileText className="h-5 w-5" />,
    promptPrefix: "As a Figjam AI assistant for collaborative design, ",
    instructions: "Emphasize collaboration, ideation, and visual thinking"
  },
  {
    id: "miro-ai",
    name: "Miro AI",
    description: "AI assistant for visual collaboration and mapping",
    category: "design",
    icon: <Sparkles className="h-5 w-5" />,
    promptPrefix: "As a Miro AI assistant for visual collaboration, ",
    instructions: "Focus on visual mapping, user journey, and collaborative ideation"
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    description: "AI assistant for documentation and project management",
    category: "productivity",
    icon: <FileText className="h-5 w-5" />,
    promptPrefix: "As a Notion AI assistant, ",
    instructions: "Structure information clearly with headers, lists, and organized content"
  },
  // General AI
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "OpenAI's conversational AI assistant",
    category: "general",
    icon: <MessageSquare className="h-5 w-5" />,
    promptPrefix: "As a UX design expert using ChatGPT, ",
    instructions: "Provide detailed, conversational responses with examples"
  },
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's AI assistant for detailed analysis",
    category: "general",
    icon: <Bot className="h-5 w-5" />,
    promptPrefix: "As a UX design expert using Claude, ",
    instructions: "Provide thorough analysis with step-by-step reasoning"
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Google's AI assistant for creative tasks",
    category: "general",
    icon: <Sparkles className="h-5 w-5" />,
    promptPrefix: "As a UX design expert using Gemini, ",
    instructions: "Focus on creative solutions and innovative approaches"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "Advanced AI for technical and creative tasks",
    category: "general",
    icon: <Zap className="h-5 w-5" />,
    promptPrefix: "As a UX design expert using DeepSeek, ",
    instructions: "Provide technical depth with practical implementation details"
  }
];

interface AIModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  onContinue: () => void;
  className?: string;
}

export const AIModelSelector = ({ selectedModel, onModelSelect, onContinue, className = '' }: AIModelSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "design" | "general" | "productivity">("all");

  const filteredModels = selectedCategory === "all" 
    ? aiModels 
    : aiModels.filter(model => model.category === selectedCategory);

  const selectedModelData = aiModels.find(model => model.id === selectedModel);

  // Group models by category
  const modelsByCategory = filteredModels.reduce((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {} as Record<string, typeof aiModels>);

  const categoryLabels = {
    design: 'Design Tools',
    productivity: 'Productivity',
    general: 'General AI'
  } as const;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Select AI Model</h2>
        <p className="text-muted-foreground">
          Choose the AI model that best fits your needs. The prompt will be optimized for your selection.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", name: "All" },
          { id: "design", name: "Design Tools" },
          { id: "general", name: "General AI" },
          { id: "productivity", name: "Productivity" }
        ].map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id as any)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* AI Models Grid */}
      <div className="space-y-6">
        {Object.entries(modelsByCategory).map(([category, models]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {models.map((model) => (
                <Card 
                  key={model.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedModel === model.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : 'hover:bg-accent/50 hover:shadow-md'
                  }`}
                  onClick={() => onModelSelect(model.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <span className="flex-shrink-0">{model.icon}</span>
                        {model.name}
                        {selectedModel === model.id && (
                          <Badge variant="outline" className="ml-2">
                            Selected
                          </Badge>
                        )}
                      </CardTitle>
                      {model.instructions && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">{model.instructions}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <CardDescription className="text-sm leading-relaxed">
                      {model.description}
                    </CardDescription>
                  </CardHeader>
                  {selectedModel === model.id && model.promptPrefix && (
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground bg-accent/30 p-2 rounded-md">
                        <p className="font-medium text-foreground mb-1">Prompt Format:</p>
                        <p className="italic">"{model.promptPrefix}..."</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-4">
        <Button 
          onClick={onContinue}
          disabled={!selectedModel}
          size="lg"
          className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {selectedModelData ? `Use with ${selectedModelData.name}` : 'Continue'}
        </Button>
      </div>
    </div>
  );
};