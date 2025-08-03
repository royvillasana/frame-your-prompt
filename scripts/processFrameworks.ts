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
      tools.push({
        name: aiTool,
        description: description,
        framework: framework,
        stage: stage,
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
      .filter(file => file.endsWith('.md') && file !== 'design_thinking_tools.md');
    
    let allTools: AITool[] = [];
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(FRAMEWORKS_DIR, file);
      console.log(`Processing ${file}...`);
      
      const tools = await processMarkdownFile(filePath);
      console.log(`  Found ${tools.length} tools in ${file}`);
      
      allTools = [...allTools, ...tools];
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
