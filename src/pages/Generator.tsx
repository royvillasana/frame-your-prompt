import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Save, Download, Sparkles, RotateCcw, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProjectContextStep, ProjectContext } from "@/components/generator/ProjectContextStep";
import { ProjectStageStep } from "@/components/generator/ProjectStageStep";
import { FrameworkStep } from "@/components/generator/FrameworkStep";
import { ToolSelectionStep } from "@/components/generator/ToolSelectionStep";
import { ProjectSelectionStep } from "@/components/generator/ProjectSelectionStep";
import { UsageLimitCard } from "@/components/generator/UsageLimitCard";
import { LoadingPromptGeneration } from "@/components/generator/LoadingPromptGeneration";

import { useAIUsage } from "@/hooks/useAIUsage";

type Step = "project" | "context" | "stage" | "framework" | "tool" | "result";

const Generator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { refreshUsage } = useAIUsage();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("project");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [projectStage, setProjectStage] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [frameworkStage, setFrameworkStage] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [aiRecommendations, setAiRecommendations] = useState<{
    recommendedFramework?: string;
    recommendedTool?: string;
    reasoning?: string;
  }>({});
  const [selectedAIModel] = useState("gpt-4o-mini");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    // Check if coming from chat with result data
    const state = location.state as {
      showResult?: boolean;
      generatedPrompt?: string;
      aiResponse?: string;
      projectContext?: ProjectContext;
      iterateFrom?: any;
      selectedFramework?: string;
      frameworkStage?: string;
      selectedTool?: string;
    };

    if (state?.showResult && state?.generatedPrompt && state?.projectContext) {
      setCurrentStep("result");
      setGeneratedPrompt(state.generatedPrompt);
      setProjectContext(state.projectContext);
      if (state.aiResponse) {
        setAiResponse(state.aiResponse);
      }
    } else if (state?.iterateFrom) {
      // Handle iteration from existing prompt
      setProjectContext(state.projectContext);
      setSelectedFramework(state.selectedFramework || "");
      setFrameworkStage(state.frameworkStage || "");
      setSelectedTool(state.selectedTool || "");
      setGeneratedPrompt(state.iterateFrom.original_prompt || "");
      if (state.iterateFrom.ai_response) {
        setAiResponse(state.iterateFrom.ai_response);
      }
      setCurrentStep("result");
    }
  }, [user, navigate, location.state]);

  const handleContextComplete = (context: ProjectContext) => {
    setProjectContext(context);
    setCurrentStep("stage");
  };

  const handleStageComplete = async (stage: string) => {
    setProjectStage(stage);
    
    // Get AI recommendations when we have the project stage
    if (currentProject && projectContext) {
      await getAIRecommendations(
        currentProject.name, 
        currentProject.description || "", 
        stage
      );
    }
    
    setCurrentStep("framework");
  };

  const handleFrameworkComplete = (framework: string, stage: string) => {
    setSelectedFramework(framework);
    setFrameworkStage(stage);
    setCurrentStep("tool");
  };

  const handleToolComplete = async (tool: string) => {
    setSelectedTool(tool);
    await generatePrompt(tool);
    setCurrentStep("result");
  };

  const generateAIResponse = async () => {
    if (!generatedPrompt) return;
    
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: generatedPrompt,
          projectContext,
          selectedFramework,
          frameworkStage,
          selectedTool,
          aiModel: selectedAIModel,
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message || 'Supabase function error');
      }

      if (data?.error) {
        console.error('AI API error:', data.error);
        throw new Error(data.error);
      }
      
      setAiResponse(data.aiResponse);
      refreshUsage(); // Refresh usage data after successful AI response
      sonnerToast.success("AI response generated!");
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMessage = error.message || "Error generating AI response";
      
      // Check for specific AI service errors and provide helpful messages
      if (errorMessage.includes("Could not generate AI response")) {
        sonnerToast.error("⚠️ AI services temporarily unavailable", {
          description: "Free AI services are busy. Try with a premium model (requires API key) or try again later.",
          action: {
            label: "Configure API Key",
            onClick: () => navigate('/profile')
          }
        });
      } else if (errorMessage.includes("exceeded your current quota")) {
        sonnerToast.error("Your OpenAI API key has exceeded the quota. Check your plan and billing in OpenAI.");
      } else if (errorMessage.includes("API key not configured")) {
        sonnerToast.error("You must configure an API key in your profile to use this function.", {
          action: {
            label: "Go to Profile",
            onClick: () => navigate('/profile')
          }
        });
      } else if (errorMessage.includes("daily limit")) {
        sonnerToast.error("You have reached the daily limit for this AI model. Try another model or come back tomorrow.");
      } else {
        sonnerToast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const generatePrompt = async (tool: string) => {
    if (!projectContext) return;

    // Start loading state
    setIsGeneratingPrompt(true);
    setGeneratedPrompt("");

    // Determine framework and stage text
    let frameworkText = "";
    let stageText = "";
    
    if (selectedFramework !== "none" && frameworkStage) {
      frameworkText = selectedFramework;
      stageText = frameworkStage;
    } else {
      frameworkText = "free methodology";
      stageText = projectStage;
    }

    // Create a meta-prompt to generate the actual UX prompt
    const metaPrompt = `Act as an expert UX Designer and AI prompt specialist. Your task is to generate a detailed and specific prompt to help a UX Designer who is working in the "${stageText}" stage of the ${frameworkText} framework, specifically with ${tool}.

Project context:
- Industry: ${projectContext.industry}
- Company type: ${projectContext.companySize}
- Product: ${projectContext.productType}
- Scope: ${projectContext.productScope}
- Target audience: ${projectContext.userProfile}

CRITICAL INSTRUCTIONS:
1. Generate a COMPLETE and SPECIFIC prompt that the UX Designer can use directly with an AI
2. The prompt must be specifically adapted to the ${projectContext.industry} industry and ${projectContext.productType} product type
3. Must include specific questions, applicable methodologies and concrete deliverables for the ${stageText} stage
4. The prompt must be practical and oriented to tangible results
5. Include specific aspects of ${tool} relevant to ${frameworkText}
6. Adapt the language and approach according to company size: ${projectContext.companySize}

Generate ONLY the final prompt that the UX Designer will use, without additional explanations or introductions. The prompt should begin directly with clear instructions for the AI that will receive it.`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: metaPrompt,
          projectContext,
          selectedFramework,
          frameworkStage,
          selectedTool: tool,
          aiModel: "gpt-4o-mini", // Use OpenAI for prompt generation
        }
      });

      if (error) {
        console.error('Error generating prompt:', error);
        throw new Error(error.message || 'Error generating prompt');
      }

      if (data?.error) {
        throw new Error(data.error);
      }
      
      setGeneratedPrompt(data.aiResponse);
      
      toast({
        title: "AI Prompt Generated!",
        description: "Your personalized prompt has been created specifically for your project.",
      });
    } catch (error: any) {
      console.error('Error generating prompt:', error);
      
      // Fallback to basic prompt structure if AI generation fails
      const fallbackPrompt = `As a UX Designer working in the "${stageText}" stage of the ${frameworkText} framework, I need help with ${tool}.

Project context:
- Industry: ${projectContext.industry}
- Company type: ${projectContext.companySize}
- Product: ${projectContext.productType}
- Scope: ${projectContext.productScope}
- Target audience: ${projectContext.userProfile}

Using AI capabilities, help me to:

1. Generate 5 specific questions to guide my ${tool} process in this context
2. Suggest 3 innovative approaches that leverage the unique characteristics of my industry
3. Identify 4 key metrics I should consider to evaluate success
4. Recommend 2 complementary tools that enhance this process
5. Provide a checklist of 6 critical points to validate before moving to the next stage

Make sure all recommendations are aligned with ${frameworkText} best practices and are applicable to ${projectContext.companySize} in ${projectContext.industry} developing ${projectContext.productType} with ${projectContext.productScope} scope.`;

      setGeneratedPrompt(fallbackPrompt);
      
      toast({
        title: "Prompt Generated (Basic Mode)",
        description: "A basic prompt was generated. AI is temporarily unavailable.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard.",
    });
  };

  const getAIRecommendations = async (name: string, description: string, stage: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-recommendations', {
        body: {
          projectName: name,
          projectDescription: description,
          projectStage: stage
        }
      });

      if (error) throw error;
      
      setAiRecommendations(data);
    } catch (error: any) {
      console.error('Error getting AI recommendations:', error);
      // Set fallback recommendations
      setAiRecommendations({
        recommendedFramework: "design-thinking",
        recommendedTool: "User Interviews",
        reasoning: "Fallback recommendation"
      });
    }
  };

  const handleNewProject = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          name,
          description,
          selected_framework: "To be defined"
        })
        .select()
        .single();

      if (error) throw error;
      
      setCurrentProject(data);
      setCurrentStep("context");
      sonnerToast.success("Project created successfully");
    } catch (error: any) {
      sonnerToast.error("Error creating project");
      console.error(error);
    }
  };

  const handleExistingProject = (project: any) => {
    setCurrentProject(project);
    // If project has context from previous prompts, we can pre-fill some data
    setSelectedFramework(project.selected_framework);
    setCurrentStep("context");
  };

  const savePromptToProject = async () => {
    if (!currentProject || !generatedPrompt) return;

    try {
      const { error } = await supabase
        .from('generated_prompts')
        .insert({
          user_id: user?.id,
          project_id: currentProject.id,
          project_context: projectContext as any,
          selected_framework: selectedFramework,
          framework_stage: frameworkStage,
          selected_tool: selectedTool,
          original_prompt: generatedPrompt,
          ai_response: aiResponse
        });

      if (error) throw error;

      // Update project framework if it changed
      if (selectedFramework !== currentProject.selected_framework) {
        await supabase
          .from('projects')
          .update({ selected_framework: selectedFramework })
          .eq('id', currentProject.id);
      }

      sonnerToast.success("Prompt saved to project");
    } catch (error: any) {
      sonnerToast.error("Error saving prompt");
      console.error(error);
    }
  };

  const resetGenerator = () => {
    setCurrentStep("project");
    setCurrentProject(null);
    setProjectContext(null);
    setProjectStage("");
    setSelectedFramework("");
    setFrameworkStage("");
    setSelectedTool("");
    setGeneratedPrompt("");
    setAiResponse("");
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "project":
        return (
          <ProjectSelectionStep 
            onNewProject={handleNewProject}
            onExistingProject={handleExistingProject}
          />
        );
      case "context":
        return <ProjectContextStep onNext={handleContextComplete} />;
      case "stage":
        return (
          <ProjectStageStep 
            context={projectContext!} 
            onNext={handleStageComplete}
            onBack={() => setCurrentStep("context")}
          />
        );
      case "framework":
        return (
          <FrameworkStep 
            context={projectContext!}
            projectStage={projectStage}
            onNext={handleFrameworkComplete}
            onBack={() => setCurrentStep("stage")}
            aiRecommendations={aiRecommendations}
          />
        );
      case "tool":
        return (
          <ToolSelectionStep 
            context={projectContext!}
            projectStage={projectStage}
            framework={selectedFramework}
            frameworkStage={frameworkStage}
            onGenerate={handleToolComplete}
            onBack={() => setCurrentStep("framework")}
            aiRecommendations={aiRecommendations}
          />
        );
      case "result":
        return (
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle>Prompt Generated!</CardTitle>
              <CardDescription>
                Your personalized prompt is ready to use with ChatGPT, Claude or other AI tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Textarea 
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="min-h-[200px] bg-transparent border-0 p-0 resize-none"
                  placeholder="Your generated prompt will appear here..."
                />
              </div>
              
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button 
                  onClick={generateAIResponse} 
                  disabled={isGeneratingAI}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGeneratingAI ? "Generating..." : "Use Prompt"}
                </Button>
                <Button onClick={() => generatePrompt(selectedTool)} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button onClick={savePromptToProject} variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button onClick={resetGenerator} variant="outline" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Prompt
                </Button>
                <Button 
                  onClick={() => navigate('/prompt-library')} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Library className="h-4 w-4" />
                  View Library
                </Button>
              </div>

              {aiResponse && (
                <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-lg">AI Response</h3>
                    <Button 
                      onClick={() => navigate('/chat', { 
                        state: { 
                          initialPrompt: generatedPrompt, 
                          initialResponse: aiResponse,
                          projectContext 
                        } 
                      })}
                      size="sm"
                      className="ml-auto"
                    >
                      Continue in Chat
                    </Button>
                  </div>
                  <div className="bg-background/50 p-4 rounded-md max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm">{aiResponse}</div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{projectContext?.industry}</Badge>
                  <Badge variant="outline">{projectContext?.productType}</Badge>
                  <Badge variant="outline">{projectStage}</Badge>
                  {selectedFramework !== "none" && (
                    <>
                      <Badge variant="secondary">{selectedFramework}</Badge>
                      <Badge variant="outline">{frameworkStage}</Badge>
                    </>
                  )}
                  <Badge variant="outline">{selectedTool}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      {/* Loading Overlay */}
      <LoadingPromptGeneration 
        isLoading={isGeneratingPrompt}
        framework={selectedFramework}
        tool={selectedTool}
        industry={projectContext?.industry || ""}
      />
      
      <div className="container px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Prompt Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate personalized AI prompts for UX following a step-by-step process
          </p>
        </div>

        <div className="mb-8">
          <UsageLimitCard />
        </div>

        {renderCurrentStep()}
      </div>
    </div>
  );
};

export default Generator;