import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, ChevronDown, Mic, Upload, Loader2, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { getAIToolsForUXTool, getUXToolsForStage, loadAITools } from '@/lib/aiTools';

// Framework ID to display name mapping
const FRAMEWORKS = [
  { id: 'design-thinking', name: 'Design Thinking' },
  { id: 'double-diamond', name: 'Double Diamond' },
  { id: 'google-design-sprint', name: 'Design Sprint' },
  { id: 'lean-ux', name: 'Lean UX' },
  { id: 'agile-ux', name: 'Agile UX' },
  { id: 'human-centered-design', name: 'Human-Centered Design' },
  { id: 'jobs-to-be-done', name: 'Jobs to be Done' },
  { id: 'ux-honeycomb', name: 'UX Honeycomb' },
  { id: 'ucd-iso-9241', name: 'UCD ISO 9241' },
  { id: 'heart-framework', name: 'HEART Framework' },
  { id: 'hooked-model', name: 'Hooked Model' },
];

// Design Thinking framework stages
const STAGES = [
  'Empathize',
  'Define',
  'Ideate',
  'Prototype',
  'Test',
  'Implement'
];

type ProjectType = 'new' | 'existing' | 'custom';

interface Project {
  id: string;
  name: string;
  description?: string;
  context?: string;
  created_at?: string;
  user_id?: string;
  selected_framework?: string;
  framework_stage?: string;
  // Add other fields that might exist in your database
  [key: string]: any; // For any additional fields we might not know about
}

interface AITool {
  name: string;
  description: string;
  framework: string;
  stage: string;
  uxTool: string;
}

export default function PromptGeneratorV2() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Form state
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [context, setContext] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [selectedFramework, setSelectedFramework] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  
  // Data state
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableTools, setAvailableTools] = useState<string[]>([]);
  const [aiTools, setAITools] = useState<AITool[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadUserProjects();
      loadAIToolsData();
    }
  }, [user]);

  const loadUserProjects = async () => {
    try {
      setLoading(true);
      
      // Start with the minimal set of columns we know should exist
      let selectColumns = 'id, name, created_at';
      
      // Try to get all projects with minimal columns first
      const { data, error } = await supabase
        .from('projects')
        .select(selectColumns)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Successfully loaded projects with minimal columns:', data);
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load AI tools data
  const loadAIToolsData = async () => {
    try {
      const tools = await loadAITools();
      setAITools(tools);
    } catch (error) {
      console.error('Error loading AI tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to load UX tools',
        variant: 'destructive',
      });
    }
  };

  // Update available tools when stage or framework changes
  useEffect(() => {
    console.log('useEffect triggered - selectedStage:', selectedStage, 'selectedFramework:', selectedFramework);
    
    const fetchTools = async () => {
      if (selectedStage && selectedFramework) {
        try {
          console.log('Fetching tools for stage:', selectedStage, 'and framework:', selectedFramework);
          
          // Find the framework ID from the FRAMEWORKS array
          const framework = FRAMEWORKS.find(f => f.name === selectedFramework);
          console.log('Found framework:', framework);
          
          if (!framework) {
            console.error('Framework not found in FRAMEWORKS array');
            setAvailableTools([]);
            return;
          }
          
          const frameworkId = framework.id;
          console.log('Using framework ID:', frameworkId);
          
          // Load all tools first to debug
          const allTools = await loadAITools();
          console.log('Loaded AI tools:', allTools);
          
          // Now get tools for the specific stage and framework
          const tools = await getUXToolsForStage(selectedStage, frameworkId);
          console.log('Filtered tools for stage and framework:', tools);
          
          setAvailableTools(tools);
          setSelectedTool(''); // Reset selected tool when stage or framework changes
        } catch (error) {
          console.error('Error loading tools:', error);
          setAvailableTools([]);
        }
      } else {
        console.log('No stage or framework selected, clearing available tools');
        setAvailableTools([]);
      }
    };

    fetchTools();
  }, [selectedStage, selectedFramework]);

  const handleProjectTypeSelect = (type: ProjectType) => {
    setProjectType(type);
    // Reset other selections when project type changes
    setSelectedStage('');
    setSelectedFramework('');
    setSelectedTool('');
    
    // Set default context based on selection
    if (type === 'custom') {
      setContext('');
      setSelectedProject(null);
    } else if (type === 'new') {
      setContext('');
      setSelectedProject(null);
    } else if (type === 'existing' && projects.length > 0) {
      // For existing projects, load the first project's context
      const firstProject = projects[0];
      setSelectedProject(firstProject);
      setContext(firstProject.context || '');
    }
  };

  // Handle project selection from dropdown
  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setContext(project.context || '');
  };

  // Handle context change
  const handleContextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContext(e.target.value);
    // Update the selected project's context if it exists
    if (selectedProject) {
      setSelectedProject({
        ...selectedProject,
        context: e.target.value
      });
    }
  };

  // Default framework to use when none is selected
  const DEFAULT_FRAMEWORK = 'Design Thinking';

  // Handle project creation/update
  const handleSaveProject = async () => {
    if (!user) return;
    
    // Ensure we have a selected framework (required field in database)
    const currentFramework = selectedFramework || DEFAULT_FRAMEWORK;
    
    try {
      setLoading(true);
      
      // Only include fields that we know exist in the database
      const projectData = {
        name: `Project ${new Date().toLocaleDateString()}`,
        user_id: user.id,
        description: context || '',
        selected_framework: currentFramework
        // Note: framework_stage is not included as it doesn't exist in the schema
      };
      
      console.log('Saving project with data (sanitized):', projectData);
      
      if (projectType === 'new' || !selectedProject) {
        console.log('Creating new project with data:', projectData);
        // Create new project with all required fields
        const { data, error } = await supabase
          .from('projects')
          .insert([projectData])
          .select('*')
          .single();

        if (error) {
          console.error('Error creating project:', error);
          throw error;
        }
        
        console.log('Created project:', data);
        setSelectedProject(data);
        setSelectedFramework(currentFramework); // Update local state
        await loadUserProjects(); // Refresh projects list
        
        toast({
          title: 'Project created',
          description: 'Your project has been saved successfully.',
        });
      } else if (selectedProject) {
        console.log('Updating project with data:', projectData);
        // Update existing project with all fields
        const { data, error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', selectedProject.id)
          .select('*')
          .single();

        if (error) {
          console.error('Error updating project:', error);
          throw error;
        }
        
        console.log('Updated project:', data);
        setSelectedProject(data);
        await loadUserProjects(); // Refresh projects list
        
        toast({
          title: 'Project updated',
          description: 'Your project has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: 'Error',
        description: 'Failed to save project. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format enhanced prompt with markdown (matching the original Generator component)
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
      if (typeof prompt.targetAudience === 'object') {
        markdown += `**Target Audience:** ${prompt.targetAudience.ageGroup || ''} interested in ${prompt.targetAudience.interests || ''}.\n`;
      } else {
        markdown += `**Target Audience:** ${prompt.targetAudience}\n`;
      }
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

  const handleGenerate = async () => {
    if (!user || !context.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide some context for the prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedPrompt('');

    try {
      // Save project first if it's a new project or existing project with changes
      if (projectType !== 'custom' && context.trim() !== selectedProject?.context) {
        await handleSaveProject();
      }

      // For custom prompts, just use the provided context
      if (projectType === 'custom') {
        setGeneratedPrompt(context);
        toast({
          title: 'Custom prompt ready',
          description: 'Your custom prompt is ready to use.',
        });
        return;
      }

      // For project-based prompts, generate enhanced prompt
      const toolInfo = selectedTool ? aiTools.find(tool => 
        tool.uxTool === selectedTool && 
        tool.framework.toLowerCase() === (selectedFramework || '').toLowerCase() &&
        tool.stage.toLowerCase() === (selectedStage || '').toLowerCase()
      ) : null;

      // Prepare the prompt data structure matching the Generator component
      const initialPrompt = `# AI Prompt Generation Request

## 📋 Project Overview
**Project:** ${selectedProject?.name || 'Untitled Project'}
**Description:** ${selectedProject?.description || 'No description provided.'}
**Product Type:** ${selectedProject?.product_type || 'Digital Product'}
**Industry:** ${selectedProject?.industry || 'General'}
**Target Audience:** ${selectedProject?.target_audience || 'Users'}

## 🎯 UX Context
**Current UX Stage:** ${selectedStage || 'Not specified'}
**Framework:** ${selectedFramework || 'Not specified'} (${selectedStage || 'Not specified'} stage)
**Selected Tool/Method:** ${selectedTool || 'Not specified'}

## 📄 Document Content
${context.trim()}

## ✨ Prompt Generation Instructions
Generate a detailed and effective prompt for the specified AI tool to help with the following task: **${selectedTool || 'UX Design Task'}**.

The generated prompt should:
1. Be optimized for the selected AI tool's capabilities and limitations
2. Include clear, step-by-step instructions
3. Provide necessary context and background information
4. Specify any requirements or constraints
5. Define the desired output format and structure
6. Include relevant examples or templates if helpful
7. Follow best practices for the specific AI tool`;

      // Call the Supabase function to generate enhanced prompt
      const { data, error } = await supabase.functions.invoke('generate-enhanced-prompt', {
        body: {
          prompt: initialPrompt,
          aiTool: 'chatgpt',
          tool: selectedTool || '',
          framework: selectedFramework || '',
          frameworkStage: selectedStage || ''
        }
      });

      if (error) throw error;
      
      // Format the enhanced prompt response
      const finalPrompt = data.enhancedPrompt || initialPrompt;
      const formattedPrompt = formatEnhancedPrompt(finalPrompt);
      
      setGeneratedPrompt(formattedPrompt);
      
      // Save the generated prompt to the database
      if (projectType !== 'custom') {
        await handleSavePrompt();
      }
      
      toast({
        title: 'Prompt generated',
        description: 'Your prompt has been successfully generated!',
      });
      
      return finalPrompt;
      
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate prompt. Using a basic prompt as a fallback.',
        variant: 'destructive',
      });
      
      // Fallback to a basic prompt if AI enhancement fails
      const fallbackPrompt = `# ${selectedProject?.name || 'Untitled Project'}

## Task
${context.trim()}

## Framework
${selectedFramework || 'Not specified'}

## Stage
${selectedStage || 'Not specified'}

## Tool
${selectedTool || 'Not specified'}`;
      
      setGeneratedPrompt(fallbackPrompt);
      return fallbackPrompt;
      
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (!generatedPrompt) return;
    
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: 'Copied to clipboard',
      description: 'The prompt has been copied to your clipboard.',
    });
  };

  const handleSavePrompt = async () => {
    if (!user || !generatedPrompt) return;
    
    try {
      setLoading(true);
      
      if (projectType === 'custom') {
        // For custom prompts, we'll save to the custom_prompts table if it exists
        const promptData = {
          content: generatedPrompt,
          user_id: user.id,
          title: selectedProject?.name || 'Custom Prompt',
          created_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('custom_prompts')
          .insert([promptData]);
          
        if (error) throw error;
      } else {
        // For generated prompts, use the generated_prompts table schema
        const promptData = {
          user_id: user.id,
          project_id: selectedProject?.id || null,
          project_context: JSON.stringify({
            description: selectedProject?.description || '',
            context: context || ''
          }),
          selected_framework: selectedFramework || 'None',
          framework_stage: selectedStage || 'discovery',
          selected_tool: selectedTool || 'None',
          original_prompt: generatedPrompt,
          ai_response: '', // This can be filled in later if needed
          created_at: new Date().toISOString(),
        };
        
        const { error } = await supabase
          .from('generated_prompts')
          .insert([promptData]);
          
        if (error) throw error;
      }
      
      toast({
        title: 'Prompt saved',
        description: 'Your prompt has been saved to your library.',
      });
      
      // Navigate to the prompts list
      navigate('/prompts');
      
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Prompt Generator</h1>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        <>
          {/* Main Context Input */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="context">
                {projectType === 'custom' 
                  ? 'Custom Prompt Content' 
                  : projectType === 'existing' && selectedProject
                    ? `Prompt Context for ${selectedProject.name}`
                    : 'Project Context'}
              </Label>
              {projectType && projectType !== 'custom' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSaveProject}
                  disabled={!context.trim()}
                >
                  {loading ? 'Saving...' : 'Save Project'}
                </Button>
              )}
            </div>
            <Textarea
              id="context"
              className="min-h-[200px] w-full font-mono text-sm"
              placeholder={
                projectType === 'custom'
                  ? 'Enter your custom prompt content here...'
                  : projectType === 'existing' && selectedProject
                    ? `Enter prompt context for ${selectedProject.name}...`
                    : 'Describe your project context, goals, and requirements...'
              }
              value={context}
              onChange={handleContextChange}
              disabled={isGenerating}
            />
          </div>

          {/* Selection Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            {/* Project Type Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isGenerating}>
                  {projectType 
                    ? projectType === 'new' ? 'New Project' 
                      : projectType === 'existing' ? 'Existing Project' 
                      : 'Custom Prompt'
                    : 'Project Type'}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleProjectTypeSelect('new')}>
                  New Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleProjectTypeSelect('existing')}
                  disabled={projects.length === 0}
                >
                  Existing Project {projects.length === 0 && '(No projects available)'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProjectTypeSelect('custom')}>
                  Custom Prompt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Project Selector (only shown for existing projects) */}
            {projectType === 'existing' && projects.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isGenerating}>
                    {selectedProject?.name || 'Select Project'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {projects.map((project) => (
                    <DropdownMenuItem 
                      key={project.id} 
                      onClick={() => handleProjectSelect(project)}
                    >
                      {project.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Project Stage (only shown when project type is selected) */}
            {projectType && projectType !== 'custom' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isGenerating}>
                    {selectedStage || 'Project Stage'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {STAGES.map((stage) => (
                    <DropdownMenuItem 
                      key={stage} 
                      onClick={() => setSelectedStage(stage)}
                    >
                      {stage}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* UX Framework (only shown when stage is selected) */}
            {selectedStage && projectType !== 'custom' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isGenerating}>
                    {selectedFramework || 'UX Framework'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                  {FRAMEWORKS.map((framework) => (
                    <DropdownMenuItem 
                      key={framework.id}
                      onClick={() => setSelectedFramework(framework.name)}
                    >
                      {framework.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* UX Tool (only shown when framework is selected) */}
            {selectedFramework && projectType !== 'custom' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isGenerating || availableTools.length === 0}>
                    {selectedTool || 'UX Tool'}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                  {availableTools.length > 0 ? (
                    availableTools.map((tool) => (
                      <DropdownMenuItem 
                        key={tool}
                        onClick={() => setSelectedTool(tool)}
                      >
                        {tool}
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No tools available for this stage
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Voice Input Button */}
            <Button variant="outline" size="sm" disabled={isGenerating}>
              <Mic className="h-4 w-4" />
            </Button>

            {/* Upload Button */}
            <Button variant="outline" size="sm" disabled={isGenerating}>
              <Upload className="h-4 w-4" />
            </Button>
          </div>

          {/* Generate Button */}
          <div className="flex justify-end gap-2 mb-8">
            <Button 
              onClick={handleGenerate}
              disabled={
                !context.trim() || 
                isGenerating || 
                (projectType === 'existing' && !selectedProject) ||
                (projectType !== 'custom' && (!selectedStage || !selectedFramework || !selectedTool))
              }
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Prompt'
              )}
            </Button>
          </div>

          {/* Generated Prompt */}
          {generatedPrompt && (
            <div className="mt-8 border rounded-lg overflow-hidden">
              <div className="bg-muted/50 p-3 border-b flex justify-between items-center">
                <h3 className="font-medium">Generated Prompt</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleCopyToClipboard}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleSavePrompt}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Prompt'}
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-background">
                <pre className="whitespace-pre-wrap font-mono text-sm">{generatedPrompt}</pre>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
