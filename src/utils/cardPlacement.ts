import type { GameState } from '../game/gameLogic';
import type { PlayerCard } from '../data/cards';

export const placeCard = (
  state: GameState, 
  card: PlayerCard, 
  zone: number, 
  slot: number
): GameState => {
  console.log('=== placeCard called ===');
  console.log('Card:', card.name, 'ID:', card.id);
  console.log('Zone:', zone, 'Slot:', slot);
  console.log('Current turn:', state.currentTurn);
  console.log('Player field zones:', state.playerField.map(z => z.zone));
  console.log('AI field zones:', state.aiField.map(z => z.zone));
  
  const newPlayerField = JSON.parse(JSON.stringify(state.playerField));
  const newAiField = JSON.parse(JSON.stringify(state.aiField));
  
  const targetField = state.currentTurn === 'player' ? newPlayerField : newAiField;
  const targetZoneIndex = targetField.findIndex((z: any) => z.zone === zone);
  
  console.log('Target zone index:', targetZoneIndex);
  
  if (targetZoneIndex !== -1) {
    const targetZone = targetField[targetZoneIndex];
    console.log('Target zone:', targetZone.zone);
    console.log('Target zone slots:', targetZone.slots.map((s: any) => ({ pos: s.position, card: s.playerCard?.name || null })));
    
    // Check if slot is within bounds (0-7 for 8-column field)
    if (slot < 0 || slot > 7) {
      console.log('Slot out of bounds:', slot);
      return state;
    }
    
    // For 8-column field, each card occupies 2 slots
    // Ensure slot is not the last column (7) as it would go out of bounds
    if (slot === 7) {
      console.log('Cannot place at slot 7 (would go out of bounds)');
      return state;
    }
    
    // Check if slots are empty
    const slot1 = targetZone.slots.find((s: any) => s.position === slot);
    const slot2 = targetZone.slots.find((s: any) => s.position === slot + 1);
    
    console.log('Slot1:', slot1 ? { pos: slot1.position, hasCard: !!slot1.playerCard } : 'not found');
    console.log('Slot2:', slot2 ? { pos: slot2.position, hasCard: !!slot2.playerCard } : 'not found');
    
    // 检查插槽是否为null，如果为null则初始化为空对象
                  const safeSlot1 = slot1 || { position: slot, playerCard: null, usedShotIcons: [], shotMarkers: 0 };
                  const safeSlot2 = slot2 || { position: slot + 1, playerCard: null, usedShotIcons: [], shotMarkers: 0 };
                  
                  if (!safeSlot1.playerCard && !safeSlot2.playerCard) {
      // Place card in both slots
safeSlot1.playerCard = card;
                  safeSlot2.playerCard = card;
      console.log('Card placed successfully in slots', slot, 'and', slot + 1);
      
      // Remove card from hand
      const newHand = state.currentTurn === 'player' 
        ? state.playerHand.filter(c => c.id !== card.id)
        : state.aiHand.filter(c => c.id !== card.id);
      
      console.log('New hand size:', newHand.length);
      
      const newState = {
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
      
      console.log('New state player field:', newState.playerField.map((z: any) => ({
        zone: z.zone,
        cards: z.slots.filter((s: any) => s.playerCard).map((s: any) => ({ pos: s.position, card: s.playerCard?.name }))
      })));
      
      return newState;
    } else {
      console.log('Cannot place - slots not empty or not found');
    }
  } else {
    console.log('Zone not found:', zone);
  }
  
  console.log('=== placeCard failed, returning original state ===');
  return state;
};