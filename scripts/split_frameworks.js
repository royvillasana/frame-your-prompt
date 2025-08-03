import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define framework mappings with their possible section headers
const frameworks = [
  { 
    name: 'Design Thinking', 
    id: 'design_thinking',
    sections: ['Design Thinking', 'Design Thinking – Empathize', 'Design Thinking – Define', 'Design Thinking – Ideate', 'Design Thinking – Prototype', 'Design Thinking – Test']
  },
  { 
    name: 'Lean UX', 
    id: 'lean_ux',
    sections: ['Lean UX', 'Lean UX – Think', 'Lean UX – Make', 'Lean UX – Check']
  },
  { 
    name: 'Double Diamond', 
    id: 'double_diamond',
    sections: ['Double Diamond', 'Discover', 'Define', 'Develop', 'Deliver']
  },
  { 
    name: 'Google Design Sprint', 
    id: 'google_design_sprint',
    sections: ['Google Design Sprint', 'Understand', 'Diverge', 'Decide', 'Prototype', 'Validate']
  },
  { 
    name: 'Human-Centered Design', 
    id: 'human_centered_design',
    sections: ['Human-Centered Design', 'Hear', 'Create', 'Deliver']
  },
  { 
    name: 'Jobs To Be Done', 
    id: 'jtbd',
    sections: ['Jobs To Be Done', 'Job Discovery', 'Job Mapping', 'Solution Ideation', 'Validation']
  },
  { 
    name: 'Agile UX', 
    id: 'agile_ux',
    sections: ['Agile UX', 'Sprint Planning', 'Sprint Execution', 'Sprint Review', 'Sprint Retrospective']
  },
  { 
    name: 'UX Lifecycle', 
    id: 'ux_lifecycle',
    sections: ['UX Lifecycle', 'Strategy', 'Research', 'Analysis', 'Design', 'Implementation', 'Evaluation']
  },
  { 
    name: 'UX Honeycomb', 
    id: 'ux_honeycomb',
    sections: ['UX Honeycomb', 'Useful', 'Usable', 'Desirable', 'Findable', 'Accessible', 'Credible', 'Valuable']
  },
  { 
    name: 'User-Centered Design', 
    id: 'ucd_iso_9241',
    sections: ['User-Centered Design', 'Understand Context of Use', 'Specify Requirements', 'Design Solutions', 'Evaluate Designs']
  },
  { 
    name: 'HEART Framework', 
    id: 'heart_framework',
    sections: ['HEART Framework', 'Happiness', 'Engagement', 'Adoption', 'Retention', 'Task Success']
  },
  { 
    name: 'Hooked Model', 
    id: 'hooked_model',
    sections: ['Hooked Model', 'Trigger', 'Action', 'Variable Reward', 'Investment']
  }
];

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../../public/frameworks');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Read the main AI tools file
const inputFile = path.join(__dirname, '../../AI_Tools_for_UX_Design_Thinking (1).md');
const content = fs.readFileSync(inputFile, 'utf8');

// Split content into sections
const sections = [];
let currentSection = null;
let currentContent = [];

const lines = content.split('\n');

// First, split the document into sections
for (const line of lines) {
  // Check if this line is a section header (starts with ## or ###)
  const sectionMatch = line.match(/^#{2,3} [🧭🔧]?\s*([^\n]+)/);
  
  if (sectionMatch) {
    // Save previous section if exists
    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n')
      });
    }
    
    // Start new section
    currentSection = sectionMatch[1].trim();
    currentContent = [line];
  } else if (currentSection) {
    currentContent.push(line);
  }
}

// Save the last section
if (currentSection) {
  sections.push({
    title: currentSection,
    content: currentContent.join('\n')
  });
}

// Group sections by framework
const frameworkSections = {};

for (const framework of frameworks) {
  frameworkSections[framework.name] = [];
  
  // Find all sections that belong to this framework
  for (const section of sections) {
    // Check if this section belongs to the current framework
    const isFrameworkSection = framework.sections.some(sectionName => 
      section.title.toLowerCase().includes(sectionName.toLowerCase())
    );
    
    if (isFrameworkSection) {
      frameworkSections[framework.name].push(section);
    }
  }
}

// Write each framework's content to a separate file
for (const framework of frameworks) {
  const sections = frameworkSections[framework.name] || [];
  
  if (sections.length > 0) {
    // Combine all sections for this framework
    const header = `# 🤖 AI Tools for UX – ${framework.name} Framework\n\n`;
    const content = header + sections.map(s => s.content).join('\n\n');
    
    const outputFile = path.join(outputDir, `${framework.id}_tools.md`);
    fs.writeFileSync(outputFile, content);
    console.log(`Created: ${outputFile} (${sections.length} sections)`);
  } else {
    console.warn(`No content found for framework: ${framework.name}`);
  }
}

console.log('Framework files created successfully!');
