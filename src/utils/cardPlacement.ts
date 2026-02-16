import type { GameState } from '../game/gameLogic';
import type { athleteCard } from '../data/cards';
import type { FieldZone } from '../types/game';

/**
 * Efficiently clone field zones using structured cloning
 */
const cloneFieldZones = (zones: FieldZone[]): FieldZone[] => {
  return zones.map(zone => ({
    ...zone,
    cards: [...zone.cards],
    synergyCards: [...zone.synergyCards],
    slots: zone.slots.map(slot => ({
      ...slot,
      athleteCard: slot.athleteCard // Keep reference, no need to clone
    }))
  }));
};

export const placeCard = (
  state: GameState, 
  card: athleteCard, 
  zone: number, 
  slot: number
): GameState => {
  console.log('=== placeCard called ===');
  console.log('Card:', card.name, 'ID:', card.id);
  console.log('Zone:', zone, 'Slot:', slot);
  console.log('Current turn:', state.currentTurn);
  console.log('Player field zones:', state.playerField.map(z => z.zone));
  console.log('AI field zones:', state.aiField.map(z => z.zone));
  
  // Validate slot bounds
  if (slot < 0 || slot > 7) {
    console.log('Slot out of bounds:', slot);
    return state;
  }
  
  // Cards occupy 2 slots, cannot start at last column
  if (slot === 7) {
    console.log('Cannot place at slot 7 (would go out of bounds)');
    return state;
  }
  
  // Clone only the field that will be modified
  const isPlayerTurn = state.currentTurn === 'player';
  const sourceField = isPlayerTurn ? state.playerField : state.aiField;
  const newField = cloneFieldZones(sourceField);
  
  const targetZoneIndex = newField.findIndex(z => z.zone === zone);
  
  if (targetZoneIndex === -1) {
    console.log('Zone not found:', zone);
    return state;
  }
  
  const targetZone = newField[targetZoneIndex];
  const slot1Index = targetZone.slots.findIndex(s => s.position === slot);
  const slot2Index = targetZone.slots.findIndex(s => s.position === slot + 1);
  
  console.log('Slot1 index:', slot1Index, 'Slot2 index:', slot2Index);
  
  // Ensure slots exist
  if (slot1Index === -1 || slot2Index === -1) {
    console.log('Slots not found in zone');
    return state;
  }
  
  const slot1 = targetZone.slots[slot1Index];
  const slot2 = targetZone.slots[slot2Index];
  
  console.log('Slot1:', { pos: slot1.position, hasCard: !!slot1.athleteCard });
  console.log('Slot2:', { pos: slot2.position, hasCard: !!slot2.athleteCard });
  
  // Check if slots are empty
  if (!slot1 || !slot2 || slot1.athleteCard || slot2.athleteCard) {
    console.log('Cannot place - slots not empty or not found');
    return state;
  }
  
  // Place card in both slots
  targetZone.slots[slot1Index] = { ...slot1, athleteCard: card };
  targetZone.slots[slot2Index] = { ...slot2, athleteCard: card };
  console.log('Card placed successfully in slots', slot, 'and', slot + 1);
  
  // Remove card from hand
  const sourceHand = isPlayerTurn ? state.playerHand : state.aiHand;
  const newHand = sourceHand.filter(c => c.id !== card.id);
  
  console.log('New hand size:', newHand.length);
  
  // Return new state with only modified fields
  const newState = {
    ...state,
    ...(isPlayerTurn ? {
      playerField: newField,
      playerHand: newHand
    } : {
      aiField: newField,
      aiHand: newHand
    }),
    message: `${card.name} placed on field`
  };
  
  console.log('New state player field:', newState.playerField.map((z: any) => ({
    zone: z.zone,
    cards: z.slots.filter((s: any) => s.athleteCard).map((s: any) => ({ pos: s.position, card: s.athleteCard?.name }))
  })));
  
  return newState;
};
