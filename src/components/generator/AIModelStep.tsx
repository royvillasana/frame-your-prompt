import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type AIModel = {
  id: string;
  name: string;
  description: string;
  promptFormat?: string;
};

export const AI_MODELS: AIModel[] = [
  {
    id: "figma-make",
    name: "Figma Make",
    description: "AI-powered design tool for creating and iterating on designs",
    promptFormat: "Design focused, visual-first prompts with clear layout and component descriptions"
  },
  {
    id: "notion-ai",
    name: "Notion AI",
    description: "AI writing and organization assistant",
    promptFormat: "Structured content with clear headings and organizational hierarchy"
  },
  {
    id: "miro-ai",
    name: "Miro AI",
    description: "Visual collaboration and diagramming assistant",
    promptFormat: "Visual mapping and diagram-oriented prompts with clear relationships"
  },
  {
    id: "figjam-ai",
    name: "FigJam AI",
    description: "Collaborative whiteboarding and ideation assistant",
    promptFormat: "Interactive workshop and brainstorming focused prompts"
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    description: "General purpose AI assistant",
    promptFormat: "Clear, conversational prompts with specific instructions"
  },
  {
    id: "claude",
    name: "Claude",
    description: "Anthropic's AI assistant with detailed analysis capabilities",
    promptFormat: "Detailed, analytical prompts with context and requirements"
  },
  {
    id: "grok",
    name: "Grok",
    description: "X's AI assistant with real-time data access",
    promptFormat: "Direct, concise prompts with current context requirements"
  }
];

type AIModelStepProps = {
  selectedModel: string;
  onModelSelect: (model: string) => void;
};

export const AIModelStep = ({ selectedModel, onModelSelect }: AIModelStepProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select AI Model (Optional)</CardTitle>
        <CardDescription>
          Choose the AI model you'll be using. This will help tailor the prompt format for better results.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select value={selectedModel} onValueChange={onModelSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select an AI model (optional)" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedModel && (
          <div className="mt-4">
            <p className="text-sm font-medium">Model Description:</p>
            <p className="text-sm text-muted-foreground">
              {AI_MODELS.find(m => m.id === selectedModel)?.description}
            </p>
            <p className="text-sm font-medium mt-2">Prompt Format:</p>
            <p className="text-sm text-muted-foreground">
              {AI_MODELS.find(m => m.id === selectedModel)?.promptFormat}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};