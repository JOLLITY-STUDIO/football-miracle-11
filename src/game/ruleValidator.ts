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
  /**
   * Validates if a card can be placed at a specific position on the field
   * 
   * IMPORTANT: This function contains critical placement rules that should not be modified without careful consideration:
   * - Column bounds: Cards span 2 columns, so startCol must be 0-6
   * - Zone restrictions: Each player type can only be placed in specific zones
   * - First card restrictions: First cards cannot be placed in certain zones
   * - Adjacency requirements: Some zones require adjacent cards
   * - First turn restrictions: Forwards in certain zones require adjacent cards on first turn
   * 
   * @param card - The athlete card to place
   * @param fieldSlots - Current field state
   * @param zone - Target zone number (0-7)
   * @param startCol - Starting column position (0-6, cards span 2 columns)
   * @param isFirstTurn - Whether this is the first turn of placement
   * @returns ValidationResult with valid flag and reason if invalid
   */
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
    // 注意：玩家场地是4-7区域，AI场地是0-3区域
    const getValidZones = (type: string): number[] => {
      switch (type) {
        case 'fw':
          return [2, 3, 4, 5]; // 前锋可放置在2-5区域（玩家：4-5，AI：2-3）
        case 'mf':
          return [1, 2, 5, 6]; // 中场可放置在1、2、5、6区域（玩家：5-6，AI：1-2）
        case 'df':
          return [0, 1, 6, 7]; // 后卫可放置在0、1、6、7区域（玩家：6-7，AI：0-1）
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
    
    // 检查场地上是否有其他卡牌（根据场地类型自动判断）
    const isPlayerField = fieldSlots.some(z => z.zone >= 4);
    const hasAnyCard = fieldSlots.some(z => z.slots.some(s => s.athleteCard));
    
    // 场上没有其他卡时，前锋不能放在前线
    if (!hasAnyCard && card.type === 'fw') {
      if (isPlayerField && zone === 4) {
        return { valid: false, reason: 'Forward cannot be placed in Zone 4 when no other cards are on field' };
      }
      if (!isPlayerField && zone === 3) {
        return { valid: false, reason: 'Forward cannot be placed in Zone 3 when no other cards are on field' };
      }
    }
    
    // 前锋放置在前线时必须与已放置的另一张卡牌紧邻
    if (card.type === 'fw') {
      // 玩家场地（前线是Zone 4）
      if (isPlayerField && zone === 4) {
        const zone4 = fieldSlots.find(z => z.zone === 4);
        const zone5 = fieldSlots.find(z => z.zone === 5);
        
        const hasAdjacentInZone4 = zone4?.slots.some(s => 
          s.athleteCard && (Math.abs(s.position - startCol) <= 1 || Math.abs(s.position - (startCol + 1)) <= 1)
        );
        const hasAheadInZone5 = zone5?.slots.some(s => 
          s.athleteCard && (Math.abs(s.position - startCol) <= 1 || Math.abs(s.position - (startCol + 1)) <= 1)
        );
        
        if (!hasAdjacentInZone4 && !hasAheadInZone5) {
          return { valid: false, reason: 'Forward in Zone 4 must be adjacent to another player card' };
        }
      }
      // AI场地（前线是Zone 3）
      if (!isPlayerField && zone === 3) {
        const zone3 = fieldSlots.find(z => z.zone === 3);
        const zone2 = fieldSlots.find(z => z.zone === 2);
        
        const hasAdjacentInZone3 = zone3?.slots.some(s => 
          s.athleteCard && (Math.abs(s.position - startCol) <= 1 || Math.abs(s.position - (startCol + 1)) <= 1)
        );
        const hasBehindInZone2 = zone2?.slots.some(s => 
          s.athleteCard && (Math.abs(s.position - startCol) <= 1 || Math.abs(s.position - (startCol + 1)) <= 1)
        );
        
        if (!hasAdjacentInZone3 && !hasBehindInZone2) {
          return { valid: false, reason: 'Forward in Zone 3 must be adjacent to another AI card' };
        }
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