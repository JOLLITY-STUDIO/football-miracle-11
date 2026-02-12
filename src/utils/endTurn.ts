import type { GameState } from '../game/gameLogic';

export const performEndTurn = (state: GameState): GameState => {
  // Switch turns
  const newTurn = state.currentTurn === 'player' ? 'ai' : 'player';
  const newTurnCount = state.turnCount + 1;
  
  // Check if we need to reset for half-time (every 10 turns)
  const isHalfTime = newTurnCount % 10 === 0;
  
  let newState: GameState = {
    ...state,
    currentTurn: newTurn,
    turnCount: newTurnCount,
    turnPhase: 'start',
    isFirstTurn: false
  };
  
  // Reset used shot icons at half-time
  if (isHalfTime) {
    newState.playerUsedShotIcons = {};
    newState.aiUsedShotIcons = {};
    newState.message = 'Half-time! All used shot icons have been reset.';
  }
  
  // Reset for new turn
  newState.playerActiveSynergy = [];
  newState.aiActiveSynergy = [];
  newState.duelPhase = 'none';
  newState.pendingShot = null;
  
  return newState;
};