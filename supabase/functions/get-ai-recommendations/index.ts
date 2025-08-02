import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const frameworks = [
  "design-thinking",
  "double-diamond", 
  "lean-ux",
  "google-design-sprint",
  "human-centered-design",
  "jobs-to-be-done",
  "agile-ux",
  "ux-lifecycle",
  "ux-honeycomb",
  "user-centered-design",
  "heart-framework",
  "hooked-model"
];

// AI tools mapped to UX frameworks and stages
const aiToolsByFrameworkAndStage = {
  // Design Thinking
  'design-thinking': {
    'empathize': [
      { name: 'Miro AI', description: 'For collaborative empathy mapping and user research synthesis', bestFor: ['Empathy Maps', 'User Interviews', 'Personas'] },
      { name: 'Dovetail', description: 'For qualitative research analysis and insights generation', bestFor: ['User Research', 'Contextual Inquiry'] },
      { name: 'Notion AI', description: 'For organizing research notes and generating insights', bestFor: ['Research Synthesis', 'Personas'] },
      { name: 'ChatGPT', description: 'For analyzing research data and generating insights', bestFor: ['Research Analysis', 'Persona Creation'] }
    ],
    'define': [
      { name: 'Miro AI', description: 'For affinity diagramming and problem definition', bestFor: ['Affinity Mapping', 'Problem Definition'] },
      { name: 'Figma Jam', description: 'For collaborative problem space mapping', bestFor: ['Problem Framing', 'HMW Questions'] },
      { name: 'Mural AI', description: 'For visualizing problem spaces and opportunity areas', bestFor: ['Problem Space Mapping'] },
      { name: 'ChatGPT', description: 'For refining problem statements and HMW questions', bestFor: ['Problem Statement Refinement'] }
    ],
    'ideate': [
      { name: 'Miro AI', description: 'For virtual brainstorming and idea organization', bestFor: ['Brainstorming', 'Idea Organization'] },
      { name: 'Figma Jam', description: 'For collaborative sketching and concept development', bestFor: ['Sketching', 'Concept Development'] },
      { name: 'Whimsical', description: 'For creating user flows and information architecture', bestFor: ['User Flows', 'IA'] },
      { name: 'ChatGPT', description: 'For generating and expanding on ideas', bestFor: ['Idea Generation', 'Concept Expansion'] }
    ],
    'prototype': [
      { name: 'Figma AI', description: 'For generating UI components and layouts', bestFor: ['UI Design', 'Prototyping'] },
      { name: 'Adobe Firefly', description: 'For generating visual assets and illustrations', bestFor: ['Visual Design', 'Assets'] },
      { name: 'Galileo AI', description: 'For generating UI from text descriptions', bestFor: ['Rapid Prototyping'] },
      { name: 'ChatGPT', description: 'For generating copy and micro-interactions', bestFor: ['Content Writing', 'Microcopy'] }
    ],
    'test': [
      { name: 'UserTesting AI', description: 'For automated user testing and analysis', bestFor: ['Usability Testing'] },
      { name: 'Hotjar', description: 'For heatmaps and session recordings', bestFor: ['Behavior Analysis'] },
      { name: 'Dovetail', description: 'For analyzing user feedback and test results', bestFor: ['Feedback Analysis'] },
      { name: 'ChatGPT', description: 'For analyzing test results and generating insights', bestFor: ['Insight Generation'] }
    ]
  },
  // Lean UX
  'lean-ux': {
    'think': [
      { name: 'Miro AI', description: 'For lean canvas and assumption mapping', bestFor: ['Assumption Mapping'] },
      { name: 'Notion AI', description: 'For documenting hypotheses and experiments', bestFor: ['Hypothesis Documentation'] },
      { name: 'Trello', description: 'For managing lean experiments', bestFor: ['Experiment Tracking'] },
      { name: 'ChatGPT', description: 'For refining hypotheses and experiment design', bestFor: ['Hypothesis Refinement'] }
    ],
    'make': [
      { name: 'Figma AI', description: 'For rapid prototyping', bestFor: ['Prototyping'] },
      { name: 'Webflow', description: 'For no-code prototyping', bestFor: ['Interactive Prototypes'] },
      { name: 'Bubble', description: 'For building functional MVPs', bestFor: ['MVP Development'] },
      { name: 'ChatGPT', description: 'For generating content and copy', bestFor: ['Content Generation'] }
    ],
    'check': [
      { name: 'Google Analytics', description: 'For quantitative metrics', bestFor: ['Analytics'] },
      { name: 'Hotjar', description: 'For qualitative user feedback', bestFor: ['User Feedback'] },
      { name: 'Amplitude', description: 'For product analytics', bestFor: ['Product Analytics'] },
      { name: 'ChatGPT', description: 'For analyzing results and generating insights', bestFor: ['Data Analysis'] }
    ]
  },
  // Add more frameworks as needed
} as const;

// Fallback AI tools for any framework/stage
const defaultAITools = [
  { name: 'ChatGPT', description: 'General purpose AI assistant for various UX tasks', bestFor: ['General Assistance', 'Content Generation'] },
  { name: 'Miro AI', description: 'For visual collaboration and whiteboarding', bestFor: ['Visual Collaboration', 'Workshops'] },
  { name: 'Figma AI', description: 'For design and prototyping assistance', bestFor: ['UI/UX Design', 'Prototyping'] },
  { name: 'Notion AI', description: 'For documentation and knowledge management', bestFor: ['Documentation', 'Knowledge Management'] }
];

// Get recommended AI tools for a specific framework and stage
function getRecommendedAITools(framework: string, stage: string, uxTool: string) {
  const frameworkTools = aiToolsByFrameworkAndStage[framework as keyof typeof aiToolsByFrameworkAndStage];
  if (!frameworkTools) return defaultAITools;
  
  const stageTools = frameworkTools[stage as keyof typeof frameworkTools];
  if (!stageTools) return defaultAITools;
  
  // Filter tools that are best for the current UX tool
  const recommendedTools = stageTools.filter(tool => 
    tool.bestFor.some(bf => uxTool.toLowerCase().includes(bf.toLowerCase()))
  );
  
  return recommendedTools.length > 0 ? recommendedTools : stageTools;
}

// Original tools mapping for backward compatibility
const tools = {
  "research": ["User Interviews", "Surveys", "User Observation", "Contextual Inquiry", "Empathy Maps", "Personas", "User Journey Maps", "Competitive Analysis"],
  "ideation": ["Brainstorming", "Crazy 8s", "SCAMPER", "Mind Mapping", "How Might We", "Storyboarding", "Concept Sketching", "Design Studio"],
  "design": ["Sketches", "Wireframes", "Prototypes", "User Flow Diagrams", "Information Architecture", "Design Systems", "UI Design", "Interaction Design"],
  "testing": ["Usability Testing", "A/B Testing", "Guerrilla Testing", "Heatmaps", "Analytics Review", "Feedback Surveys", "User Acceptance Testing", "Accessibility Testing"],
  "implementation": ["Design Handoff", "Developer QA", "Sprint Planning", "Accessibility QA", "Design Review", "User Training", "Launch Planning", "Post-Launch Analysis"],
  "strategy": ["Business Model Canvas", "Value Proposition Canvas", "SWOT Analysis", "Stakeholder Mapping", "User Research Planning", "Product Roadmapping", "Market Research", "Design Strategy"],
  "metrics": ["Analytics Setup", "KPI Definition", "User Feedback Analysis", "Performance Metrics", "Conversion Analysis", "User Satisfaction Surveys", "ROI Analysis", "Success Metrics"]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectName, projectDescription, projectStage } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Based on this project information:
- Project Name: ${projectName}
- Description: ${projectDescription}
- Current Stage: ${projectStage}

Analyze the project and recommend:
1. The MOST suitable UX framework from these options: ${frameworks.join(', ')}
2. The MOST suitable tool for the ${projectStage} stage from these options: ${tools[projectStage as keyof typeof tools]?.join(', ') || 'general UX tools'}

After selecting the framework and tool, recommend the most appropriate AI tools that would help with the selected UX tool and framework stage.

Consider the project's scope, complexity, industry context, and current stage when making recommendations.

You are an expert UX Designer specialized in generating detailed and practical content based on UX framework prompts. 

IMPORTANT INSTRUCTIONS:
1. Always respond in English
2. Structure your response clearly and organized
3. Provide specific examples when relevant
4. Ensure all recommendations are practical and applicable
5. Maintain a professional but accessible tone
6. Consider the specific needs of the project stage and selected tool when recommending AI tools
7. For each recommended AI tool, include a brief explanation of how it would be used with the selected UX tool

Respond ONLY with a JSON object in this exact format:
{
  "recommendedFramework": "framework-id",
  "recommendedTool": "Tool Name",
  "recommendedAITools": [
    {
      "name": "AI Tool Name",
      "description": "Brief description of the AI tool",
      "useCase": "How this AI tool would be used with the recommended tool"
    },
    ...
  ],
  "reasoning": "Brief explanation of why these recommendations fit this project"
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a UX methodology expert. Provide precise recommendations based on project requirements.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
        max_tokens: 800
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse the JSON response
    let recommendations;
    try {
      recommendations = JSON.parse(aiResponse);
      
      // Validate required fields
      if (!recommendations.recommendedFramework || !recommendations.recommendedTool) {
        throw new Error('Missing required fields in AI response');
      }
      
      // Set default AI tools if not provided
      if (!recommendations.recommendedAITools || !Array.isArray(recommendations.recommendedAITools)) {
        recommendations.recommendedAITools = getRecommendedAITools(
          recommendations.recommendedFramework,
          projectStage,
          recommendations.recommendedTool
        );
      }
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback recommendations if AI response is not valid JSON or missing fields
      recommendations = {
        recommendedFramework: "design-thinking",
        recommendedTool: tools[projectStage as keyof typeof tools]?.[0] || "User Interviews",
        recommendedAITools: getRecommendedAITools(
          "design-thinking",
          projectStage,
          tools[projectStage as keyof typeof tools]?.[0] || "User Interviews"
        ),
        reasoning: "Default recommendation based on project stage"
      };
    }

    // Validate that the recommended framework exists
    if (!frameworks.includes(recommendations.recommendedFramework)) {
      recommendations.recommendedFramework = "design-thinking";
    }

    // Validate that the recommended tool exists for the stage
    const stageTools = tools[projectStage as keyof typeof tools] || [];
    if (!stageTools.includes(recommendations.recommendedTool)) {
      recommendations.recommendedTool = stageTools[0] || "User Interviews";
    }
    
    // Ensure we have AI tools even if not provided in the response
    if (!recommendations.recommendedAITools || !recommendations.recommendedAITools.length) {
      recommendations.recommendedAITools = getRecommendedAITools(
        recommendations.recommendedFramework,
        projectStage,
        recommendations.recommendedTool
      );
    }
    
    // Limit to 4 AI tools max
    if (recommendations.recommendedAITools.length > 4) {
      recommendations.recommendedAITools = recommendations.recommendedAITools.slice(0, 4);
    }

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-ai-recommendations function:', error);
    
    // Fallback recommendations on error
    const fallbackRecommendations = {
      recommendedFramework: "design-thinking",
      recommendedTool: tools[projectStage as keyof typeof tools]?.[0] || "User Interviews",
      reasoning: "Fallback recommendation due to AI service unavailability"
    };

    return new Response(JSON.stringify(fallbackRecommendations), {
      status: 200, // Return 200 to avoid breaking the flow
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});