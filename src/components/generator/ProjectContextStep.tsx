import { useState, useEffect } from "react";
import { StepCard } from "./StepCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import { ArrowRight, Sparkles } from "lucide-react";

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
}

export const ProjectContextStep = ({ onNext, onBack, initialContext, basicInfo }: ProjectContextStepProps) => {
  const [projectDescription, setProjectDescription] = useState("");
  const [contextFiles, setContextFiles] = useState<File[]>([]);

  useEffect(() => {
    if (initialContext) {
      setProjectDescription(initialContext.projectDescription || "");
    }
  }, [initialContext]);

  const handleNext = () => {
    onNext({
      projectDescription: projectDescription,
      contextFiles: contextFiles.length > 0 ? contextFiles : undefined,
    });
  };

  const handleFilesSelected = (files: File[]) => {
    setContextFiles([...contextFiles, ...files]);
  };

  const handleFileRemove = (fileToRemove: File) => {
    setContextFiles(contextFiles.filter(file => file !== fileToRemove));
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
          />
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