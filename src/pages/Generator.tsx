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

type Step = "project" | "basic-info" | "stage" | "framework" | "tool" | "context" | "result";

import { supabase } from "@/integrations/supabase/client";
import { post, put } from "@/utils/api";

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

  // Check for skipToProjectCreate in location state
  useEffect(() => {
    if (location.state?.skipToProjectCreate) {
      setCurrentStep("project");
      // Clear the state to prevent re-triggering on re-renders
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [projectStage, setProjectStage] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("");
  const [frameworkStage, setFrameworkStage] = useState("");
  const [lastUsedFramework, setLastUsedFramework] = useState<{framework: string, stage: string} | null>(null);
  const [selectedTool, setSelectedTool] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [basicInfo, setBasicInfo] = useState<ProjectBasicInfo | null>(null);
  const [selectedAITool, setSelectedAITool] = useState<string>('chatgpt'); // Default to ChatGPT

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
    setSelectedAITool('chatgpt'); // Reset to default on reset
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
        .insert([{
          user_id: user.id,
          project_id: currentProject.id,
          project_context: {
            ...(projectContext || {}),
            ...(basicInfo || {}),
            stage: projectStage,
          },
          selected_framework: selectedFramework,
          framework_stage: frameworkStage,
          selected_tool: selectedTool,
          original_prompt: generatedPrompt,
          ai_response: aiResponse,
        }]);

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
    return generatePromptWithContext(tool, {
      projectContext,
      projectStage,
      selectedFramework,
      frameworkStage,
      currentProject,
      basicInfo
    });
  };

  // AI Tool specific instructions mapping
  const getAIToolInstructions = (aiToolId?: string) => {
    if (!aiToolId) return '';
    
    const instructions: Record<string, {description: string; bestPractices: string[]}> = {
      'chatgpt': {
        description: 'ChatGPT is a versatile AI language model that excels at generating text-based responses, analyzing information, and providing detailed explanations.',
        bestPractices: [
          'Use clear, step-by-step instructions',
          'Provide context before asking questions',
          'Use markdown for formatting (headings, lists, code blocks)',
          'Be specific about the desired output format',
          'Include examples when possible'
        ]
      },
      'miro': {
        description: 'Miro is a visual collaboration platform that works well for brainstorming, diagramming, and organizing information spatially.',
        bestPractices: [
          'Define clear sections for different board areas',
          'Specify visual elements (sticky notes, shapes, connectors)',
          'Include color-coding suggestions',
          'Consider board layout and organization',
          'Mention any templates or frameworks to use'
        ]
      },
      'figma': {
        description: 'Figma is a collaborative interface design tool with powerful features for creating UI/UX designs and prototypes.',
        bestPractices: [
          'Specify frames, components, and constraints',
          'Mention any design systems or UI kits to use',
          'Include responsive design requirements',
          'Specify interactive elements and states',
          'Note any Figma plugins that should be utilized'
        ]
      },
      'uxpilot': {
        description: 'UX Pilot is a user research platform that helps with testing and gathering user feedback.',
        bestPractices: [
          'Define clear research objectives',
          'Specify participant criteria',
          'Outline test scenarios and tasks',
          'Include data collection methods',
          'Note any specific metrics to track'
        ]
      },
      'mural': {
        description: 'Mural is a digital workspace for visual collaboration, ideal for workshops and team activities.',
        bestPractices: [
          'Structure activities with clear timing',
          'Specify templates or frameworks to use',
          'Include instructions for voting and timer features',
          'Define participant roles and permissions',
          'Consider different collaboration modes (diverging/converging)'
        ]
      },
      'notion': {
        description: 'Notion is an all-in-one workspace for notes, tasks, wikis, and databases.',
        bestPractices: [
          'Define database properties and relations',
          'Specify views (table, board, calendar, etc.)',
          'Include template structures',
          'Note any automations or formulas',
          'Consider permission levels for different users'
        ]
      }
    };
    
    const toolInfo = instructions[aiToolId] || {
      description: 'A versatile tool for various tasks',
      bestPractices: [
        'Be clear about the desired outcome',
        'Provide sufficient context',
        'Specify any constraints or requirements',
        'Include examples if helpful',
        'Consider the tool\'s strengths and limitations'
      ]
    };
    
    return `## AI Tool Information
**Tool:** ${aiToolId.charAt(0).toUpperCase() + aiToolId.slice(1)}
**Description:** ${toolInfo.description}

### Best Practices for This Tool:
${toolInfo.bestPractices.map((item, i) => `- ${item}`).join('\n')}`;
  };

  const generatePromptWithContext = async (tool: string, context: {
    projectContext: ProjectContext | null;
    projectStage: string | null;
    selectedFramework: string | null;
    frameworkStage: string | null;
    currentProject: any | null;
    basicInfo: any | null;
    selectedAITool?: string;
  }) => {
    const { projectContext, projectStage, selectedFramework, frameworkStage, currentProject, basicInfo, selectedAITool } = context;
    
    const missingFields = [];
    if (!projectContext) missingFields.push("project context");
    if (!projectStage) missingFields.push("project stage");
    if (!selectedFramework) missingFields.push("framework");
    if (!frameworkStage) missingFields.push("framework stage");
    if (!currentProject) missingFields.push("project");
    if (!basicInfo) missingFields.push("basic info");
    
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields);
      toast({
        title: "Missing Information",
        description: `Please complete these steps: ${missingFields.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingPrompt(true);
    setGeneratedPrompt("");
    setAiResponse("");
  
    const frameworkContext = getFrameworkContext(selectedFramework, frameworkStage, tool);
    const aiToolInstructions = getAIToolInstructions(selectedAITool);
    
    // Add AI tool context if available
    const aiToolContext = selectedAITool ? `\n\n## 🛠️ AI Tool Configuration\n${aiToolInstructions}` : '';

    const initialPrompt = `# AI Prompt Generation Request

## 📋 Project Overview
**Project:** ${currentProject.name}\n**Description:** ${currentProject.description || 'No description provided.'}\n**Product Type:** ${basicInfo.productType || 'Not specified'}\n**Industry:** ${basicInfo.industry || 'Not specified'}\n**Target Audience:** ${basicInfo.targetAudience || 'Not specified'}

## 🎯 UX Context
**Current UX Stage:** ${projectStage}\n**Framework:** ${selectedFramework} (${frameworkStage} stage)\n**Selected Tool/Method:** ${tool}

## 📚 Framework Context
${frameworkContext}

## 📄 Document Content
${projectContext.documentContent || 'No additional context provided.'}${aiToolContext}

## ✨ Prompt Generation Instructions
Generate a detailed and effective prompt for the specified AI tool to help with the following task: **${tool}**.

The generated prompt should:
1. Be optimized for the selected AI tool's capabilities and limitations
2. Include clear, step-by-step instructions
3. Provide necessary context and background information
4. Specify any requirements or constraints
5. Define the desired output format and structure
6. Include relevant examples or templates if helpful
7. Follow best practices for the specific AI tool

Make the prompt concise yet comprehensive enough to get high-quality results. The prompt should be immediately usable with the selected AI tool.`;

    try {
      const { data, error } = await supabase.functions.invoke('generate-enhanced-prompt', {
        body: {
          prompt: initialPrompt,
          aiTool: selectedAITool || 'chatgpt',
          tool: tool,
          framework: selectedFramework,
          frameworkStage: frameworkStage
        }
      });

      if (error) throw error;
      
      const finalPrompt = data.enhancedPrompt || initialPrompt;
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
      // Ensure we have a selected AI tool (default to chatgpt if not set)
      const aiToolToUse = selectedAITool || 'chatgpt';
      
      // Pass the selected AI tool to generate the prompt
      const newPrompt = generatedPrompt || await generatePromptWithContext(selectedTool, {
        projectContext,
        projectStage,
        selectedFramework,
        frameworkStage,
        currentProject,
        basicInfo,
        selectedAITool: aiToolToUse
      });

      if (!newPrompt) {
        toast({ 
          title: "Failed to generate prompt.", 
          description: "Could not generate a prompt. Please check previous steps.", 
          variant: "destructive" 
        });
        setIsGeneratingAI(false);
        return;
      }

      // Use Supabase function to generate AI response
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: newPrompt,
          projectContext: { 
            ...(projectContext || {}), 
            ...(basicInfo || {}),
            selectedAITool: aiToolToUse
          },
          selectedFramework,
          frameworkStage,
          selectedTool,
          aiModel: aiToolToUse === 'chatgpt' ? 'gpt-4o-mini' : 'default-model',
          aiTool: aiToolToUse
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

  const handleProjectSelect = async (project: any) => {
    setCurrentProject(project);
    
    try {
      // Try to get the most recent prompt for this project
      const { data: prompts, error } = await supabase
        .from('generated_prompts')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: false })
        .limit(1);

      let hasPreviousPrompt = false;
      
      if (!error && prompts && prompts.length > 0) {
        const latestPrompt = prompts[0];
        hasPreviousPrompt = true;
        
        // Set basic info from the latest prompt
        const promptBasicInfo = {
          productType: latestPrompt.industry || project.product_type || "",
          industry: latestPrompt.industry || project.industry || "",
          targetAudience: latestPrompt.target_audience || project.target_audience || ""
        };
        
        setBasicInfo(promptBasicInfo);
        
        // Set project context from the latest prompt
        if (latestPrompt.project_context) {
          setProjectContext({
            projectDescription: latestPrompt.project_context.projectDescription || "",
            documentContent: latestPrompt.project_context.documentContent || ""
          });
        } else if (project.project_description || project.document_content) {
          setProjectContext({
            projectDescription: project.project_description || "",
            documentContent: project.document_content || ""
          });
        }
        
        // Set framework and stage from the latest prompt
        if (latestPrompt.selected_framework && latestPrompt.selected_framework !== "None") {
          setSelectedFramework(latestPrompt.selected_framework);
          if (latestPrompt.framework_stage) {
            setFrameworkStage(latestPrompt.framework_stage);
          }
        } else if (project.selected_framework && project.selected_framework !== "None") {
          setSelectedFramework(project.selected_framework);
          if (project.framework_stage) {
            setFrameworkStage(project.framework_stage);
          }
        }
        
        // Skip to the stage selection since we have all the info we need
        setCurrentStep("stage");
        return;
      }
      
      // If no previous prompts found, use the project's basic info
      const projectBasicInfo = {
        productType: project.product_type || "",
        industry: project.industry || "",
        targetAudience: project.target_audience || ""
      };
      
      setBasicInfo(projectBasicInfo);
      
      // Check if we have enough info to skip to stage
      const hasBasicInfo = projectBasicInfo.productType || projectBasicInfo.industry || projectBasicInfo.targetAudience;
      const hasProjectContext = project.project_description || project.document_content;
      
      if (hasBasicInfo && hasProjectContext) {
        setProjectContext({
          projectDescription: project.project_description || "",
          documentContent: project.document_content || ""
        });
        
        if (project.selected_framework && project.selected_framework !== "None") {
          setSelectedFramework(project.selected_framework);
          if (project.framework_stage) {
            setFrameworkStage(project.framework_stage);
          }
        }
        
        setCurrentStep("stage");
      } else {
        setCurrentStep("basic-info");
      }
      
    } catch (error) {
      console.error("Error fetching project prompts:", error);
      // Fall back to basic behavior if there's an error
      setBasicInfo({
        productType: project.product_type || "",
        industry: project.industry || "",
        targetAudience: project.target_audience || ""
      });
      setCurrentStep("basic-info");
    }
  };

  const handleBasicInfoComplete = async (info: ProjectBasicInfo) => {
    setBasicInfo(info);
    
    // Update the project with the basic info (only if we have a project)
    if (currentProject) {
      try {
        // Only include the updated_at field which we know exists
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString()
        };

        // We'll skip trying to update product_type, industry, and target_audience
        // since they might not exist in the database yet
        // These fields will be stored in local state until we can update the database schema

        // Use the project ID in the URL for the primary key filter
        const { error } = await put(`/projects?id=eq.${currentProject.id}`, updateData, {
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        });
        
        if (error) {
          console.warn("Could not update project:", error);
        }
        
      } catch (error) {
        console.error("Error updating project with basic info:", error);
      }
    }
    
    // Navigate to the stage step after basic info
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
    setCurrentStep("context");
  };

  const handleContextComplete = async (context: ProjectContext & { selectedAITool?: string }) => {
    // First update the context in state
    const { selectedAITool, ...restContext } = context;
    setProjectContext(restContext);
    
    // Store the selected AI tool separately if it exists
    if (selectedAITool) {
      setSelectedAITool(selectedAITool);
    } else {
      // Default to ChatGPT if no AI tool is selected
      setSelectedAITool('chatgpt');
    }
    
    // Update the project with the context (only if we have a project)
    if (currentProject) {
      try {
        // Only include the updated_at field which we know exists
        const updateData: Record<string, any> = {
          updated_at: new Date().toISOString()
        };

        // We'll skip trying to update project_description and document_content
        // since they might not exist in the database yet
        // These fields will be stored in local state until we can update the database schema

        // Use the project ID in the URL for the primary key filter
        const { error } = await put(`/projects?id=eq.${currentProject.id}`, updateData, {
          headers: {
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          }
        });
        
        if (error) {
          console.warn("Could not update project:", error);
        }
        
      } catch (error) {
        console.error("Error updating project with context:", error);
      }
    }
    
    // Ensure we have all required fields before proceeding
    if (!projectStage || !selectedFramework || !frameworkStage || !currentProject || !basicInfo) {
      console.error("Missing required fields for prompt generation:", {
        projectStage,
        selectedFramework,
        frameworkStage,
        currentProject: !!currentProject,
        basicInfo: !!basicInfo
      });
      toast({
        title: "Error",
        description: "Missing required information. Please complete all previous steps.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate the prompt with the latest context
      const prompt = await generatePromptWithContext(selectedTool, {
        projectContext: context, // Use the context passed to this function, not the state
        projectStage,
        selectedFramework,
        frameworkStage,
        currentProject,
        basicInfo
      });
      
      if (prompt) {
        setCurrentStep("result");
      }
    } catch (error) {
      console.error("Error generating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to generate prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "project":
        return (
          <ProjectSelectionStep 
            onNewProject={handleProjectSelect}
            onExistingProject={handleProjectSelect}
            onCustomPrompt={() => {
              // Navigate to the custom prompt editor
              navigate('/prompts/new');
            }}
          />
        );
      case "basic-info":
        return (
          <ProjectBasicInfoStep 
            onNext={handleBasicInfoComplete} 
            initialInfo={basicInfo} 
            onBack={() => setCurrentStep("project")}
          />
        );
      case "stage":
        return (
          <ProjectStageStep 
            context={{
              industry: basicInfo?.industry || "",
              productType: basicInfo?.productType || "",
              companySize: "", // Add this if you have company size in your basic info
              projectDescription: projectContext?.projectDescription || ""
            }}
            onNext={handleStageComplete}
            onBack={() => setCurrentStep("basic-info")}
          />
        );
      case "framework":
        return (
          <FrameworkStep 
            context={{
              industry: basicInfo?.industry || "",
              productType: basicInfo?.productType || "",
              companySize: "", // Add this if you have company size in your basic info
              projectDescription: projectContext?.projectDescription || ""
            }}
            projectStage={projectStage || ""}
            onNext={handleFrameworkComplete}
            onBack={() => setCurrentStep("stage")}
            initialFramework={selectedFramework}
            initialFrameworkStage={frameworkStage}
            aiRecommendations={{
              recommendedFramework: selectedFramework,
              // Add other AI recommendations if available
            }}
          />
        );
      case "tool":
        return (
          <ToolSelectionStep 
            context={{
              industry: basicInfo?.industry || "",
              productType: basicInfo?.productType || "",
              companySize: "",
              projectDescription: projectContext?.projectDescription || ""
            }}
            projectStage={projectStage || ""}
            framework={selectedFramework || "none"}
            frameworkStage={frameworkStage || ""}
            onNext={handleToolComplete}
            onBack={() => setCurrentStep("framework")}
            aiRecommendations={{
              recommendedFramework: selectedFramework,
              // Add other AI recommendations if available
            }}
          />
        );
      case "context":
        return (
          <ProjectContextStep
            onNext={handleContextComplete}
            initialContext={projectContext}
            basicInfo={currentProject}
            projectStage={projectStage}
            framework={selectedFramework}
            frameworkStage={frameworkStage}
            selectedTool={selectedTool}
            onBack={() => setCurrentStep("tool")}
            onGenerate={handleContextComplete}
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
                <Button 
                  onClick={() => currentProject?.id && navigate(`/projects/${currentProject.id}`)} 
                  variant="outline" 
                  size="sm"
                  disabled={!currentProject?.id}
                >
                  <Library className="mr-2 h-4 w-4" />
                  View Project
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

  useEffect(() => {
    const state = location.state as { 
      project?: any;
      basicInfo?: ProjectBasicInfo;
      projectContext?: ProjectContext | string;
      projectStage?: string;
      selectedFramework?: string;
      frameworkStage?: string;
      selectedTool?: string;
      generatedPrompt?: string;
      aiResponse?: string;
      skipToStage?: boolean;
    } | null;

    const initializeState = async () => {
      if (!state) return;

      // Set basic info first from project or state
      if (state.basicInfo) {
        setBasicInfo(state.basicInfo);
      } else if (state.project) {
        // Set basic info from project if available
        setBasicInfo({
          productType: state.project.product_type || '',
          industry: state.project.industry || '',
          targetAudience: state.project.target_audience || ''
        });
      }

      // Set project context
      if (state.projectContext) {
        setProjectContext(
          typeof state.projectContext === 'string' 
            ? { projectDescription: state.projectContext } 
            : state.projectContext
        );
      } else if (state.project?.description) {
        setProjectContext({
          projectDescription: state.project.description
        });
      }

      // Set project stage
      if (state.projectStage) {
        setProjectStage(state.projectStage);
      }

      // Set framework and stage
      if (state.selectedFramework) {
        setSelectedFramework(state.selectedFramework);
      } else if (state.project?.selected_framework) {
        setSelectedFramework(state.project.selected_framework);
      }

      if (state.frameworkStage) {
        setFrameworkStage(state.frameworkStage);
      }

      // Set current project
      if (state.project) {
        setCurrentProject(state.project);

        // Try to fetch the last used framework if we don't have one yet
        if (!state.selectedFramework && !state.project.selected_framework) {
          try {
            const { data: prompts, error } = await supabase
              .from('generated_prompts')
              .select('framework, framework_stage')
              .eq('project_id', state.project.id)
              .order('created_at', { ascending: false })
              .limit(1);

            if (!error && prompts?.[0]?.framework) {
              setSelectedFramework(prompts[0].framework);
              setFrameworkStage(prompts[0].framework_stage || '');
            }
          } catch (error) {
            console.error('Error fetching last used framework:', error);
          }
        }

        // Set navigation step
        setCurrentStep(state.skipToStage ? "stage" : "basic-info");
      }

      // Set other state from location state if available
      if (state.selectedTool) setSelectedTool(state.selectedTool);
      if (state.generatedPrompt) setGeneratedPrompt(state.generatedPrompt);
      if (state.aiResponse) setAiResponse(state.aiResponse);
    };

    initializeState();
  }, [location.state]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
  }, [user, navigate, location.state]);

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