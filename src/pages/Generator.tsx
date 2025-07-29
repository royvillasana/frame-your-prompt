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

// Add this helper function to get framework-specific context
const formatEnhancedPrompt = (prompt: any): string => {
  if (typeof prompt === 'string') return prompt;
  if (typeof prompt !== 'object' || prompt === null) return "";

  let markdown = ``;

  if (prompt.project) markdown += `# Prompt for ${prompt.project}\n\n`;
  if (prompt.description) markdown += `## Description\n${prompt.description}\n\n`;
  if (prompt.task) markdown += `## Task\n${prompt.task}\n\n`;

  if (prompt.productType) markdown += `**Product Type:** ${prompt.productType}\n`;
  if (prompt.industry) markdown += `**Industry:** ${prompt.industry}\n`;

  if (prompt.targetAudience) {
    markdown += `**Target Audience:** ${prompt.targetAudience.ageGroup} interested in ${prompt.targetAudience.interests}.\n`;
  }

  markdown += `\n## Context\n`;
  if (prompt.currentUXStage) markdown += `**UX Stage:** ${prompt.currentUXStage}\n`;
  if (prompt.framework) markdown += `**Framework:** ${prompt.framework} (${prompt.frameworkStage} stage)\n`;
  if (prompt.selectedToolMethod) markdown += `**Method:** ${prompt.selectedToolMethod}\n`;

  if (prompt.promptDetails) {
    markdown += `\n## Prompt Details\n`;
    const { objectives, specificRequirements, examples, practicalRecommendations } = prompt.promptDetails;
    if (objectives) markdown += `### Objectives\n${objectives.map((o: string) => `- ${o}`).join('\n')}\n\n`;
    if (specificRequirements) markdown += `### Specific Requirements\n${specificRequirements.map((r: string) => `- ${r}`).join('\n')}\n\n`;
    if (examples) markdown += `### Examples\n${examples.map((e: string) => `- ${e}`).join('\n')}\n\n`;
    if (practicalRecommendations) markdown += `### Practical Recommendations\n${practicalRecommendations.map((r: string) => `- ${r}`).join('\n')}\n\n`;
  }

  return markdown;
};



const getFrameworkContext = (framework: string, stage: string, tool: string) => {
  // This is a placeholder. In a real application, you'd fetch this from a CMS or a config file.
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
      'ideate': {
        tools: ['Brainstorming', 'Mind Mapping', 'Storyboarding', 'Crazy 8s', 'SCAMPER'],
        aiUse: ['Generate creative ideas', 'develop concepts', 'create scenarios', 'visualize solutions']
      },
      'prototype': {
        tools: ['Paper Prototyping', 'Wireframing', 'Interactive Prototypes', 'Mockups'],
        aiUse: ['Generate UI mockups', 'create interactive prototypes', 'design user flows', 'write microcopy']
      },
      'test': {
        tools: ['Usability Testing', 'A/B Testing', 'Heuristic Evaluation', 'Surveys', 'Feedback Analysis'],
        aiUse: ['Analyze usability data', 'summarize user feedback', 'identify pain points', 'generate test reports']
      }
    },
  };

  const frameworkInfo = frameworkMap[framework.toLowerCase()];
  if (!frameworkInfo) return 'Using free methodology approach';

  const stageInfo = frameworkInfo[stage.toLowerCase()];
  if (!stageInfo) return `Working in the ${stage} stage`;

  return `Framework: ${framework}\nStage: ${stage}\nRecommended Tools: ${stageInfo.tools.join(', ')}\nAI Use Cases: ${stageInfo.aiUse.join(', ')}\nSelected Tool: ${tool}`;
};

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
    if (!user || !currentProject || !generatedPrompt) {
      toast({
        title: "Cannot save prompt",
        description: "Please ensure you are logged in, a project is selected, and a prompt has been generated.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTool) {
      toast({
        title: "Cannot save prompt",
        description: "No tool/method selected. Please select a tool before saving.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('generated_prompts')
        .insert({
          user_id: user.id,
          project_id: currentProject.id,
          project_context: JSON.stringify({
            ...(projectContext || {}),
            ...(basicInfo || {}),
            stage: projectStage,
          }),
          selected_framework: selectedFramework,
          framework_stage: frameworkStage,
          selected_tool: selectedTool,
          original_prompt: generatedPrompt,
          ai_response: aiResponse,
        });

      if (error) throw error;

      toast({ 
        title: "Success!", 
        description: "Prompt saved to project successfully."
      });

      navigate(`/projects/${currentProject.id}`);
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
  
    const frameworkContext = getFrameworkContext(selectedFramework, frameworkStage, tool);

    const initialPrompt = `As an expert UX designer, generate a detailed and practical prompt for an AI assistant. The prompt should be based on the following context:\n\n**Project:** ${currentProject.name}\n**Description:** ${currentProject.description}\n**Product Type:** ${basicInfo.productType}\n**Industry:** ${basicInfo.industry}\n**Target Audience:** ${basicInfo.targetAudience}\n\n**Current UX Stage:** ${projectStage}\n**Framework:** ${selectedFramework}\n**Framework Stage:** ${frameworkStage}\n**Selected Tool/Method:** ${tool}\n\n**Framework Context:**\n${frameworkContext}\n\n**Document Content:**\n${projectContext.documentContent || 'No file provided.'}\n\nBased on this, generate a prompt that I can use to ask an AI to perform the following task: ${tool}. The prompt should be structured to elicit a comprehensive and actionable response from the AI, including specific examples and practical recommendations.`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-enhanced-prompt', {
        body: { prompt: initialPrompt },
      });

      if (error) throw new Error(error.message);
      
      const finalPrompt = data.enhancedPrompt;
      const formattedPrompt = formatEnhancedPrompt(finalPrompt);
      setGeneratedPrompt(formattedPrompt);
      return finalPrompt;

    } catch (error) {
      console.error("Error generating enhanced prompt:", error);
      toast({
        title: "Error",
        description: "Failed to generate enhanced prompt. Using a basic prompt as a fallback.",
        variant: "destructive",
      });
      // Fallback to initial prompt if AI enhancement fails
      setGeneratedPrompt(initialPrompt);
      return initialPrompt;
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const generateAIResponse = async () => {
    if (!selectedTool) {
      toast({ title: "Please complete all steps first.", variant: "destructive" });
      return;
    }

    setIsGeneratingAI(true);
    setAiResponse("");

    try {
      const newPrompt = generatedPrompt || await generatePrompt(selectedTool);

      if (!newPrompt) {
        toast({ title: "Failed to generate prompt.", description: "Could not generate a prompt. Please check previous steps.", variant: "destructive" });
        setIsGeneratingAI(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: newPrompt,
          projectContext: { ...(projectContext || {}), ...(basicInfo || {}) },
          selectedFramework,
          frameworkStage,
          selectedTool,
          aiModel: 'gpt-4o-mini'
        }
      });

      if (error) throw new Error(error.message);
      setAiResponse(data.aiResponse);
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
  };

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const state = location.state as { 
      project?: any;
      basicInfo?: ProjectBasicInfo;
      projectContext?: ProjectContext;
      projectStage?: string;
      selectedFramework?: string;
      frameworkStage?: string;
      selectedTool?: string;
      generatedPrompt?: string;
      aiResponse?: string;
    } | null;

    if (state) {
      if (state.project) {
        setCurrentProject(state.project);
        setCurrentStep("basic-info");
      }
      if (state.basicInfo) setBasicInfo(state.basicInfo);
      if (state.projectContext) setProjectContext(state.projectContext);
      if (state.projectStage) setProjectStage(state.projectStage);
      if (state.selectedFramework) setSelectedFramework(state.selectedFramework);
      if (state.frameworkStage) setFrameworkStage(state.frameworkStage);
      if (state.selectedTool) setSelectedTool(state.selectedTool);
      if (state.generatedPrompt) {
        setGeneratedPrompt(state.generatedPrompt);
        setAiResponse(state.aiResponse || "");
        setCurrentStep("result");
      }
    }
  }, [user, navigate, location.state]);

  const handleProjectSelect = async (project: any) => {
    setCurrentProject(project);
    
    // If the project has basic info, set it
    if (project.product_type || project.industry || project.target_audience) {
      setBasicInfo({
        productType: project.product_type || "",
        industry: project.industry || "",
        targetAudience: project.target_audience || ""
      });
    }
    
    // If the project has context, set it
    if (project.project_description || project.document_content) {
      setProjectContext({
        projectDescription: project.project_description || "",
        documentContent: project.document_content || ""
      });
    }
    
    // If the project has a framework selected, pre-select it
    if (project.selected_framework && project.selected_framework !== "None") {
      setSelectedFramework(project.selected_framework);
      // If the project has a framework stage, pre-select it as well
      if (project.framework_stage) {
        setFrameworkStage(project.framework_stage);
      }
      // If we have all context, go to framework step, otherwise to context
      if (project.project_description && project.document_content) {
        setCurrentStep("framework");
      } else {
        setCurrentStep("context");
      }
    } else {
      // If no framework is set, go to basic info
      setCurrentStep("basic-info");
    }
  };

  const handleBasicInfoComplete = async (info: ProjectBasicInfo) => {
    setBasicInfo(info);
    
    // Update the project with the basic info
    if (currentProject) {
      const { error } = await supabase
        .from('projects')
        .update({
          product_type: info.productType,
          industry: info.industry,
          target_audience: info.targetAudience,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentProject.id);
      
      if (error) {
        console.error("Error updating project with basic info:", error);
      }
    }
    
    setCurrentStep("context");
  };

  const handleContextComplete = async (context: ProjectContext) => {
    setProjectContext(context);
    
    // Update the project with the context
    if (currentProject) {
      const { error } = await supabase
        .from('projects')
        .update({
          project_description: context.projectDescription,
          document_content: context.documentContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentProject.id);
      
      if (error) {
        console.error("Error updating project with context:", error);
      }
    }
    
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

  const handleToolComplete = async (tool: string) => {
    setSelectedTool(tool);
    const prompt = await generatePrompt(tool);
    if (prompt) {
      setCurrentStep("result");
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "project":
        return (
          <ProjectSelectionStep 
            onNewProject={handleProjectSelect}
            onExistingProject={handleProjectSelect}
          />
        );
      case "basic-info":
        return <ProjectBasicInfoStep onNext={handleBasicInfoComplete} initialInfo={basicInfo} />;
      case "context":
        return basicInfo ? (
          <ProjectContextStep
            onNext={handleContextComplete}
            initialContext={projectContext}
            basicInfo={currentProject}
            onBack={() => setCurrentStep("basic-info")}
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
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Prompt Generated!</CardTitle>
                  <CardDescription>
                    Your personalized prompt is ready. You can now generate the AI response.
                  </CardDescription>
                </div>
                <Button onClick={resetGenerator} variant="ghost" size="sm">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <Textarea 
                  value={generatedPrompt}
                  onChange={(e) => setGeneratedPrompt(e.target.value)}
                  className="min-h-[150px] bg-transparent border-0 p-0 resize-none focus:ring-0"
                  placeholder="Your generated prompt will appear here..."
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button onClick={copyToClipboard} variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button onClick={savePromptToProject} variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save to Project
                </Button>
                <Button onClick={() => navigate('/library')} variant="outline" size="sm">
                  <Library className="mr-2 h-4 w-4" />
                  View Library
                </Button>
              </div>

              <div className="pt-4">
                <Button onClick={generateAIResponse} disabled={isGeneratingAI} className="w-full">
                  {isGeneratingAI ? "Generating..." : <><Sparkles className="mr-2 h-4 w-4" />Generate AI Response</>}
                </Button>
              </div>

              {aiResponse && (
                <div className="pt-4 space-y-2">
                  <h3 className="text-lg font-semibold">AI Response</h3>
                  <div className="bg-background/50 p-4 rounded-md max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:bg-muted prose-blockquote:border-primary prose-li:text-foreground">
                      <ReactMarkdown>{aiResponse}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {basicInfo?.industry && <Badge variant="secondary">{basicInfo.industry}</Badge>}
                  {basicInfo?.productType && <Badge variant="outline">{basicInfo.productType}</Badge>}
                  {projectStage && <Badge variant="outline">{projectStage}</Badge>}
                  {selectedFramework && selectedFramework !== "none" && (
                    <>
                      <Badge variant="secondary">{selectedFramework}</Badge>
                      <Badge variant="outline">{frameworkStage}</Badge>
                    </>
                  )}
                  {selectedTool && <Badge variant="outline">{selectedTool}</Badge>}
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
        industry={basicInfo?.industry || ""}
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