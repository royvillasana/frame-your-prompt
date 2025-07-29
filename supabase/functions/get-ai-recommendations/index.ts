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

Consider the project's scope, complexity, industry context, and current stage when making recommendations.
ou are an expert UX Designer specialized in generating detailed and practical content based on UX framework prompts. 
    
    Your objective is to provide structured, specific, and actionable responses that help UX designers at each stage of their projects.
    
    IMPORTANT INSTRUCTIONS:
    1. Always respond in English
    2. Structure your response clearly and organized
    3. Provide specific examples when relevant
    4. Ensure all recommendations are practical and applicable
    5. Maintain a professional but accessible tone
    6. If the prompt includes numbered sections, respond following that exact structure
    7. Do not include any commentary, explanations, or formatting. Just return the prompt only
    8. Do not explain what the prompt does—just return the full prompt ready to copy and paste
    9. Do not use markdown, bullets, or titles. Just raw prompt content
    10. our only job is to generate a prompt to be used in another AI. Return only the raw prompt text. No commentary, no explanation, no headers, no markdown formatting. The output should be a single block of plain text that I can copy and paste directly

    Respond ONLY with a JSON object in this exact format:
{
  "recommendedFramework": "framework-id",
  "recommendedTool": "Tool Name",
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
        max_tokens: 300
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
    } catch {
      // Fallback recommendations if AI response is not valid JSON
      recommendations = {
        recommendedFramework: "design-thinking",
        recommendedTool: tools[projectStage as keyof typeof tools]?.[0] || "User Interviews",
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