import { useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import useUser from '@/hooks/useUser';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { CustomPrompt } from "@/types/prompt";
import { Plus, Loader2, Trash2, Tag as TagIcon, Eye, Copy, Save, Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PromptPreview } from "./PromptPreview";

const PLATFORMS = [
  'OpenAI',
  'Anthropic',
  'Google',
  'Hugging Face',
  'Other'
];

const variableNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const variableSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, "Variable name is required")
    .regex(variableNameRegex, "Must start with a letter or underscore and contain only letters, numbers, and underscores"),
  description: z.string().optional(),
  defaultValue: z.string().optional(),
  isRequired: z.boolean().default(false)
});

const promptSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(10, "Prompt content must be at least 10 characters"),
  platform: z.string().optional(),
  projectId: z.string().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).default([]),
  variables: z.array(variableSchema).default([]),
  isPublic: z.boolean().default(false)
});

type FormData = z.infer<typeof promptSchema>;

interface CustomPromptEditorProps {
  initialData?: CustomPrompt;
  onSave?: (prompt: CustomPrompt) => void;
  onSaveAndCopy?: (prompt: CustomPrompt) => void;
  onCancel?: () => void;
  projects?: Array<{ id: string; name: string }>;
  onCreateProject?: (name: string) => Promise<{ id: string; name: string }>;
  isLoadingProjects?: boolean;
}

export function CustomPromptEditor({
  initialData,
  onSave,
  onSaveAndCopy,
  onCancel,
  projects = [],
  onCreateProject,
  isLoadingProjects = false,
}: CustomPromptEditorProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string | 'new' | undefined>(
    initialData?.projectId || undefined
  );
  const [newTag, setNewTag] = useState('');

  const { user } = useUser();
  
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      platform: initialData?.platform || '',
      projectId: 'custom_prompt', // Default project ID
      notes: initialData?.notes || '',
      tags: initialData?.tags || [],
      variables: initialData?.variables || [],
      isPublic: initialData?.isPublic || false,
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'variables',
    keyName: 'key', // Add a unique key for each item to help with focus management
  });

  const tags = watch('tags') || [];
  const watchedContent = watch('content', '');

  // Extract variables from content using regex
  const extractVariables = useCallback((content: string): string[] => {
    const regex = /\{\s*([^{}]+?)\s*\}/g;
    const matches = new Set<string>();
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const varName = match[1].trim();
      if (varName) {
        matches.add(varName);
      }
    }
    
    return Array.from(matches);
  }, []);

  // Auto-detect variables from content and add them
  const handleAutoDetectVariables = useCallback(() => {
    const content = getValues('content');
    if (!content) return;
    
    const variableNames = extractVariables(content);
    const existingVariables = getValues('variables') || [];
    const existingNames = new Set(existingVariables.map(v => v.name));
    
    // Only add variables that don't already exist
    const newVariables = variableNames
      .filter(name => !existingNames.has(name))
      .map(name => ({
        id: uuidv4(),
        name,
        description: '',
        defaultValue: '',
        isRequired: false
      }));
    
    if (newVariables.length === 0) {
      toast({
        title: 'No new variables found',
        description: 'All variables in your content are already defined.',
      });
      return;
    }
    
    // Add all new variables at once
    append(newVariables);
    
    toast({
      title: 'Variables detected',
      description: `Added ${newVariables.length} new variable(s) from your content.`,
    });
  }, [append, extractVariables, getValues, toast]);

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !onCreateProject) return;
    
    try {
      const newProject = await onCreateProject(newProjectName);
      setSelectedProjectId(newProject.id);
      setValue('projectId', newProject.id);
      setNewProjectName('');
      setIsCreatingProject(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);
    setValue('projectId', value === 'new' ? '' : value);
    if (value === 'new') {
      setIsCreatingProject(true);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const tag = newTag.trim();
    if (tag && !tags.includes(tag)) {
      const newTags = [...tags, tag];
      setValue('tags', newTags);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter((tag) => tag !== tagToRemove));
  };

  const addVariable = () => {
    append({
      id: uuidv4(),
      name: '',
      description: '',
      defaultValue: '',
      isRequired: false,
    });
  };

  const handleVariableChange = (index: number, field: keyof typeof variableSchema.shape, value: any) => {
    // Use the update function from useFieldArray to update the specific field
    // This is more efficient and maintains focus
    const currentValue = getValues(`variables.${index}`);
    if (currentValue) {
      update(index, { ...currentValue, [field]: value });
    }
  };

  const handleSaveAndCopy = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (onSaveAndCopy) {
        await onSaveAndCopy(data as CustomPrompt);
      }
      toast({
        title: 'Success',
        description: 'Prompt saved and copied to clipboard!',
      });
    } catch (error) {
      console.error('Error saving and copying prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save and copy prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      
      // Validate that all required variables have values if they're used in the content
      const usedVariables = new Set<string>();
      const variableRegex = /{{(.*?)}}/g;
      let match;
      
      while ((match = variableRegex.exec(data.content)) !== null) {
        usedVariables.add(match[1].trim());
      }
      
      const missingRequiredVars = data.variables.filter(
        v => v.isRequired && usedVariables.has(v.name) && !v.defaultValue
      );
      
      if (missingRequiredVars.length > 0) {
        toast({
          title: 'Missing required variables',
          description: `The following required variables are missing default values: ${missingRequiredVars.map(v => v.name).join(', ')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Prepare the prompt data
      const promptData: CustomPrompt = {
        ...data,
        id: initialData?.id || uuidv4(),
        user_id: user?.id || '',
        created_at: initialData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        variables: fields,
        project_id: 'custom_prompt' // Ensure project_id is set
      };
      
      await onSave(promptData);
      
      toast({
        title: 'Prompt saved',
        description: 'Your prompt has been saved successfully',
      });
      
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: 'Error',
        description: 'Failed to save prompt. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Custom Prompt Editor</h1>
        <Button
          onClick={() => {
            if (onCancel) onCancel();
          }}
          variant="outline"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a title for your prompt"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Prompt Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your prompt content here. Use {variable} for variables."
                className={`min-h-[200px] ${errors.content ? 'border-red-500' : ''}`}
                {...register('content')}
              />
              {errors.content && (
                <p className="text-sm text-red-500">{errors.content.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project ID is now set to 'custom_prompt' by default */}
        <input type="hidden" {...register('projectId')} />

        {/* Variables Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Variables</CardTitle>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoDetectVariables}
                  title="Auto-detect variables from content"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Auto-detect
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      id: uuidv4(),
                      name: '',
                      description: '',
                      defaultValue: '',
                      isRequired: false,
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No variables added yet.</p>
                <p className="text-sm mt-2">
                  Add variables to make your prompt dynamic. Use {'{variableName}'} in your prompt content.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="border p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          key={`${field.id}-name`}
                          value={field.name}
                          onChange={(e) => handleVariableChange(index, 'name', e.target.value)}
                          placeholder="variable_name"
                        />
                        {errors.variables?.[index]?.name && (
                          <p className="text-sm text-red-500">
                            {errors.variables[index]?.name?.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label>Default Value</Label>
                        <Input
                          key={`${field.id}-defaultValue`}
                          value={field.defaultValue || ''}
                          onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                          placeholder="Default value"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input
                        key={`${field.id}-description`}
                        value={field.description || ''}
                        onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                        placeholder="What does this variable do?"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`required-${field.id}`}
                          checked={field.isRequired}
                          onChange={(e) => handleVariableChange(index, 'isRequired', e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor={`required-${field.id}`} className="text-sm font-medium">
                          Required
                        </Label>
                      </div>
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive/90"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes Section */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes">Add any notes or instructions for using this prompt</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional notes or instructions..."
                {...register('notes')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Platform Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Platform (Optional)</Label>
              <Controller
                name="platform"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tags Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Add Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags?.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full bg-primary/20 hover:bg-primary/30"
                    >
                      <span className="sr-only">Remove tag</span>
                      <span className="text-primary">×</span>
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  placeholder="Add tags..."
                  className="pl-10"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e);
                    }
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Press Enter to add a tag
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Live Preview</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </div>
          </CardHeader>
          {showPreview && (
            <CardContent>
              <PromptPreview 
                content={watchedContent}
                variables={fields}
                className="border-t pt-6"
              />
            </CardContent>
          )}
        </Card>

        {/* Form Actions */}
        <div className="flex justify-between items-center pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onCancel) onCancel();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSubmit(handleSaveAndCopy)}
              disabled={isSubmitting}
            >
              <Copy className="h-4 w-4 mr-2" />
              Save & Copy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Prompt
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
