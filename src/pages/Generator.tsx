import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, RefreshCw, Save, Download, Sparkles, RotateCcw, Library } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ProjectContextStep, ProjectContext } from "@/components/generator/ProjectContextStep";
import { ProjectStageStep } from "@/components/generator/ProjectStageStep";
import { FrameworkStep } from "@/components/generator/FrameworkStep";
import { ToolSelectionStep } from "@/components/generator/ToolSelectionStep";
import { ProjectSelectionStep } from "@/components/generator/ProjectSelectionStep";
import { UsageLimitCard } from "@/components/generator/UsageLimitCard";
import { LoadingPromptGeneration } from "@/components/generator/LoadingPromptGeneration";
import ReactMarkdown from "react-markdown";
import { ProjectBasicInfoStep, ProjectBasicInfo } from "@/components/generator/ProjectBasicInfoStep";

type Step = "project" | "basic-info" | "context" | "stage" | "framework" | "tool" | "result";

import { supabase } from "@/integrations/supabase/client";

const Generator = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState<Step>("project");
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [projectStage, setProjectStage] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [frameworkStage, setFrameworkStage] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [basicInfo, setBasicInfo] = useState<ProjectBasicInfo | null>(null);

  const copyToClipboard = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const generateAIResponse = async () => {
    if (!generatedPrompt) {
      toast({ title: "Please generate a prompt first.", variant: "destructive" });
      return;
    }
    setIsGeneratingAI(true);
    setAiResponse("");
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: generatedPrompt,
          projectContext,
          selectedFramework,
          frameworkStage,
          selectedTool,
          aiModel: 'gpt-4o-mini'
        }
      });

      if (error) throw new Error(error.message);
      setAiResponse(data?.aiResponse || "Failed to generate AI response.");
    } catch (error) {
      console.error("Error generating AI response:", error);
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingAI(false);
    }
  }; // Remove the extra closing brace here

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
    setBasicInfo(null);
  };

  const savePromptToProject = async () => {
    if (!currentProject || !generatedPrompt) {
      toast({
        title: "No project selected or prompt generated.",
        description: "Please select a project and generate a prompt first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create a structured project context that includes all relevant information
      const fullProjectContext = {
        project: {
          name: currentProject.name,
          description: currentProject.description
        },
        basicInfo,
        details: projectContext,
        stage: projectStage
      };

      const { data, error } = await supabase
        .from('generated_prompts')
        .insert([
          {
            user_id: user.id,
            project_id: currentProject.id, // Add this line
            project_context: fullProjectContext,
            selected_framework: selectedFramework,
            framework_stage: frameworkStage,
            selected_tool: selectedTool,
            original_prompt: generatedPrompt,
            ai_response: aiResponse
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({ 
        title: "Success!", 
        description: "Prompt saved to project successfully."
      });

      navigate(`/projects/${currentProject.id}`, {
        state: { 
          savedPrompt: generatedPrompt,
          projectContext: fullProjectContext,
          selectedFramework,
          frameworkStage,
          selectedTool,
          aiResponse
        }
      });
    } catch (error) {
      console.error("Error saving prompt:", error);
      toast({
        title: "Error",
        description: "Failed to save prompt to project. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generatePrompt = async (tool: string) => {
    if (!projectContext || !projectStage || !selectedFramework || !frameworkStage || !currentProject || !basicInfo) {
      toast({
        title: "Missing Information",
        description: "Please complete all previous steps before generating a prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPrompt(true);
    setGeneratedPrompt("");
    setAiResponse("");
  
    try {
      const frameworkContext = getFrameworkContext(selectedFramework, frameworkStage, tool);
      const fullProjectContext = {
        project: {
          name: currentProject.name,
          description: currentProject.description
        },
        basicInfo,
        details: projectContext,
        stage: projectStage
      };

      const initialPrompt = `As a UX expert, I need to perform the following task: ${tool}.

    Project Information:
    - Project Name: ${currentProject.name}
    - Project Description: ${currentProject.description}
    - Target Users: ${basicInfo.targetUsers}
    - Project Goals: ${basicInfo.goals}
    - Success Metrics: ${basicInfo.successMetrics}

    Project Context:
    - Industry: ${projectContext.industry}
    - Product Type: ${projectContext.productType}
    - Company Size: ${projectContext.companySize}
    - Project Stage: ${projectStage} 
  
    Framework Context:
    ${frameworkContext}
  
    Project Description:
    ${projectContext.projectDescription || 'No additional description provided.'}
  
    Please generate a detailed prompt for an AI assistant to help me with this task. The prompt should be clear, concise, and provide enough context for the AI to generate a useful response.
    
    IMPORTANT INSTRUCTIONS:
    1. Always respond in English
    2. Structure your response clearly and organized
    3. Provide specific examples when relevant
    4. Ensure all recommendations are practical and applicable
    5. Maintain a professional but accessible tone
    6. If the prompt includes numbered sections, respond following that exact structure
    7. Do not include any commentary, explanations, or formatting. Just return the prompt only
    8. Do not explain what the prompt does—just return the full prompt ready to copy and paste
    9. Do not use markdown, bullets, or titles. Just raw prompt content
    10. our only job is to generate a prompt to be used in another AI. Return only the raw prompt text. No commentary, no explanation, no headers, no markdown formatting. The output should be a single block of plain text that I can copy and paste directly
    `;
  
    // Call the Supabase Edge Function to enhance the prompt using OpenAI
    const { data, error } = await supabase.functions.invoke('generate-ai-response', {
      body: {
        prompt: initialPrompt,
        projectContext: fullProjectContext,
        selectedFramework,
        frameworkStage,
        selectedTool: tool,
        aiModel: 'gpt-4o-mini' // Using OpenAI model for better prompt enhancement
      }
    });
  
    if (error) {
      throw new Error(error.message);
    }
  
    // Access the aiResponse from the Edge Function response
    setGeneratedPrompt(data?.aiResponse || initialPrompt);
  } catch (error) {
    console.error("Error generating prompt:", error);
    toast({
      title: "Error",
      description: "Failed to generate enhanced prompt. Please try again.",
      variant: "destructive",
    });
    // Fallback to initial prompt if AI enhancement fails
    setGeneratedPrompt(initialPrompt);
  } finally {
    setIsGeneratingPrompt(false);
  }
};

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

  const handleBasicInfoComplete = (info: ProjectBasicInfo) => {
    setBasicInfo(info);
    setCurrentStep("context");
  };

  const handleContextComplete = (context: ProjectContext) => {
    setProjectContext(context);
    setCurrentStep("stage");
  };

  const handleStageComplete = (stage: string) => {
    setProjectStage(stage);
    setCurrentStep("framework");
  };

  const handleFrameworkComplete = (framework: string, stage: string) => {
    setSelectedFramework(framework);
    setFrameworkStage(stage);
    setCurrentStep("tool");
  };

  const handleToolComplete = (tool: string) => {
    setSelectedTool(tool);
    generatePrompt(tool);
    setCurrentStep("result");
  };

  const handleProjectSelect = (project: any) => {
    setCurrentProject(project);
    setCurrentStep("basic-info");
  };

  const handleNewProject = (project: any) => {
    setCurrentProject(project);
    setCurrentStep("basic-info");
  };

  const handleExistingProject = (project: any) => {
    setCurrentProject(project);
    setCurrentStep("basic-info");
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
      case "basic-info":
        return <ProjectBasicInfoStep onNext={handleBasicInfoComplete} initialInfo={projectContext} />;
      case "context":
        return basicInfo ? (
          <ProjectContextStep
            onNext={handleContextComplete}
            initialContext={projectContext}
            basicInfo={basicInfo}
          />
        ) : null;
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
            initialFramework={selectedFramework}
            initialFrameworkStage={frameworkStage}
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
          />
        );
      case "result":
        return (
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle>Prompt Generated!</CardTitle>
              <CardDescription>
                Your personalized prompt is ready
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
                    <div className="ml-auto flex gap-2">
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse);
                          toast({
                            title: "Copied!",
                            description: "AI response copied to clipboard.",
                          });
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Response
                      </Button>
                      <Button 
                        onClick={() => navigate('/chat', { 
                          state: { 
                            initialPrompt: generatedPrompt, 
                            initialResponse: aiResponse,
                            projectContext 
                          } 
                        })}
                        size="sm"
                      >
                        Continue in Chat
                      </Button>
                    </div>
                  </div>
                  <div className="bg-background/50 p-4 rounded-md max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-primary prose-li:text-foreground">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
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


// Add this helper function to get framework-specific context
const getFrameworkContext = (framework: string, stage: string, tool: string) => {
  // Map the framework and stage to the corresponding section in the UX framework document
  const frameworkMap: { [key: string]: { [key: string]: { tools: string[], aiUse: string[] } } } = {
    'design-thinking': {
      'empathize': {
        tools: ['Interviews', 'Contextual Inquiry', 'Diary Studies', 'Empathy Maps', 'Field Studies', 'Stakeholder Maps'],
        aiUse: ['Transcribe interviews (NLP)', 'cluster qualitative data', 'synthesize empathy maps', 'sentiment analysis']
      },
      'define': {
        tools: ['Affinity Diagrams', 'Point-of-View Statements', 'Problem Statements', 'Journey Maps', 'How Might We questions'],
        aiUse: ['Generate POVs', 'synthesize user needs', 'identify patterns', 'write user personas']
      },
      // Add other stages similarly
    },
    // Add other frameworks similarly
  };

  const frameworkInfo = frameworkMap[framework];
  if (!frameworkInfo) return 'Using free methodology approach';

  const stageInfo = frameworkInfo[stage.toLowerCase()];
  if (!stageInfo) return `Working in the ${stage} stage`;

  return `Framework: ${framework}
Stage: ${stage}
Recommended Tools: ${stageInfo.tools.join(', ')}
AI Use Cases: ${stageInfo.aiUse.join(', ')}
Selected Tool: ${tool}`;
};