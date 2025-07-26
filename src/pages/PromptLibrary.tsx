import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Library, 
  MoreVertical, 
  Edit, 
  Copy, 
  Trash2, 
  Plus, 
  Calendar,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface GeneratedPrompt {
  id: string;
  created_at: string;
  project_context: any;
  selected_framework: string;
  framework_stage: string;
  selected_tool: string;
  original_prompt: string;
  ai_response: string | null;
}

const PromptLibrary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchPrompts();
  }, [user, navigate]);

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('generated_prompts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error("Error loading prompts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPrompts(prev => prev.filter(p => p.id !== id));
      toast.success("Prompt deleted successfully");
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast.error("Error deleting prompt");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success("Prompt copied to clipboard");
    } catch (error) {
      toast.error("Error copying prompt");
    }
  };

  const handleIteratePrompt = (prompt: GeneratedPrompt) => {
    // Navigate to generator with the prompt data pre-filled
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

  const handleNewPrompt = () => {
    navigate('/generator');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-96">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Prompt Library</h1>
          </div>
          <p className="text-muted-foreground">
            Manage all your generated prompts and AI responses
          </p>
        </div>
        
        <Button onClick={handleNewPrompt} className="gap-2">
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Prompts</CardDescription>
            <CardTitle className="text-2xl">{prompts.length}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>With AI Response</CardDescription>
            <CardTitle className="text-2xl">
              {prompts.filter(p => p.ai_response).length}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>This Month</CardDescription>
            <CardTitle className="text-2xl">
              {prompts.filter(p => {
                const promptDate = new Date(p.created_at);
                const currentDate = new Date();
                return promptDate.getMonth() === currentDate.getMonth() && 
                       promptDate.getFullYear() === currentDate.getFullYear();
              }).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Prompts List */}
      {prompts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Library className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No generated prompts</h3>
            <p className="text-muted-foreground text-center mb-6">
              Start by creating your first UX prompt with our generator
            </p>
            <Button onClick={handleNewPrompt} className="gap-2">
              <Plus className="h-4 w-4" />
              Create First Prompt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(prompt.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {prompt.project_context?.industry && (
                        <Badge variant="secondary">{prompt.project_context.industry}</Badge>
                      )}
                      {prompt.project_context?.productType && (
                        <Badge variant="outline">{prompt.project_context.productType}</Badge>
                      )}
                      <Badge variant="outline">{prompt.selected_framework}</Badge>
                      <Badge variant="outline">{prompt.framework_stage}</Badge>
                      <Badge variant="outline">{prompt.selected_tool}</Badge>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleIteratePrompt(prompt)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Iterate Prompt
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyPrompt(prompt.original_prompt)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Prompt
                      </DropdownMenuItem>
                      <Separator className="my-1" />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onSelect={(e) => e.preventDefault()}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete prompt?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The prompt and its AI response will be permanently deleted.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeletePrompt(prompt.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Original Prompt */}
                <div>
                  <h4 className="font-medium mb-2">Original Prompt</h4>
                  <ScrollArea className="h-24 w-full rounded border bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {prompt.original_prompt}
                    </p>
                  </ScrollArea>
                </div>

                {/* AI Response */}
                {prompt.ai_response && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">AI Response</h4>
                      <ScrollArea className="h-32 w-full rounded border bg-background p-3">
                        <p className="text-sm whitespace-pre-wrap">
                          {prompt.ai_response}
                        </p>
                      </ScrollArea>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleIteratePrompt(prompt)}
                    className="gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    Iterate
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleCopyPrompt(prompt.original_prompt)}
                    className="gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PromptLibrary;