import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../types/game';

export const startDraftRound = (state: GameState): GameState => {
  // Mock implementation - should generate draft cards
  const mockCards: PlayerCard[] = [
    {
      id: 'draft1',
      name: 'Draft Player 1',
      position: 'CF',
      power: 5,
      iconPositions: [{ type: 'attack', position: 'top-25%' }],
      skills: [],
      image: 'draft1.png',
      rarity: 'common'
    },
    {
      id: 'draft2',
      name: 'Draft Player 2',
      position: 'CB',
      power: 4,
      iconPositions: [{ type: 'defense', position: 'bottom-25%' }],
      skills: [],
      image: 'draft2.png',
      rarity: 'common'
    }
  ];
  
  return {
    ...state,
    availableDraftCards: mockCards,
    message: 'Draft round started - choose your player'
  };
};

export const pickDraftCard = (state: GameState, cardIndex: number): GameState => {
  if (cardIndex >= 0 && cardIndex < state.availableDraftCards.length) {
    const selectedCard = state.availableDraftCards[cardIndex];
    const newHand = [...state.playerHand, selectedCard];
    
    return {
      ...state,
      playerHand: newHand,
      availableDraftCards: [],
      draftStep: state.draftStep + 1,
      message: `Selected ${selectedCard.name}`
    };
  }
  
  return state;
};