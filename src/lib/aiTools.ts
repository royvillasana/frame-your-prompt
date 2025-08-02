export interface AITool {
  name: string;
  description: string;
  framework: string;
  stage: string;
  uxTool: string;
}

let aiToolsCache: AITool[] | null = null;

// Parse the markdown into an array of AITool objects
const parseAIToolsMarkdown = (markdown: string): AITool[] => {
  const tools: AITool[] = [];
  let currentSection = '';
  let currentFramework = '';
  let currentStage = '';
  let currentUxTool = '';

  // Split by lines and process each line
  const lines = markdown.split('\n');
  
  for (const line of lines) {
    // Extract framework and stage from section headers (e.g., "## 🧭 Design Thinking – Define")
    const sectionMatch = line.match(/^##\s+[^\w]*(\w+.*?)(?:\s+–\s+(\w+))?\s*$/);
    if (sectionMatch) {
      currentFramework = sectionMatch[1] || '';
      currentStage = sectionMatch[2] || '';
      continue;
    }

    // Extract UX tool from sub-headers (e.g., "### 🔧 UX Tool: "How Might We" questions")
    const toolMatch = line.match(/^###\s+[^\w]*UX Tool: (.*?)\s*$/);
    if (toolMatch) {
      currentUxTool = toolMatch[1].replace(/["']/g, '').trim();
      continue;
    }

    // Extract AI tool entries (lines starting with "- **AI Tool:")
    const aiToolMatch = line.match(/^-\s*\*\*AI Tool:\*\*\s*(.*?)(?:\s*_Description:_\s*(.*?))?\s*$/);
    if (aiToolMatch && currentUxTool) {
      const name = aiToolMatch[1].trim();
      const description = (aiToolMatch[2] || '').replace(/[_-]/g, '').trim();
      
      if (name && currentFramework && currentStage && currentUxTool) {
        tools.push({
          framework: currentFramework,
          stage: currentStage,
          uxTool: currentUxTool,
          name: name,
          description: description || `AI assistant for ${currentUxTool}`,
        });
      }
    }
  }

  return tools;
};

// Load AI tools from the markdown file
export const loadAITools = async (): Promise<AITool[]> => {
  if (aiToolsCache) return aiToolsCache;

  try {
    // Try both possible file names
    const fileName = 'AI_Tools_for_UX_Design_Thinking (1).md';
    console.log('Loading AI tools from:', fileName);
    
    const response = await fetch(`/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to load AI tools (${response.status}): ${response.statusText}`);
    }
    
    const markdown = await response.text();
    console.log('Successfully loaded markdown file');
    
    aiToolsCache = parseAIToolsMarkdown(markdown);
    console.log('Parsed AI tools:', aiToolsCache);
    
    if (aiToolsCache.length === 0) {
      console.warn('No AI tools were parsed from the markdown file');
    }
    
    return aiToolsCache;
  } catch (error) {
    console.error('Error loading AI tools:', error);
    // Return a default set of tools if the file fails to load
    return [{
      name: 'Default AI Tool',
      description: 'AI tool for UX design',
      framework: 'Design Thinking',
      stage: 'Empathize',
      uxTool: 'Interviews'
    }];
  }
};

// Get AI tools for a specific UX tool
export const getAIToolsForUXTool = async (
  uxTool: string, 
  stage: string, 
  framework: string = 'Design Thinking'
): Promise<AITool[]> => {
  try {
    console.log(`Getting AI tools for UX Tool: ${uxTool}, Stage: ${stage}, Framework: ${framework}`);
    const tools = await loadAITools();
    
    const filteredTools = tools.filter(tool => {
      const matches = 
        tool.uxTool.toLowerCase() === uxTool.toLowerCase() &&
        tool.stage.toLowerCase() === stage.toLowerCase() &&
        tool.framework.toLowerCase() === framework.toLowerCase();
      
      if (matches) {
        console.log('Found matching tool:', tool);
      }
      
      return matches;
    });
    
    console.log(`Found ${filteredTools.length} AI tools for ${uxTool}`);
    return filteredTools;
  } catch (error) {
    console.error('Error in getAIToolsForUXTool:', error);
    return [];
  }
};

// Get all unique UX tools for a stage
export const getUXToolsForStage = async (
  stage: string, 
  framework: string = 'Design Thinking'
): Promise<string[]> => {
  const tools = await loadAITools();
  const uniqueTools = new Set<string>();
  
  tools.forEach(tool => {
    if (
      tool.stage.toLowerCase() === stage.toLowerCase() &&
      tool.framework.toLowerCase() === framework.toLowerCase()
    ) {
      uniqueTools.add(tool.uxTool);
    }
  });
  
  return Array.from(uniqueTools);
};
