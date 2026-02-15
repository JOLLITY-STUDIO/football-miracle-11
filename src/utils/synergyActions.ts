import type { GameState } from '../game/gameLogic';
import type { SynergyCard, athleteCard } from '../types/game';

export const useSynergy = (state: GameState, synergyCard: SynergyCard, targetCard: athleteCard): GameState => {
  const isPlayer = state.currentTurn === 'player';
  
  // Add synergy card to active synergy
  const newActiveSynergy = isPlayer 
    ? [...state.playerActiveSynergy, synergyCard]
    : [...state.aiActiveSynergy, synergyCard];
  
  // Remove from hand
  const newSynergyHand = isPlayer
    ? state.playerSynergyHand.filter(c => c.id !== synergyCard.id)
    : state.aiSynergyHand.filter(c => c.id !== synergyCard.id);
  
  return {
    ...state,
    ...(isPlayer ? {
      playerActiveSynergy: newActiveSynergy,
      playerSynergyHand: newSynergyHand
    } : {
      aiActiveSynergy: newActiveSynergy,
      aiSynergyHand: newSynergyHand
    }),
    message: `Synergy card used: ${synergyCard.name}`
  };
};
