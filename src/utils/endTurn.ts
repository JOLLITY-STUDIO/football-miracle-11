import type { GameState } from '../game/gameLogic';
import { isHalfTime } from '../game/gameLogic';

export const performEndTurn = (state: GameState): GameState => {
  // Switch turns
  const newTurn = state.currentTurn === 'player' ? 'ai' : 'player';
  const newTurnCount = state.turnCount + 1;
  
  // Check if we need to reset for half-time (using helper function)
  const isHalfTimeTurn = isHalfTime(state);
  
  let newState: GameState = {
    ...state,
    currentTurn: newTurn,
    turnCount: newTurnCount,
    turnPhase: 'teamAction',
    isFirstTurn: false,
    skipTeamAction: false,
    isFirstMatchTurn: false
  };
  
  // Reset used shot icons at half-time
  if (isHalfTimeTurn) {
    newState.playerUsedShotIcons = {};
    newState.aiUsedShotIcons = {};
    newState.message = 'Half-time! All used shot icons have been reset.';
    // Skip team action phase after half-time, go directly to player action
    newState.turnPhase = 'playerAction';
  }
  
  // Reset for new turn
  newState.playerActiveSynergy = [];
  newState.aiActiveSynergy = [];
  newState.duelPhase = 'none';
  newState.pendingShot = null;
  
  // Set AI action step if it's AI turn
  if (newTurn === 'ai') {
    newState.aiActionStep = 'teamAction';
    newState.message = 'AI is thinking...';
  } else {
    newState.message = 'Your turn!';
  }
  
  return newState;
};