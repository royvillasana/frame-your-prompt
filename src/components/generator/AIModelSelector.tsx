import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Brain, Star, Key } from "lucide-react";
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
  // OpenAI Models
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Rápido y eficiente para tareas generales de UX",
    freeLimit: 50,
    registeredLimit: 999999,
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
  // Google Gemini Models
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "Google",
    description: "Excelente para análisis detallados y creatividad",
    freeLimit: 50,
    registeredLimit: 999999,
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
  // Anthropic Claude Models
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Perfecto para tareas de UX complejas y análisis profundo",
    freeLimit: 50,
    registeredLimit: 999999,
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

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);

  // Auto-select first model with API key configured
  useEffect(() => {
    if (isRegistered && !selectedModel) {
      const configuredKeys = getConfiguredAPIKeys();
      if (configuredKeys.length > 0) {
        onModelSelect(configuredKeys[0]);
      }
    }
  }, [isRegistered, selectedModel, getConfiguredAPIKeys, onModelSelect]);

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">
          Seleccionar Modelo de IA
        </label>
        <Select value={selectedModel} onValueChange={onModelSelect} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un modelo de IA" />
          </SelectTrigger>
          <SelectContent>
            {AI_MODELS.map((model) => {
              const usage = getModelUsage(model.id);
              const userHasAPIKey = hasAPIKey(model.id);
              const premiumModels = [
                'gpt-4o', 'gpt-4.1', 'gpt-4.1-mini',
                'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro',
                'claude-3.5-haiku', 'claude-3.5-sonnet', 'claude-3.7-sonnet', 'claude-sonnet-4', 'claude-opus-4'
              ];
              const isPremium = premiumModels.includes(model.id);
              
              // Solo mostrar modelos premium si el usuario tiene la API key correspondiente
              const shouldShow = !isPremium || userHasAPIKey;
              
              if (!shouldShow) return null;
              
              return (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  disabled={!usage.can_use && !loading && !userHasAPIKey}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {model.icon}
                      <span>{model.name}</span>
                      {userHasAPIKey && (
                        <Key className="h-3 w-3 text-green-600" />
                      )}
                      {isPremium && (
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {userHasAPIKey && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Tu API
                        </Badge>
                      )}
                      {!isPremium && (
                        <Badge variant={usage.can_use ? "secondary" : "destructive"}>
                          {loading ? "..." : `${usage.remaining}/${usage.daily_limit}`}
                        </Badge>
                      )}
                      {isPremium && (
                        <Badge variant="secondary">
                          Ilimitado
                        </Badge>
                      )}
                      {!usage.can_use && !loading && !userHasAPIKey && (
                        <Zap className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {selectedModelData && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${selectedModelData.color}`} />
              <CardTitle className="text-base">{selectedModelData.name}</CardTitle>
              <Badge variant="outline">{selectedModelData.provider}</Badge>
              {hasAPIKey(selectedModel) && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Key className="h-3 w-3 mr-1" />
                  Usando tu API
                </Badge>
              )}
            </div>
            <CardDescription className="text-sm">
              {selectedModelData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Estado de uso:</span>
                <div className="flex items-center gap-2">
                  {loading ? (
                    <Badge variant="outline">Cargando...</Badge>
                  ) : (
                    <>
                      {hasAPIKey(selectedModel) ? (
                        <Badge variant="secondary" className="text-green-600">
                          Ilimitado con tu API
                        </Badge>
                      ) : (
                        <>
                          <Badge variant={getModelUsage(selectedModel).can_use ? "secondary" : "destructive"}>
                            {getModelUsage(selectedModel).current_usage}/{getModelUsage(selectedModel).daily_limit} usados
                          </Badge>
                          {!getModelUsage(selectedModel).can_use && (
                            <span className="text-destructive text-xs">Sin usos restantes</span>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {!isRegistered && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  💡 Regístrate para obtener uso ilimitado y configurar tus propias API keys
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};