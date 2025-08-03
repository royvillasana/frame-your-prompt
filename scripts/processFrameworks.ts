import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory containing the framework markdown files
const FRAMEWORKS_DIR = path.join(__dirname, '../public/frameworks');
const OUTPUT_DIR = path.join(__dirname, '../src/lib/generated');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Define the AITool interface
export interface AITool {
  name: string;
  description: string;
  framework: string;
  stage: string;
  uxTool: string;
}

// Map of framework names to their normalized stage names
const frameworkStageMappings: Record<string, Record<string, string>> = {
  'design thinking': {
    'empathize': 'Empathize',
    'define': 'Define',
    'ideate': 'Ideate',
    'prototype': 'Prototype',
    'test': 'Test',
    'implement': 'Implement'
  },
  'double-diamond': {
    'discover': 'Discover',
    'define': 'Define',
    'develop': 'Develop',
    'deliver': 'Deliver'
  },
  'double diamond': {
    'discover': 'Discover',
    'define': 'Define',
    'develop': 'Develop',
    'deliver': 'Deliver'
  },
  'lean-ux': {
    'think': 'Think',
    'make': 'Make',
    'check': 'Check'
  },
  'lean ux': {
    'think': 'Think',
    'make': 'Make',
    'check': 'Check'
  },
  'google-design-sprint': {
    'understand': 'Understand (Mon)',
    'ideate': 'Ideate (Tue)',
    'decide': 'Decide (Wed)',
    'prototype': 'Prototype (Thu)',
    'test': 'Test (Fri)'
  },
  'google design sprint': {
    'understand': 'Understand (Mon)',
    'ideate': 'Ideate (Tue)',
    'decide': 'Decide (Wed)',
    'prototype': 'Prototype (Thu)',
    'test': 'Test (Fri)'
  },
  'human-centered-design': {
    'define': 'Research',  // Map 'define' to 'Research' for backward compatibility
    'research': 'Research',
    'ideation': 'Ideation',
    'prototyping': 'Prototyping',
    'implementation': 'Implementation'
  },
  'human centered design': {
    'define': 'Research',  // Map 'define' to 'Research' for backward compatibility
    'research': 'Research',
    'ideation': 'Ideation',
    'prototyping': 'Prototyping',
    'implementation': 'Implementation'
  },
  'human centered design': {
    'research': 'Research',
    'ideation': 'Ideation',
    'prototyping': 'Prototyping',
    'implementation': 'Implementation'
  },
  'jobs-to-be-done': {
    'job discovery': 'Job Discovery',
    'job mapping': 'Job Mapping',
    'solution ideation': 'Solution Ideation',
    'validation': 'Validation'
  },
  'jobs to be done': {
    'job discovery': 'Job Discovery',
    'job mapping': 'Job Mapping',
    'solution ideation': 'Solution Ideation',
    'validation': 'Validation'
  },
  'agile-ux': {
    'ux sprint planning': 'UX Sprint Planning',
    'design sprint': 'Design Sprint',
    'validation': 'Validation',
    'iteration': 'Iteration'
  },
  'agile ux': {
    'ux sprint planning': 'UX Sprint Planning',
    'design sprint': 'Design Sprint',
    'validation': 'Validation',
    'iteration': 'Iteration'
  },
  'ux-lifecycle': {
    'analysis': 'Analysis',
    'design': 'Design',
    'development': 'Development',
    'evaluation': 'Evaluation',
    'implementation': 'Implementation'
  },
  'ux lifecycle': {
    'analysis': 'Analysis',
    'design': 'Design',
    'development': 'Development',
    'evaluation': 'Evaluation',
    'implementation': 'Implementation'
  },
  'ux-honeycomb': {
    'define': 'Facets',  // Map 'define' to 'Facets' for backward compatibility
    'facets': 'Facets'
  },
  'ux honeycomb': {
    'define': 'Facets',  // Map 'define' to 'Facets' for backward compatibility
    'facets': 'Facets'
  },
  'user-centered-design': {
    'context of use': 'Context of use',
    'requirements': 'Requirements',
    'design': 'Design',
    'evaluation': 'Evaluation'
  },
  'user centered design': {
    'context of use': 'Context of use',
    'requirements': 'Requirements',
    'design': 'Design',
    'evaluation': 'Evaluation'
  },
  'heart-framework': {
    'metrics': 'Metrics'
  },
  'heart framework': {
    'metrics': 'Metrics'
  },
  'hooked-model': {
    'trigger': 'Trigger',
    'action': 'Action',
    'variable reward': 'Variable Reward',
    'investment': 'Investment'
  },
  'hooked model': {
    'trigger': 'Trigger',
    'action': 'Action',
    'variable reward': 'Variable Reward',
    'investment': 'Investment'
  }
};

// Function to normalize stage names based on framework
function normalizeStageName(framework: string, stage: string): string {
  // Get the framework name in lowercase for case-insensitive matching
  const frameworkKey = framework.toLowerCase();
  const stageKey = stage.trim().toLowerCase();
  
  // Find the framework in our mappings
  for (const [frameworkPattern, stages] of Object.entries(frameworkStageMappings)) {
    if (frameworkKey.includes(frameworkPattern.toLowerCase())) {
      // Check for exact match first
      if (stages[stageKey]) {
        return stages[stageKey];
      }
      
      // Try to find a partial match
      for (const [pattern, normalized] of Object.entries(stages)) {
        if (stageKey.includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(stageKey)) {
          return normalized;
        }
      }
    }
  }
  
  // If no match found, return the original stage with first letter capitalized
  return stage.trim().charAt(0).toUpperCase() + stage.trim().slice(1).toLowerCase();
}

// Function to parse a markdown table into AITool objects
function parseMarkdownTable(content: string): AITool[] {
  const tools: AITool[] = [];
  
  // Split content into lines and filter out non-table lines
  const lines = content.split('\n').filter(line => line.trim().startsWith('|'));
  
  if (lines.length < 2) return []; // Need at least header and one data row
  
  // Extract column indices from the header
  const headers = lines[0].split('|').map(h => h.trim().toLowerCase());
  const frameworkIndex = headers.indexOf('framework');
  const stageIndex = headers.indexOf('stage');
  const uxToolIndex = headers.indexOf('ux tool');
  const aiToolIndex = headers.indexOf('ai tool');
  const descriptionIndex = headers.indexOf('ai description');
  
  // If any required column is missing, skip this file
  if ([frameworkIndex, stageIndex, uxToolIndex, aiToolIndex, descriptionIndex].some(i => i === -1)) {
    console.warn('Missing required columns in markdown table');
    return [];
  }
  
  // Process each data row
  for (let i = 2; i < lines.length; i++) { // Start from 2 to skip header and separator
    const cells = lines[i].split('|').map(cell => cell.trim());
    
    if (cells.length <= Math.max(frameworkIndex, stageIndex, uxToolIndex, aiToolIndex, descriptionIndex)) {
      continue; // Skip malformed rows
    }
    
    const framework = cells[frameworkIndex];
    const stage = cells[stageIndex];
    const uxTool = cells[uxToolIndex];
    const aiTool = cells[aiToolIndex];
    const description = cells[descriptionIndex];
    
    if (framework && stage && uxTool && aiTool && description) {
      // Normalize the stage name based on the framework
      const normalizedStage = normalizeStageName(framework, stage);
      
      tools.push({
        name: aiTool,
        description: description,
        framework: framework,
        stage: normalizedStage,
        uxTool: uxTool
      });
    }
  }
  
  return tools;
}

// Function to process a single markdown file
async function processMarkdownFile(filePath: string): Promise<AITool[]> {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return parseMarkdownTable(content);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return [];
  }
}

// Function to process all markdown files in the frameworks directory
async function processAllFrameworks() {
  try {
    const files = fs.readdirSync(FRAMEWORKS_DIR)
      .filter(file => file.endsWith('.md') && file !== 'design_thinking_tools.md' && file.startsWith('ai_tools_for_ux_'));
    
    let allTools: AITool[] = [];
    
        // Process each file
    for (const file of files) {
      const filePath = path.join(FRAMEWORKS_DIR, file);
      console.log(`Processing ${file}...`);
      
      const tools = await processMarkdownFile(filePath);
      console.log(`  Found ${tools.length} tools in ${file}`);
      
      // Extract framework name from filename (e.g., 'ai_tools_for_ux_agile_ux.md' -> 'agile-ux')
      let frameworkName = file
        .replace('ai_tools_for_ux_', '')
        .replace('.md', '');
      
      // Special case for human-centered-design to match the expected format
      if (frameworkName === 'human-centered_design' || frameworkName === 'human_centered_design') {
        frameworkName = 'human-centered-design';
      } else {
        // Convert to kebab-case for consistency
        frameworkName = frameworkName.replace(/_/g, '-');
      }
      
      // Add tools with proper framework names
      allTools = [
        ...allTools, 
        ...tools.map(tool => ({
          ...tool,
          framework: frameworkName
        }))
      ];
    }
    
    // Generate the output file
    const outputPath = path.join(OUTPUT_DIR, 'aiTools.json');
    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(allTools, null, 2),
      'utf-8'
    );
    
    console.log(`\nSuccessfully processed ${files.length} files.`);
    console.log(`Total tools extracted: ${allTools.length}`);
    console.log(`Output written to: ${outputPath}`);
    
    return allTools;
  } catch (error) {
    console.error('Error processing frameworks:', error);
    return [];
  }
}

// Run the processor
processAllFrameworks().catch(console.error);
