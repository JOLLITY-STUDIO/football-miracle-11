// Detailed test case for LWF in zone 3

// Replicate the exact logic from the codebase
function generateRotatedTactics(tactics) {
  return {
    left: {
      left: tactics.right?.right,
      top: tactics.right?.down,
      down: tactics.right?.top
    },
    right: {
      top: tactics.left?.down,
      down: tactics.left?.top,
      right: tactics.left?.left
    }
  };
}

// A02 LWF tactics data
const lwfTactics = {
  left: { down: 'press' },
  right: { top: 'attack', down: 'attack', right: 'attack' }
};

// Generate rotatedTactics
const rotatedTactics = generateRotatedTactics(lwfTactics);

console.log('=== Detailed LWF Zone 3 Test ===');
console.log('A02 LWF Tactics:');
console.log(JSON.stringify(lwfTactics, null, 2));

console.log('\nRotated Tactics:');
console.log(JSON.stringify(rotatedTactics, null, 2));

// Simulate zone 3 scenario
const testCases = [
  { slotIndex: 4, columns: '5-6', description: 'LWF in 5-6 columns' },
  { slotIndex: 5, columns: '6-7', description: 'LWF in 6-7 columns' },
  { slotIndex: 6, columns: '7-8', description: 'LWF in 7-8 columns' }
];

const fieldIconType = 'attack';
const zoneNum = 3;

testCases.forEach(testCase => {
  console.log(`\n=== Test Case: ${testCase.description} ===`);
  console.log(`Slot index: ${testCase.slotIndex}`);
  console.log(`Columns: ${testCase.columns}`);
  
  // Check bottom icons (for zone 3 AI)
  console.log('\nChecking rotatedTactics bottom icons:');
  console.log('left.down:', rotatedTactics.left?.down);
  console.log('left.down matches field icon:', rotatedTactics.left?.down === fieldIconType);
  console.log('right.down:', rotatedTactics.right?.down);
  console.log('right.down matches field icon:', rotatedTactics.right?.down === fieldIconType);
  
  // Calculate adjusted slot indices
  const leftAdjustedSlot = testCase.slotIndex - 1;
  const rightAdjustedSlot = testCase.slotIndex;
  
  console.log('\nAdjusted slot indices:');
  console.log('Left adjusted slot:', leftAdjustedSlot);
  console.log('Right adjusted slot:', rightAdjustedSlot);
  
  // Check boundary conditions
  console.log('\nBoundary conditions:');
  console.log('Left slot valid (>0 && <7):', leftAdjustedSlot > 0 && leftAdjustedSlot < 7);
  console.log('Right slot valid (>0 && <7):', rightAdjustedSlot > 0 && rightAdjustedSlot < 7);
  
  // Check if complete icon should be generated
  const shouldGenerateLeftIcon = rotatedTactics.left?.down === fieldIconType && leftAdjustedSlot > 0 && leftAdjustedSlot < 7;
  const shouldGenerateRightIcon = rotatedTactics.right?.down === fieldIconType && rightAdjustedSlot > 0 && rightAdjustedSlot < 7;
  
  console.log('\nShould generate icons:');
  console.log('Left icon (column', leftAdjustedSlot + 1, '):', shouldGenerateLeftIcon);
  console.log('Right icon (column', rightAdjustedSlot + 1, '):', shouldGenerateRightIcon);
  
  if (shouldGenerateLeftIcon) {
    console.log('✓ Will generate attack icon at column', leftAdjustedSlot + 1);
  } else if (rotatedTactics.left?.down === fieldIconType) {
    console.log('✗ Would generate icon but slot is out of bounds');
  } else {
    console.log('✗ No match for left.down');
  }
});

console.log('\n=== Summary ===');
console.log('Expected behavior:');
console.log('- LWF in 5-6 columns (slot 4): Should generate icon at column 5');
console.log('- LWF in 6-7 columns (slot 5): Should generate icon at column 6');
console.log('- LWF in 7-8 columns (slot 6): Should generate icon at column 7 (but out of bounds)');
