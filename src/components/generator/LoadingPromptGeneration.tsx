import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Brain, Wand2, CheckCircle } from "lucide-react";

interface LoadingPromptGenerationProps {
  isLoading: boolean;
  framework: string;
  tool: string;
  industry: string;
}

interface LoadingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
}

export const LoadingPromptGeneration = ({ 
  isLoading, 
  framework, 
  tool, 
  industry 
}: LoadingPromptGenerationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const loadingSteps: LoadingStep[] = [
    {
      id: "analyzing",
      title: "Analyzing context",
      description: `Processing specific characteristics of ${industry} and ${tool}`,
      icon: <Brain className="h-4 w-4" />,
      duration: 2000
    },
    {
      id: "framework",
      title: "Adapting to framework",
      description: `Applying ${framework} best practices`,
      icon: <Wand2 className="h-4 w-4" />,
      duration: 2500
    },
    {
      id: "generating",
      title: "Generating AI prompt",
      description: "Creating a personalized and specific prompt for your project",
      icon: <Sparkles className="h-4 w-4" />,
      duration: 3000
    },
    {
      id: "complete",
      title: "Ready!",
      description: "Your personalized prompt is prepared",
      icon: <CheckCircle className="h-4 w-4" />,
      duration: 500
    }
  ];

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    let stepIndex = 0;
    let progressValue = 0;
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    
    const stepInterval = setInterval(() => {
      if (stepIndex < loadingSteps.length - 1) {
        setCurrentStep(stepIndex);
        
        // Progress animation for current step
        const stepDuration = loadingSteps[stepIndex].duration;
        const stepProgress = stepDuration / 50; // 50ms intervals
        let currentStepProgress = 0;
        
        const progressInterval = setInterval(() => {
          currentStepProgress += 1;
          const stepPercentage = (currentStepProgress / (stepDuration / 50)) * 100;
          const overallPercentage = (stepIndex * 25) + (stepPercentage * 0.25);
          setProgress(Math.min(overallPercentage, 100));
          
          if (currentStepProgress >= stepDuration / 50) {
            clearInterval(progressInterval);
            stepIndex++;
            if (stepIndex >= loadingSteps.length - 1) {
              setCurrentStep(loadingSteps.length - 1);
              setProgress(100);
              clearInterval(stepInterval);
            }
          }
        }, 50);
      }
    }, 0);

    return () => {
      clearInterval(stepInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  const currentStepData = loadingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit animate-pulse">
            <div className="animate-spin">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Generating your personalized prompt</CardTitle>
          <CardDescription>
            This will only take a few seconds...
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Current Step */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg animate-fade-in">
              <div className="p-2 bg-primary/10 rounded-full animate-pulse">
                {currentStepData.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-sm">{currentStepData.title}</h3>
                <p className="text-xs text-muted-foreground">{currentStepData.description}</p>
              </div>
            </div>

            {/* Context Info */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary" className="text-xs">
                {framework}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {tool}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {industry}
              </Badge>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-2">
            {loadingSteps.slice(0, -1).map((step, index) => (
              <div 
                key={step.id} 
                className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${
                  index <= currentStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  index < currentStep 
                    ? 'bg-green-500' 
                    : index === currentStep 
                      ? 'bg-primary animate-pulse' 
                      : 'bg-muted'
                }`} />
                <span className={index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}>
                  {step.title}
                </span>
                {index < currentStep && (
                  <CheckCircle className="h-3 w-3 text-green-500 ml-auto" />
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-lg">
            💡 <strong>Tip:</strong> Your prompt will be specific to {industry} and optimized for {tool}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};