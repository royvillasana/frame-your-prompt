import { PromptTemplate, PromptVariable, PromptEngineeringMethod } from '@/types';

export interface PromptEngineConfig {
  method: PromptEngineeringMethod;
  temperature: number;
  maxTokens: number;
  context?: string;
  examples?: string[];
}

export class PromptEngine {
  
  // Method Templates
  private methodTemplates: Record<PromptEngineeringMethod, string> = {
    'zero-shot': `{systemPrompt}

Task: {task}

{context}

{userInput}

Please provide a comprehensive response.`,

    'few-shot': `{systemPrompt}

Task: {task}

Here are some examples:

{examples}

{context}

Now for your task:
{userInput}

Please follow the pattern shown in the examples.`,

    'chain-of-thought': `{systemPrompt}

Task: {task}

{context}

{userInput}

Let's approach this step by step:
1. First, I'll analyze the problem
2. Then, I'll consider the options
3. Finally, I'll provide a detailed solution

Please work through this systematically.`,

    'instruction-tuning': `{systemPrompt}

You are an expert UX professional. Follow these specific instructions:

{instructions}

Context: {context}

Task: {task}

Input: {userInput}

Please follow the instructions precisely and provide detailed output.`,

    'role-playing': `{systemPrompt}

You are a {role}. You have {expertise} and your approach is {style}.

Context: {context}

Task: {task}

Input: {userInput}

Respond as the {role} would, drawing on their expertise and approach.`,

    'step-by-step': `{systemPrompt}

Task: {task}

{context}

{userInput}

Please break this down into clear steps:

Step 1: [Analysis]
Step 2: [Planning] 
Step 3: [Execution]
Step 4: [Validation]

Provide detailed guidance for each step.`
  };

  // UX-specific system prompts
  private uxSystemPrompts = {
    'design-thinking': 'You are a Design Thinking expert focused on human-centered innovation.',
    'double-diamond': 'You are a Double Diamond process expert specializing in design strategy.',
    'google-design-sprint': 'You are a Google Design Sprint facilitator with expertise in rapid prototyping.',
    'human-centered-design': 'You are a Human-Centered Design expert focused on inclusive and accessible solutions.',
    'jobs-to-be-done': 'You are a Jobs-to-Be-Done expert specializing in customer outcome analysis.',
    'lean-ux': 'You are a Lean UX expert focused on rapid experimentation and learning.',
    'agile-ux': 'You are an Agile UX expert specializing in iterative design within development cycles.',
    'heart': 'You are a UX metrics expert specializing in the HEART framework.',
    'hooked-model': 'You are a behavioral design expert specializing in habit-forming products.'
  };

  buildPrompt(config: PromptEngineConfig & {
    template: PromptTemplate;
    variables: Record<string, any>;
    frameworkType?: string;
  }): string {
    const { method, template, variables, frameworkType } = config;
    
    // Get method template
    const methodTemplate = this.methodTemplates[method];
    
    // Build system prompt
    let systemPrompt = template.template;
    if (frameworkType && this.uxSystemPrompts[frameworkType as keyof typeof this.uxSystemPrompts]) {
      systemPrompt = this.uxSystemPrompts[frameworkType as keyof typeof this.uxSystemPrompts];
    }

    // Prepare template variables
    const templateVars = {
      systemPrompt,
      task: variables.task || '',
      context: config.context || '',
      userInput: variables.userInput || '',
      examples: config.examples?.join('\n\n') || '',
      instructions: this.buildInstructions(template),
      role: variables.role || 'UX Designer',
      expertise: variables.expertise || 'user experience design',
      style: variables.style || 'analytical and user-focused',
      ...variables
    };

    // Replace template variables
    let finalPrompt = methodTemplate;
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      finalPrompt = finalPrompt.replace(regex, String(value));
    });

    // Clean up empty sections
    finalPrompt = finalPrompt.replace(/\n\s*\n\s*\n/g, '\n\n');
    finalPrompt = finalPrompt.replace(/{\w+}/g, ''); // Remove unreplaced variables

    return finalPrompt.trim();
  }

  private buildInstructions(template: PromptTemplate): string {
    const instructions: string[] = [];
    
    instructions.push(`- Focus on ${template.category} best practices`);
    instructions.push('- Provide actionable and specific guidance');
    instructions.push('- Include relevant examples where helpful');
    instructions.push('- Structure your response clearly');
    
    if (template.description) {
      instructions.push(`- ${template.description}`);
    }

    return instructions.join('\n');
  }

  // Pre-built UX prompt templates
  getUXPromptTemplates(): PromptTemplate[] {
    return [
      {
        id: 'user-interview-guide',
        name: 'User Interview Guide',
        description: 'Generate structured interview questions for user research',
        template: 'Create a comprehensive user interview guide for {projectType} targeting {userGroup}. Include warm-up, main, and wrap-up questions.',
        method: 'instruction-tuning',
        category: 'Research',
        tags: ['interviews', 'research', 'user-insights'],
        variables: [
          {
            id: 'projectType',
            name: 'Project Type',
            type: 'text',
            required: true,
            description: 'Type of project or product being researched'
          },
          {
            id: 'userGroup',
            name: 'Target User Group',
            type: 'text',
            required: true,
            description: 'Primary user group to interview'
          },
          {
            id: 'researchGoals',
            name: 'Research Goals',
            type: 'textarea',
            required: false,
            description: 'Specific goals for the research'
          }
        ]
      },
      {
        id: 'persona-generator',
        name: 'User Persona Generator',
        description: 'Create detailed user personas based on research data',
        template: 'Generate a detailed user persona for {userType} based on the following research insights: {researchData}',
        method: 'few-shot',
        category: 'Synthesis',
        tags: ['personas', 'user-research', 'synthesis'],
        variables: [
          {
            id: 'userType',
            name: 'User Type',
            type: 'text',
            required: true,
            description: 'Type of user for the persona'
          },
          {
            id: 'researchData',
            name: 'Research Data',
            type: 'textarea',
            required: true,
            description: 'Key insights from user research'
          }
        ]
      },
      {
        id: 'journey-map-creator',
        name: 'Customer Journey Map',
        description: 'Create comprehensive customer journey maps',
        template: 'Create a customer journey map for {scenario} including touchpoints, emotions, and opportunities',
        method: 'step-by-step',
        category: 'Mapping',
        tags: ['journey-mapping', 'touchpoints', 'experience'],
        variables: [
          {
            id: 'scenario',
            name: 'Scenario',
            type: 'text',
            required: true,
            description: 'Customer scenario to map'
          },
          {
            id: 'touchpoints',
            name: 'Known Touchpoints',
            type: 'textarea',
            required: false,
            description: 'Existing touchpoints to include'
          }
        ]
      },
      {
        id: 'usability-test-plan',
        name: 'Usability Test Plan',
        description: 'Generate comprehensive usability testing plans',
        template: 'Create a usability test plan for {product} with {userGroup} focusing on {testObjectives}',
        method: 'instruction-tuning',
        category: 'Testing',
        tags: ['usability-testing', 'test-plan', 'validation'],
        variables: [
          {
            id: 'product',
            name: 'Product/Feature',
            type: 'text',
            required: true,
            description: 'Product or feature to test'
          },
          {
            id: 'userGroup',
            name: 'Test Participants',
            type: 'text',
            required: true,
            description: 'Target user group for testing'
          },
          {
            id: 'testObjectives',
            name: 'Test Objectives',
            type: 'textarea',
            required: true,
            description: 'What you want to learn from testing'
          }
        ]
      },
      {
        id: 'ideation-facilitator',
        name: 'Ideation Session Guide',
        description: 'Generate structured ideation session plans',
        template: 'Create an ideation session plan for {challenge} using {method} with {participantCount} participants',
        method: 'chain-of-thought',
        category: 'Ideation',
        tags: ['ideation', 'brainstorming', 'facilitation'],
        variables: [
          {
            id: 'challenge',
            name: 'Design Challenge',
            type: 'text',
            required: true,
            description: 'The challenge or problem to address'
          },
          {
            id: 'method',
            name: 'Ideation Method',
            type: 'select',
            required: true,
            description: 'Preferred ideation technique',
            options: ['Brainstorming', 'SCAMPER', 'How Might We', 'Crazy 8s', '6-3-5 Method']
          },
          {
            id: 'participantCount',
            name: 'Number of Participants',
            type: 'number',
            required: true,
            description: 'How many people will participate'
          }
        ]
      }
    ];
  }

  // Enhanced prompt generation with context
  generateContextualPrompt(
    templateId: string,
    variables: Record<string, any>,
    context: string,
    method: PromptEngineeringMethod = 'instruction-tuning'
  ): string {
    const templates = this.getUXPromptTemplates();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return this.buildPrompt({
      method,
      template,
      variables,
      context,
      temperature: 0.7,
      maxTokens: 2000
    });
  }

  // Validate prompt variables
  validatePromptVariables(template: PromptTemplate, variables: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    template.variables.forEach(variable => {
      const value = variables[variable.id];

      // Check required fields
      if (variable.required && (!value || value.toString().trim() === '')) {
        errors.push(`${variable.name} is required`);
        return;
      }

      // Check validation rules
      if (value && variable.validation) {
        const validation = variable.validation;
        const stringValue = value.toString();

        if (validation.minLength && stringValue.length < validation.minLength) {
          errors.push(`${variable.name} must be at least ${validation.minLength} characters`);
        }

        if (validation.maxLength && stringValue.length > validation.maxLength) {
          errors.push(`${variable.name} must be no more than ${validation.maxLength} characters`);
        }

        if (validation.pattern) {
          const regex = new RegExp(validation.pattern);
          if (!regex.test(stringValue)) {
            errors.push(`${variable.name} format is invalid`);
          }
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const promptEngine = new PromptEngine();