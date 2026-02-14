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
    const slotPosition = Math.floor(slot / 2);
    
    // Check if slots are empty
    const slot1 = targetZone.slots.find(s => s.position === slotPosition);
    const slot2 = targetZone.slots.find(s => s.position === slotPosition + 1);
    
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