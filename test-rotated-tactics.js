// Test script to verify LWF rotatedTactics
const { RotationUtils } = require('./dist/utils/rotationUtils.js');

// A02 LWF tactics data
const lwfTactics = {
  left: { down: 'press' },
  right: { top: 'attack', down: 'attack', right: 'attack' }
};

// Generate rotatedTactics
const rotatedTactics = RotationUtils.generateRotatedTactics(lwfTactics);

console.log('Original tactics:');
console.log(JSON.stringify(lwfTactics, null, 2));

console.log('\nRotated tactics:');
console.log(JSON.stringify(rotatedTactics, null, 2));

// Test zone 3 scenario (slotIndex = 6 for 6-7 columns)
const slotIndex = 6;
const fieldIconType = 'attack';

console.log('\nZone 3 scenario (slotIndex = 6):');
console.log('Checking left.down:', rotatedTactics.left?.down === fieldIconType);
console.log('Checking right.down:', rotatedTactics.right?.down === fieldIconType);

// Calculate adjusted slot indices
const leftAdjustedSlot = slotIndex - 1;
const rightAdjustedSlot = slotIndex;

console.log('\nAdjusted slot indices:');
console.log('Left adjusted slot:', leftAdjustedSlot);
console.log('Right adjusted slot:', rightAdjustedSlot);

// Check boundary conditions
console.log('\nBoundary conditions:');
console.log('Left slot valid (>=0 && <=6):', leftAdjustedSlot >= 0 && leftAdjustedSlot <= 6);
console.log('Right slot valid (>=0 && <=6):', rightAdjustedSlot >= 0 && rightAdjustedSlot <= 6);
