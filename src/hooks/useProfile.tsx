import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  openai_api_key: string | null;
  gemini_api_key: string | null;
  claude_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  const getConfiguredAPIKeys = () => {
    if (!profile) return [];
    
    const keys = [];
    // Priorizar modelos más avanzados cuando hay API key configurada
    if (profile.openai_api_key) keys.push('gpt-4.1');
    if (profile.gemini_api_key) keys.push('gemini-2.5-pro');
    if (profile.claude_api_key) keys.push('claude-opus-4');
    
    return keys;
  };

  const getAvailableModelsForAPIKey = (apiKeyType: 'openai' | 'gemini' | 'claude') => {
    if (!profile) return [];
    
    switch (apiKeyType) {
      case 'openai':
        return profile.openai_api_key ? ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1', 'gpt-4.1-mini'] : [];
      case 'gemini':
        return profile.gemini_api_key ? ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'] : [];
      case 'claude':
        return profile.claude_api_key ? ['claude-3-haiku', 'claude-3.5-haiku', 'claude-3.5-sonnet', 'claude-3.7-sonnet', 'claude-sonnet-4', 'claude-opus-4'] : [];
      default:
        return [];
    }
  };

  const hasAPIKey = (modelId: string) => {
    if (!profile) return false;
    
    switch (modelId) {
      case 'gpt-4o-mini':
      case 'gpt-4o':
      case 'gpt-4.1':
      case 'gpt-4.1-mini':
        return !!profile.openai_api_key;
      case 'gemini-1.5-flash':
      case 'gemini-1.5-pro':
      case 'gemini-2.0-flash':
      case 'gemini-2.5-flash':
      case 'gemini-2.5-pro':
        return !!profile.gemini_api_key;
      case 'claude-3-haiku':
      case 'claude-3.5-haiku':
      case 'claude-3.5-sonnet':
      case 'claude-3.7-sonnet':
      case 'claude-sonnet-4':
      case 'claude-opus-4':
        return !!profile.claude_api_key;
      default:
        return false;
    }
  };

  return {
    profile,
    loading,
    getConfiguredAPIKeys,
    getAvailableModelsForAPIKey,
    hasAPIKey,
    refreshProfile: loadProfile
  };
};