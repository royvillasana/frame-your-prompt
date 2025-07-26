import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FreeAIModel {
  id: string;
  name: string;
  url: string;
  limitations: string;
  promptOptimization: (prompt: string) => string;
  color: string;
}

const FREE_AI_MODELS: FreeAIModel[] = [
  {
    id: "chatgpt",
    name: "ChatGPT Free",
    url: "https://chat.openai.com/",
    limitations: "GPT-3.5 model, no memory between sessions, ~4,000 token limit",
    color: "bg-green-100 text-green-800 border-green-200",
    promptOptimization: (prompt: string) => {
      // Optimize for ChatGPT - keep it concise and structured
      return `${prompt}\n\nPlease provide a structured response with clear headings and actionable insights.`;
    }
  },
  {
    id: "gemini",
    name: "Google Gemini",
    url: "https://gemini.google.com/",
    limitations: "Best for short, well-scoped tasks with clear objectives",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    promptOptimization: (prompt: string) => {
      // Optimize for Gemini - direct and specific
      return `${prompt}\n\nFocus on practical, actionable recommendations with specific examples.`;
    }
  },
  {
    id: "claude",
    name: "Claude Free",
    url: "https://claude.ai/",
    limitations: "Handles longer context well, more thoughtful responses, slower output",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    promptOptimization: (prompt: string) => {
      // Optimize for Claude - can handle detailed context
      return `${prompt}\n\nPlease provide a comprehensive analysis with detailed reasoning and consider multiple perspectives where relevant.`;
    }
  }
];

interface FreeAIIntegrationProps {
  prompt: string;
}

export function FreeAIIntegration({ prompt }: FreeAIIntegrationProps) {
  const [selectedModel, setSelectedModel] = useState<string>("chatgpt");
  const { toast } = useToast();

  const currentModel = FREE_AI_MODELS.find(model => model.id === selectedModel) || FREE_AI_MODELS[0];

  const copyPromptForModel = (model: FreeAIModel) => {
    const optimizedPrompt = model.promptOptimization(prompt);
    navigator.clipboard.writeText(optimizedPrompt);
    toast({
      title: "Prompt copied!",
      description: `Optimized prompt for ${model.name} copied to clipboard`,
    });
  };

  const openAITool = (url: string, modelName: string) => {
    window.open(url, '_blank');
    toast({
      title: `Opening ${modelName}`,
      description: "Paste your copied prompt to get started",
    });
  };

  const shortenPrompt = () => {
    // Simple prompt shortening logic
    const sentences = prompt.split('. ');
    const shortened = sentences.slice(0, Math.ceil(sentences.length * 0.7)).join('. ');
    navigator.clipboard.writeText(shortened);
    toast({
      title: "Shortened prompt copied!",
      description: "Reduced prompt length for token-limited models",
    });
  };

  return (
    <TooltipProvider>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Use with Free AI Tools</span>
            <Badge variant="secondary">No API Required</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Copy your generated prompt and use it with free AI models outside this platform
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Model Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select AI Model</label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREE_AI_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Current Model Info */}
          <div className={`p-3 rounded-lg border ${currentModel.color}`}>
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">{currentModel.name} Limitations</p>
                <p className="text-xs mt-1">{currentModel.limitations}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FREE_AI_MODELS.map((model) => (
              <div key={model.id} className="space-y-2">
                <Button
                  onClick={() => copyPromptForModel(model)}
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy for {model.name}
                </Button>
                <Button
                  onClick={() => openAITool(model.url, model.name)}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open {model.name}
                </Button>
              </div>
            ))}
          </div>

          {/* Additional Tools */}
          <div className="pt-3 border-t space-y-2">
            <p className="text-sm font-medium">Additional Options</p>
            <div className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={shortenPrompt} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Shortened
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reduces prompt length for models with token limits</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Usage Tips */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="text-sm font-medium mb-2">💡 Usage Tips</p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Copy the optimized prompt for your chosen AI model</li>
              <li>• Click "Open" to access the AI tool in a new tab</li>
              <li>• Paste your prompt and start the conversation</li>
              <li>• Use "Copy Shortened" for models with strict token limits</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
