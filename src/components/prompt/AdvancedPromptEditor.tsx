import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  PromptTemplate, 
  PromptVariable, 
  PromptEngineeringMethod,
  AIConfiguration,
  AIResponse
} from '@/types';
import { promptEngine } from '@/lib/prompt-engine';
import { 
  Play, 
  Save, 
  Copy, 
  Download, 
  Settings, 
  Lightbulb,
  Code,
  Eye,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Check
} from 'lucide-react';

interface AdvancedPromptEditorProps {
  template?: PromptTemplate;
  context?: string;
  frameworkType?: string;
  stageId?: string;
  onSave?: (template: PromptTemplate) => void;
  onExecute?: (prompt: string, config: AIConfiguration) => Promise<AIResponse>;
  mode?: 'standalone' | 'stage-bound';
}

export const AdvancedPromptEditor: React.FC<AdvancedPromptEditorProps> = ({
  template: initialTemplate,
  context = '',
  frameworkType,
  stageId,
  onSave,
  onExecute,
  mode = 'standalone'
}) => {
  const [template, setTemplate] = useState<PromptTemplate>(
    initialTemplate || {
      id: `template-${Date.now()}`,
      name: 'New Prompt Template',
      description: '',
      template: '',
      method: 'instruction-tuning',
      category: 'General',
      tags: [],
      variables: []
    }
  );

  const [variables, setVariables] = useState<Record<string, any>>({});
  const [aiConfig, setAiConfig] = useState<AIConfiguration>({
    provider: 'openai',
    model: 'gpt-4',
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    }
  });

  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [showVariableDetection, setShowVariableDetection] = useState(false);

  // Auto-detect variables in template
  const detectVariables = useCallback(() => {
    const regex = /{(\w+)}/g;
    const matches = template.template.match(regex);
    if (!matches) return [];

    const detected = matches.map(match => {
      const varName = match.slice(1, -1);
      return {
        id: varName,
        name: varName.charAt(0).toUpperCase() + varName.slice(1).replace(/([A-Z])/g, ' $1'),
        type: 'text' as const,
        required: true,
        description: `Variable: ${varName}`
      };
    });

    // Remove duplicates
    const unique = detected.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    );

    return unique;
  }, [template.template]);

  useEffect(() => {
    const detectedVars = detectVariables();
    if (detectedVars.length > 0 && showVariableDetection) {
      setTemplate(prev => ({
        ...prev,
        variables: [
          ...prev.variables,
          ...detectedVars.filter(dv => !prev.variables.some(v => v.id === dv.id))
        ]
      }));
    }
  }, [detectVariables, showVariableDetection]);

  // Generate final prompt
  useEffect(() => {
    try {
      const prompt = promptEngine.buildPrompt({
        method: template.method,
        template,
        variables,
        context,
        frameworkType,
        temperature: aiConfig.parameters.temperature,
        maxTokens: aiConfig.parameters.maxTokens
      });
      setGeneratedPrompt(prompt);
    } catch (error) {
      console.error('Error generating prompt:', error);
    }
  }, [template, variables, context, frameworkType, aiConfig]);

  const handleExecutePrompt = async () => {
    if (!onExecute) return;

    setIsExecuting(true);
    try {
      const response = await onExecute(generatedPrompt, aiConfig);
      setAiResponse(response);
      setActiveTab('response');
    } catch (error) {
      console.error('Error executing prompt:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveTemplate = () => {
    if (onSave) {
      onSave(template);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addVariable = () => {
    const newVariable: PromptVariable = {
      id: `var_${Date.now()}`,
      name: 'New Variable',
      type: 'text',
      required: false,
      description: ''
    };

    setTemplate(prev => ({
      ...prev,
      variables: [...prev.variables, newVariable]
    }));
  };

  const updateVariable = (index: number, updates: Partial<PromptVariable>) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.map((v, i) => i === index ? { ...v, ...updates } : v)
    }));
  };

  const removeVariable = (index: number) => {
    setTemplate(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Editor</h2>
          <p className="text-muted-foreground">
            {mode === 'stage-bound' ? `Stage-bound editor for ${stageId}` : 'Standalone prompt builder'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowVariableDetection(!showVariableDetection)}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Auto-detect Variables
          </Button>
          <Button variant="outline" onClick={handleSaveTemplate}>
            <Save className="h-4 w-4 mr-2" />
            Save Template
          </Button>
          <Button 
            onClick={handleExecutePrompt}
            disabled={isExecuting || !onExecute}
          >
            {isExecuting ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Execute
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="edit">
            <Code className="h-4 w-4 mr-2" />
            Edit
          </TabsTrigger>
          <TabsTrigger value="variables">
            <Settings className="h-4 w-4 mr-2" />
            Variables
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="config">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Config
          </TabsTrigger>
          <TabsTrigger value="response">
            <MessageSquare className="h-4 w-4 mr-2" />
            Response
          </TabsTrigger>
        </TabsList>

        {/* Edit Tab */}
        <TabsContent value="edit" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="method">Prompt Method</Label>
                    <Select
                      value={template.method}
                      onValueChange={(value: PromptEngineeringMethod) => 
                        setTemplate(prev => ({ ...prev, method: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="zero-shot">Zero-shot</SelectItem>
                        <SelectItem value="few-shot">Few-shot</SelectItem>
                        <SelectItem value="chain-of-thought">Chain of Thought</SelectItem>
                        <SelectItem value="instruction-tuning">Instruction Tuning</SelectItem>
                        <SelectItem value="role-playing">Role Playing</SelectItem>
                        <SelectItem value="step-by-step">Step by Step</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={template.category}
                      onChange={(e) => setTemplate(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={template.tags.join(', ')}
                    onChange={(e) => setTemplate(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    }))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Template Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={template.template}
                  onChange={(e) => setTemplate(prev => ({ ...prev, template: e.target.value }))}
                  rows={12}
                  placeholder="Enter your prompt template here. Use {variableName} for variables."
                  className="font-mono"
                />
                {showVariableDetection && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <Lightbulb className="h-4 w-4 inline mr-1" />
                    Variables will be auto-detected from {'{variableName}'} patterns
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Variables Tab */}
        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Template Variables</CardTitle>
                <Button onClick={addVariable} size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Add Variable
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {template.variables.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No variables defined. Add variables to make your template dynamic.
                </div>
              ) : (
                <div className="space-y-4">
                  {template.variables.map((variable, index) => (
                    <Card key={variable.id}>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <Label>Variable ID</Label>
                            <Input
                              value={variable.id}
                              onChange={(e) => updateVariable(index, { id: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Display Name</Label>
                            <Input
                              value={variable.name}
                              onChange={(e) => updateVariable(index, { name: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Type</Label>
                            <Select
                              value={variable.type}
                              onValueChange={(value: any) => updateVariable(index, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="textarea">Textarea</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="select">Select</SelectItem>
                                <SelectItem value="multiselect">Multi-select</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="mt-4">
                          <Label>Description</Label>
                          <Textarea
                            value={variable.description}
                            onChange={(e) => updateVariable(index, { description: e.target.value })}
                            rows={2}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={variable.required}
                              onCheckedChange={(checked) => updateVariable(index, { required: checked })}
                            />
                            <Label>Required</Label>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeVariable(index)}
                          >
                            Remove
                          </Button>
                        </div>

                        {/* Variable Input for Testing */}
                        <Separator className="my-4" />
                        <div>
                          <Label>Test Value</Label>
                          {variable.type === 'textarea' ? (
                            <Textarea
                              value={variables[variable.id] || ''}
                              onChange={(e) => setVariables(prev => ({
                                ...prev,
                                [variable.id]: e.target.value
                              }))}
                              rows={3}
                            />
                          ) : (
                            <Input
                              value={variables[variable.id] || ''}
                              onChange={(e) => setVariables(prev => ({
                                ...prev,
                                [variable.id]: e.target.value
                              }))}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Generated Prompt Preview</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedPrompt)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">{generatedPrompt}</pre>
              </div>
              {context && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Context (will be included):</h4>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded text-sm">
                    {context}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Config Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <Label>Provider</Label>
                  <Select
                    value={aiConfig.provider}
                    onValueChange={(value: any) => setAiConfig(prev => ({ ...prev, provider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                      <SelectItem value="google">Google</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Model</Label>
                  <Input
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig(prev => ({ ...prev, model: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Temperature: {aiConfig.parameters.temperature}</Label>
                  <Slider
                    value={[aiConfig.parameters.temperature]}
                    onValueChange={([value]) => setAiConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, temperature: value }
                    }))}
                    max={2}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Max Tokens: {aiConfig.parameters.maxTokens}</Label>
                  <Slider
                    value={[aiConfig.parameters.maxTokens]}
                    onValueChange={([value]) => setAiConfig(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, maxTokens: value }
                    }))}
                    max={4000}
                    min={100}
                    step={100}
                    className="mt-2"
                  />
                </div>

                {aiConfig.parameters.topP !== undefined && (
                  <div>
                    <Label>Top P: {aiConfig.parameters.topP}</Label>
                    <Slider
                      value={[aiConfig.parameters.topP]}
                      onValueChange={([value]) => setAiConfig(prev => ({
                        ...prev,
                        parameters: { ...prev.parameters, topP: value }
                      }))}
                      max={1}
                      min={0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Tab */}
        <TabsContent value="response" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Response</CardTitle>
                {aiResponse && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(aiResponse.content)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Response
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {aiResponse ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                    <pre className="whitespace-pre-wrap text-sm">{aiResponse.content}</pre>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Tokens: {aiResponse.tokensUsed}</span>
                    <span>Time: {aiResponse.processingTime}ms</span>
                    <span>Model: {aiResponse.model}</span>
                    {aiResponse.confidence && (
                      <span>Confidence: {Math.round(aiResponse.confidence * 100)}%</span>
                    )}
                  </div>

                  {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Suggestions:</h4>
                      <div className="space-y-2">
                        {aiResponse.suggestions.map((suggestion, index) => (
                          <Badge key={index} variant="outline">
                            {suggestion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Execute the prompt to see AI response here
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};