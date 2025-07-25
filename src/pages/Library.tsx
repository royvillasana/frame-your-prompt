import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Search, Filter, BookOpen, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Library = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFramework, setSelectedFramework] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIndustry, setSelectedIndustry] = useState("all");

  const promptTemplates = [
    {
      id: 1,
      title: "E-commerce User Interview Questions",
      description: "Comprehensive interview questions for understanding online shopping behaviors and pain points",
      framework: "Design Thinking",
      stage: "Empathize",
      tool: "User Interviews",
      industry: "E-commerce",
      tags: ["B2C", "Research", "Shopping"],
      prompt: "Generate 15 user interview questions for understanding e-commerce customer behavior. Focus on their shopping journey, pain points, decision-making process, and preferred features. Include questions about mobile vs desktop usage, payment preferences, and post-purchase experience.",
      preview: "1. Can you walk me through your last online shopping experience? 2. What factors influence your decision to shop online vs in-store? 3. What's the most frustrating part of online shopping for you?..."
    },
    {
      id: 2,
      title: "SaaS Empathy Map Generation",
      description: "Create detailed empathy maps for B2B SaaS users to understand their thoughts, feelings, and motivations",
      framework: "Design Thinking", 
      stage: "Empathize",
      tool: "Empathy Map",
      industry: "SaaS",
      tags: ["B2B", "Enterprise", "Software"],
      prompt: "Create an empathy map for B2B SaaS users in the project management space. Include what they think, feel, see, say, do, and their pains and gains. Focus on team leads and project managers who need to coordinate remote teams and track project progress.",
      preview: "THINKS: 'I need better visibility into team progress' 'These tools are too complex' 'We're missing deadlines'... FEELS: Overwhelmed by multiple tools, frustrated with lack of integration..."
    },
    {
      id: 3,
      title: "Mobile App Journey Mapping",
      description: "Map user journeys for mobile applications from discovery to long-term engagement",
      framework: "Design Thinking",
      stage: "Define",
      tool: "User Journey Map",
      industry: "Mobile App",
      tags: ["Mobile", "B2C", "Journey"],
      prompt: "Create a comprehensive user journey map for a fitness tracking mobile app. Include stages from awareness and download to daily usage and long-term retention. Identify touchpoints, emotions, pain points, and opportunities at each stage.",
      preview: "AWARENESS STAGE: User sees social media ad → visits app store → reads reviews... EMOTIONS: Curious, skeptical, hopeful... PAIN POINTS: Too many fitness apps to choose from..."
    },
    {
      id: 4,
      title: "FinTech Ideation Prompts", 
      description: "Brainstorming prompts for financial technology solutions targeting different user segments",
      framework: "Design Thinking",
      stage: "Ideate",
      tool: "Brainstorming",
      industry: "FinTech",
      tags: ["B2C", "Innovation", "Finance"],
      prompt: "Generate 20 innovative ideas for a personal finance app targeting young professionals aged 25-35. Focus on budgeting, saving, investing, and financial education. Consider gamification, social features, and integration with existing banking systems.",
      preview: "1. AI-powered spending coach that provides real-time budget alerts 2. Social saving challenges with friends and family 3. Micro-investing based on daily activities..."
    },
    {
      id: 5,
      title: "Healthcare Usability Testing",
      description: "Usability testing scenarios for healthcare applications with focus on accessibility and patient safety",
      framework: "Design Thinking",
      stage: "Test",
      tool: "Usability Testing",
      industry: "HealthTech",
      tags: ["B2C", "Healthcare", "Accessibility"],
      prompt: "Design usability testing scenarios for a telemedicine app used by patients aged 50+. Include tasks for scheduling appointments, video consultations, accessing medical records, and medication reminders. Focus on accessibility and ease of use.",
      preview: "Task 1: Schedule a video consultation with your primary care doctor for next week. Task 2: During the video call, share your current medication list with the doctor..."
    },
    {
      id: 6,
      title: "Lean UX Assumption Mapping",
      description: "Identify and prioritize assumptions for rapid product validation using Lean UX methodology",
      framework: "Lean UX",
      stage: "Think",
      tool: "Assumptions Mapping",
      industry: "Startup",
      tags: ["B2B", "MVP", "Validation"],
      prompt: "Create an assumptions map for a B2B collaboration tool targeting remote teams. Identify business assumptions, user assumptions, and technical assumptions. Prioritize them by risk and importance for MVP validation.",
      preview: "HIGH RISK ASSUMPTIONS: Users will pay $15/month for advanced features, Teams want integrated video calling, Small businesses need advanced analytics... MEDIUM RISK: Users prefer email notifications..."
    }
  ];

  const frameworks = ["Design Thinking", "Lean UX", "Double Diamond", "Google Design Sprint"];
  const stages = ["Empathize", "Define", "Ideate", "Prototype", "Test", "Think", "Make", "Check"];
  const industries = ["E-commerce", "SaaS", "FinTech", "HealthTech", "EdTech", "Gaming", "Startup"];

  const filteredPrompts = promptTemplates.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFramework = selectedFramework === "all" || prompt.framework === selectedFramework;
    const matchesStage = selectedStage === "all" || prompt.stage === selectedStage;
    const matchesIndustry = selectedIndustry === "all" || prompt.industry === selectedIndustry;

    return matchesSearch && matchesFramework && matchesStage && matchesIndustry;
  });

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Prompt Library</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover pre-built UX prompts organized by framework, stage, and industry
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-gradient-card shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search prompts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Framework</label>
                <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Frameworks</SelectItem>
                    {frameworks.map(framework => (
                      <SelectItem key={framework} value={framework}>{framework}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Stage</label>
                <Select value={selectedStage} onValueChange={setSelectedStage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredPrompts.length} of {promptTemplates.length} prompts
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {filteredPrompts.map((template) => (
              <Card key={template.id} className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">{template.framework}</Badge>
                    <Badge variant="secondary">{template.stage}</Badge>
                    <Badge variant="outline">{template.tool}</Badge>
                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                      {template.industry}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Preview:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {template.preview}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      onClick={() => copyPrompt(template.prompt)}
                      variant="default"
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Full Prompt
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPrompts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No prompts found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;