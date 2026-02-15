import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../data/cards';

export const placeCard = (
  state: GameState, 
  card: PlayerCard, 
  zone: number, 
  slot: number,
  isFirstTurn: boolean = false
): GameState => {
  const newPlayerField = JSON.parse(JSON.stringify(state.playerField));
  const newAiField = JSON.parse(JSON.stringify(state.aiField));
  
  const targetField = state.currentTurn === 'player' ? newPlayerField : newAiField;
  const targetZoneIndex = targetField.findIndex(z => z.zone === zone);
  
  if (targetZoneIndex !== -1) {
    const targetZone = targetField[targetZoneIndex];
    
    // Check if slot is within bounds (0-7 for 8-column field)
    if (slot < 0 || slot > 7) {
      return state;
    }
    
    // For 8-column field, each card occupies 2 slots
    // Ensure slot is not the last column (7) as it would go out of bounds
    if (slot === 7) {
      return state;
    }
    
    // Check if slots are empty
    const slot1 = targetZone.slots.find(s => s.position === slot);
    const slot2 = targetZone.slots.find(s => s.position === slot + 1);
    
    if (slot1 && slot2 && !slot1.playerCard && !slot2.playerCard) {
      // Place card in both slots
      slot1.playerCard = card;
      slot2.playerCard = card;
      
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
  }
  
  return state;
};