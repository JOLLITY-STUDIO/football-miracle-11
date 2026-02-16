/**
 * Script to remove console.log statements from source files
 * Keeps console.warn and console.error for important messages
 */

const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/hooks/useGameState.ts',
  'src/components/GameField.tsx',
  'src/components/GameBoard.tsx',
  'src/demos/DemosPage.tsx',
  'src/demos/Demo7_ArcLayout.tsx',
  'src/data/tutorialSteps.ts'
];

function removeConsoleLogs(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalLength = content.length;
  
  // Remove console.log statements (but keep console.warn and console.error)
  content = content.replace(/\s*console\.log\([^)]*\);?\n?/g, '');
  
  // Remove empty lines that might be left
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Cleaned ${filePath} (removed ${originalLength - content.length} characters)`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

console.log('Starting console.log cleanup...\n');

filesToClean.forEach(file => {
  try {
    removeConsoleLogs(file);
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('\n✓ Cleanup complete!');
