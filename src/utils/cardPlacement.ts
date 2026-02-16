import type { GameState } from '../game/gameLogic';
import type { athleteCard } from '../data/cards';
import type { FieldZone } from '../types/game';
import { logger } from './logger';

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
  logger.game('PLACE_CARD', { card: card.nickname, cardId: card.id, zone, slot, turn: state.currentTurn });
  
  // Validate slot bounds
  if (slot < 0 || slot > 7) {
    logger.warn('Slot out of bounds:', slot);
    return state;
  }
  
  // Cards occupy 2 slots, cannot start at last column
  if (slot === 7) {
    logger.warn('Cannot place at slot 7 (would go out of bounds)');
    return state;
  }
  
  // Clone only the field that will be modified
  const isPlayerTurn = state.currentTurn === 'player';
  const sourceField = isPlayerTurn ? state.playerField : state.aiField;
  const newField = cloneFieldZones(sourceField);
  
  const targetZoneIndex = newField.findIndex(z => z.zone === zone);
  
  if (targetZoneIndex === -1) {
    logger.warn('Zone not found:', zone);
    return state;
  }
  
  const targetZone = newField[targetZoneIndex];
  if (!targetZone) {
    logger.warn('Zone not found:', zone);
    return state;
  }
  
  const slot1Index = targetZone.slots.findIndex(s => s.position === slot);
  const slot2Index = targetZone.slots.findIndex(s => s.position === slot + 1);
  
  logger.debug('Slot indices:', { slot1Index, slot2Index });
  
  // Ensure slots exist
  if (slot1Index === -1 || slot2Index === -1) {
    logger.warn('Slots not found in zone');
    return state;
  }
  
  const slot1 = targetZone.slots[slot1Index];
  const slot2 = targetZone.slots[slot2Index];
  
  if (!slot1 || !slot2) {
    logger.warn('Slots not found');
    return state;
  }
  
  logger.debug('Slot check:', { 
    slot1: { pos: slot1.position, hasCard: !!slot1.athleteCard },
    slot2: { pos: slot2.position, hasCard: !!slot2.athleteCard }
  });
  
  // Check if slots are empty
  if (slot1.athleteCard || slot2.athleteCard) {
    logger.warn('Cannot place - slots not empty');
    return state;
  }
  
  // Place card in both slots
  targetZone.slots[slot1Index] = { ...slot1, athleteCard: card };
  targetZone.slots[slot2Index] = { ...slot2, athleteCard: card };
  logger.game('CARD_PLACED', { cardName: card.nickname, slots: [slot, slot + 1] });
  

  
  // Remove card from hand
  const sourceHand = isPlayerTurn ? state.playerAthleteHand : state.aiAthleteHand;
  const newHand = sourceHand.filter(c => c.id !== card.id);
  
  logger.debug('New hand size:', newHand.length);
  
  // Return new state with only modified fields
  const newState = {
    ...state,
    ...(isPlayerTurn ? {
      playerField: newField,
      playerAthleteHand: newHand
    } : {
      aiField: newField,
      aiAthleteHand: newHand
    }),
    message: `${card.nickname} placed on field`
  };
  
  logger.debug('Final state:', { 
    playerField: newState.playerField.map(z => ({
      zone: z.zone,
      cards: z.slots.filter(s => s.athleteCard).map(s => ({ pos: s.position, card: s.athleteCard?.name }))
    }))
  });
  
  return newState;
};
