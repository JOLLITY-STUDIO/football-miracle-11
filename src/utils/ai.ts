import type { GameState } from '../game/gameLogic';

export const aiTurn = (state: GameState): GameState => {
  // Mock AI implementation
  // In a real implementation, this would contain AI decision logic
  
  return {
    ...state,
    message: 'AI turn completed',
    aiActionStep: 'none'
  };
};