import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AIProvider, AIConfiguration, PromptEngineeringMethod } from '@/types';
import { 
  Plus, 
  Trash2, 
  TestTube, 
  Key, 
  Settings, 
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';

interface AIIntegrationSettingsProps {
  configurations: AIConfiguration[];
  onSaveConfiguration: (config: AIConfiguration) => void;
  onDeleteConfiguration: (configId: string) => void;
  onTestConfiguration: (config: AIConfiguration) => Promise<boolean>;
}

export const AIIntegrationSettings: React.FC<AIIntegrationSettingsProps> = ({
  configurations,
  onSaveConfiguration,
  onDeleteConfiguration,
  onTestConfiguration
}) => {
  const [selectedConfig, setSelectedConfig] = useState<AIConfiguration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});

  // Default configuration for new providers
  const createDefaultConfig = (provider: AIProvider): AIConfiguration => ({
    provider,
    model: getDefaultModel(provider),
    parameters: {
      temperature: 0.7,
      maxTokens: 2000,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0
    }
  });

  const getDefaultModel = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai': return 'gpt-4';
      case 'anthropic': return 'claude-3-opus-20240229';
      case 'google': return 'gemini-pro';
      case 'custom': return '';
      default: return '';
    }
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'custom': return '⚙️';
      default: return '🤖';
    }
  };

  const handleTestConfiguration = async (config: AIConfiguration) => {
    const configKey = `${config.provider}-${config.model}`;
    setIsTesting(prev => ({ ...prev, [configKey]: true }));
    
    try {
      const isValid = await onTestConfiguration(config);
      setTestResults(prev => ({ ...prev, [configKey]: isValid }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [configKey]: false }));
    } finally {
      setIsTesting(prev => ({ ...prev, [configKey]: false }));
    }
  };

  const handleSaveConfiguration = () => {
    if (selectedConfig) {
      onSaveConfiguration(selectedConfig);
      setIsEditing(false);
      setSelectedConfig(null);
    }
  };

  const addNewConfiguration = (provider: AIProvider) => {
    const newConfig = createDefaultConfig(provider);
    setSelectedConfig(newConfig);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Integration Settings</h2>
          <p className="text-muted-foreground">
            Configure AI providers and model parameters for prompt generation
          </p>
        </div>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">AI Providers</TabsTrigger>
          <TabsTrigger value="defaults">Default Settings</TabsTrigger>
          <TabsTrigger value="library">Tool Library</TabsTrigger>
        </TabsList>

        {/* AI Providers Tab */}
        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Providers List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Configured Providers</CardTitle>
                  <div className="flex gap-2">
                    <Select onValueChange={(value: AIProvider) => addNewConfiguration(value)}>
                      <SelectTrigger className="w-40">
                        <Plus className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Add Provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {configurations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Zap className="h-12 w-12 mx-auto mb-4" />
                    <p>No AI providers configured</p>
                    <p className="text-sm">Add a provider to get started</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {configurations.map((config, index) => {
                      const configKey = `${config.provider}-${config.model}`;
                      const testResult = testResults[configKey];
                      const testing = isTesting[configKey];

                      return (
                        <Card 
                          key={index}
                          className={`cursor-pointer transition-all ${
                            selectedConfig === config ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => {
                            setSelectedConfig(config);
                            setIsEditing(false);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">
                                  {getProviderIcon(config.provider)}
                                </span>
                                <div>
                                  <h4 className="font-medium capitalize">
                                    {config.provider}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {config.model}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {testResult !== undefined && (
                                  <div className="flex items-center gap-1">
                                    {testResult ? (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <XCircle className="h-4 w-4 text-red-500" />
                                    )}
                                  </div>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTestConfiguration(config);
                                  }}
                                  disabled={testing}
                                >
                                  <TestTube className="h-3 w-3" />
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteConfiguration(configKey);
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Configuration Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {selectedConfig ? 'Configuration Details' : 'Provider Details'}
                  </CardTitle>
                  {selectedConfig && !isEditing && (
                    <Button onClick={() => setIsEditing(true)}>
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {selectedConfig ? (
                  <ConfigurationEditor
                    config={selectedConfig}
                    isEditing={isEditing}
                    showApiKey={showApiKey}
                    onConfigChange={setSelectedConfig}
                    onToggleApiKeyVisibility={() => setShowApiKey(!showApiKey)}
                    onSave={handleSaveConfiguration}
                    onCancel={() => {
                      setIsEditing(false);
                      setSelectedConfig(null);
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4" />
                    <p>Select a provider to view configuration</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Default Settings Tab */}
        <TabsContent value="defaults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Default Prompt Engineering Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Default Prompting Method</Label>
                <Select defaultValue="instruction-tuning">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Default Temperature</Label>
                  <div className="mt-2">
                    <Slider defaultValue={[0.7]} max={2} min={0} step={0.1} />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Focused</span>
                      <span>Creative</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Default Max Tokens</Label>
                  <div className="mt-2">
                    <Slider defaultValue={[2000]} max={4000} min={100} step={100} />
                    <div className="flex justify-between text-sm text-muted-foreground mt-1">
                      <span>Short</span>
                      <span>Long</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-generate Context Summaries</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically create summaries for stage-to-stage context
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable AI Recommendations</Label>
                    <p className="text-sm text-muted-foreground">
                      Show intelligent suggestions for tools and methods
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cache Prompt Templates</Label>
                    <p className="text-sm text-muted-foreground">
                      Store frequently used templates for faster access
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tool Library Tab */}
        <TabsContent value="library" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Tool Instruction Library</CardTitle>
              <p className="text-sm text-muted-foreground">
                Predefined instruction sets for UX tools and collaboration platforms
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would be populated with tool instructions */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Tool instructions help AI understand how to generate prompts for specific UX tools and platforms.
                    These are automatically applied based on your selected frameworks and tools.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">UX Research Tools</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Instructions for user interviews, surveys, and usability testing
                      </p>
                      <Badge variant="outline">12 tools configured</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Design Tools</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Instructions for wireframing, prototyping, and design systems
                      </p>
                      <Badge variant="outline">8 tools configured</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Collaboration Platforms</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Instructions for Slack, Confluence, and project management tools
                      </p>
                      <Badge variant="outline">6 platforms configured</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium">Analytics Tools</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Instructions for metrics analysis and reporting tools
                      </p>
                      <Badge variant="outline">4 tools configured</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ConfigurationEditorProps {
  config: AIConfiguration;
  isEditing: boolean;
  showApiKey: boolean;
  onConfigChange: (config: AIConfiguration) => void;
  onToggleApiKeyVisibility: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ConfigurationEditor: React.FC<ConfigurationEditorProps> = ({
  config,
  isEditing,
  showApiKey,
  onConfigChange,
  onToggleApiKeyVisibility,
  onSave,
  onCancel
}) => {
  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div>
          <Label>Provider</Label>
          <p className="text-sm capitalize">{config.provider}</p>
        </div>
        
        <div>
          <Label>Model</Label>
          <p className="text-sm">{config.model}</p>
        </div>
        
        <div>
          <Label>API Key</Label>
          <p className="text-sm">
            {config.apiKey ? '••••••••••••••••' : 'Not configured'}
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Temperature</Label>
            <p className="text-sm">{config.parameters.temperature}</p>
          </div>
          <div>
            <Label>Max Tokens</Label>
            <p className="text-sm">{config.parameters.maxTokens}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          value={config.model}
          onChange={(e) => onConfigChange({ ...config, model: e.target.value })}
          placeholder="e.g., gpt-4, claude-3-opus-20240229"
        />
      </div>

      <div>
        <Label htmlFor="apiKey">API Key</Label>
        <div className="relative">
          <Input
            id="apiKey"
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey || ''}
            onChange={(e) => onConfigChange({ ...config, apiKey: e.target.value })}
            placeholder="Enter your API key"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={onToggleApiKeyVisibility}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {config.provider === 'custom' && (
        <div>
          <Label htmlFor="endpoint">API Endpoint</Label>
          <Input
            id="endpoint"
            value={config.endpoint || ''}
            onChange={(e) => onConfigChange({ ...config, endpoint: e.target.value })}
            placeholder="https://api.example.com/v1"
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Temperature: {config.parameters.temperature}</Label>
          <Slider
            value={[config.parameters.temperature]}
            onValueChange={([value]) => onConfigChange({
              ...config,
              parameters: { ...config.parameters, temperature: value }
            })}
            max={2}
            min={0}
            step={0.1}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Max Tokens: {config.parameters.maxTokens}</Label>
          <Slider
            value={[config.parameters.maxTokens]}
            onValueChange={([value]) => onConfigChange({
              ...config,
              parameters: { ...config.parameters, maxTokens: value }
            })}
            max={4000}
            min={100}
            step={100}
            className="mt-2"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={onSave}>Save Configuration</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};