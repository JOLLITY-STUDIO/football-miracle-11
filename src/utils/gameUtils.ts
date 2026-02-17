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
        count += slot.athleteCard.icons.filter((i: string) => i === iconType).length;
      }
    });
  });
  return count;
};

export const calculateActivatedIconPositions = (playerField: FieldZone[], aiField: FieldZone[]): { zone: number; position: number }[] => {
  const activatedPositions: { zone: number; position: number }[] = [];
  const processedCards = new Set<string>();
  
  const processField = (field: FieldZone[], isPlayer: boolean) => {
    field.forEach(zone => {
      zone.slots.forEach(slot => {
        if (slot.athleteCard) {
          const card = slot.athleteCard;
          const cardKey = `${card.id}-${zone.zone}-${slot.position}`;
          
          // Skip if this card has already been processed for this slot
          if (processedCards.has(cardKey)) return;
          processedCards.add(cardKey);
          
          // Define icon position to slot position mapping
          const iconSlotMap: Record<string, number> = {
            'slot-topLeft': slot.position,
            'slot-topRight': slot.position + 1,
            'slot-bottomLeft': slot.position,
            'slot-bottomRight': slot.position + 1
          };
          
          // Define which icon positions are relevant for each zone and icon type
          const relevantPositionsByZone: Record<number, { positions: string[]; iconTypes: string[] }> = {
            0: { positions: ['slot-topLeft', 'slot-topRight'], iconTypes: ['defense'] },    // AI defense - top positions (only defense icons)
            3: { positions: ['slot-bottomLeft', 'slot-bottomRight'], iconTypes: ['attack'] }, // AI attack - bottom positions (only attack icons)
            4: { positions: ['slot-topLeft', 'slot-topRight'], iconTypes: ['attack'] },    // Player attack - top positions (only attack icons)
            7: { positions: ['slot-bottomLeft', 'slot-bottomRight'], iconTypes: ['defense'] }  // Player defense - bottom positions (only defense icons)
          };
          
          const relevantPositions = relevantPositionsByZone[zone.zone];
          if (!relevantPositions) return;
          
          // Only add activated positions for relevant icon positions and types
          card.iconPositions.forEach((iconPos: any) => {
            if (relevantPositions.positions.includes(iconPos.position) && relevantPositions.iconTypes.includes(iconPos.type)) {
              const targetSlot = iconSlotMap[iconPos.position];
              if (targetSlot !== undefined && targetSlot >= 0 && targetSlot < 8) {
                activatedPositions.push({
                  zone: zone.zone,
                  position: targetSlot
                });
              }
            }
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
