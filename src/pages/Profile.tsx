import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mi Perfil</CardTitle>
            <CardDescription>
              Configura tu información personal y API keys de diferentes proveedores de IA
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
                <Label htmlFor="displayName">Nombre para mostrar</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>

              {user && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">API Keys de IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Configura tus API keys personales para usar diferentes modelos de IA
                    </p>
                  </div>

                  {/* OpenAI API Key */}
                  <div className="space-y-2">
                    <Label htmlFor="openaiApiKey">
                      API Key de OpenAI
                      <span className="text-sm text-muted-foreground ml-2">
                        (Para GPT-4o-mini)
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
                      Obtén tu API key en{" "}
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
                      API Key de Google Gemini
                      <span className="text-sm text-muted-foreground ml-2">
                        (Para Gemini 1.5 Flash)
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
                      Obtén tu API key en{" "}
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
                      API Key de Anthropic Claude
                      <span className="text-sm text-muted-foreground ml-2">
                        (Para Claude 3 Haiku)
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
                      Obtén tu API key en{" "}
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
                {loading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;