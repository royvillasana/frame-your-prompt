import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function PromptsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      
      // Fetch all prompts for the user without joining projects
      const { data, error } = await supabase
        .from('custom_prompts')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the expected format
      const formattedPrompts = (data || []).map(prompt => ({
        ...prompt,
        // Add empty projects object to match the previous structure
        projects: null
      }));
      
      setPrompts(formattedPrompts);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load prompts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    prompt.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (prompt.tags && prompt.tags.some((tag: string) => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const handleDeletePrompt = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this prompt?')) return;
    
    try {
      const { error } = await supabase
        .from('custom_prompts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPrompts(prompts.filter(p => p.id !== id));
      toast({
        title: 'Success',
        description: 'Prompt deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete prompt. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Custom Prompts</h1>
          <p className="text-muted-foreground">
            Manage your custom prompts and create new ones
          </p>
        </div>
        <Button onClick={() => navigate('/prompts/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Custom Prompt
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search prompts..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredPrompts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <h3 className="text-lg font-medium mb-2">No prompts found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? 'No prompts match your search. Try a different query.'
                : "You haven't created any prompts yet."}
            </p>
            <Button onClick={() => navigate('/prompts/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Prompt
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg m-0">
                        <button 
                          onClick={() => navigate(`/prompts/${prompt.id}/edit`)}
                          className="text-left hover:underline"
                        >
                          {prompt.title}
                        </button>
                      </CardTitle>
                      
                      {/* Platform badge */}
                      {prompt.platform && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {prompt.platform}
                        </span>
                      )}
                    </div>
                    
                    {/* Description from notes */}
                    {prompt.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {prompt.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/prompts/${prompt.id}/edit`)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Tags as pills */}
                {prompt.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {prompt.tags.map((tag: string) => (
                      <span 
                        key={tag}
                        className="text-xs bg-muted/50 hover:bg-muted px-2.5 py-1 rounded-full cursor-pointer transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery(tag);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Preview of prompt content */}
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-md p-3 mt-2">
                  <div className="prose max-w-none line-clamp-3 text-sm text-muted-foreground">
                    {prompt.content.substring(0, 200)}
                    {prompt.content.length > 200 ? '...' : ''}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
