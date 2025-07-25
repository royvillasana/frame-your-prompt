import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, User, ArrowRight, Lightbulb, Target, Users2 } from "lucide-react";

const Learn = () => {
  const featuredArticles = [
    {
      id: 1,
      title: "How to Use Design Thinking with AI Prompts",
      excerpt: "Learn how to leverage AI-powered prompts to enhance each stage of the Design Thinking process, from empathy to testing.",
      author: "Sarah Chen",
      readTime: "8 min read",
      category: "Design Thinking",
      image: "🧠",
      tags: ["Design Thinking", "AI", "Empathy", "Ideation"]
    },
    {
      id: 2,
      title: "Best Prompts for UX Research in 2024",
      excerpt: "Discover the most effective prompt patterns for conducting user interviews, surveys, and usability testing with AI assistance.",
      author: "Marcus Rodriguez",
      readTime: "6 min read",
      category: "Research",
      image: "🔍",
      tags: ["Research", "User Interviews", "Surveys", "AI"]
    },
    {
      id: 3,
      title: "Prompt Engineering for Product Teams",
      excerpt: "A comprehensive guide to creating effective prompts that align with your product strategy and business objectives.",
      author: "Emily Taylor",
      readTime: "12 min read",
      category: "Strategy",
      image: "⚡",
      tags: ["Product Strategy", "Prompts", "Team Collaboration"]
    }
  ];

  const resources = [
    {
      title: "UX Framework Comparison Guide",
      description: "Compare Design Thinking, Lean UX, Double Diamond, and more to choose the right approach for your project.",
      icon: <Target className="h-6 w-6" />,
      category: "Frameworks"
    },
    {
      title: "AI Prompt Writing Best Practices",
      description: "Learn the principles of effective prompt engineering specifically for UX and design workflows.",
      icon: <Lightbulb className="h-6 w-6" />,
      category: "AI & Prompts"
    },
    {
      title: "Team Collaboration Templates",
      description: "Ready-to-use templates and workshops for introducing AI prompts to your design team.",
      icon: <Users2 className="h-6 w-6" />,
      category: "Team Resources"
    }
  ];

  const tutorials = [
    {
      title: "Getting Started with FramePromptly",
      duration: "5 min",
      description: "Quick tour of the platform and your first prompt generation"
    },
    {
      title: "Advanced Context Variables",
      duration: "8 min", 
      description: "Master demographic and business context customization"
    },
    {
      title: "Integrating with Your UX Workflow",
      duration: "12 min",
      description: "How to incorporate AI prompts into your existing design process"
    },
    {
      title: "Team Setup and Collaboration",
      duration: "10 min",
      description: "Set up shared libraries and collaborate with your team"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Learn & Resources</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Master AI-powered UX prompts with our guides, tutorials, and best practices
          </p>
        </div>

        {/* Featured Articles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 group cursor-pointer">
                <CardHeader>
                  <div className="text-4xl mb-4">{article.image}</div>
                  <div className="space-y-2">
                    <Badge variant="secondary" className="w-fit">
                      {article.category}
                    </Badge>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription>{article.excerpt}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {article.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {article.author}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {article.readTime}
                    </div>
                  </div>
                  
                  <Button variant="ghost" className="w-full group-hover:bg-primary/10 transition-colors">
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Start Tutorials */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Quick Start Tutorials</h2>
            <Button variant="outline">
              View All Tutorials
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                      {tutorial.duration}
                    </Badge>
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">{index + 1}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {tutorial.description}
                  </p>
                  
                  <Button variant="ghost" size="sm" className="group-hover:bg-primary/10 transition-colors">
                    Start Tutorial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Resource Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Resource Categories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 group cursor-pointer">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    {resource.icon}
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {resource.category}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center mb-4">
                    {resource.description}
                  </CardDescription>
                  <Button variant="outline" className="w-full group-hover:bg-primary/10 transition-colors">
                    Explore Resources
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section>
          <Card className="bg-gradient-primary text-white shadow-glow">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Get the latest UX prompts, tutorials, and AI insights delivered to your inbox every week.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
                />
                <Button variant="secondary" className="whitespace-nowrap">
                  Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm opacity-75 mt-4">
                Join 5,000+ UX professionals. Unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Learn;