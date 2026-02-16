import type { GameState } from '../game/gameLogic';
import { calculateDefensePower } from './gameUtils';

export const resolveShot = (state: GameState): GameState => {
  if (!state.pendingShot) return state;
  
  const { attacker, defender } = state.pendingShot;
  
  const playerZones = state.currentTurn === 'player' ? state.playerField : state.aiField;
  const aiZones = state.currentTurn === 'player' ? state.aiField : state.playerField;
  
  const usedShotIcons = state.currentTurn === 'player' 
    ? (state.playerUsedShotIcons[attacker.card.id] || [])
    : (state.aiUsedShotIcons[attacker.card.id] || []);
  
  const attackPower = calculateAttackPower(attacker.card, playerZones, usedShotIcons) + 
    (state.playerActiveSynergy.length * 2);
  
  let defensePower = 0;
  if (defender) {
    defensePower = calculateDefensePower(defender.card, aiZones) + 
      (state.aiActiveSynergy.length * 2);
  }
  
  let result: 'goal' | 'save' | 'miss';
  if (!defender) {
    result = 'goal';
  } else if (attackPower > defensePower) {
    result = 'goal';
  } else if (attackPower === defensePower) {
    result = 'save';
  } else {
    result = 'miss';
  }
  
  let newState = { ...state };
  if (result === 'goal') {
    if (state.currentTurn === 'player') {
      newState.playerScore += 1;
    } else {
      newState.aiScore += 1;
    }
  }
  
  newState.pendingShot = {
    ...state.pendingShot,
    attackerPower: attackPower,
    defenderPower: defensePower,
    result
  };
  
  return newState;
};
