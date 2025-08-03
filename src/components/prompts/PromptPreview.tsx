import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PromptVariable } from "@/types/prompt";

interface PromptPreviewProps {
  content: string;
  variables: PromptVariable[];
  onVariableChange?: (name: string, value: string) => void;
  className?: string;
}

export function PromptPreview({ content, variables, onVariableChange, className }: PromptPreviewProps) {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [processedContent, setProcessedContent] = useState('');

  // Initialize variable values with defaults
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    variables.forEach(variable => {
      initialValues[variable.name] = variable.defaultValue || '';
    });
    setVariableValues(initialValues);
  }, [variables]);

  // Process content with current variable values
  useEffect(() => {
    let result = content;
    
    // Replace all variable placeholders with their current values
    Object.entries(variableValues).forEach(([name, value]) => {
      const regex = new RegExp(`\\{\\s*${name}\\s*\\}`, 'g');
      result = result.replace(regex, value);
    });
    
    setProcessedContent(result);
  }, [content, variableValues]);

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (onVariableChange) {
      onVariableChange(name, value);
    }
  };

  // Extract all variables from content
  const extractVariables = (text: string): string[] => {
    const regex = /{{\s*([^}]+)\s*}}/g;
    const matches = [];
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1].trim());
    }
    
    return [...new Set(matches)]; // Remove duplicates
  };

  const contentVariables = extractVariables(content);
  const usedVariables = variables.filter(v => contentVariables.includes(v.name));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {usedVariables.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Variables</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usedVariables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label htmlFor={`preview-${variable.name}`}>
                    {variable.name}
                    {variable.isRequired && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={`preview-${variable.name}`}
                    value={variableValues[variable.name] || ''}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                    placeholder={variable.description || `Enter value for ${variable.name}`}
                    className={variable.isRequired && !variableValues[variable.name] ? 'border-red-500' : ''}
                  />
                  {variable.description && (
                    <p className="text-xs text-muted-foreground">{variable.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>Preview</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(processedContent)}
            >
              Copy
            </Button>
          </div>
          <div className="min-h-[200px] p-4 border rounded-md bg-muted/50 whitespace-pre-wrap font-mono text-sm">
            {processedContent || 'Enter some content and add variables to see the preview...'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
