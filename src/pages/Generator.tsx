import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, RefreshCw, Save, Download, Sparkles, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Generator = () => {
  const { toast } = useToast();
  const [selectedFramework, setSelectedFramework] = useState("");
  const [selectedStage, setSelectedStage] = useState("");
  const [selectedTool, setSelectedTool] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  
  const [formData, setFormData] = useState({
    industry: "",
    productType: "",
    companySize: "",
    productScope: "",
    userProfile: "",
    demographics: "",
    lifecycleStage: ""
  });

  type FrameworkType = {
    name: string;
    stages: {
      [key: string]: {
        name: string;
        tools: string[];
      };
    };
  };

  const frameworks: { [key: string]: FrameworkType } = {
    "design-thinking": {
      name: "Design Thinking",
      stages: {
        "empathize": {
          name: "Empathize",
          tools: ["User Interviews", "Empathy Map", "Persona Development", "User Journey Map"]
        },
        "define": {
          name: "Define", 
          tools: ["Problem Statement", "Point of View", "How Might We", "User Needs Analysis"]
        },
        "ideate": {
          name: "Ideate",
          tools: ["Brainstorming", "Crazy 8s", "SCAMPER", "Mind Mapping"]
        },
        "prototype": {
          name: "Prototype",
          tools: ["Paper Prototype", "Digital Wireframes", "Interactive Prototype", "Storyboard"]
        },
        "test": {
          name: "Test",
          tools: ["Usability Testing", "A/B Testing", "User Feedback", "Heuristic Evaluation"]
        }
      }
    },
    "lean-ux": {
      name: "Lean UX",
      stages: {
        "think": {
          name: "Think",
          tools: ["Assumptions Mapping", "Proto-Personas", "Problem Hypothesis", "Feature Brainstorm"]
        },
        "make": {
          name: "Make",
          tools: ["MVP Design", "Wireframes", "Mockups", "Feature Sketches"]
        },
        "check": {
          name: "Check",
          tools: ["User Testing", "Analytics Review", "Feedback Collection", "Metric Analysis"]
        }
      }
    },
    "double-diamond": {
      name: "Double Diamond",
      stages: {
        "discover": {
          name: "Discover",
          tools: ["User Research", "Market Analysis", "Stakeholder Interviews", "Desk Research"]
        },
        "define": {
          name: "Define",
          tools: ["Problem Definition", "User Needs", "Design Brief", "Success Metrics"]
        },
        "develop": {
          name: "Develop", 
          tools: ["Concept Development", "Prototyping", "Design Iterations", "Solution Exploration"]
        },
        "deliver": {
          name: "Deliver",
          tools: ["Final Design", "Testing", "Implementation", "Launch Planning"]
        }
      }
    }
  };

  const industries = [
    "HealthTech", "FinTech", "EdTech", "E-commerce", "SaaS", "Gaming", 
    "Travel", "Real Estate", "Food & Beverage", "Automotive", "Other"
  ];

  const productTypes = [
    "Mobile App", "Web App", "Website", "Desktop Software", "IoT Device", 
    "Physical Product", "Service Platform", "Marketplace", "Other"
  ];

  const companySizes = ["Startup", "Small (1-50)", "Medium (51-200)", "Large (201-1000)", "Enterprise (1000+)"];
  const productScopes = ["Local", "National", "Global"];
  const userProfiles = ["B2B", "B2C", "B2B2C", "Internal Tool"];
  const lifecycleStages = ["Ideation", "MVP", "Growth", "Maturity", "Maintenance"];

  const generatePrompt = () => {
    if (!selectedFramework || !selectedStage || !selectedTool) {
      toast({
        title: "Missing Information",
        description: "Please select framework, stage, and tool first.",
        variant: "destructive"
      });
      return;
    }

    const framework = frameworks[selectedFramework];
    const stage = framework?.stages[selectedStage];
    
    let basePrompt = `Generate 5 ${selectedTool.toLowerCase()} prompts for the ${stage?.name} stage of the ${framework?.name} framework.`;
    
    if (formData.companySize && formData.industry) {
      basePrompt += ` This is for a ${formData.companySize.toLowerCase()} company in the ${formData.industry} sector`;
    }
    
    if (formData.productType) {
      basePrompt += `, offering a ${formData.productType.toLowerCase()}`;
    }
    
    if (formData.productScope) {
      basePrompt += ` with ${formData.productScope.toLowerCase()} reach`;
    }
    
    if (formData.lifecycleStage) {
      basePrompt += `. The product is currently in the ${formData.lifecycleStage.toLowerCase()} phase`;
    }
    
    if (formData.userProfile) {
      basePrompt += `, targeting ${formData.userProfile} users`;
    }
    
    if (formData.demographics) {
      basePrompt += ` with demographics such as ${formData.demographics}`;
    }

    basePrompt += ". Make the prompts specific, actionable, and ready to use with AI tools like ChatGPT or Claude.";

    setGeneratedPrompt(basePrompt);
    
    toast({
      title: "Prompt Generated!",
      description: "Your custom UX prompt has been created.",
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard.",
    });
  };

  const getCurrentStages = () => {
    if (!selectedFramework) return [];
    const framework = frameworks[selectedFramework];
    return Object.entries(framework?.stages || {});
  };

  const getCurrentTools = () => {
    if (!selectedFramework || !selectedStage) return [];
    const framework = frameworks[selectedFramework];
    const stage = framework?.stages[selectedStage];
    return stage?.tools || [];
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Prompt Generator</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Generate AI-powered UX prompts tailored to your framework, stage, and business context
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
              <CardDescription>
                Set up your UX framework and project context
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Framework Selection */}
              <div className="space-y-2">
                <Label htmlFor="framework">UX Framework</Label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your framework" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(frameworks).map(([key, framework]) => (
                      <SelectItem key={key} value={key}>
                        {framework.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stage Selection */}
              <div className="space-y-2">
                <Label htmlFor="stage">Framework Stage</Label>
                <Select 
                  value={selectedStage} 
                  onValueChange={setSelectedStage}
                  disabled={!selectedFramework}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentStages().map(([key, stage]) => (
                      <SelectItem key={key} value={key}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tool Selection */}
              <div className="space-y-2">
                <Label htmlFor="tool">UX Tool</Label>
                <Select 
                  value={selectedTool} 
                  onValueChange={setSelectedTool}
                  disabled={!selectedStage}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select UX tool" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCurrentTools().map((tool) => (
                      <SelectItem key={tool} value={tool}>
                        {tool}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Context Variables */}
              <div className="space-y-4">
                <h3 className="font-semibold">Project Context</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Industry</Label>
                    <Select value={formData.industry} onValueChange={(value) => setFormData({...formData, industry: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Type</Label>
                    <Select value={formData.productType} onValueChange={(value) => setFormData({...formData, productType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select product type" />
                      </SelectTrigger>
                      <SelectContent>
                        {productTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Company Size</Label>
                    <Select value={formData.companySize} onValueChange={(value) => setFormData({...formData, companySize: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent>
                        {companySizes.map((size) => (
                          <SelectItem key={size} value={size}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Product Scope</Label>
                    <Select value={formData.productScope} onValueChange={(value) => setFormData({...formData, productScope: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                      <SelectContent>
                        {productScopes.map((scope) => (
                          <SelectItem key={scope} value={scope}>
                            {scope}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>User Profile</Label>
                    <Select value={formData.userProfile} onValueChange={(value) => setFormData({...formData, userProfile: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        {userProfiles.map((profile) => (
                          <SelectItem key={profile} value={profile}>
                            {profile}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Lifecycle Stage</Label>
                    <Select value={formData.lifecycleStage} onValueChange={(value) => setFormData({...formData, lifecycleStage: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {lifecycleStages.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Demographics (Optional)</Label>
                  <Input 
                    placeholder="e.g., 25-45 years old, urban professionals, tech-savvy"
                    value={formData.demographics}
                    onChange={(e) => setFormData({...formData, demographics: e.target.value})}
                  />
                </div>
              </div>

              <Button onClick={generatePrompt} className="w-full" size="lg">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Prompt
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <Card className="bg-gradient-card shadow-medium">
            <CardHeader>
              <CardTitle>Generated Prompt</CardTitle>
              <CardDescription>
                Your custom AI prompt ready to use with ChatGPT, Claude, or other AI tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedPrompt ? (
                <>
                  <div className="bg-muted p-4 rounded-lg">
                    <Textarea 
                      value={generatedPrompt}
                      onChange={(e) => setGeneratedPrompt(e.target.value)}
                      className="min-h-[200px] bg-transparent border-0 p-0 resize-none"
                      placeholder="Your generated prompt will appear here..."
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={copyToClipboard} variant="outline" size="sm">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                    <Button onClick={generatePrompt} variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button variant="outline" size="sm">
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                  </div>

                  <div className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedFramework && <Badge variant="secondary">
                        {frameworks[selectedFramework]?.name}
                      </Badge>}
                      {selectedStage && <Badge variant="outline">
                        {frameworks[selectedFramework]?.stages[selectedStage]?.name}
                      </Badge>}
                      {selectedTool && <Badge variant="outline">{selectedTool}</Badge>}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>Configure your framework and context to generate a custom prompt</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Generator;