import { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Copy, Tag as TagIcon, Code, Save } from "lucide-react";
import { CustomPrompt, PLATFORMS, PromptVariable } from "@/types/prompt";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

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
}

export function CustomPromptEditor({
  initialData,
  onSave,
  onSaveAndCopy,
  onCancel,
  projects = []
}: CustomPromptEditorProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      platform: initialData?.platform || '',
      projectId: initialData?.projectId || '',
      notes: initialData?.notes || '',
      tags: initialData?.tags || [],
      variables: initialData?.variables || [],
      isPublic: initialData?.isPublic || false
    }
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "variables"
  });

  const tags = watch('tags');

  const addTag = (e: React.KeyboardEvent) => {
    e.preventDefault();
    const value = newTag.trim();
    if (value && !tags.includes(value)) {
      setValue('tags', [...tags, value]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };

  const addVariable = () => {
    const newVar = {
      id: uuidv4(),
      name: `var${fields.length + 1}`,
      description: '',
      defaultValue: '',
      isRequired: false
    };
    append(newVar);
  };

  const handleVariableChange = (index: number, field: keyof PromptVariable, value: any) => {
    update(index, {
      ...fields[index],
      [field]: value
    });
  };

  const insertVariable = (varName: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    setValue('content', `${before}{{${varName}}}${after}`);
    
    // Set cursor after the inserted variable
    setTimeout(() => {
      const newCursorPos = start + varName.length + 4; // 4 for {{ and }}
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const handleSaveAndCopy = async (data: FormData) => {
    if (onSave) {
      setIsSubmitting(true);
      try {
        await onSave(data);
        
        // Copy content to clipboard
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(data.content);
          toast({
            title: "Copied to clipboard",
            description: "Prompt content has been copied to your clipboard"
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const onSubmit = (data: FormData) => {
    if (onSave) {
      onSave(data);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Custom Prompt Editor</h1>
        <Button
          onClick={() => {
            // This will be handled by the parent component via the onNewPrompt prop
            if (onCancel) onCancel();
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          New Prompt
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <div className="flex justify-between items-center">
            <Label htmlFor="content">Prompt Content *</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addVariable}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Variable
            </Button>
          </div>
          <Textarea
            id="content"
            placeholder="Enter your prompt content. Use {{variable}} to insert variables."
            className={cn(
              "min-h-[200px] font-mono text-sm",
              errors.content && 'border-red-500'
            )}
            {...register('content')}
          />
          {errors.content && (
            <p className="text-sm text-red-500">{errors.content.message}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Wrap variable names in double curly braces, like {'{{variable}}'}
          </p>
        </div>

        {/* Variables Section */}
        {fields.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Variables</h3>
            {fields.map((field, index) => (
              <div key={field.id} className="space-y-2 border p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{`{{${field.name}}}`}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
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
                      value={field.defaultValue || ''}
                      onChange={(e) => handleVariableChange(index, 'defaultValue', e.target.value)}
                      placeholder="Default value"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={field.description || ''}
                    onChange={(e) => handleVariableChange(index, 'description', e.target.value)}
                    placeholder="What does this variable do?"
                  />
                </div>
                
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
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable(field.name)}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Insert into prompt
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any notes or instructions for using this prompt"
            {...register('notes')}
          />
        </div>

        <div className="space-y-2">
          <Label>Platform</Label>
          <Controller
            name="platform"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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

        {projects.length > 0 && (
          <div className="space-y-2">
            <Label>Project (Optional)</Label>
            <Controller
              name="projectId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Tags</Label>
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

        <div className="flex items-center space-x-2 pt-2">
          <input
            type="checkbox"
            id="isPublic"
            {...register('isPublic')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="isPublic" className="text-sm font-medium">
            Make this prompt public
          </Label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
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
                <Save className="h-4 w-4 mr-2 animate-spin" />
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
      </form>
    </div>
  );
}
