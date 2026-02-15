import type { athleteCard } from '../data/cards';
import type { FieldZone } from '../types/game';

export const calculateAttackPower = (card: athleteCard): number => {
  let power = card.power || 0;
  
  if (card.skills?.includes('shot')) {
    power += 2;
  }
  
  if (card.position?.includes('CF') || card.position?.includes('ST')) {
    power += 1;
  }
  
  return power;
};

export const calculateDefensePower = (card: athleteCard): number => {
  let power = card.power || 0;
  
  if (card.skills?.includes('defense')) {
    power += 2;
  }
  
  if (card.position?.includes('CB') || card.position?.includes('GK')) {
    power += 1;
  }
  
  return power;
};

export const countIcons = (field: FieldZone[], iconType: string): number => {
  let count = 0;
  field.forEach(zone => {
    zone.slots.forEach(slot => {
      if (slot.athleteCard) {
        count += slot.athleteCard.icons.filter(i => i === iconType).length;
      }
    });
  });
  return count;
};

export const getControlState = (controlPosition: number): 'low' | 'medium' | 'high' => {
  if (controlPosition < 33) return 'low';
  if (controlPosition < 67) return 'medium';
  return 'high';
};

export const getMaxSynergyCardsForAttack = (controlState: 'low' | 'medium' | 'high'): number => {
  switch (controlState) {
    case 'low': return 1;
    case 'medium': return 2;
    case 'high': return 3;
    default: return 1;
  }
};
