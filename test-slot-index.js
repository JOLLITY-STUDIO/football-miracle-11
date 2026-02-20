// Test slot index calculation for different positions

console.log('=== Slot Index Calculation Test ===');

// Column positions and their corresponding slot indices
const columnPositions = [
  { columns: '1-2', slotIndex: 0 },
  { columns: '2-3', slotIndex: 1 },
  { columns: '3-4', slotIndex: 2 },
  { columns: '4-5', slotIndex: 3 },
  { columns: '5-6', slotIndex: 4 },
  { columns: '6-7', slotIndex: 5 },
  { columns: '7-8', slotIndex: 6 }
];

console.log('\nColumn positions and slot indices:');
columnPositions.forEach(pos => {
  console.log(`${pos.columns} columns -> slotIndex = ${pos.slotIndex}`);
});

// Test LWF in 6-7 columns (slotIndex = 5)
console.log('\n=== LWF in 6-7 columns Test ===');
const slotIndex = 5;
const adjustedSlotIndex = slotIndex - 1;

console.log(`Slot index for 6-7 columns: ${slotIndex}`);
console.log(`Adjusted slot index: ${adjustedSlotIndex}`);
console.log(`Adjusted slot index valid (>0 && <7): ${adjustedSlotIndex > 0 && adjustedSlotIndex < 7}`);

// Test LWF rotatedTactics
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

const lwfTactics = {
  left: { down: 'press' },
  right: { top: 'attack', down: 'attack', right: 'attack' }
};

const rotatedTactics = generateRotatedTactics(lwfTactics);

console.log('\nLWF rotatedTactics.left.down:', rotatedTactics.left?.down);
console.log('Matches attack icon:', rotatedTactics.left?.down === 'attack');

// Check if icon should be generated
const shouldGenerateIcon = rotatedTactics.left?.down === 'attack' && adjustedSlotIndex > 0 && adjustedSlotIndex < 7;

console.log('\nShould generate attack icon:', shouldGenerateIcon);
if (shouldGenerateIcon) {
  console.log('✓ Will generate attack icon at column', adjustedSlotIndex + 1);
} else {
  console.log('✗ Will not generate attack icon');
}
