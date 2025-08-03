import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the frameworks we expect to find in the markdown
const FRAMEWORKS = [
  'Design Thinking',
  'Double Diamond',
  'Google Design Sprint',
  'UX Lifecycle',
  'Lean UX',
  'Human-Centered Design',
  'Jobs to be Done',
  'Agile UX',
  'UX Honeycomb',
  'UCD ISO 9241',
  'HEART Framework',
  'Hooked Model'
];

// Input and output paths
const INPUT_FILE = path.join(__dirname, '../public/AI_Tools_for_UX_Design_Thinking (1).md');
const OUTPUT_DIR = path.join(__dirname, '../public/frameworks');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Read the input file
const content = fs.readFileSync(INPUT_FILE, 'utf-8');

// Split content by framework sections
const frameworkSections: Record<string, string[]> = {};
let currentFramework = '';
let currentContent: string[] = [];

// Process each line
const lines = content.split('\n');

for (const line of lines) {
  // Check if this line starts a new framework section
  const frameworkMatch = line.match(/^#+\s*🤖\s*AI Tools for UX –\s*([^\n]+)\s*Framework/);
  
  if (frameworkMatch) {
    // If we were already processing a framework, save it
    if (currentFramework) {
      frameworkSections[currentFramework] = [...currentContent];
    }
    
    // Start new framework section
    const frameworkName = frameworkMatch[1].trim();
    currentFramework = FRAMEWORKS.find(fw => 
      frameworkName.toLowerCase().includes(fw.toLowerCase())
    ) || frameworkName;
    
    currentContent = [line];
    continue;
  }
  
  // Add line to current content if we're in a framework section
  if (currentFramework) {
    currentContent.push(line);
  }
}

// Don't forget the last framework
if (currentFramework && currentContent.length > 0) {
  frameworkSections[currentFramework] = currentContent;
}

// Map framework names to filenames
const frameworkFiles: Record<string, string> = {
  'Design Thinking': 'design_thinking_tools.md',
  'Double Diamond': 'double_diamond_tools.md',
  'Google Design Sprint': 'google_design_sprint_tools.md',
  'UX Lifecycle': 'ux_lifecycle_tools.md',
  'Lean UX': 'lean_ux_tools.md',
  'Human-Centered Design': 'human_centered_design_tools.md',
  'Jobs to be Done': 'jtbd_tools.md',
  'Agile UX': 'agile_ux_tools.md',
  'UX Honeycomb': 'ux_honeycomb_tools.md',
  'UCD ISO 9241': 'ucd_iso_9241_tools.md',
  'HEART Framework': 'heart_framework_tools.md',
  'Hooked Model': 'hooked_model_tools.md'
};

// Write each framework's content to its own file
for (const [framework, content] of Object.entries(frameworkSections)) {
  const filename = frameworkFiles[framework] || `${framework.toLowerCase().replace(/\s+/g, '_')}_tools.md`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  
  // Add a proper header if it's missing
  let fileContent = content.join('\n');
  if (!fileContent.trim().startsWith('#')) {
    fileContent = `# ${framework} AI Tools\n\n${fileContent}`;
  }
  
  fs.writeFileSync(outputPath, fileContent);
  console.log(`Wrote ${content.length} lines to ${filename}`);
}

console.log('\nFramework extraction complete!');
console.log(`Extracted ${Object.keys(frameworkSections).length} frameworks.`);
