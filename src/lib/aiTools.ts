export interface AITool {
  name: string;
  description: string;
  framework: string;
  stage: string;
  uxTool: string;
}

let aiToolsCache: AITool[] | null = null;

// Load AI tools from the generated JSON file
const loadAIToolsFromJSON = async (): Promise<AITool[]> => {
  if (aiToolsCache) {
    return aiToolsCache;
  }

  try {
    const response = await fetch('/generated/aiTools.json');
    if (!response.ok) {
      throw new Error(`Failed to load AI tools: ${response.statusText}`);
    }
    
    aiToolsCache = await response.json();
    console.log(`Loaded ${aiToolsCache.length} AI tools from JSON`);
    return aiToolsCache;
  } catch (error) {
    console.error('Error loading AI tools from JSON:', error);
    return [];
  }
};

// Framework ID to display name mapping
const frameworkDisplayNames: Record<string, string> = {
  'design-thinking': 'Design Thinking',
  'double-diamond': 'Double Diamond',
  'google-design-sprint': 'Google Design Sprint',
  'ux-lifecycle': 'UX Lifecycle',
  'lean-ux': 'Lean UX',
  'human-centered-design': 'Human-Centered Design',
  'jobs-to-be-done': 'Jobs to be Done',
  'agile-ux': 'Agile UX',
  'ux-honeycomb': 'UX Honeycomb',
  'ucd-iso-9241': 'UCD ISO 9241',
  'heart-framework': 'HEART Framework',
  'hooked-model': 'Hooked Model'
};

// Load AI tools from the generated JSON file
export const loadAITools = async (frameworkId?: string): Promise<AITool[]> => {
  try {
    // Load all tools from the JSON file
    const allTools = await loadAIToolsFromJSON();
    
    // If no specific framework is requested, return all tools
    if (!frameworkId) {
      return allTools;
    }
    
    // Get the display name for the framework
    const frameworkName = frameworkDisplayNames[frameworkId] || frameworkId;
    
    // Filter tools by framework (case-insensitive)
    const filteredTools = allTools.filter(tool => 
      tool.framework.toLowerCase() === frameworkName.toLowerCase()
    );
    
    console.log(`Found ${filteredTools.length} tools for framework: ${frameworkName}`);
    
    // If no tools found, return a default tool
    if (filteredTools.length === 0) {
      console.warn(`No tools found for framework: ${frameworkName}. Returning default tool.`);
      return [{
        name: 'Default AI Tool',
        description: 'AI tool for UX design',
        framework: frameworkName,
        stage: 'General',
        uxTool: 'General'
      }];
    }
    
    return filteredTools;
  } catch (error) {
    console.error('Error in loadAITools:', error);
    return [{
      name: 'Default AI Tool',
      description: 'AI tool for UX design',
      framework: frameworkId || 'Design Thinking',
      stage: 'General',
      uxTool: 'General'
    }];
  }
};

// Get all AI tools for a specific UX tool and optional stage
export const getAIToolsForUXTool = async (
  uxTool: string,
  stage?: string,
  framework: string = 'design-thinking' // Default to design-thinking for backward compatibility
): Promise<AITool[]> => {
  try {
    if (!uxTool) {
      console.warn('No UX tool provided to getAIToolsForUXTool');
      return [];
    }
    
    console.log(`Getting AI tools for UX tool: "${uxTool}", stage: "${stage || 'any'}", framework: "${framework}"`);
    
    // Only load tools for the specified framework for better performance
    const tools = await loadAITools(framework.toLowerCase());
    
    if (!tools || tools.length === 0) {
      console.warn('No tools available for filtering');
      return [];
    }
    
    // Filter tools by UX tool name (case-insensitive partial match)
    let filteredTools = tools.filter(tool => 
      tool.uxTool && tool.uxTool.toLowerCase().includes(uxTool.toLowerCase())
    );
    
    // Further filter by stage if provided (case-insensitive exact match)
    if (stage) {
      filteredTools = filteredTools.filter(tool => 
        tool.stage && tool.stage.toLowerCase() === stage.toLowerCase()
      );
    }
    
    if (filteredTools.length === 0) {
      console.warn(`No tools found for UX tool "${uxTool}"${stage ? ` and stage "${stage}"` : ''} in framework "${framework}".`);
      console.warn(`Available UX tools in this framework: ${[...new Set(tools.map(t => t.uxTool).filter(Boolean))].join(', ')}`);
    }
    
    console.log(`Found ${filteredTools.length} AI tools for ${uxTool}`);
    return filteredTools;
  } catch (error) {
    console.error('Error in getAIToolsForUXTool:', error);
    return [];
  }
};

// Stage name mappings to handle variations across different frameworks
const stageNameMappings: Record<string, string[]> = {
  // Design Thinking stages
  'Empathize': ['Empathize', 'Empathy', 'Discovery', 'Research', 'User Research'],
  'Define': ['Define', 'Definition', 'Analysis', 'Synthesis', 'Problem Definition'],
  'Ideate': ['Ideate', 'Ideation', 'Brainstorming', 'Generate Ideas'],
  'Prototype': ['Prototype', 'Prototyping', 'Design', 'Create', 'Build'],
  'Test': ['Test', 'Testing', 'Usability Testing', 'Validate', 'Validation', 'Evaluate'],
  'Implement': ['Implement', 'Implementation', 'Development', 'Deploy', 'Deliver'],
  
  // Google Design Sprint stages
  'Understand': ['Understand', 'Understand (Mon)', 'Discovery', 'Empathize', 'Research', 'Learn'],
  'Ideate': ['Ideate', 'Ideate (Tue)', 'Brainstorming', 'Ideation', 'Generate'],
  'Decide': ['Decide', 'Decide (Wed)', 'Define', 'Analysis', 'Synthesis', 'Converge'],
  'Prototype': ['Prototype', 'Prototype (Thu)', 'Design', 'Prototyping', 'Create'],
  'Test': ['Test', 'Test (Fri)', 'Usability Testing', 'Validate', 'Interview'],
  
  // Lean UX stages
  'Think': ['Think', 'Plan', 'Define', 'Hypothesize', 'Research', 'Understand'],
  'Make': ['Make', 'Build', 'Prototype', 'Design', 'Create', 'Experiment'],
  'Check': ['Check', 'Test', 'Validate', 'Learn', 'Measure', 'Evaluate'],
  
  // Double Diamond stages
  'Discover': ['Discover', 'Research', 'Explore', 'Empathize', 'Understand'],
  'Define': ['Define', 'Synthesize', 'Problem Definition', 'Focus'],
  'Develop': ['Develop', 'Ideate', 'Brainstorm', 'Create', 'Prototype'],
  'Deliver': ['Deliver', 'Test', 'Implement', 'Launch', 'Validate'],
  
  // Human-Centered Design stages
  'Research': ['Research', 'Discover', 'Empathize', 'Understand', 'Observe'],
  'Ideation': ['Ideation', 'Ideate', 'Brainstorm', 'Generate', 'Create'],
  'Prototyping': ['Prototyping', 'Prototype', 'Design', 'Build', 'Make'],
  'Implementation': ['Implementation', 'Implement', 'Deliver', 'Launch', 'Test']
};

// Framework-specific stage mappings
const frameworkStageMappings: Record<string, Record<string, string[]>> = {
  'design-thinking': {
    'Empathize': ['Empathize', 'Empathy', 'Discovery', 'Research', 'User Research'],
    'Define': ['Define', 'Definition', 'Analysis', 'Synthesis', 'Problem Definition'],
    'Ideate': ['Ideate', 'Ideation', 'Brainstorming', 'Generate Ideas'],
    'Prototype': ['Prototype', 'Prototyping', 'Design', 'Create', 'Build'],
    'Test': ['Test', 'Testing', 'Usability Testing', 'Validate', 'Validation', 'Evaluate'],
    'Implement': ['Implement', 'Implementation', 'Development', 'Deploy', 'Deliver']
  },
  'google-design-sprint': {
    'Understand': ['Understand', 'Understand (Mon)', 'Discovery', 'Empathize', 'Research', 'Learn'],
    'Ideate': ['Ideate', 'Ideate (Tue)', 'Brainstorming', 'Ideation', 'Generate'],
    'Decide': ['Decide', 'Decide (Wed)', 'Define', 'Analysis', 'Synthesis', 'Converge'],
    'Prototype': ['Prototype', 'Prototype (Thu)', 'Design', 'Prototyping', 'Create'],
    'Test': ['Test', 'Test (Fri)', 'Usability Testing', 'Validate', 'Interview']
  },
  'lean-ux': {
    'Think': ['Think', 'Plan', 'Define', 'Hypothesize', 'Research', 'Understand'],
    'Make': ['Make', 'Build', 'Prototype', 'Design', 'Create', 'Experiment'],
    'Check': ['Check', 'Test', 'Validate', 'Learn', 'Measure', 'Evaluate']
  },
  'double-diamond': {
    'Discover': ['Discover', 'Research', 'Explore', 'Empathize', 'Understand'],
    'Define': ['Define', 'Synthesize', 'Problem Definition', 'Focus'],
    'Develop': ['Develop', 'Ideate', 'Brainstorm', 'Create', 'Prototype'],
    'Deliver': ['Deliver', 'Test', 'Implement', 'Launch', 'Validate']
  },
  'human-centered-design': {
    'Research': ['Research', 'Discover', 'Empathize', 'Understand', 'Observe'],
    'Ideation': ['Ideation', 'Ideate', 'Brainstorm', 'Generate', 'Create'],
    'Prototyping': ['Prototyping', 'Prototype', 'Design', 'Build', 'Make'],
    'Implementation': ['Implementation', 'Implement', 'Deliver', 'Launch', 'Test']
  },
  'jobs-to-be-done': {
    'Job Discovery': ['Job Discovery', 'Research', 'Discover', 'Empathize', 'Understand', 'Define'],
    'Job Mapping': ['Job Mapping', 'Analysis', 'Synthesize', 'Map', 'Process'],
    'Solution Ideation': ['Solution Ideation', 'Ideate', 'Brainstorm', 'Generate', 'Create', 'Ideation'],
    'Validation': ['Validation', 'Test', 'Validate', 'Evaluate', 'Measure', 'Check']
  },
  'ux-honeycomb': {
    'Facets': ['Facets', 'Honeycomb', 'UX Honeycomb', 'UX Dimensions', 'UX Elements'],
    'Useful': ['Useful', 'Utility', 'Functionality'],
    'Usable': ['Usable', 'Usability', 'Ease of Use'],
    'Desirable': ['Desirable', 'Desire', 'Appeal', 'Aesthetics'],
    'Findable': ['Findable', 'Findability', 'Navigation', 'Discovery'],
    'Accessible': ['Accessible', 'Accessibility', 'Inclusive Design'],
    'Credible': ['Credible', 'Credibility', 'Trust', 'Reliability'],
    'Valuable': ['Valuable', 'Value', 'ROI', 'Business Value']
  },
  'heart-framework': {
    'Metrics': ['Metrics', 'HEART', 'HEART Framework', 'Framework'],
    'Happiness': ['Happiness', 'Satisfaction', 'User Satisfaction', 'Delight'],
    'Engagement': ['Engagement', 'Engage', 'Interaction', 'Usage'],
    'Adoption': ['Adoption', 'Adopt', 'New Users', 'Acquisition'],
    'Retention': ['Retention', 'Retain', 'Churn', 'Loyalty'],
    'Task Success': ['Task Success', 'Completion', 'Success Rate', 'Efficiency']
  },
  'hooked-model': {
    'Trigger': ['Trigger', 'Cue', 'Prompt', 'Signal'],
    'Action': ['Action', 'Behavior', 'Activity', 'Interaction'],
    'Variable Reward': ['Variable Reward', 'Reward', 'Incentive', 'Benefit', 'Pleasure'],
    'Investment': ['Investment', 'Effort', 'Contribution', 'Commitment']
  }
};

// Get all unique UX tools for a stage and framework
export const getUXToolsForStage = async (
  stage: string, 
  framework: string = 'design-thinking' // Default to design-thinking for backward compatibility
): Promise<string[]> => {
  try {
    if (!stage) {
      console.warn('No stage provided to getUXToolsForStage');
      return [];
    }
    
    console.log(`Getting UX tools for stage: "${stage}", framework: "${framework}"`);
    
    // Normalize framework ID
    const normalizedFramework = framework.toLowerCase().replace(/\s+/g, '-');
    
    // Only load tools for the specified framework for better performance
    const tools = await loadAITools(normalizedFramework);
    
    if (!tools || tools.length === 0) {
      console.warn('No tools available for filtering');
      return [];
    }
    
    // Get all unique stage names in the tools data
    const allStages = [...new Set(tools.map(t => t.stage).filter(Boolean))];
    console.log('All available stages in tools data:', allStages);
    
    // Try to find a direct match first
    const normalizedInputStage = stage.trim().toLowerCase();
    let matchedStage = allStages.find(s => s.toLowerCase() === normalizedInputStage);
    
    // If no direct match, try to find a matching stage using framework-specific mappings
    if (!matchedStage) {
      const frameworkStages = frameworkStageMappings[normalizedFramework] || {};
      
      // First, try to find a direct mapping for the input stage
      for (const [canonicalStage, variations] of Object.entries(frameworkStages)) {
        if (variations.some(v => v.toLowerCase() === normalizedInputStage)) {
          // Try to find a matching stage in the tools data
          const potentialMatch = allStages.find(s => 
            s.toLowerCase() === canonicalStage.toLowerCase() ||
            variations.some(v => v.toLowerCase() === s.toLowerCase())
          );
          if (potentialMatch) {
            matchedStage = potentialMatch;
            console.log(`Matched stage "${stage}" to "${matchedStage}" using framework-specific mapping`);
            break;
          }
        }
      }
      
      // If still no match, try to find any stage that contains the input stage
      if (!matchedStage) {
        const partialMatch = allStages.find(s => 
          s.toLowerCase().includes(normalizedInputStage) ||
          normalizedInputStage.includes(s.toLowerCase())
        );
        
        if (partialMatch) {
          matchedStage = partialMatch;
          console.log(`Matched stage "${stage}" to "${matchedStage}" using partial matching`);
        }
      }
    }
    
    if (!matchedStage) {
      console.warn(`No matching stage found for "${stage}" in framework "${framework}". Available stages: ${allStages.join(', ')}`);
      return [];
    }
    
    console.log(`Using stage: "${matchedStage}" for tools lookup`);
    
    // Get unique UX tools for the matched stage (case-insensitive match)
    const uniqueTools = new Set<string>();
    
    for (const tool of tools) {
      if (tool.stage && tool.stage.toLowerCase() === matchedStage.toLowerCase() && tool.uxTool) {
        uniqueTools.add(tool.uxTool);
      }
    }
    
    const result = Array.from(uniqueTools).sort();
    
    if (result.length === 0) {
      console.warn(`No tools found for stage "${matchedStage}" in framework "${framework}". Available stages: ${allStages.join(', ')}`);
    } else {
      console.log(`Found ${result.length} unique UX tools for "${matchedStage}" in "${framework}"`);
    }
    
    return result;
  } catch (error) {
    console.error('Error in getUXToolsForStage:', error);
    return [];
  }
};
