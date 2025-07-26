import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Bot, MessageSquare, Palette, FileText, Zap } from "lucide-react";

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
}

export const AIModelSelector = ({ selectedModel, onModelSelect, onContinue }: AIModelSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<"all" | "design" | "general" | "productivity">("all");

  const filteredModels = selectedCategory === "all" 
    ? aiModels 
    : aiModels.filter(model => model.category === selectedCategory);

  const selectedModelData = aiModels.find(model => model.id === selectedModel);

  return (
    <Card className="bg-gradient-card shadow-medium">
      <CardHeader>
        <CardTitle>Choose Your AI Tool</CardTitle>
        <CardDescription>
          Select the AI tool you'll use with this prompt to customize it accordingly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex gap-2">
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
              onClick={() => setSelectedCategory(category.id as "all" | "design" | "general" | "productivity")}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* AI Models Grid */}
        <div className="grid gap-3 md:grid-cols-2">
          {filteredModels.map((model) => (
            <Card
              key={model.id}
              className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                selectedModel === model.id 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => onModelSelect(model.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {model.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{model.name}</h3>
                      {selectedModel === model.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {model.category}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected Model Details */}
        {selectedModelData && (
          <div className="bg-muted/30 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Customization for {selectedModelData.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {selectedModelData.instructions}
            </p>
            {selectedModelData.promptPrefix && (
              <div className="text-xs bg-background p-2 rounded border">
                <strong>Prompt prefix:</strong> {selectedModelData.promptPrefix}
              </div>
            )}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onContinue}
            disabled={!selectedModel}
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Use with {selectedModelData?.name || "Selected AI"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};