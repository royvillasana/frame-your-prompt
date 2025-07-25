import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Users, ArrowRight } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started with UX prompts",
      features: [
        "Access to Design Thinking framework",
        "Basic prompt templates",
        "5 prompt generations per month", 
        "Copy to clipboard",
        "Community support"
      ],
      limitations: [
        "Limited framework access",
        "No custom variables",
        "No saved prompts",
        "Basic export options"
      ],
      cta: "Start Free",
      variant: "outline",
      popular: false
    },
    {
      name: "Pro",
      price: "19",
      description: "Full access for professional UX practitioners",
      features: [
        "All UX frameworks (Design Thinking, Lean UX, Double Diamond, etc.)",
        "Unlimited prompt generations", 
        "Advanced customization variables",
        "Save and organize prompts",
        "Export to PDF, Markdown, Notion",
        "Premium prompt templates",
        "Email support",
        "Early access to new features"
      ],
      limitations: [],
      cta: "Start Pro Trial",
      variant: "hero",
      popular: true
    },
    {
      name: "Team",
      price: "49",
      description: "Collaboration features for design teams",
      features: [
        "Everything in Pro",
        "Team collaboration workspace",
        "Shared prompt libraries",
        "Team member management",
        "Advanced analytics",
        "Custom branding",
        "Priority support",
        "Custom integrations"
      ],
      limitations: [],
      cta: "Contact Sales",
      variant: "premium",
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior UX Designer at TechCorp",
      content: "FramePromptly Pro has transformed our research process. The prompts are so much more relevant than generic templates.",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez", 
      role: "Product Manager at StartupX",
      content: "Even as a non-designer, I can create professional UX prompts. It's like having a UX consultant on demand.",
      avatar: "MR"
    },
    {
      name: "Emily Taylor",
      role: "Design Lead at Innovation Labs",
      content: "The team features are fantastic. We can share prompts across projects and maintain consistency.",
      avatar: "ET"
    }
  ];

  const faqs = [
    {
      question: "Can I switch between plans?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing."
    },
    {
      question: "Do you offer student discounts?",
      answer: "Yes! Students and educators get 50% off Pro plans. Contact us with your academic email for verification."
    },
    {
      question: "Is there a free trial for Pro?",
      answer: "Yes, we offer a 14-day free trial of Pro features. No credit card required to start."
    },
    {
      question: "Can I export my prompts?",
      answer: "Free users can copy prompts to clipboard. Pro users can export to PDF, Markdown, and integrate with Notion."
    },
    {
      question: "What frameworks do you support?",
      answer: "We support Design Thinking, Lean UX, Double Diamond, Google Design Sprint, Jobs-to-be-Done, and more frameworks are added regularly."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container px-4 max-w-6xl">
        
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Simple, Transparent Pricing
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Choose the perfect plan for your{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              UX workflow
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free and scale as your needs grow. All plans include core prompt generation features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`relative bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-primary/20 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-primary text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  variant={plan.variant as any} 
                  size="lg" 
                  className="w-full"
                  asChild
                >
                  <Link to={plan.name === "Team" ? "/contact" : "/signup"}>
                    {plan.cta}
                    {plan.name !== "Team" && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Link>
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {plan.name === "Free" ? "No credit card required" : 
                   plan.name === "Pro" ? "14-day free trial included" :
                   "Custom pricing available"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Compare Plans</h2>
          <Card className="bg-gradient-card shadow-medium overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Features</th>
                    <th className="text-center p-4 font-semibold">Free</th>
                    <th className="text-center p-4 font-semibold">Pro</th>
                    <th className="text-center p-4 font-semibold">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["UX Frameworks", "1", "All", "All"],
                    ["Monthly Prompt Generations", "5", "Unlimited", "Unlimited"],
                    ["Custom Variables", "✗", "✓", "✓"],
                    ["Save Prompts", "✗", "✓", "✓"],
                    ["Export Options", "Copy only", "PDF, Markdown, Notion", "PDF, Markdown, Notion"],
                    ["Team Collaboration", "✗", "✗", "✓"],
                    ["Analytics", "✗", "Basic", "Advanced"],
                    ["Support", "Community", "Email", "Priority"]
                  ].map(([feature, free, pro, team], index) => (
                    <tr key={index} className="border-t">
                      <td className="p-4 font-medium">{feature}</td>
                      <td className="p-4 text-center text-sm">{free}</td>
                      <td className="p-4 text-center text-sm">{pro}</td>
                      <td className="p-4 text-center text-sm">{team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Testimonials */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">What our users say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium">
                <CardContent className="p-6">
                  <p className="italic mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="bg-gradient-card shadow-medium">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-primary rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to accelerate your UX process?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of UX professionals using FramePromptly to create better prompts, faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Users className="mr-2 h-4 w-4" />
              Talk to Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;