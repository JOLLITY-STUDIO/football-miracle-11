import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../types/game';

export const placeCard = (state: GameState, card: PlayerCard, zone: number, slot: number): GameState => {
  const newPlayerField = [...state.playerField];
  const newAiField = [...state.aiField];
  
  const targetField = state.currentTurn === 'player' ? newPlayerField : newAiField;
  
  if (targetField[zone] && targetField[zone].cards[slot] === undefined) {
    targetField[zone].cards[slot] = card;
    
    // Remove card from hand
    const newHand = state.currentTurn === 'player' 
      ? state.playerHand.filter(c => c.id !== card.id)
      : state.aiHand.filter(c => c.id !== card.id);
    
    return {
      ...state,
      ...(state.currentTurn === 'player' ? {
        playerField: newPlayerField,
        playerHand: newHand
      } : {
        aiField: newAiField,
        aiHand: newHand
      }),
      message: `${card.name} placed on field`
    };
  }
  
  return state;
};