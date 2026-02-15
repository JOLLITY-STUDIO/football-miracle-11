import type { GameState } from '../game/gameLogic';

export const performPenalty = (state: GameState, zone: number, slot: number): GameState => {
  // Mock implementation for penalty actions
  return {
    ...state,
    message: 'Penalty performed',
    pendingPenalty: false
  };
};
