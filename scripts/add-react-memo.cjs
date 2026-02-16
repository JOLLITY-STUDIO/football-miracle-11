/**
 * Script to add React.memo to components for performance optimization
 */

const fs = require('fs');
const path = require('path');

const componentsToOptimize = [
  {
    file: 'src/components/AthleteCard.tsx',
    componentName: 'AthleteCardComponent',
    compareProps: `(prevProps, nextProps) => {
  return prevProps.card.id === nextProps.card.id &&
         prevProps.selected === nextProps.selected &&
         prevProps.faceDown === nextProps.faceDown &&
         prevProps.disabled === nextProps.disabled &&
         JSON.stringify(prevProps.usedShotIcons) === JSON.stringify(nextProps.usedShotIcons);
}`
  },
  {
    file: 'src/components/SynergyCard.tsx',
    componentName: 'SynergyCardComponent',
    compareProps: `(prevProps, nextProps) => {
  return prevProps.card.id === nextProps.card.id &&
         prevProps.selected === nextProps.selected &&
         prevProps.faceDown === nextProps.faceDown;
}`
  }
];

function addReactMemo(config) {
  const fullPath = path.join(process.cwd(), config.file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${config.file}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if already has React.memo
  if (content.includes(`React.memo`)) {
    console.log(`- ${config.file} already optimized`);
    return;
  }
  
  // Find the export statement
  const exportPattern = new RegExp(`export const ${config.componentName}:`, 'g');
  
  if (!exportPattern.test(content)) {
    console.log(`! Could not find export for ${config.componentName} in ${config.file}`);
    return;
  }
  
  // Add comment before the component
  const comment = `\n// Optimized with React.memo to prevent unnecessary re-renders\n`;
  content = content.replace(
    new RegExp(`(export const ${config.componentName}:)`, 'g'),
    `${comment}$1`
  );
  
  // Wrap the component with React.memo at the end of file
  // Find the closing of the component (last }; before end of file)
  const lines = content.split('\n');
  const lastBraceIndex = lines.length - 1 - lines.slice().reverse().findIndex(line => line.trim() === '};');
  
  if (lastBraceIndex >= 0) {
    lines[lastBraceIndex] = `});\n\n// Memoized version for performance\nexport const ${config.componentName}Memo = React.memo(${config.componentName}, ${config.compareProps});`;
    content = lines.join('\n');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✓ Added React.memo to ${config.file}`);
  } else {
    console.log(`! Could not find component closing in ${config.file}`);
  }
}

console.log('Adding React.memo optimizations...\n');

componentsToOptimize.forEach(config => {
  try {
    addReactMemo(config);
  } catch (error) {
    console.error(`Error processing ${config.file}:`, error.message);
  }
});

console.log('\n✓ Optimization complete!');
console.log('\nNote: Update imports to use the Memo versions where needed.');
