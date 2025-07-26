import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AI_MODELS } from "@/components/generator/AIModelSelector";

interface UsageData {
  [modelId: string]: {
    current_usage: number;
    remaining: number;
    daily_limit: number;
    can_use: boolean;
  };
}

export const useAIUsage = () => {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData>({});
  const [loading, setLoading] = useState(true);

  const isRegistered = !!user;

  const fetchUsageData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ai_usage')
        .select('ai_model, prompts_used, daily_limit, last_reset_date')
        .eq('user_id', user.id)
        .eq('last_reset_date', new Date().toISOString().split('T')[0]);

      if (error) throw error;

      const usage: UsageData = {};
      
      AI_MODELS.forEach(model => {
        const modelUsage = data?.find(u => u.ai_model === model.id);
        const limit = isRegistered ? 999999 : 50; // Usuarios registrados tienen uso ilimitado, no registrados 50 prompts al mes
        const used = modelUsage?.prompts_used || 0;
        
        usage[model.id] = {
          current_usage: used,
          remaining: Math.max(0, limit - used),
          daily_limit: limit,
          can_use: used < limit
        };
      });

      setUsageData(usage);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [user, isRegistered]);

  const getModelUsage = (modelId: string) => {
    // Los modelos premium solo están disponibles con API key propia
    const premiumModels = ['gpt-4o', 'gemini-1.5-pro', 'claude-3.5-sonnet'];
    const isPremium = premiumModels.includes(modelId);
    
    if (isPremium) {
      return {
        current_usage: 0,
        remaining: 999999,
        daily_limit: 999999,
        can_use: true // Se validará la API key en el backend
      };
    }
    
    return usageData[modelId] || {
      current_usage: 0,
      remaining: isRegistered ? 999999 : 50,
      daily_limit: isRegistered ? 999999 : 50,
      can_use: true
    };
  };

  const getAvailableModels = () => {
    return AI_MODELS.filter(model => getModelUsage(model.id).can_use);
  };

  const refreshUsage = () => {
    fetchUsageData();
  };

  return {
    usageData,
    loading,
    isRegistered,
    getModelUsage,
    getAvailableModels,
    refreshUsage
  };
};