import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap } from "lucide-react";
import { AI_MODELS } from "./AIModelSelector";

interface AILimitAlertProps {
  selectedModel: string;
  usage: any;
  onModelSelect: (modelId: string) => void;
}

export const AILimitAlert = ({ selectedModel, usage, onModelSelect }: AILimitAlertProps) => {
  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);
  const isFreeModel = selectedModelData?.freeLimit && selectedModelData.freeLimit > 0;
  
  // Solo mostrar si es un modelo gratuito y no puede usarse
  if (!isFreeModel || usage.can_use) {
    return null;
  }

  // Obtener modelos alternativos disponibles
  const alternativeModels = AI_MODELS.filter(model => {
    return model.freeLimit > 0 && model.id !== selectedModel;
  });

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="space-y-3">
        <div className="text-sm">
          <strong className="text-orange-800">
            Has alcanzado el límite diario para {selectedModelData?.name}
          </strong>
          <p className="text-orange-700 mt-1">
            Has usado {usage.current_usage} de {usage.daily_limit} prompts disponibles hoy.
          </p>
        </div>
        
        {alternativeModels.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-orange-700 font-medium">
              💡 Puedes probar con estos modelos gratuitos:
            </p>
            <div className="flex flex-wrap gap-2">
              {alternativeModels.slice(0, 3).map((model) => (
                <button
                  key={model.id}
                  onClick={() => onModelSelect(model.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-orange-100 hover:bg-orange-200 transition-colors"
                >
                  <Zap className="h-3 w-3 text-orange-600" />
                  <span className="text-sm text-orange-800">{model.name}</span>
                  <Badge variant="secondary" className="text-xs bg-orange-200 text-orange-800">
                    Gratis
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
          También puedes configurar tus propias API keys en el perfil para usar modelos premium sin límites.
        </div>
      </AlertDescription>
    </Alert>
  );
};