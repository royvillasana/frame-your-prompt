import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Copy, Sparkles, RefreshCw, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";

const PromptDetail = () => {
  const { promptId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast: toastHook } = useToast();
  const [prompt, setPrompt] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  useEffect(() => {
    if (user && promptId) {
      loadPromptDetails();
    }
  }, [user, promptId]);

  const loadPromptDetails = async () => {
    if (!promptId || !user?.id) return;
    
    try {
      // Try to load from custom_prompts first
      const { data: customPromptData, error: customPromptError } = await supabase
        .from('custom_prompts')
        .select('*')
        .eq('id', promptId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (customPromptError) {
        console.error('Error loading custom prompt:', customPromptError);
        throw customPromptError;
      }

      // If not found in custom_prompts, try generated_prompts
      if (!customPromptData) {
        const { data: generatedPromptData, error: generatedPromptError } = await supabase
          .from('generated_prompts')
          .select('*')
          .eq('id', promptId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (generatedPromptError) {
          console.error('Error loading generated prompt:', generatedPromptError);
          throw generatedPromptError;
        }

        if (!generatedPromptData) {
          throw new Error('Prompt not found');
        }

        setPrompt(generatedPromptData);
        
        // Load associated project if it exists
        if (generatedPromptData.project_id) {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', generatedPromptData.project_id)
            .maybeSingle();

          if (!projectError && projectData) {
            setProject(projectData);
          }
        }
      } else {
        // Handle custom prompt data
        setPrompt(customPromptData);
        
        // Load associated project if it's not the custom prompt project
        if (customPromptData.project_id && customPromptData.project_id !== 'custom_prompt') {
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', customPromptData.project_id)
            .maybeSingle();

          if (!projectError && projectData) {
            setProject(projectData);
          }
        }
      }
    } catch (error: any) {
      toast.error("Error loading prompt details");
      console.error(error);
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.original_prompt);
    toastHook({
      title: "Copied!",
      description: "Prompt copied to clipboard.",
    });
  };

  const generateAIResponse = async () => {
    if (!prompt.original_prompt) return;
    
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-response', {
        body: {
          prompt: prompt.original_prompt,
          projectContext: prompt.project_context,
          selectedFramework: prompt.selected_framework,
          frameworkStage: prompt.framework_stage,
          selectedTool: prompt.selected_tool,
          aiModel: "gpt-4o-mini",
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
      
      // Update prompt with new response
      const { error: updateError } = await supabase
        .from('custom_prompts')
        .update({ content: data.aiResponse })
        .eq('id', promptId);

      if (updateError) throw updateError;

      setPrompt({ ...prompt, ai_response: data.aiResponse });
      toast.success("AI response generated!");
    } catch (error: any) {
      console.error('Full error:', error);
      const errorMessage = error.message || "Error generating AI response";
      
      if (errorMessage.includes("Could not generate AI response")) {
        toast.error("⚠️ AI services temporarily unavailable", {
          description: "Free AI services are busy. Try with a premium model (requires API key) or try again later.",
          action: {
            label: "Configure API Key",
            onClick: () => navigate('/profile')
          }
        });
      } else if (errorMessage.includes("API key not configured")) {
        toast.error("You must configure an API key in your profile to use this function.", {
          action: {
            label: "Go to Profile",
            onClick: () => navigate('/profile')
          }
        });
      } else {
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const iteratePrompt = () => {
    navigate('/generator', {
      state: {
        iterateFrom: prompt,
        projectContext: prompt.project_context,
        selectedFramework: prompt.selected_framework,
        frameworkStage: prompt.framework_stage,
        selectedTool: prompt.selected_tool
      }
    });
  };

  const deletePrompt = async () => {
    if (!window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_prompts')
        .delete()
        .eq('id', promptId)
        .eq('user_id', user?.id);

      if (error) throw error;

      toast.success("Prompt deleted successfully");
      
      // Return to project or profile
      if (project) {
        navigate(`/projects/${project.id}`);
      } else {
        navigate('/profile');
      }
    } catch (error: any) {
      toast.error("Error deleting prompt");
      console.error(error);
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Loading prompt...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!prompt) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Prompt not found</h1>
          <Button onClick={() => navigate('/profile')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => project ? navigate(`/projects/${project.id}`) : navigate('/profile')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {project ? `Back to ${project.name}` : 'Back to profile'}
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Prompt Details</h1>
              {project && (
                <p className="text-muted-foreground text-lg mb-4">Project: {project.name}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(prompt.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary">{prompt.selected_framework}</Badge>
                <Badge variant="outline">{prompt.framework_stage}</Badge>
                <Badge variant="outline">{prompt.selected_tool}</Badge>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={iteratePrompt} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={deletePrompt}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Prompt Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Original Prompt</CardTitle>
            <CardDescription>
              The prompt generated specifically for your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <Textarea 
                value={prompt.original_prompt}
                readOnly
                className="min-h-[200px] bg-transparent border-0 p-0 resize-none"
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
                {isGeneratingAI ? "Generating..." : prompt.ai_response ? "Regenerate AI" : "Use Prompt"}
              </Button>
              <Button onClick={iteratePrompt} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Iterate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Response */}
        {prompt.ai_response && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>AI Response</CardTitle>
                <Button 
                  onClick={() => navigate('/chat', { 
                    state: { 
                      initialPrompt: prompt.original_prompt, 
                      initialResponse: prompt.ai_response,
                      projectContext: prompt.project_context 
                    } 
                  })}
                  size="sm"
                  className="ml-auto"
                >
                  Continue in Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-4 rounded-lg border">
                <div className="bg-background/50 p-4 rounded-md max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm">{prompt.ai_response}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PromptDetail;