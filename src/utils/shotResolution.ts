import type { GameState } from '../game/gameLogic';
import { calculateDefensePower } from './gameUtils';

export const resolveShot = (state: GameState): GameState => {
  if (!state.pendingShot) return state;
  
  const { attacker, defender } = state.pendingShot;
  
  // Calculate final attack power
  const attackPower = attacker.card.power + 
    (state.playerActiveSynergy.length * 2) + // Synergy bonus
    (attacker.card.skills?.includes('shot') ? 3 : 0); // Shot skill bonus
  
  // Calculate final defense power
  let defensePower = 0;
  if (defender) {
    defensePower = defender.card.power + 
      (state.aiActiveSynergy.length * 2) + // Synergy bonus
      (defender.card.skills?.includes('defense') ? 3 : 0); // Defense skill bonus
  }
  
  // Determine result
  let result: 'goal' | 'save' | 'miss';
  if (!defender) {
    result = 'goal'; // No defender = automatic goal
  } else if (attackPower > defensePower) {
    result = 'goal';
  } else if (attackPower === defensePower) {
    result = 'save';
  } else {
    result = 'miss';
  }
  
  // Update scores
  let newState = { ...state };
  if (result === 'goal') {
    if (state.currentTurn === 'player') {
      newState.playerScore += 1;
    } else {
      newState.aiScore += 1;
    }
  }
  
  // Update pending shot with final values
  newState.pendingShot = {
    ...state.pendingShot,
    attackerPower: attackPower,
    defenderPower: defensePower,
    result
  };
  
  return newState;
};