// Analysis script for LWF in zone 3
const { RotationUtils } = require('./dist/utils/rotationUtils.js');

// A02 LWF tactics data
const lwfTactics = {
  left: { down: 'press' },
  right: { top: 'attack', down: 'attack', right: 'attack' }
};

// Generate rotatedTactics
const rotatedTactics = RotationUtils.generateRotatedTactics(lwfTactics);

console.log('=== A02 LWF Analysis ===');
console.log('Original tactics:');
console.log(JSON.stringify(lwfTactics, null, 2));

console.log('\nRotated tactics:');
console.log(JSON.stringify(rotatedTactics, null, 2));

// Zone 3 scenario (slotIndex = 6 for 6-7 columns)
const slotIndex = 6;
const fieldIconType = 'attack';
const zoneNum = 3;

console.log('\n=== Zone 3 Scenario ===');
console.log('LWF position: 6-7 columns (slotIndex = 6)');
console.log('Field icon type:', fieldIconType);

// Check top icons (for zone 3 AI)
console.log('\nChecking rotatedTactics top icons:');
console.log('left.top:', rotatedTactics.left?.top);
console.log('left.top matches field icon:', rotatedTactics.left?.top === fieldIconType);
console.log('right.top:', rotatedTactics.right?.top);
console.log('right.top matches field icon:', rotatedTactics.right?.top === fieldIconType);

// Calculate adjusted slot indices
const leftAdjustedSlot = slotIndex - 1;
const rightAdjustedSlot = slotIndex;

console.log('\nAdjusted slot indices:');
console.log('Left adjusted slot:', leftAdjustedSlot);
console.log('Right adjusted slot:', rightAdjustedSlot);

// Check boundary conditions
console.log('\nBoundary conditions:');
console.log('Left slot valid (>0 && <7):', leftAdjustedSlot > 0 && leftAdjustedSlot < 7);
console.log('Right slot valid (>0 && <7):', rightAdjustedSlot > 0 && rightAdjustedSlot < 7);

// Summary
console.log('\n=== Summary ===');
if (rotatedTactics.left?.top === fieldIconType && leftAdjustedSlot > 0 && leftAdjustedSlot < 7) {
  console.log('✓ Will activate attack icon at column', leftAdjustedSlot + 1);
} else {
  console.log('✗ Will not activate left attack icon');
}

if (rotatedTactics.right?.top === fieldIconType && rightAdjustedSlot > 0 && rightAdjustedSlot < 7) {
  console.log('✓ Will activate attack icon at column', rightAdjustedSlot + 1);
} else {
  console.log('✗ Will not activate right attack icon');
}
