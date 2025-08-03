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
    
    console.log(`Getting UX tools for stage: ${stage}, framework: ${framework}`);
    
    // Only load tools for the specified framework for better performance
    const tools = await loadAITools(framework.toLowerCase());
    
    if (!tools || tools.length === 0) {
      console.warn('No tools available for filtering');
      return [];
    }
    
    // Get unique UX tools for the specified stage
    const uniqueTools = new Set<string>();
    
    for (const tool of tools) {
      if (tool.stage && tool.stage.toLowerCase() === stage.toLowerCase() && tool.uxTool) {
        uniqueTools.add(tool.uxTool);
      }
    }
    
    const result = Array.from(uniqueTools).sort();
    
    if (result.length === 0) {
      console.warn(`No tools found for stage "${stage}" in framework "${framework}". Available stages: ${[...new Set(tools.map(t => t.stage))].join(', ')}`);
    } else {
      console.log(`Found ${result.length} unique UX tools for "${stage}" in "${framework}":`, result);
    }
    
    return result;
  } catch (error) {
    console.error('Error in getUXToolsForStage:', error);
    return [];
  }
};
