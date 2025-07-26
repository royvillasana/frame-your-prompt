import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Brain, Star } from "lucide-react";
import { useAIUsage } from "@/hooks/useAIUsage";

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
  // Free models that actually work
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B (Gratuito)",
    provider: "Groq",
    description: "Modelo gratuito rápido y confiable para UX",
    freeLimit: 50,
    registeredLimit: 100,
    icon: <Zap className="h-4 w-4" />,
    color: "bg-green-500"
  },
  // Premium models (require API keys)
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Modelo premium rápido y eficiente (Requiere API Key de OpenAI)",
    freeLimit: 0,
    registeredLimit: 999,
    icon: <Sparkles className="h-4 w-4" />,
    color: "bg-blue-600"
  },
  {
    id: "llama-3.1-sonar-small-128k-online",
    name: "Perplexity Sonar Small",
    provider: "Perplexity AI",
    description: "Modelo con acceso a internet (Requiere API Key de Perplexity)",
    freeLimit: 0,
    registeredLimit: 50,
    icon: <Brain className="h-4 w-4" />,
    color: "bg-orange-500"
  }
];

interface AIModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
}

export const AIModelSelector = ({ selectedModel, onModelSelect, disabled }: AIModelSelectorProps) => {
  const { loading, isRegistered, getModelUsage } = useAIUsage();

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);

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
              return (
                <SelectItem 
                  key={model.id} 
                  value={model.id}
                  disabled={!usage.can_use && !loading}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      {model.icon}
                      <span>{model.name}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={usage.can_use ? "secondary" : "destructive"}>
                        {loading ? "..." : `${usage.remaining}/${usage.daily_limit}`}
                      </Badge>
                      {!usage.can_use && !loading && (
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
            </div>
            <CardDescription className="text-sm">
              {selectedModelData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Estado de uso hoy:</span>
                <div className="flex items-center gap-2">
                  {loading ? (
                    <Badge variant="outline">Cargando...</Badge>
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
                </div>
              </div>
              
              {!isRegistered && (
                <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                  💡 Regístrate para obtener límites mayores: hasta {selectedModelData.registeredLimit} prompts diarios
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};