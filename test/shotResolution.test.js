import { createInitialState, gameReducer } from '../src/game/gameLogic';
import { resolveShot } from '../src/utils/shotResolution';

// Mock card data
const mockAttackerCard = {
  id: 'test_attacker',
  nickname: 'Test Attacker',
  icons: ['attack', 'attack', 'defense'],
  iconPositions: [
    { type: 'attack' },
    { type: 'attack' },
    { type: 'defense' }
  ],
  power: 2
};

const mockDefenderCard = {
  id: 'test_defender',
  nickname: 'Test Defender',
  icons: ['defense', 'defense'],
  iconPositions: [
    { type: 'defense' },
    { type: 'defense' }
  ],
  power: 1
};

test('resolveShot should update score when shot results in goal', () => {
  // Create initial state
  const initialState = createInitialState();
  
  // Set up a shot attempt with high attack power to ensure goal
  const stateWithPendingShot = {
    ...initialState,
    currentTurn: 'player',
    pendingShot: {
      attacker: {
        card: mockAttackerCard,
        zone: 0,
        slot: 0,
        usedShotIcons: []
      },
      defender: {
        card: mockDefenderCard,
        zone: 0,
        slot: 0
      },
      phase: 'result',
      attackerPower: 10, // High attack power
      defenderPower: 2,  // Low defense power
      attackSynergy: [],
      defenseSynergy: [],
      activatedSkills: {
        attackerSkills: [],
        defenderSkills: []
      },
      result: 'goal' // Manually set result to goal
    }
  };
  
  // Initial score should be 0
  expect(stateWithPendingShot.playerScore).toBe(0);
  
  // Resolve the shot
  const resolvedState = resolveShot(stateWithPendingShot);
  
  // Score should be updated to 1
  expect(resolvedState.playerScore).toBe(1);
  console.log('✅ Test passed: Score updated correctly after goal');
});

test('gameReducer should call resolveShot when duel ends', () => {
  // Create initial state
  const initialState = createInitialState();
  
  // Set up a shot attempt
  const stateWithPendingShot = {
    ...initialState,
    currentTurn: 'player',
    duelPhase: 'result',
    pendingShot: {
      attacker: {
        card: mockAttackerCard,
        zone: 0,
        slot: 0,
        usedShotIcons: []
      },
      defender: {
        card: mockDefenderCard,
        zone: 0,
        slot: 0
      },
      phase: 'result',
      attackerPower: 10,
      defenderPower: 2,
      attackSynergy: [],
      defenseSynergy: [],
      activatedSkills: {
        attackerSkills: [],
        defenderSkills: []
      },
      result: 'goal'
    }
  };
  
  // Initial score should be 0
  expect(stateWithPendingShot.playerScore).toBe(0);
  
  // Advance duel to end it
  const finalState = gameReducer(stateWithPendingShot, { type: 'ADVANCE_DUEL' });
  
  // Score should be updated to 1
  expect(finalState.playerScore).toBe(1);
  console.log('✅ Test passed: gameReducer calls resolveShot when duel ends');
});

console.log('All tests completed!');
