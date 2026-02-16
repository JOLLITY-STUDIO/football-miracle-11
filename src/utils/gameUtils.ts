import type { athleteCard } from '../data/cards';
import type { FieldZone } from '../types/game';
import { calculateAttackBonus, calculateDefenseBonus } from '../game/tactics';

export const calculateAttackPower = (card: athleteCard, zones: any[], usedShotIcons: number[] = []): number => {
  let power = card.power || 0;
  
  const attackIcons = card.iconPositions.filter(pos => pos.type === 'attack');
  const availableAttackIcons = attackIcons.filter((_, index) => !usedShotIcons.includes(index));
  power += availableAttackIcons.length;
  
  const attackBonus = calculateAttackBonus(zones);
  power += attackBonus;
  
  return power;
};

export const calculateDefensePower = (card: athleteCard, zones: any[]): number => {
  let power = card.power || 0;
  
  const defenseIcons = card.iconPositions.filter(pos => pos.type === 'defense');
  power += defenseIcons.length;
  
  const defenseBonus = calculateDefenseBonus(zones);
  power += defenseBonus;
  
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

export const calculateActivatedIconPositions = (playerField: FieldZone[], aiField: FieldZone[]): { zone: number; position: number }[] => {
  const activatedPositions: { zone: number; position: number }[] = [];
  
  const processField = (field: FieldZone[], isPlayer: boolean) => {
    field.forEach(zone => {
      zone.slots.forEach(slot => {
        if (slot.athleteCard) {
          const card = slot.athleteCard;
          card.iconPositions.forEach(iconPos => {
            activatedPositions.push({
              zone: zone.zone,
              position: slot.position
            });
          });
        }
      });
    });
  };
  
  processField(playerField, true);
  processField(aiField, false);
  
  return activatedPositions;
};

export const getControlState = (controlPosition: number): 'low' | 'medium' | 'high' => {
  if (controlPosition < 33) return 'high';
  if (controlPosition < 67) return 'medium';
  return 'low';
};

export const getMaxSynergyCardsForAttack = (controlState: 'low' | 'medium' | 'high'): number => {
  switch (controlState) {
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 0;
    default: return 0;
  }
};
