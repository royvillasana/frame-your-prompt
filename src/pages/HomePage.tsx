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
import { useEffect, useRef, useState } from "react";

function AnimatedBokehLavaLampCanvas({ className = "" }) {
  const canvasRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect mobile device
    const mobileCheck = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(mobileCheck);

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    let ctx = canvas.getContext('2d');
    let animationFrameId;

    // Helper function to draw a blurred circle using radial gradients
    const drawBlurredCircle = (ctx, x, y, radius, blur, color1, color2) => {
      // Save the current context state
      ctx.save();
      
      // Create a radial gradient for the blur effect
      const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, radius + blur
      );
      
      // Add color stops for the gradient
      gradient.addColorStop(0, color1);
      gradient.addColorStop(0.8, color2);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');
      
      // Draw the gradient
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius + blur, 0, Math.PI * 2);
      ctx.fill();
      
      // Restore the context state
      ctx.restore();
    };

    const rand = (min, max) => Math.random() * (max - min) + min;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 480; // Fixed height for hero banner
      ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = isMobile ? 'screen' : 'lighter';
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Adjust parameters based on device
    let count = isMobile ? 30 : 70; // Fewer particles on mobile
    let blur = isMobile ? [15, 35] : [30, 70]; // Reduced blur on mobile
    let radius = isMobile ? [5, 60] : [10, 120]; // Smaller radius on mobile
    
    let backgroundColors = [ '#000000', '#18181b' ]; // dark gray
    let colors = [
      [ '#002aff', "#009ff2" ],
      [ '#0054ff', '#27e49b' ], 
      [ '#202bc5' ,'#873dcc' ]
    ];

    ctx.clearRect( 0, 0, canvas.width, canvas.height );
    ctx.globalCompositeOperation = isMobile ? 'screen' : 'lighter';
    let grd = ctx.createLinearGradient(0, canvas.height, canvas.width, 0);
    grd.addColorStop(0, backgroundColors[0]);
    grd.addColorStop(1, backgroundColors[1]);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let items = [];
    let tempCount = count;
    while(tempCount--) {
      let thisRadius = rand( radius[0], radius[1] );
      let thisBlur = rand( blur[0], blur[1] );
      let x = rand( -100, canvas.width + 100 );
      let y = rand( -100, canvas.height + 100 );
      let colorIndex = Math.floor(rand(0, 299) / 100);
      let colorOne = colors[colorIndex][0];
      let colorTwo = colors[colorIndex][1];
      // Use the custom blur function
      drawBlurredCircle(
        ctx,
        x,
        y,
        thisRadius,
        thisBlur * 0.8, // Slightly reduce blur intensity for better performance
        colorOne,
        colorTwo
      );
      
      // Draw the main circle with less blur for better color
      ctx.beginPath();
      const grd = ctx.createLinearGradient(
        x - thisRadius / 2,
        y - thisRadius / 2,
        x + thisRadius,
        y + thisRadius
      );
      grd.addColorStop(0, colorOne);
      grd.addColorStop(1, colorTwo);
      ctx.fillStyle = grd;
      ctx.arc(x, y, thisRadius * 0.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.closePath();
      let directionX = Math.round(rand(-99, 99) / 100);
      let directionY = Math.round(rand(-99, 99) / 100);
      items.push({
        x: x,
        y: y,
        blur: thisBlur,
        radius: thisRadius,
        initialXDirection: directionX,
        initialYDirection: directionY,
        initialBlurDirection: directionX,
        colorOne: colorOne,
        colorTwo: colorTwo,
        gradient: [ x - thisRadius / 2, y - thisRadius / 2, x + thisRadius, y + thisRadius ],
      });
    }

    function changeCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let adjX = 2;
      let adjY = 2;
      let adjBlur = 1;
      items.forEach(function(item) {
        if(item.x + (item.initialXDirection * adjX) >= canvas.width && item.initialXDirection !== 0 || item.x + (item.initialXDirection * adjX) <= 0 && item.initialXDirection !== 0) {
          item.initialXDirection = item.initialXDirection * -1;
        }
        if(item.y + (item.initialYDirection * adjY) >= canvas.height && item.initialYDirection !== 0 || item.y + (item.initialYDirection * adjY) <= 0 && item.initialYDirection !== 0) {
          item.initialYDirection = item.initialYDirection * -1;
        }
        if(item.blur + (item.initialBlurDirection * adjBlur) >= radius[1] && item.initialBlurDirection !== 0 || item.blur + (item.initialBlurDirection * adjBlur) <= radius[0] && item.initialBlurDirection !== 0) {
          item.initialBlurDirection *= -1;
        }
        item.x += (item.initialXDirection * adjX);
        item.y += (item.initialYDirection * adjY);
        item.blur += (item.initialBlurDirection * adjBlur);
        ctx.beginPath();
        ctx.filter = `blur(${item.blur}px)`;
        let grd = ctx.createLinearGradient(item.gradient[0], item.gradient[1], item.gradient[2], item.gradient[3]);
        grd.addColorStop(0, item.colorOne);
        grd.addColorStop(1, item.colorTwo);
        ctx.fillStyle = grd;
        ctx.arc( item.x, item.y, item.radius, 0, Math.PI * 2 );
        ctx.fill();
        ctx.closePath();
      });
      animationFrameId = window.requestAnimationFrame(changeCanvas);
    }
    animationFrameId = window.requestAnimationFrame(changeCanvas);
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={"absolute left-0 top-0 w-full h-full object-cover z-0 " + className}
      aria-hidden="true"
      tabIndex={-1}
      style={{
        pointerEvents: 'none',
        minHeight: 480,
        // Improve mobile rendering
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        // Prevent white flashes on mobile
        backgroundColor: '#000000',
        // Optimize GPU acceleration
        willChange: 'transform',
        // Better image rendering
        imageRendering: isMobile ? 'crisp-edges' : 'auto'
      }}
    />
  );
}

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
      <section className="relative overflow-hidden bg-gradient-subtle" style={{ minHeight: 480 }}>
        {/* Dark blur overlay BELOW the canvas */}
        <div className="absolute inset-0 w-full h-full z-0 backdrop-blur-md" style={{ background: '#0a174eCC' }} aria-hidden="true" />
        {/* Animated background */}
        <AnimatedBokehLavaLampCanvas className="z-10" />
        <div className="container px-4 py-20 lg:py-32 relative z-20 flex items-center justify-center min-h-[480px]">
          <div className="w-full flex flex-col items-center justify-center text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="bg-primary/10 text-white border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered UX Prompts
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-white">
                Generate AI-powered{" "}
                <span
               className="bg-gradient-primary bg-clip-text text-transparent stroke-white-stroke"

                >
                  UX prompts
                </span>{" "}
                tailored to your framework
              </h1>
              <p className="text-xl text-white max-w-2xl mx-auto">
                Accelerate your UX process using intelligent, structured, editable AI prompts designed for Design Thinking, Lean UX, and other popular frameworks.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/generator">
                <Button
                  variant="hero"
                  size="lg"
                  className="w-full sm:w-auto stroke-white-stroke"
                  style={{
                    boxShadow: "0 0 0 2px #fff, 0 0 0 4px rgba(255,255,255,0.2)",
                    WebkitBoxShadow: "0 0 0 2px #fff, 0 0 0 4px rgba(255,255,255,0.2)"
                  }}
                >
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
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-sm text-white">Supports:</span>
              {frameworks.map((framework) => (
                <Badge key={framework} variant="outline" className="text-xs text-white border-white/30">
                  {framework}
                </Badge>
              ))}
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