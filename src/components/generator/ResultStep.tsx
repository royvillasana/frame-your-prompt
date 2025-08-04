import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw, Save, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";

interface ResultStepProps {
  prompt: string;
  onRegenerate: () => void;
  onSave: () => void;
  onBack: () => void;
  aiResponse: string;
  isGeneratingAI: boolean;
  onGenerateAI: () => void;
}

export function ResultStep({
  prompt,
  onRegenerate,
  onSave,
  onBack,
  aiResponse,
  isGeneratingAI,
  onGenerateAI
}: ResultStepProps) {
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "The prompt has been copied to your clipboard.",
    });
    
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Your Generated Prompt</CardTitle>
              <CardDescription>
                Review and copy your prompt, or regenerate if needed.
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy}
                disabled={isCopied}
              >
                <Copy className="h-4 w-4 mr-2" />
                {isCopied ? "Copied!" : "Copy"}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRegenerate}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted/50 p-4 overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {prompt}
            </pre>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save to Project
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>AI Response</CardTitle>
              <CardDescription>
                Generate an AI response using this prompt
              </CardDescription>
            </div>
            <Button 
              onClick={onGenerateAI} 
              disabled={isGeneratingAI}
              className="gap-2"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate AI Response
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {aiResponse && (
          <CardContent>
            <div className="rounded-md bg-muted/50 p-4 overflow-auto max-h-96">
              <div className="prose prose-sm max-w-none">
                {aiResponse}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
