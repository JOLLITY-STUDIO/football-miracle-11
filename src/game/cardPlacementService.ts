/**
 * Card Placement Service
 * 
 * This service provides a unified interface for card placement logic,
 * ensuring consistency across the entire application.
 * 
 * Key responsibilities:
 * - Validate card placement based on rules
 * - Calculate card positions
 * - Manage placement state
 * - Provide consistent placement API
 */

import type { AthleteCard } from '../data/cards';
import type { FieldZone } from '../types/game';
import { RuleValidator, type FieldState } from './ruleValidator';
import { 
  VALID_ZONES, 
  COLUMN_CONSTRAINTS, 
  FIRST_CARD_RESTRICTIONS, 
  ADJACENCY_REQUIREMENTS,
  getValidZones,
  isZoneValidForPlayerType,
  isColumnValidForPlacement
} from './placementRules';

/**
 * Placement validation result
 */
export interface PlacementValidationResult {
  valid: boolean;
  reason: string | undefined;
  canHighlight: boolean | undefined;
}

/**
 * Card placement service
 */
export class CardPlacementService {
  /**
   * Validate if a card can be placed at a specific position
   * 
   * @param card - The athlete card to place
   * @param fieldSlots - Current field state
   * @param zone - Target zone number (0-7)
   * @param startCol - Starting column position (0-6, cards span 2 columns)
   * @param isFirstTurn - Whether this is the first turn of placement
   * @returns Validation result with valid flag and reason if invalid
   */
  static validatePlacement(
    card: AthleteCard,
    fieldSlots: FieldState[],
    zone: number,
    startCol: number,
    isFirstTurn: boolean
  ): PlacementValidationResult {
    const result = RuleValidator.canPlaceCard(card, fieldSlots, zone, startCol, isFirstTurn);
    
    // Use the same result for both valid and canHighlight to ensure consistency
    const canHighlight = result.valid;
    
    console.log('🎯 CardPlacementService.validatePlacement:', {
      card: card.nickname,
      zone,
      startCol,
      isFirstTurn,
      result: {
        valid: result.valid,
        reason: result.reason,
        canHighlight
      }
    });
    
    return {
      valid: result.valid,
      reason: result.reason,
      canHighlight
    };
  }

  /**
   * Check if a position should be highlighted
   * 
   * @param card - The athlete card to place
   * @param fieldSlots - Current field state
   * @param zone - Target zone number (0-7)
   * @param startCol - Starting column position (0-6, cards span 2 columns)
   * @param isFirstTurn - Whether this is the first turn of placement
   * @returns True if position should be highlighted
   */
  static canHighlight(
    card: AthleteCard,
    fieldSlots: FieldState[],
    zone: number,
    startCol: number,
    isFirstTurn: boolean
  ): boolean {
    // Validate placement directly using RuleValidator
    const result = RuleValidator.canPlaceCard(card, fieldSlots, zone, startCol, isFirstTurn);
    const canHighlight = result.valid;
    
    console.log('🔍 CardPlacementService.canHighlight:', {
      card: card.nickname,
      zone,
      startCol,
      isFirstTurn,
      result: {
        valid: result.valid,
        canHighlight
      }
    });
    
    return canHighlight;
  }

  /**
   * Get the actual start column for placement
   * Handles special case for column 7 (last column)
   * 
   * @param clickedColumn - The column that was clicked (0-7)
   * @returns The actual start column for placement (0-6, cards span 2 columns)
   */
  static getStartColumn(clickedColumn: number): number {
    // Column 7 (last column) should map to column 6 for placement
    // Cards can only start at columns 0-6, occupying columns [0-1], [1-2], ..., [6-7]
    return clickedColumn === 7 ? 6 : clickedColumn;
  }

  /**
   * Check if column is the last column
   * 
   * @param column - Column number to check
   * @returns True if column is the last column (7)
   */
  static isLastColumn(column: number): boolean {
    return column === COLUMN_CONSTRAINTS.TOTAL_COLUMNS - 1;
  }

  /**
   * Get all valid zones for a player type
   * 
   * @param type - Player type ('fw', 'mf', 'df')
   * @returns Array of valid zone numbers
   */
  static getValidZones(type: string): number[] {
    return getValidZones(type);
  }

  /**
   * Check if zone is valid for player type
   * 
   * @param type - Player type ('fw', 'mf', 'df')
   * @param zone - Zone number to check
   * @returns True if zone is valid for this player type
   */
  static isZoneValid(type: string, zone: number): boolean {
    return isZoneValidForPlayerType(type, zone);
  }

  /**
   * Check if column is valid for placement
   * 
   * @param column - Column number to check
   * @returns True if column is valid for starting a card placement
   */
  static isColumnValid(column: number): boolean {
    return isColumnValidForPlacement(column);
  }
}