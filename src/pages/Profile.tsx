import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Eye, EyeOff, Crown, Loader2, Camera, User, Save, X, Edit2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type UserType = 'guest' | 'registered_free' | 'registered_premium';

const Profile = () => {
  const { user } = useAuth();
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [userType, setUserType] = useState<UserType>('guest');
  const [profileName, setProfileName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempProfileName, setTempProfileName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load profile image from localStorage if it exists
    const savedImage = localStorage.getItem('profileImage');
    if (savedImage) {
      setProfileImage(savedImage);
    }
    
    if (user) {
      loadProfile();
      // Set initial profile name from user's email
      if (user.email) {
        const nameFromEmail = user.email.split('@')[0];
        setProfileName(nameFromEmail);
        setTempProfileName(nameFromEmail);
      }
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      if (!user) return;
      
      // First get the profile with API key
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('openai_api_key, display_name')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Determine user type based on API key presence
      const hasApiKey = !!profileData?.openai_api_key;
      const userType: UserType = hasApiKey ? 'registered_premium' : 'registered_free';
      
      setUserType(userType);
      setOpenaiApiKey(profileData?.openai_api_key || "");
      
      // Set profile name if available, otherwise use email username
      if (profileData?.display_name) {
        setProfileName(profileData.display_name);
        setTempProfileName(profileData.display_name);
      } else if (user.email) {
        const nameFromEmail = user.email.split('@')[0];
        setProfileName(nameFromEmail);
        setTempProfileName(nameFromEmail);
      }
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
          display_name: profileName,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (isEditingName) {
        setIsEditingName(false);
      }
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string;
      setProfileImage(imageDataUrl);
      // Save to localStorage
      localStorage.setItem('profileImage', imageDataUrl);
      toast.success('Profile image updated');
    };
    reader.readAsDataURL(file);
  };
  
  const removeProfileImage = () => {
    setProfileImage(null);
    localStorage.removeItem('profileImage');
    toast.info('Profile image removed');
  };
  
  const handleNameEdit = () => {
    setTempProfileName(profileName);
    setIsEditingName(true);
  };
  
  const saveNameEdit = () => {
    setProfileName(tempProfileName);
    setIsEditingName(false);
  };
  
  const cancelNameEdit = () => {
    setIsEditingName(false);
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
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
              <Avatar className="h-24 w-24 overflow-hidden">
                <AvatarImage 
                  src={profileImage || ''} 
                  className="h-full w-auto object-cover object-center"
                  style={{ minHeight: '100%', minWidth: '100%' }}
                />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl h-full w-full flex items-center justify-center">
                  {profileName ? profileName.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>
              <label 
                className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
                title="Change profile image"
              >
                <Camera className="h-5 w-5 text-gray-700" />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </label>
              {profileImage && (
                <button
                  onClick={removeProfileImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  title="Remove profile image"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="text-center">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempProfileName}
                    onChange={(e) => setTempProfileName(e.target.value)}
                    className="text-xl font-bold text-center"
                    autoFocus
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={saveNameEdit}
                    disabled={!tempProfileName.trim()}
                  >
                    <Save className="h-4 w-4 mr-1" /> Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={cancelNameEdit}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{profileName}</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-500 hover:text-gray-700"
                    onClick={handleNameEdit}
                    title="Edit name"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
              
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
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
