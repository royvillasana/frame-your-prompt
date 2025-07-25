import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Brain, 
  Zap, 
  Target, 
  Users, 
  Sparkles, 
  CheckCircle,
  Play,
  BookOpen,
  Layers
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const HomePage = () => {
  const frameworks = [
    "Design Thinking",
    "Lean UX", 
    "Double Diamond",
    "Google Design Sprint",
    "Jobs-to-be-Done"
  ];

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "AI-Powered Prompts",
      description: "Generate intelligent, context-aware prompts tailored to your specific UX framework and project needs."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Framework-Specific",
      description: "Built for popular UX frameworks including Design Thinking, Lean UX, Double Diamond, and more."
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Stage-Based Workflow",
      description: "Navigate through framework stages with prompts designed for empathy mapping, ideation, prototyping, and testing."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Context Variables",
      description: "Customize prompts with industry, product type, user demographics, and company size for maximum relevance."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior UX Designer at TechCorp",
      content: "FramePromptly has transformed how we approach user research. The AI-generated prompts are incredibly relevant and save us hours of preparation time."
    },
    {
      name: "Marcus Rodriguez",
      role: "Product Manager at StartupX",
      content: "As a non-designer, this tool helps me create meaningful prompts for our UX activities. It's like having a UX expert on demand."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        <div className="container px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI-Powered UX Prompts
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Generate AI-powered{" "}
                  <span className="bg-gradient-primary bg-clip-text text-transparent">
                    UX prompts
                  </span>{" "}
                  tailored to your framework
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Accelerate your UX process using intelligent, structured, editable AI prompts designed for Design Thinking, Lean UX, and other popular frameworks.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/generator">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto">
                    Start Prompting Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/library">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Prompt Library
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Supports:</span>
                {frameworks.map((framework) => (
                  <Badge key={framework} variant="outline" className="text-xs">
                    {framework}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full"></div>
              <img 
                src={heroImage} 
                alt="UX Design Workspace" 
                className="relative z-10 rounded-2xl shadow-strong w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to generate perfect UX prompts for your project
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Choose Framework",
                description: "Select your UX framework like Design Thinking or Lean UX"
              },
              {
                step: "2", 
                title: "Pick Stage",
                description: "Choose the stage like Empathize, Ideate, or Prototype"
              },
              {
                step: "3",
                title: "Select Tool",
                description: "Pick the UX tool like Empathy Map or Journey Map"
              },
              {
                step: "4",
                title: "Add Context",
                description: "Customize with industry, product type, and user details"
              }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {item.step}
                </div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-32 bg-muted/30">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Powerful Features for UX Teams</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to generate professional UX prompts that drive results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-32">
        <div className="container px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Loved by UX Professionals</h2>
            <p className="text-xl text-muted-foreground">
              See what designers and product teams are saying
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium">
                <CardContent className="p-8">
                  <p className="text-lg mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-primary">
        <div className="container px-4 text-center text-white">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ready to accelerate your UX process?
            </h2>
            <p className="text-xl opacity-90">
              Join thousands of UX professionals using FramePromptly to create better prompts, faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/generator">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Start Free Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Free forever plan
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;