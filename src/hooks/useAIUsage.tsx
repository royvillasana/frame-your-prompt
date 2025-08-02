import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { get } from "@/utils/api";
import { supabase } from "@/integrations/supabase/client";
// Define AI models for usage tracking
const AI_MODELS = [
  {
    id: "llama-3.1-8b",
    name: "Llama 3.1 8B (Free)",
    provider: "Groq",
    description: "Fast and reliable free model for UX",
    freeLimit: 50,
    registeredLimit: 100,
    color: "bg-green-500"
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Fast and efficient premium model (Requires OpenAI API Key)",
    freeLimit: 0,
    registeredLimit: 999,
    color: "bg-blue-600"
  },
  {
    id: "llama-3.1-sonar-small-128k-online",
    name: "Perplexity Sonar Small",
    provider: "Perplexity AI",
    description: "Model with internet access (Requires Perplexity API Key)",
    freeLimit: 0,
    registeredLimit: 50,
    color: "bg-orange-500"
  }
];

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
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await get<any[]>(
        `/rest/v1/ai_usage?select=ai_model,prompts_used,daily_limit,last_reset_date&user_id=eq.${user.id}&last_reset_date=eq.${today}`
      );

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