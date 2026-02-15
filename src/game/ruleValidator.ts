import type { AthleteCard, SynergyCard } from '../data/cards';

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  details?: string;
}

export interface FieldState {
  zone: number;
  slots: { position: number; athleteCard: AthleteCard | null; shotMarkers?: number }[];
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
    card: AthleteCard,
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
    
    // 基于球员类型判断可放置区域
    const getValidZones = (type: string): number[] => {
      switch (type) {
        case 'fw':
          return [2, 3, 4, 5]; // 前锋可放置在2-5区域
        case 'mf':
          return [1, 2, 5, 6]; // 中场只能放置在1、2、5、6行
        case 'df':
          return [0, 1, 6, 7]; // 后卫只能放置在0、1、6、7行
        default:
          return [];
      }
    };
    
    const validZones = getValidZones(card.type);
    if (!validZones.includes(zone)) {
      return { valid: false, reason: 'Card cannot be placed in this zone' };
    }
    
    const slot1 = targetZone.slots.find(s => s.position === startCol);
    const slot2 = targetZone.slots.find(s => s.position === startCol + 1);
    
    if (!slot1 || !slot2) {
      return { valid: false, reason: 'Slot not found' };
    }
    
    if (slot1.athleteCard || slot2.athleteCard) {
      return { valid: false, reason: 'Slot already occupied' };
    }
    
    const hasAnyCard = fieldSlots.some(z => z.slots.some(s => s.athleteCard));
    
    // 场上没有其他卡时，前锋不能放在3、4行
    if (!hasAnyCard && card.type === 'fw' && (zone === 3 || zone === 4)) {
      return { valid: false, reason: 'Forward cannot be placed in Zone 3 or 4 when no other cards are on field' };
    }
    
    // Zone 1: 第三行（AI半场）- 需要相邻验证
    if (zone === 1) {
      if (!hasAnyCard) {
        return { valid: false, reason: 'First card cannot be placed in Zone 1' };
      }
      
      const zone1 = fieldSlots.find(z => z.zone === 1);
      const zone2 = fieldSlots.find(z => z.zone === 2);
      
      const hasAdjacentInZone1 = zone1?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      const hasBehindInZone2 = zone2?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      
      if (!hasAdjacentInZone1 && !hasBehindInZone2) {
        return { valid: false, reason: 'Zone 1 requires adjacent card in Zone 1 or Zone 2' };
      }
    }
    
    // Zone 3: AI半场第一行（最靠近中线）- 第一回合前锋需要相邻验证
    if (zone === 3 && isFirstTurn && card.type === 'fw') {
      const zone3 = fieldSlots.find(z => z.zone === 3);
      const zone2 = fieldSlots.find(z => z.zone === 2);
      const zone4 = fieldSlots.find(z => z.zone === 4);
      
      const hasAdjacentInZone3 = zone3?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      const hasBehindInZone2 = zone2?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      const hasAheadInZone4 = zone4?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      
      if (!hasAdjacentInZone3 && !hasBehindInZone2 && !hasAheadInZone4) {
        return { valid: false, reason: 'First turn: Forward in Zone 3 requires adjacent players' };
      }
    }
    
    // Zone 4: 玩家半场第一行（最靠近中线）- 第一回合前锋需要相邻验证
    if (zone === 4 && isFirstTurn && card.type === 'fw') {
      const zone4 = fieldSlots.find(z => z.zone === 4);
      const zone3 = fieldSlots.find(z => z.zone === 3);
      const zone5 = fieldSlots.find(z => z.zone === 5);
      
      const hasAdjacentInZone4 = zone4?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      const hasBehindInZone3 = zone3?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      const hasAheadInZone5 = zone5?.slots.some(s => 
        s.athleteCard && Math.abs(s.position - startCol) <= 1
      );
      
      if (!hasAdjacentInZone4 && !hasBehindInZone3 && !hasAheadInZone5) {
        return { valid: false, reason: 'First turn: Forward in Zone 4 requires adjacent players' };
      }
    }
    
    return { valid: true };
  }

  static canShoot(
    attacker: AthleteCard,
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
    
    if (!attackerSlotData || !attackerSlotData.athleteCard) {
      return { valid: false, reason: 'Attacker not found on field' };
    }
    
    if (attackerSlotData.athleteCard.id !== attacker.id) {
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
    // Check if synergyCard is valid
    if (!synergyCard) {
      return { valid: false, reason: 'Invalid synergy card' };
    }
    
    const hand = isPlayer ? gameState.playerSynergyHand : gameState.aiSynergyHand;
    
    // Check if hand exists and is not empty
    if (!hand || hand.length === 0) {
      return { valid: false, reason: 'No synergy cards in hand' };
    }
    
    // Check if card is in hand using proper comparison (by ID)
    const cardInHand = hand.some(card => card && card.id === synergyCard.id);
    if (!cardInHand) {
      return { valid: false, reason: 'Card not in hand' };
    }
    
    return { valid: true };
  }

  static getValidAttackers(
    field: FieldState[],
    gameState: GameStateForRules,
    isPlayer: boolean
  ): { zone: number; slot: number; card: AthleteCard }[] {
    const attackers: { zone: number; slot: number; card: AthleteCard }[] = [];
    
    field.forEach(z => {
      z.slots.forEach(s => {
        if (s.athleteCard) {
          const result = this.canShoot(s.athleteCard, z.zone, s.position, gameState, isPlayer);
          if (result.valid) {
            attackers.push({ zone: z.zone, slot: s.position, card: s.athleteCard });
          }
        }
      });
    });
    
    return attackers;
  }

  static getValidPlacements(
    cards: AthleteCard[],
    field: FieldState[],
    isFirstTurn: boolean
  ): { card: AthleteCard; zone: number; startCol: number }[] {
    const placements: { card: AthleteCard; zone: number; startCol: number }[] = [];
    
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