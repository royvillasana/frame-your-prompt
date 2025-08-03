import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { CustomPrompt } from '@/types/prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomPromptEditor } from '@/components/prompts/CustomPromptEditor';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function CreatePrompt() {
  const { id } = useParams<{ id?: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(!!id);
  const [initialData, setInitialData] = useState<CustomPrompt | null>(null);

  // Fetch projects for the project selector
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch prompt data if editing
  useEffect(() => {
    if (!id || !user) return;

    const fetchPrompt = async () => {
      try {
        const { data, error } = await supabase
          .from('custom_prompts')
          .select('*')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setInitialData({
            ...data,
            variables: data.variables ? JSON.parse(data.variables) : [],
            tags: data.tags || []
          });
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [id, user]);

  const handleSave = async (promptData: any) => {
    try {
      const saveData = {
        ...(id && { id }),
        title: promptData.title,
        content: promptData.content,
        platform: promptData.platform || null,
        project_id: 'custom_prompt', // Now using the default project_id
        notes: promptData.notes || null,
        tags: promptData.tags || [],
        variables: JSON.stringify(promptData.variables || []),
        is_public: promptData.is_public || false,
        user_id: user?.id,
        updated_at: new Date().toISOString(),
        created_at: id ? undefined : new Date().toISOString() // Only set on create
      };

      console.log('Saving prompt data:', saveData);

      const { data, error } = await supabase
        .from('custom_prompts')
        .upsert(saveData)
        .select()
        .single();

      console.log('Save response:', { data, error });

      if (error) {
        console.error('Error saving prompt:', error);
        throw error;
      }

      // If this was a new prompt, navigate to the edit URL
      if (!id && data) {
        navigate(`/prompts/${data.id}/edit`, { replace: true });
      } else if (data) {
        // Show success message for updates
        console.log('Prompt saved successfully:', data);
      }

      return data;
    } catch (error) {
      console.error('Error in handleSave:', error);
      console.error('Error saving prompt:', error);
      throw error;
    }
  };

  const handleSaveAndCopy = (promptData: any) => {
    // Copy the prompt content to clipboard
    navigator.clipboard.writeText(promptData.content);
    return promptData;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          {id ? 'Edit Prompt' : 'Create New Prompt'}
        </h1>
        <p className="text-muted-foreground">
          {id ? 'Update your custom prompt' : 'Create a new custom prompt with variables and settings'}
        </p>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="preview" disabled>Preview</TabsTrigger>
          <TabsTrigger value="settings" disabled>Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card>
            <CardContent className="pt-6">
              <CustomPromptEditor
                initialData={initialData || undefined}
                onSave={handleSave}
                onSaveAndCopy={handleSaveAndCopy}
                projects={projects}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
