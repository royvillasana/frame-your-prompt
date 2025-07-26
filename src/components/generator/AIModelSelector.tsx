import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Zap, Brain, Star, Key, Clock, Infinity, AlertCircle } from "lucide-react";
import { useAIUsage } from "@/hooks/useAIUsage";
import { useProfile } from "@/hooks/useProfile";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  freeLimit: number;
  registeredLimit: number;
  icon: React.ReactNode;
  color: string;
}

export const AI_MODELS: AIModel[] = [
  // Modelos Gratuitos - disponibles sin API key
  {
    id: "gpt-3.5-turbo-free",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Modelo rápido y versátil para análisis UX general",
    freeLimit: 50,
    registeredLimit: 200,
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-green-500"
  },
  {
    id: "claude-3-haiku-free",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Respuestas rápidas y precisas para consultas de UX",
    freeLimit: 30,
    registeredLimit: 150,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-500"
  },
  {
    id: "gemini-1.5-flash-free",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "IA multimodal para análisis completo de experiencia",
    freeLimit: 40,
    registeredLimit: 180,
    icon: <Star className="h-4 w-4" />,
    color: "bg-blue-500"
  },
  {
    id: "deepseek-v3-free",
    name: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Modelo avanzado para insights técnicos y UX",
    freeLimit: 25,
    registeredLimit: 120,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-indigo-500"
  },
  // OpenAI Models - requieren API key
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Rápido y eficiente para tareas generales de UX",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-green-500"
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Modelo versátil de alta inteligencia para UX avanzado",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-green-600"
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    description: "Modelo más avanzado con mejoras en codificación y contexto largo",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-green-700"
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "OpenAI",
    description: "Versión optimizada de GPT-4.1 para mejor rendimiento",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-green-600"
  },
  // Google Gemini Models - requieren API key
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "Excelente para análisis detallados y creatividad",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Star className="h-4 w-4" />,
    color: "bg-blue-500"
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Modelo premium para razonamiento complejo en UX",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Star className="h-4 w-4" />,
    color: "bg-blue-600"
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Funciones de próxima generación con velocidad y streaming",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Star className="h-4 w-4" />,
    color: "bg-blue-700"
  },
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    description: "Mejor relación precio-rendimiento con pensamiento adaptativo",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Star className="h-4 w-4" />,
    color: "bg-blue-800"
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    description: "Modelo de pensamiento avanzado para problemas complejos de UX",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Star className="h-4 w-4" />,
    color: "bg-blue-900"
  },
  // Anthropic Claude Models - requieren API key
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Perfecto para tareas de UX complejas y análisis profundo",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-500"
  },
  {
    id: "claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    description: "Modelo más rápido con inteligencia a velocidades ultrarrápidas",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-600"
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Modelo inteligente anterior con alto nivel de capacidad",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-700"
  },
  {
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    description: "Modelo de alto rendimiento con pensamiento extendido",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-800"
  },
  {
    id: "claude-sonnet-4",
    name: "Claude Sonnet 4",
    provider: "Anthropic",
    description: "Modelo de alto rendimiento con razonamiento excepcional",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-900"
  },
  {
    id: "claude-opus-4",
    name: "Claude Opus 4",
    provider: "Anthropic",
    description: "El modelo más capaz e inteligente para UX avanzado",
    freeLimit: 0,
    registeredLimit: 0,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-purple-950"
  }
];

interface AIModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
}

export const AIModelSelector = ({ selectedModel, onModelSelect, disabled }: AIModelSelectorProps) => {
  const { loading, isRegistered, getModelUsage } = useAIUsage();
  const { hasAPIKey, getConfiguredAPIKeys, getAvailableModelsForAPIKey } = useProfile();
  const [activeTab, setActiveTab] = useState("free");

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);
  
  // Categorizar modelos
  const freeModels = AI_MODELS.filter(m => m.freeLimit > 0);
  const premiumModels = AI_MODELS.filter(m => m.freeLimit === 0);
  
  // Debug: log the models
  console.log('Free models count:', freeModels.length);
  console.log('Free models:', freeModels.map(m => ({ id: m.id, name: m.name, freeLimit: m.freeLimit })));
  console.log('Loading state:', loading);
  console.log('User registered:', isRegistered);

  // Auto-select first available model
  useEffect(() => {
    if (!selectedModel) {
      // Priorizar modelos con API key configurada, luego modelos gratuitos
      const configuredKeys = getConfiguredAPIKeys();
      if (configuredKeys.length > 0) {
        onModelSelect(configuredKeys[0]);
        setActiveTab("premium");
      } else {
        // Seleccionar primer modelo gratuito disponible
        if (freeModels.length > 0) {
          onModelSelect(freeModels[0].id);
          setActiveTab("free");
        }
      }
    } else {
      // Actualizar tab activo basado en el modelo seleccionado
      const isFree = freeModels.some(m => m.id === selectedModel);
      setActiveTab(isFree ? "free" : "premium");
    }
  }, [selectedModel, getConfiguredAPIKeys, onModelSelect, freeModels]);

  const renderModelCard = (model: AIModel) => {
    const usage = getModelUsage(model.id);
    const userHasAPIKey = hasAPIKey(model.id);
    const isFreeModel = model.freeLimit > 0;
    const isSelected = selectedModel === model.id;
    const progressValue = usage.daily_limit > 0 ? (usage.current_usage / usage.daily_limit) * 100 : 0;

    return (
      <Card 
        key={model.id}
        className={`cursor-pointer transition-all hover:shadow-md ${
          isSelected 
            ? 'ring-2 ring-primary shadow-md' 
            : 'hover:ring-1 hover:ring-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !disabled && onModelSelect(model.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${model.color} flex items-center justify-center text-white`}>
                {model.icon}
              </div>
              <div>
                <CardTitle className="text-sm">{model.name}</CardTitle>
                <CardDescription className="text-xs">{model.provider}</CardDescription>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {isFreeModel && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  <Zap className="h-3 w-3 mr-1" />
                  Gratis
                </Badge>
              )}
              {!isFreeModel && userHasAPIKey && (
                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                  <Key className="h-3 w-3 mr-1" />
                  Tu API
                </Badge>
              )}
              {!isFreeModel && !userHasAPIKey && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  <Key className="h-3 w-3 mr-1" />
                  API Key
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground mb-3">{model.description}</p>
          
          {/* Progress bar y límites para modelos gratuitos */}
          {isFreeModel && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Uso diario</span>
                <span className={usage.can_use ? "text-green-600" : "text-destructive"}>
                  {loading ? "..." : `${usage.current_usage}/${usage.daily_limit}`}
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
              {!usage.can_use && (
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>Límite alcanzado</span>
                </div>
              )}
            </div>
          )}
          
          {/* Estado para modelos premium */}
          {!isFreeModel && (
            <div className="flex items-center gap-2 text-xs">
              {userHasAPIKey ? (
                <>
                  <Infinity className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">Uso ilimitado</span>
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Requiere configuración</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-3 block">
          Seleccionar Modelo de IA
        </label>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="free" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Modelos Gratuitos
              <Badge variant="secondary" className="ml-1">{freeModels.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="premium" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Modelos Premium
              <Badge variant="secondary" className="ml-1">{premiumModels.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="free" className="mt-4">
            <div className="grid gap-3">
              {freeModels.map(renderModelCard)}
            </div>
            <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-orange-600 mt-0.5" />
                <div className="text-xs text-orange-700">
                  <p className="font-medium">Modelos Open Source Gratuitos</p>
                  <p>Límites diarios por modelo. Sin costo adicional.</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="premium" className="mt-4">
            <div className="grid gap-3">
              {premiumModels.map(renderModelCard)}
            </div>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Key className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-medium">Modelos Premium</p>
                  <p>Requieren API key propia. Uso ilimitado con tus créditos.</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {selectedModelData && (
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${selectedModelData.color} flex items-center justify-center text-white`}>
                {selectedModelData.icon}
              </div>
              <div>
                <CardTitle className="text-base">{selectedModelData.name}</CardTitle>
                <CardDescription className="text-sm">{selectedModelData.provider}</CardDescription>
              </div>
              <div className="ml-auto">
                {selectedModelData.freeLimit > 0 ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Gratis
                  </Badge>
                ) : hasAPIKey(selectedModel) ? (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <Key className="h-3 w-3 mr-1" />
                    Tu API
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Key className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground mb-3">{selectedModelData.description}</p>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Estado de uso:</span>
              <div className="flex items-center gap-2">
                {loading ? (
                  <Badge variant="outline">Cargando...</Badge>
                ) : (
                  <>
                    {hasAPIKey(selectedModel) ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Infinity className="h-4 w-4" />
                        <span className="font-medium">Ilimitado</span>
                      </div>
                    ) : selectedModelData.freeLimit > 0 ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={getModelUsage(selectedModel).can_use ? "secondary" : "destructive"}>
                          {getModelUsage(selectedModel).remaining}/{getModelUsage(selectedModel).daily_limit} restantes
                        </Badge>
                        {!getModelUsage(selectedModel).can_use && (
                          <span className="text-destructive text-xs">Límite alcanzado</span>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">
                        Requiere API Key
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {!isRegistered && (
              <div className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                💡 Regístrate para obtener uso ilimitado y configurar tus propias API keys
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};