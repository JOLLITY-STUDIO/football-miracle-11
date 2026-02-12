import type { GameState } from '../game/gameLogic';

export const performTeamAction = (state: GameState, action: 'pass' | 'press'): GameState => {
  let newControlPosition = state.controlPosition;
  let message = '';
  
  switch (action) {
    case 'pass':
      newControlPosition += state.currentTurn === 'player' ? 10 : -10;
      message = 'Pass action performed';
      break;
    case 'press':
      newControlPosition += state.currentTurn === 'player' ? 5 : -5;
      message = 'Press action performed';
      break;
  }
  
  // Clamp position between 0-100
  newControlPosition = Math.max(0, Math.min(100, newControlPosition));
  
  return {
    ...state,
    controlPosition: newControlPosition,
    message,
    turnPhase: 'playerAction'
  };
};