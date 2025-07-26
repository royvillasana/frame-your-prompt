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
    if (profile.openai_api_key) keys.push('gpt-4o-mini');
    if (profile.gemini_api_key) keys.push('gemini-1.5-flash');
    if (profile.claude_api_key) keys.push('claude-3-haiku');
    
    return keys;
  };

  const hasAPIKey = (modelId: string) => {
    if (!profile) return false;
    
    switch (modelId) {
      case 'gpt-4o-mini':
        return !!profile.openai_api_key;
      case 'gemini-1.5-flash':
        return !!profile.gemini_api_key;
      case 'claude-3-haiku':
        return !!profile.claude_api_key;
      default:
        return false;
    }
  };

  return {
    profile,
    loading,
    getConfiguredAPIKeys,
    hasAPIKey,
    refreshProfile: loadProfile
  };
};