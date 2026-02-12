import type { PlayerCard, SynergyCard } from '../data/cards';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  details?: string;
}

export interface FieldState {
  zone: number;
  slots: { position: number; playerCard: PlayerCard | null; shotMarkers?: number }[];
}

export interface GameStateForRules {
  playerField: FieldState[];
  aiField: FieldState[];
  isFirstTurn: boolean;
  turnPhase: string;
  phase: string;
  currentTurn: 'player' | 'ai';
  controlPosition: number;
  playerSynergyHand?: SynergyCard[];
  aiSynergyHand?: SynergyCard[];
}

export class RuleValidator {
  static canPlaceCard(
    card: PlayerCard,
    fieldSlots: FieldState[],
    zone: number,
    startCol: number,
    isFirstTurn: boolean
  ): ValidationResult {
    const targetZone = fieldSlots.find(z => z.zone === zone);
    if (!targetZone) {
      return { valid: false, reason: 'Zone not found' };
    }
    
    if (startCol < 0 || startCol > 6) {
      return { valid: false, reason: 'Invalid column position' };
    }
    
    if (!card.zones.includes(zone)) {
      return { valid: false, reason: 'Card cannot be placed in this zone' };
    }
    
    const slot1 = targetZone.slots.find(s => s.position === startCol);
    const slot2 = targetZone.slots.find(s => s.position === startCol + 1);
    
    if (!slot1 || !slot2) {
      return { valid: false, reason: 'Slot not found' };
    }
    
    if (slot1.playerCard || slot2.playerCard) {
      return { valid: false, reason: 'Slot already occupied' };
    }
    
    const hasAnyCard = fieldSlots.some(z => z.slots.some(s => s.playerCard));
    
    if (zone === 1) {
      if (!hasAnyCard) {
        return { valid: false, reason: 'First card cannot be placed in Zone 1 (Front)' };
      }
      
      const zone1 = fieldSlots.find(z => z.zone === 1);
      const zone2 = fieldSlots.find(z => z.zone === 2);
      
      const hasAdjacentInZone1 = zone1?.slots.some(s => 
        s.playerCard && Math.abs(s.position - startCol) <= 1
      );
      const hasBehindInZone2 = zone2?.slots.some(s => 
        s.playerCard && Math.abs(s.position - startCol) <= 1
      );
      
      if (!hasAdjacentInZone1 && !hasBehindInZone2) {
        return { valid: false, reason: 'Zone 1 requires adjacent card in Zone 1 or Zone 2' };
      }
    }
    
    return { valid: true };
  }

  static canShoot(
    attacker: PlayerCard,
    attackerZone: number,
    attackerSlot: number,
    gameState: GameStateForRules,
    isPlayer: boolean
  ): ValidationResult {
    if (!attacker.icons.includes('attack')) {
      return { valid: false, reason: 'Card does not have attack icon' };
    }
    
    const attackerField = isPlayer ? gameState.playerField : gameState.aiField;
    const attackerZoneData = attackerField.find(z => z.zone === attackerZone);
    const attackerSlotData = attackerZoneData?.slots.find(s => s.position === attackerSlot);
    
    if (!attackerSlotData || !attackerSlotData.playerCard) {
      return { valid: false, reason: 'Attacker not found on field' };
    }
    
    if (attackerSlotData.playerCard.id !== attacker.id) {
      return { valid: false, reason: 'Card mismatch' };
    }
    
    if (gameState.turnPhase !== 'playerAction') {
      return { valid: false, reason: 'Cannot shoot during this phase' };
    }
    
    if (gameState.phase !== 'firstHalf' && gameState.phase !== 'secondHalf' && gameState.phase !== 'extraTime') {
      return { valid: false, reason: 'Cannot shoot during this phase' };
    }
    
    return { valid: true };
  }

  static canUseSynergyCard(
    synergyCard: SynergyCard,
    gameState: GameStateForRules,
    isPlayer: boolean,
    maxCards: number
  ): ValidationResult {
    const hand = isPlayer ? gameState.playerSynergyHand : gameState.aiSynergyHand;
    
    if (!hand.includes(synergyCard)) {
      return { valid: false, reason: 'Card not in hand' };
    }
    
    return { valid: true };
  }

  static getValidAttackers(
    field: FieldState[],
    gameState: GameStateForRules,
    isPlayer: boolean
  ): { zone: number; slot: number; card: PlayerCard }[] {
    const attackers: { zone: number; slot: number; card: PlayerCard }[] = [];
    
    field.forEach(z => {
      z.slots.forEach(s => {
        if (s.playerCard) {
          const result = this.canShoot(s.playerCard, z.zone, s.position, gameState, isPlayer);
          if (result.valid) {
            attackers.push({ zone: z.zone, slot: s.position, card: s.playerCard });
          }
        }
      });
    });
    
    return attackers;
  }

  static getValidPlacements(
    cards: PlayerCard[],
    field: FieldState[],
    isFirstTurn: boolean
  ): { card: PlayerCard; zone: number; startCol: number }[] {
    const placements: { card: PlayerCard; zone: number; startCol: number }[] = [];
    
    cards.forEach(card => {
      field.forEach(z => {
        for (let col = 0; col <= 6; col++) {
          const result = this.canPlaceCard(card, field, z.zone, col, isFirstTurn);
          if (result.valid) {
            placements.push({ card, zone: z.zone, startCol: col });
          }
        }
      });
    });
    
    return placements;
  }

  static validateTurnPhase(
    currentPhase: string,
    expectedPhase: string
  ): ValidationResult {
    if (currentPhase !== expectedPhase) {
      return { 
        valid: false, 
        reason: `Wrong phase. Expected: ${expectedPhase}, Current: ${currentPhase}` 
      };
    }
    return { valid: true };
  }

  static validateTurn(
    currentTurn: 'player' | 'ai',
    expectedTurn: 'player' | 'ai'
  ): ValidationResult {
    if (currentTurn !== expectedTurn) {
      return { 
        valid: false, 
        reason: `Wrong turn. Expected: ${expectedTurn}, Current: ${currentTurn}` 
      };
    }
    return { valid: true };
  }
}