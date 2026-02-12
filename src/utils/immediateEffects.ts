import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../types/game';

export const performImmediateEffect = (state: GameState, card: PlayerCard, zone: number, slot: number): GameState => {
  // Mock implementation for immediate effects
  // In a real implementation, this would handle various immediate effects
  // like drawing cards, discarding opponent cards, etc.
  
  return {
    ...state,
    message: `Immediate effect triggered: ${card.name}`,
    pendingImmediateEffect: null
  };
};