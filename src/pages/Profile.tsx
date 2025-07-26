import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Eye, EyeOff, User, FolderOpen } from "lucide-react";
import { ProjectsView } from "@/components/projects/ProjectsView";

const Profile = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [claudeApiKey, setClaudeApiKey] = useState("");
  const [showApiKeys, setShowApiKeys] = useState({
    openai: false,
    gemini: false,
    claude: false
  });
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setDisplayName(data.display_name || "");
        setOpenaiApiKey(data.openai_api_key || "");
        setGeminiApiKey(data.gemini_api_key || "");
        setClaudeApiKey(data.claude_api_key || "");
      }
    } catch (error: any) {
      toast.error("Error al cargar el perfil");
      console.error(error);
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
        .upsert({
          user_id: user.id,
          display_name: displayName,
          openai_api_key: openaiApiKey,
          gemini_api_key: geminiApiKey,
          claude_api_key: claudeApiKey,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success("Perfil actualizado exitosamente");
    } catch (error: any) {
      toast.error("Error al actualizar el perfil");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApiKeyVisibility = (provider: 'openai' | 'gemini' | 'claude') => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Cargando perfil...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and organize your UX projects
          </p>
        </div>

        <Tabs defaultValue="projects" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              My Projects
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Account Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-6">
            <ProjectsView />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-2xl">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your personal information and AI provider API keys
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>

                    {user && (
                      <>
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">AI API Keys</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure your personal API keys to use different AI models
                          </p>
                        </div>

                        {/* OpenAI API Key */}
                        <div className="space-y-2">
                          <Label htmlFor="openaiApiKey">
                            OpenAI API Key
                            <span className="text-sm text-muted-foreground ml-2">
                              (For GPT models)
                            </span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="openaiApiKey"
                              type={showApiKeys.openai ? "text" : "password"}
                              value={openaiApiKey}
                              onChange={(e) => setOpenaiApiKey(e.target.value)}
                              placeholder="sk-..."
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => toggleApiKeyVisibility('openai')}
                            >
                              {showApiKeys.openai ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get your API key at{" "}
                            <a 
                              href="https://platform.openai.com/api-keys" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              platform.openai.com/api-keys
                            </a>
                          </p>
                        </div>

                        {/* Gemini API Key */}
                        <div className="space-y-2">
                          <Label htmlFor="geminiApiKey">
                            Google Gemini API Key
                            <span className="text-sm text-muted-foreground ml-2">
                              (For Gemini models)
                            </span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="geminiApiKey"
                              type={showApiKeys.gemini ? "text" : "password"}
                              value={geminiApiKey}
                              onChange={(e) => setGeminiApiKey(e.target.value)}
                              placeholder="AIza..."
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => toggleApiKeyVisibility('gemini')}
                            >
                              {showApiKeys.gemini ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get your API key at{" "}
                            <a 
                              href="https://aistudio.google.com/app/apikey" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Google AI Studio
                            </a>
                          </p>
                        </div>

                        {/* Claude API Key */}
                        <div className="space-y-2">
                          <Label htmlFor="claudeApiKey">
                            Anthropic Claude API Key
                            <span className="text-sm text-muted-foreground ml-2">
                              (For Claude models)
                            </span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="claudeApiKey"
                              type={showApiKeys.claude ? "text" : "password"}
                              value={claudeApiKey}
                              onChange={(e) => setClaudeApiKey(e.target.value)}
                              placeholder="sk-ant-..."
                              className="pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => toggleApiKeyVisibility('claude')}
                            >
                              {showApiKeys.claude ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Get your API key at{" "}
                            <a 
                              href="https://console.anthropic.com/account/keys" 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Anthropic Console
                            </a>
                          </p>
                        </div>
                      </>
                    )}

                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;