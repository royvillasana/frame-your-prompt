import { useState, useEffect } from "react";
import { StepCard } from "./StepCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProjectContextStepProps {
  onNext: (context: ProjectContext) => void;
  onBack: () => void;
  initialContext?: ProjectContext | null;
  basicInfo: {
    name: string;
    description: string;
  };
}

export interface ProjectContext {
  projectDescription?: string;
  contextFiles?: File[];
  documentContent?: string;
}

export const ProjectContextStep = ({ onNext, onBack, initialContext, basicInfo }: ProjectContextStepProps) => {
  const [projectDescription, setProjectDescription] = useState("");
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [documentContent, setDocumentContent] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (initialContext) {
      setProjectDescription(initialContext.projectDescription || "");
    }
  }, [initialContext]);

  const handleNext = () => {
    onNext({
      projectDescription: projectDescription,
      contextFiles: contextFiles.length > 0 ? contextFiles : undefined,
      documentContent: documentContent,
    });
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

  return (
    <StepCard
      step={1}
      totalSteps={4}
      title="Project Context"
      description="Tell us about your project to generate more relevant prompts"
    >
      <div className="space-y-6">
        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-semibold">Project Context</h3>
          <p className="text-sm text-gray-500">What is your project about? Provide as much detail as possible.</p>
          <Textarea
            placeholder="e.g., A mobile app for tracking personal fitness goals..."
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            rows={6}
          />
          <div className="flex justify-end">
            <Button
              onClick={enhanceWithAI}
              disabled={isEnhancing || !projectDescription}
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
            </Button>
          </div>
        </div>

        <div className="p-4 border rounded-lg space-y-2">
          <h3 className="font-semibold">File Upload</h3>
          <p className="text-sm text-gray-500">Upload any relevant files for context (e.g., project brief, user stories).</p>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            onFileRemove={handleFileRemove}
            selectedFiles={contextFiles}
            disabled={isProcessing}
          />
          {isProcessing && <p className="text-sm text-gray-500">Processing file, please wait...</p>}
          {documentContent && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-semibold">Document Content:</h4>
              <p className="text-sm text-gray-700 mt-2 italic">{documentContent.substring(0, 200)}...</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </StepCard>
  );
};

export default ProjectContextStep;