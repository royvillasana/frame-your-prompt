import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Zap, Crown, User, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UsageData {
  can_use: boolean;
  remaining: number;
  monthly_limit: number;
  current_usage: number;
  user_type: 'guest' | 'registered_free' | 'registered_premium';
  reset_period: 'monthly';
}

export const UsageLimitCard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkUsage();
    }
  }, [user]);

  const checkUsage = async () => {
    try {
      // Check if user has API keys
      const { data: profile } = await supabase
        .from('profiles')
        .select('openai_api_key, perplexity_api_key')
        .eq('user_id', user?.id)
        .maybeSingle();

      const hasApiKey = !!(profile?.openai_api_key || profile?.perplexity_api_key);

      // Get usage info without incrementing counter
      const { data: usage } = await supabase
        .from('ai_usage')
        .select('*')
        .eq('user_id', user?.id)
        .eq('ai_model', 'gpt-4o-mini')
        .eq('last_reset_date', new Date().toISOString().split('T')[0])
        .maybeSingle();

      let userType: 'guest' | 'registered_free' | 'registered_premium' = 'registered_free';
      let monthlyLimit = 6;
      let currentUsage = usage?.prompts_used || 0;

      if (hasApiKey) {
        userType = 'registered_premium';
        monthlyLimit = 999999;
      } else {
        userType = 'registered_free';
        monthlyLimit = 6;
      }

      setUsageData({
        can_use: currentUsage < monthlyLimit,
        remaining: Math.max(0, monthlyLimit - currentUsage),
        monthly_limit: monthlyLimit,
        current_usage: currentUsage,
        user_type: userType,
        reset_period: 'monthly'
      });
    } catch (error) {
      console.error('Error checking usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !usageData) {
    return null;
  }

  const getTypeInfo = () => {
    switch (usageData.user_type) {
      case 'registered_premium':
        return {
          icon: <Crown className="h-4 w-4" />,
          label: "Premium Plan",
          color: "text-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          description: "Unlimited access with your API key"
        };
      case 'registered_free':
        return {
          icon: <User className="h-4 w-4" />,
          label: "Free",
          color: "text-blue-600",
          bgColor: "bg-blue-50 border-blue-200",
          description: "6 free monthly prompts"
        };
      case 'guest':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "Guest",
          color: "text-orange-600",
          bgColor: "bg-orange-50 border-orange-200",
          description: "2 monthly prompts for unregistered users"
        };
    }
  };

  const typeInfo = getTypeInfo();
  const usagePercentage = usageData.user_type === 'registered_premium' 
    ? 0 
    : (usageData.current_usage / usageData.monthly_limit) * 100;

  return (
    <Card className={`${typeInfo.bgColor} border-2`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={typeInfo.color}>{typeInfo.icon}</span>
            <CardTitle className="text-base">Plan {typeInfo.label}</CardTitle>
          </div>
          {usageData.user_type === 'registered_free' && (
            <Button 
              size="sm" 
              onClick={() => navigate('/profile')}
              className="gap-1"
            >
              <Zap className="h-3 w-3" />
              Upgrade
            </Button>
          )}
        </div>
        <CardDescription className="text-sm">
          {typeInfo.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {usageData.user_type !== 'registered_premium' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Prompts used this month</span>
              <Badge variant={usageData.can_use ? "secondary" : "destructive"}>
                {usageData.current_usage} / {usageData.monthly_limit}
              </Badge>
            </div>
            
            <Progress 
              value={usagePercentage} 
              className="h-2"
            />
            
            {!usageData.can_use && (
              <div className="text-xs text-muted-foreground">
                <p>You have reached your monthly limit. {usageData.user_type === 'registered_free' 
                  ? 'Configure an API key for unlimited access.' 
                  : 'Register to get more prompts.'}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Zap className="h-4 w-4" />
            <span>Unlimited access activated</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};