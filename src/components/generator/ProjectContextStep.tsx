import { useState, useEffect, useCallback } from "react";
import { StepCard } from "./StepCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowRight, Sparkles, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AIToolSelector } from "@/components/ai/AIToolSelector";

interface ProjectContextStepProps {
  onNext: (context: ProjectContext) => void;
  onBack: () => void;
  onGenerate: (tool: string) => Promise<void>;
  initialContext?: ProjectContext | null;
  basicInfo: {
    name: string;
    description: string;
  };
  projectStage: string;
  framework: string;
  frameworkStage: string;
  selectedTool: string;
}

export interface ProjectContext {
  projectDescription?: string;
  contextFiles?: File[];
  documentContent?: string;
  selectedAITool?: string;
}

export const ProjectContextStep = ({ 
  onNext, 
  onBack, 
  initialContext, 
  basicInfo, 
  projectStage, 
  framework, 
  frameworkStage, 
  selectedTool,
  onGenerate 
}: ProjectContextStepProps) => {
  const [projectDescription, setProjectDescription] = useState("");
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedAITool, setSelectedAITool] = useState<string | null>(null);
  const { toast } = useToast();

  // Track if we have existing context from props
  const [hasExistingContext, setHasExistingContext] = useState(!!(initialContext?.projectDescription || initialContext?.documentContent));
  const [hasEdited, setHasEdited] = useState(false);

  // Set default AI tool when the selected tool changes
  useEffect(() => {
    if (selectedTool) {
      // Default to 'chatgpt' as the selected AI tool
      setSelectedAITool('chatgpt');
    } else {
      setSelectedAITool(null);
    }
  }, [selectedTool]);

  // Initialize from initialContext if we haven't edited yet
  useEffect(() => {
    if (initialContext && !hasEdited) {
      setProjectDescription(initialContext.projectDescription || "");
      setDocumentContent(initialContext.documentContent || "");
      setHasExistingContext(!!(initialContext.projectDescription || initialContext.documentContent));
    }
  }, [initialContext, hasEdited]);

  const handleNext = () => {
    const contextToSend = {
      projectDescription: projectDescription.trim(),
      contextFiles: contextFiles.length > 0 ? contextFiles : undefined,
      documentContent: documentContent,
      selectedAITool: selectedAITool || undefined,
    };
    
    // Always send the current context, regardless of previous state
    onNext(contextToSend);
  };
  
  const handleAIToolSelect = (toolName: string) => {
    setSelectedAITool(toolName);
  };

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setContextFiles([file]);
    setIsProcessing(true);
    setDocumentContent("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await supabase.functions.invoke('process-document', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

      // The 'data' from invoke is the parsed JSON response body.
      // If the function returns { documentContent: '...' }, this is correct.
      // We'll add a check to ensure it's a string before setting.
      if (typeof data.documentContent === 'string') {
        setDocumentContent(data.documentContent);
      } else {
        // If the structure is different, we'll handle it gracefully.
        const content = JSON.stringify(data, null, 2);
        setDocumentContent(content);
        console.warn('Received unexpected data structure:', data);
      }

      toast({ title: "File processed successfully!" });

    } catch (error: any) {
      console.error('Error processing file:', error);
      toast({ title: "Error processing file", description: error.message, variant: "destructive" });
      setContextFiles([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileRemove = (fileToRemove: File) => {
    setContextFiles(contextFiles.filter(file => file !== fileToRemove));
    setDocumentContent("");
  };

  const [isEnhancing, setIsEnhancing] = useState(false);

  const [isTouched, setIsTouched] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Validate the project description
  const validateInput = () => {
    const isValid = projectDescription.trim().length > 0;
    setIsTouched(true);
    return isValid;
  };

  const handleGenerate = async () => {
    if (!selectedTool) {
      toast({
        title: "No tool selected",
        description: "Please select a tool before generating a prompt.",
        variant: "destructive",
      });
      return;
    }

    // Validate the input
    if (!validateInput()) {
      toast({
        title: "Project Context Required",
        description: "Please enter some context before generating a prompt.",
        variant: "destructive",
      });
      return;
    }

    // Create the current context with the latest values
    const currentContext = {
      projectDescription: projectDescription.trim(),
      contextFiles,
      documentContent,
    };

    // Call onNext to update the parent's state with the latest context
    onNext(currentContext);

    setIsGenerating(true);
    try {
      // Now generate the prompt with the updated context
      await onGenerate(selectedTool);
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceWithAI = async () => {
    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: basicInfo.name,
          projectDescription: basicInfo.description,
          currentContext: projectDescription
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const enhancedContext = await response.json();
      setProjectDescription(enhancedContext.enhancedDescription);
    } catch (error) {
      console.error('Error enhancing context:', error);
      alert('Failed to enhance context. Please try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // Show context summary
  const contextInfo = [
    basicInfo?.name,
    projectStage,
    framework !== "none" ? framework : null,
    frameworkStage && framework !== "none" ? `(${frameworkStage})` : null,
    selectedTool
  ].filter(Boolean).join(" • ") || "No context provided";

  return (
    <StepCard
      step={5}
      totalSteps={6}
      title="Generate Prompt"
      description="Provide context and generate the perfect prompt"
    >
      <div className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4">
          <h3 className="font-semibold">Your Context</h3>
          <div className="text-sm bg-muted/30 p-3 rounded">
            {contextInfo}
          </div>
          
          {/* AI Tool Selector - Only show if we have tools or are loading */}
          {(selectedTool) && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">AI Assistant</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Select an AI tool to help with your {selectedTool || 'selected task'}
              </p>
              <AIToolSelector
                uxToolId={selectedTool}
                selectedTool={selectedAITool}
                onSelectTool={setSelectedAITool}
                className="mb-6"
              />
            </div>
          )}
          
          {hasExistingContext && !hasEdited && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                This project has existing context. You can update it below if needed.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Prompt Context</h4>
              {isTouched && !projectDescription.trim() && (
                <span className="text-sm text-red-500">Context is required</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Add any additional details to help generate a better prompt
            </p>
            <Textarea
              placeholder="e.g., A mobile app for tracking personal fitness goals..."
              value={projectDescription}
              onChange={(e) => {
                setProjectDescription(e.target.value);
                if (e.target.value !== initialContext?.projectDescription) {
                  setHasEdited(true);
                }
                if (isTouched) {
                  validateInput();
                }
              }}
              onBlur={() => {
                setIsInputFocused(false);
                validateInput();
              }}
              onFocus={() => setIsInputFocused(true)}
              className={`min-h-[120px] ${isTouched && !projectDescription.trim() ? 'border-red-500' : ''}`}
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Upload Documents (Optional)</h4>
            <p className="text-sm text-muted-foreground">
              Add any relevant documents, images, or references to help generate a better prompt
            </p>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              accept="image/*,.pdf,.doc,.docx,.txt"
              maxFiles={5}
              maxSizeMB={5} // 5MB
            />
            {isProcessing && (
              <div className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                Processing document...
              </div>
            )}
            {documentContent && (
              <div className="mt-3 p-3 bg-muted/30 rounded text-sm">
                <h4 className="font-medium mb-1">Document Content:</h4>
                <p className="whitespace-pre-wrap text-muted-foreground">
                  {documentContent.length > 500 
                    ? `${documentContent.substring(0, 500)}...` 
                    : documentContent}
                </p>
                {documentContent.length > 500 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    (Document truncated - {documentContent.length} characters total)
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="space-x-2">
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Prompt <Sparkles className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </StepCard>
  );
};

export default ProjectContextStep;