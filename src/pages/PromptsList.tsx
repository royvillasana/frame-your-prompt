import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Search, Loader2, BookOpen, Copy, Eye, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

// Import platform types
import { PLATFORMS } from '@/types/prompt';

// Helper function to get unique tags from all prompts
const getUniqueTags = (prompts: any[]) => {
  const allTags = new Set<string>();
  prompts.forEach(prompt => {
    if (prompt.tags && Array.isArray(prompt.tags)) {
      prompt.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  return Array.from(allTags).sort();
};

// Helper function to get date ranges
const getDateRanges = () => {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  const lastMonth = new Date(today);
  lastMonth.setMonth(today.getMonth() - 1);
  
  return [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'older', label: 'Older' }
  ];
};

export default function PromptsList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');

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

  const filteredPrompts = prompts.filter(prompt => {
    const searchLower = searchQuery.toLowerCase();
    const promptDate = prompt.created_at ? new Date(prompt.created_at) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Search query filter
    const matchesSearch = 
      searchQuery === '' ||
      prompt.title.toLowerCase().includes(searchLower) ||
      prompt.content.toLowerCase().includes(searchLower) ||
      (prompt.tags && prompt.tags.some((tag: string) => 
        tag.toLowerCase().includes(searchLower)
      ));
    
    // Platform filter
    const matchesPlatform = 
      selectedPlatform === 'all' || 
      (prompt.platform || '').toLowerCase() === selectedPlatform.toLowerCase();
      
    // Tag filter
    const matchesTag = 
      selectedTag === 'all' || 
      (prompt.tags && prompt.tags.some((tag: string) => 
        tag.toLowerCase() === selectedTag.toLowerCase()
      ));
    
    // Date range filter
    let matchesDateRange = true;
    if (promptDate) {
      const dayDiff = Math.floor((today.getTime() - promptDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch(selectedDateRange) {
        case 'today':
          matchesDateRange = dayDiff === 0;
          break;
        case 'week':
          matchesDateRange = dayDiff <= 7;
          break;
        case 'month':
          matchesDateRange = dayDiff <= 30;
          break;
        case 'older':
          matchesDateRange = dayDiff > 30;
          break;
        // 'all' or any other value - no date filter
      }
    }
    
    return matchesSearch && matchesPlatform && matchesTag && matchesDateRange;
  });

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
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">My Custom Prompts</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage and organize your custom prompts
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-gradient-card shadow-medium">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle className="text-lg">Filters</CardTitle>
              </div>
              <Button onClick={() => navigate('/prompts/new')}>
                <Plus className="mr-2 h-4 w-4" />
                New Custom Prompt
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    {PLATFORMS.map(platform => (
                      <SelectItem key={platform} value={platform.toLowerCase()}>
                        {platform}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tag</label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tags</SelectItem>
                    {getUniqueTags(prompts).map(tag => (
                      <SelectItem key={tag} value={tag.toLowerCase()}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Added</label>
                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getDateRanges().map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
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
            <div className="grid lg:grid-cols-2 gap-6">
              {filteredPrompts.map((prompt) => (
                <Card key={prompt.id} className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{prompt.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {prompt.ai_platform || 'Custom'}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2">
                          {prompt.notes || 'No description provided'}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
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
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {prompt.tags && prompt.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {prompt.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Preview:</h4>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg max-h-32 overflow-y-auto">
                        {prompt.content}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => {
                          navigator.clipboard.writeText(prompt.content);
                          toast({
                            title: 'Copied!',
                            description: 'Prompt copied to clipboard',
                          });
                        }}
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Prompt
                      </Button>
                      {/* <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/edit-prompt/${prompt.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button> */}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
