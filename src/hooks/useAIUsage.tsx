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
        const limit = isRegistered ? model.registeredLimit : model.freeLimit;
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
    return usageData[modelId] || {
      current_usage: 0,
      remaining: isRegistered ? 
        AI_MODELS.find(m => m.id === modelId)?.registeredLimit || 5 : 5,
      daily_limit: isRegistered ? 
        AI_MODELS.find(m => m.id === modelId)?.registeredLimit || 5 : 5,
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