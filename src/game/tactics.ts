import type { PlayerCard, TacticalIcon, IconWithPosition } from '../data/cards';

export interface TacticalSlot {
  id: string;
  zone: number;
  position: number;
  playerCard: PlayerCard | null;
}

export interface TacticalZone {
  id: number;
  name: string;
  slots: TacticalSlot[];
}

export interface TacticalConnection {
  fromSlot: string;
  toSlot: string;
  iconType: TacticalIcon;
  fromPosition: string;
  toPosition: string;
}

export interface TacticalEffect {
  iconType: TacticalIcon;
  connections: TacticalConnection[];
  totalCount: number;
}

export interface TacticalBoard {
  zones: TacticalZone[];
  connections: TacticalConnection[];
  effects: Map<TacticalIcon, number>;
}

const ADJACENT_POSITIONS: Record<string, { position: string; direction: 'left' | 'right' | 'up' | 'down' }[]> = {
  'slot1-topLeft': [
    { position: 'slot1-topRight', direction: 'right' },
    { position: 'slot1-middleLeft', direction: 'down' },
  ],
  'slot1-topRight': [
    { position: 'slot1-topLeft', direction: 'left' },
    { position: 'slot1-middleRight', direction: 'down' },
    { position: 'slot2-topLeft', direction: 'right' },
  ],
  'slot1-middleLeft': [
    { position: 'slot1-topLeft', direction: 'up' },
    { position: 'slot1-middleRight', direction: 'right' },
    { position: 'slot1-bottomLeft', direction: 'down' },
  ],
  'slot1-middleRight': [
    { position: 'slot1-topRight', direction: 'up' },
    { position: 'slot1-middleLeft', direction: 'left' },
    { position: 'slot1-bottomRight', direction: 'down' },
    { position: 'slot2-middleLeft', direction: 'right' },
  ],
  'slot1-bottomLeft': [
    { position: 'slot1-middleLeft', direction: 'up' },
    { position: 'slot1-bottomRight', direction: 'right' },
  ],
  'slot1-bottomRight': [
    { position: 'slot1-middleRight', direction: 'up' },
    { position: 'slot1-bottomLeft', direction: 'left' },
    { position: 'slot2-bottomLeft', direction: 'right' },
  ],
  'slot2-topLeft': [
    { position: 'slot1-topRight', direction: 'left' },
    { position: 'slot2-topRight', direction: 'right' },
    { position: 'slot2-middleLeft', direction: 'down' },
  ],
  'slot2-topRight': [
    { position: 'slot2-topLeft', direction: 'left' },
    { position: 'slot2-middleRight', direction: 'down' },
  ],
  'slot2-middleLeft': [
    { position: 'slot1-middleRight', direction: 'left' },
    { position: 'slot2-topLeft', direction: 'up' },
    { position: 'slot2-middleRight', direction: 'right' },
    { position: 'slot2-bottomLeft', direction: 'down' },
  ],
  'slot2-middleRight': [
    { position: 'slot2-topRight', direction: 'up' },
    { position: 'slot2-middleLeft', direction: 'left' },
    { position: 'slot2-bottomRight', direction: 'down' },
  ],
  'slot2-bottomLeft': [
    { position: 'slot1-bottomRight', direction: 'left' },
    { position: 'slot2-middleLeft', direction: 'up' },
    { position: 'slot2-bottomRight', direction: 'right' },
  ],
  'slot2-bottomRight': [
    { position: 'slot2-middleRight', direction: 'up' },
    { position: 'slot2-bottomLeft', direction: 'left' },
  ],
};

const MATCHING_POSITIONS: Record<string, string> = {
  'slot1-topLeft': 'slot2-topRight',
  'slot1-topRight': 'slot2-topLeft',
  'slot1-middleLeft': 'slot2-middleRight',
  'slot1-middleRight': 'slot2-middleLeft',
  'slot1-bottomLeft': 'slot2-bottomRight',
  'slot1-bottomRight': 'slot2-bottomLeft',
  'slot2-topLeft': 'slot1-topRight',
  'slot2-topRight': 'slot1-topLeft',
  'slot2-middleLeft': 'slot1-middleRight',
  'slot2-middleRight': 'slot1-middleLeft',
  'slot2-bottomLeft': 'slot1-bottomRight',
  'slot2-bottomRight': 'slot1-bottomLeft',
};

export function createTacticalBoard(): TacticalZone[] {
  return [
    {
      id: 1,
      name: 'Attack Zone',
      slots: [
        { id: '1-1', zone: 1, position: 1, playerCard: null },
        { id: '1-2', zone: 1, position: 2, playerCard: null },
        { id: '1-3', zone: 1, position: 3, playerCard: null },
        { id: '1-4', zone: 1, position: 4, playerCard: null },
      ],
    },
    {
      id: 2,
      name: 'Midfield Zone',
      slots: [
        { id: '2-1', zone: 2, position: 1, playerCard: null },
        { id: '2-2', zone: 2, position: 2, playerCard: null },
        { id: '2-3', zone: 2, position: 3, playerCard: null },
        { id: '2-4', zone: 2, position: 4, playerCard: null },
      ],
    },
    {
      id: 3,
      name: 'Defense Zone',
      slots: [
        { id: '3-1', zone: 3, position: 1, playerCard: null },
        { id: '3-2', zone: 3, position: 2, playerCard: null },
        { id: '3-3', zone: 3, position: 3, playerCard: null },
        { id: '3-4', zone: 3, position: 4, playerCard: null },
      ],
    },
    {
      id: 4,
      name: 'Goal Zone',
      slots: [
        { id: '4-1', zone: 4, position: 1, playerCard: null },
        { id: '4-2', zone: 4, position: 2, playerCard: null },
        { id: '4-3', zone: 4, position: 3, playerCard: null },
        { id: '4-4', zone: 4, position: 4, playerCard: null },
      ],
    },
  ];
}

export function findSlot(
  zones: TacticalZone[],
  zoneId: number,
  slotPosition: number
): TacticalSlot | null {
  const zone = zones.find(z => z.id === zoneId);
  if (!zone) return null;
  return zone.slots.find(s => s.position === slotPosition) || null;
}

export function findSlotById(zones: TacticalZone[], slotId: string): TacticalSlot | null {
  for (const zone of zones) {
    const slot = zone.slots.find(s => s.id === slotId);
    if (slot) return slot;
  }
  return null;
}

export function getAdjacentSlots(
  zones: TacticalZone[],
  currentSlot: TacticalSlot
): TacticalSlot[] {
  const adjacent: TacticalSlot[] = [];
  const zoneIndex = zones.findIndex(z => z.id === currentSlot.zone);
  const currentZone = zones[zoneIndex];
  
  if (!currentZone) return adjacent;
  
  const slotIndex = currentZone.slots.findIndex(s => s.id === currentSlot.id);

  if (slotIndex === -1) return adjacent;

  if (slotIndex > 0) {
    const leftSlot = currentZone.slots[slotIndex - 1];
    if (leftSlot) adjacent.push(leftSlot);
  }

  if (slotIndex < currentZone.slots.length - 1) {
    const rightSlot = currentZone.slots[slotIndex + 1];
    if (rightSlot) adjacent.push(rightSlot);
  }

  if (zoneIndex > 0) {
    const upZone = zones[zoneIndex - 1];
    if (upZone) {
      const upSlot = upZone.slots[slotIndex];
      if (upSlot) adjacent.push(upSlot);
    }
  }

  if (zoneIndex < zones.length - 1) {
    const downZone = zones[zoneIndex + 1];
    if (downZone) {
      const downSlot = downZone.slots[slotIndex];
      if (downSlot) adjacent.push(downSlot);
    }
  }

  return adjacent;
}

export function calculateTacticalConnections(
  zones: TacticalZone[]
): TacticalConnection[] {
  const connections: TacticalConnection[] = [];
  const processedPairs = new Set<string>();

  for (const zone of zones) {
    for (const slot of zone.slots) {
      if (!slot.playerCard) continue;

      const card = slot.playerCard;
      
      for (const iconWithPos of card.iconPositions) {
        const matchingPos = MATCHING_POSITIONS[iconWithPos.position];
        if (!matchingPos) continue;

        const adjacentSlots = getAdjacentSlots(zones, slot);
        
        for (const adjSlot of adjacentSlots) {
          if (!adjSlot.playerCard) continue;

          const pairKey = [slot.id, adjSlot.id, iconWithPos.type].sort().join('-');
          if (processedPairs.has(pairKey)) continue;

          const hasMatchingIcon = adjSlot.playerCard.iconPositions.some(
            pos => pos.position === matchingPos && pos.type === iconWithPos.type
          );

          if (hasMatchingIcon) {
            connections.push({
              fromSlot: slot.id,
              toSlot: adjSlot.id,
              iconType: iconWithPos.type,
              fromPosition: iconWithPos.position,
              toPosition: matchingPos,
            });
            processedPairs.add(pairKey);
          }
        }
      }
    }
  }

  return connections;
}

export function calculateTacticalEffects(
  zones: TacticalZone[]
): Map<TacticalIcon, number> {
  const effects = new Map<TacticalIcon, number>();
  const connections = calculateTacticalConnections(zones);

  for (const conn of connections) {
    const current = effects.get(conn.iconType) || 0;
    effects.set(conn.iconType, current + 1);
  }

  for (const zone of zones) {
    for (const slot of zone.slots) {
      if (slot.playerCard?.completeIcon) {
        const current = effects.get(slot.playerCard.completeIcon) || 0;
        effects.set(slot.playerCard.completeIcon, current + 1);
      }
    }
  }

  return effects;
}

export function getTacticalBonus(effects: Map<TacticalIcon, number>, iconType: TacticalIcon): number {
  return effects.get(iconType) || 0;
}

export function calculateAttackBonus(zones: TacticalZone[]): number {
  const effects = calculateTacticalEffects(zones);
  return (effects.get('attack') || 0) + (effects.get('breakthrough') || 0) * 2;
}

export function calculateDefenseBonus(zones: TacticalZone[]): number {
  const effects = calculateTacticalEffects(zones);
  return (effects.get('defense') || 0) + (effects.get('press') || 0);
}

export function calculatePassBonus(zones: TacticalZone[]): number {
  const effects = calculateTacticalEffects(zones);
  return effects.get('pass') || 0;
}
