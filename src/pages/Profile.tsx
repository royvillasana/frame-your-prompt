import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Crown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type UserType = 'guest' | 'registered_free' | 'registered_premium';

const Profile = () => {
  const { user } = useAuth();
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>('guest');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user) return;
      
      // First get the profile with API key
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('openai_api_key')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Determine user type based on API key presence
      const hasApiKey = !!profileData?.openai_api_key;
      const userType: UserType = hasApiKey ? 'registered_premium' : 'registered_free';
      
      setUserType(userType);
      setOpenaiApiKey(profileData?.openai_api_key || "");
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error("Error loading profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          openai_api_key: openaiApiKey,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      toast.success("API key updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update API key");
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeInfo = () => {
    switch (userType) {
      case 'registered_premium':
        return {
          label: 'Premium Member',
          description: 'You have full access to all features',
          icon: <Crown className="h-4 w-4 text-yellow-500" />,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };
      case 'registered_free':
        return {
          label: 'Free Account',
          description: 'Upgrade to Premium for full access',
          icon: null,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        };
      default:
        return {
          label: 'Guest',
          description: 'Sign up to save your settings',
          icon: null,
          className: 'bg-gray-50 text-gray-700 border-gray-200'
        };
    }
  };

  const userTypeInfo = getUserTypeInfo();

  if (profileLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      {/* Account Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Account Status</CardTitle>
            <Badge className={`${userTypeInfo.className} flex items-center gap-1`}>
              {userTypeInfo.icon}
              {userTypeInfo.label}
            </Badge>
          </div>
          <CardDescription>
            {userTypeInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userType === 'registered_free' && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Upgrade to Premium</h4>
              <p className="text-sm text-blue-700 mb-3">
                Get unlimited access to all features and priority support by upgrading to our Premium plan.
              </p>
              <Button variant="outline" size="sm" onClick={() => (window.location.href = '/pricing')}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Settings</CardTitle>
          <CardDescription>
            Manage your API keys and integration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="openai-api-key">OpenAI API Key</Label>
                {userType === 'registered_premium' && (
                  <Badge variant="outline" className="text-xs">
                    Active
                  </Badge>
                )}
              </div>
              <div className="relative">
                <Input
                  id="openai-api-key"
                  type={showApiKey ? "text" : "password"}
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowApiKey(!showApiKey)}
                  aria-label={showApiKey ? "Hide API key" : "Show API key"}
                >
                  {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">
                Your API key is stored securely and only used for your requests.
              </p>
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              
              {userType === 'registered_premium' && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpenaiApiKey("");
                    toast.info("API key cleared. Don't forget to save changes!");
                  }}
                >
                  Clear Key
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
