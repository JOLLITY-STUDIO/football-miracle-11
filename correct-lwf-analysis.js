// Correct analysis for LWF in zone 3

// A02 LWF tactics data
const lwfTactics = {
  left: { down: 'press' },
  right: { top: 'attack', down: 'attack', right: 'attack' }
};

// Generate rotatedTactics manually (replicating RotationUtils logic)
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

const rotatedTactics = generateRotatedTactics(lwfTactics);

console.log('=== Corrected A02 LWF Analysis ===');
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

// Check bottom icons (for zone 3 AI)
console.log('\nChecking rotatedTactics bottom icons:');
console.log('left.down:', rotatedTactics.left?.down);
console.log('left.down matches field icon:', rotatedTactics.left?.down === fieldIconType);
console.log('right.down:', rotatedTactics.right?.down);
console.log('right.down matches field icon:', rotatedTactics.right?.down === fieldIconType);

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
if (rotatedTactics.left?.down === fieldIconType && leftAdjustedSlot > 0 && leftAdjustedSlot < 7) {
  console.log('✓ Will activate attack icon at column', leftAdjustedSlot + 1);
  console.log('  Reason: rotatedTactics.left.down = attack matches field icon');
} else {
  console.log('✗ Will not activate left attack icon');
}

if (rotatedTactics.right?.down === fieldIconType && rightAdjustedSlot > 0 && rightAdjustedSlot < 7) {
  console.log('✓ Will activate attack icon at column', rightAdjustedSlot + 1);
  console.log('  Reason: rotatedTactics.right.down = attack matches field icon');
} else {
  console.log('✗ Will not activate right attack icon');
  console.log('  Reason: rotatedTactics.right.down =', rotatedTactics.right?.down);
}
