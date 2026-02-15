/**
 * Placement Rules Configuration
 * 
 * IMPORTANT: This file contains critical placement rules that should not be modified without careful consideration.
 * Any changes to these rules will affect card placement validation across the entire game.
 * 
 * Zone Layout:
 * - Zones 0-3: AI half (top of field)
 * - Zones 4-7: Player half (bottom of field)
 * 
 * Card Placement Rules:
 * - Each card spans 2 columns
 * - Start column must be 0-6 (cannot start at column 7)
 * - Each player type can only be placed in specific zones
 * - First cards cannot be placed in certain zones
 * - Some zones require adjacent cards
 * - First turn has additional restrictions for forwards
 */

/**
 * Valid zones for each player type
 */
export const VALID_ZONES = {
  fw: [2, 3, 4, 5], // Forwards can be placed in zones 2-5
  mf: [1, 2, 5, 6], // Midfielders can be placed in zones 1, 2, 5, 6
  df: [0, 1, 6, 7], // Defenders can be placed in zones 0, 1, 6, 7
} as const;

/**
 * Column constraints
 */
export const COLUMN_CONSTRAINTS = {
  MIN_COLUMN: 0,
  MAX_START_COLUMN: 6, // Cards span 2 columns, so max start is 6 (occupies 6-7)
  TOTAL_COLUMNS: 8,
  COLUMNS_PER_CARD: 2,
} as const;

/**
 * First card placement restrictions
 * First cards cannot be placed in certain zones when no other cards are on field
 */
export const FIRST_CARD_RESTRICTIONS = {
  FORWARD_FORBIDDEN_ZONES: [3, 4], // Forwards cannot be placed in zones 3 or 4
} as const;

/**
 * Adjacency requirements
 * Some zones require adjacent cards
 */
export const ADJACENCY_REQUIREMENTS = {
  ZONE_1: {
    zone: 1,
    adjacentZones: [1, 2], // Zone 1 requires adjacent card in Zone 1 or Zone 2
  },
  ZONE_3_FIRST_TURN: {
    zone: 3,
    cardType: 'fw',
    adjacentZones: [2, 3, 4], // Zone 3 requires adjacent card in Zones 2, 3, or 4
  },
  ZONE_4_FIRST_TURN: {
    zone: 4,
    cardType: 'fw',
    adjacentZones: [3, 4, 5], // Zone 4 requires adjacent card in Zones 3, 4, or 5
  },
} as const;

/**
 * Get valid zones for a player type
 * @param type - Player type ('fw', 'mf', 'df')
 * @returns Array of valid zone numbers
 */
export const getValidZones = (type: string): number[] => {
  return VALID_ZONES[type as keyof typeof VALID_ZONES] || [];
};

/**
 * Check if a zone is valid for a player type
 * @param type - Player type ('fw', 'mf', 'df')
 * @param zone - Zone number to check
 * @returns True if zone is valid for this player type
 */
export const isZoneValidForPlayerType = (type: string, zone: number): boolean => {
  const validZones = getValidZones(type);
  return validZones.includes(zone);
};

/**
 * Check if column is within valid range for card placement
 * @param column - Column number to check
 * @returns True if column is valid for starting a card placement
 */
export const isColumnValidForPlacement = (column: number): boolean => {
  return column >= COLUMN_CONSTRAINTS.MIN_COLUMN && column <= COLUMN_CONSTRAINTS.MAX_START_COLUMN;
};