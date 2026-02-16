/**
 * Field Configuration System
 * 
 * This module provides a flexible configuration system for game fields,
 * decoupling field display logic from home/away team identities.
 * 
 * Key features:
 * - Define field halves with their own properties
 * - Configure display options per half
 * - Support for mirroring and rotation
 * - Decoupled from specific team identities
 */

/**
 * Field half configuration
 */
export interface FieldHalfConfig {
  /** Unique identifier for the field half */
  id: 'top' | 'bottom';
  /** Display name for the field half */
  name: string;
  /** Starting zone index for this half */
  startZone: number;
  /** Number of zones in this half */
  zoneCount: number;
  /** Display configuration */
  display: {
    /** Whether to mirror the column positions */
    mirrorColumns: boolean;
    /** Rotation angle for cards in this half */
    cardRotation: number;
    /** Positioning offset */
    position: {
      top: number;
      left: number;
    };
  };
  /** Interaction configuration */
  interaction: {
    /** Whether this half is interactive for card placement */
    interactive: boolean;
  };
}

/**
 * Field configuration
 */
export interface FieldConfiguration {
  /** Total number of zones on the field */
  totalZones: number;
  /** Total number of rows per half */
  rowsPerHalf: number;
  /** Total number of columns */
  columns: number;
  /** Field halves configuration */
  halves: {
    top: FieldHalfConfig;
    bottom: FieldHalfConfig;
  };
  /** Get field half config by zone number */
  getHalfByZone(zone: number): FieldHalfConfig;
  /** Get display variant by zone number */
  getVariantByZone(zone: number): 'home' | 'away';
  /** Check if zone is in top half */
  isTopHalf(zone: number): boolean;
  /** Check if zone is in bottom half */
  isBottomHalf(zone: number): boolean;
}

/**
 * Create field configuration
 */
export const createFieldConfig = (): FieldConfiguration => {
  const config: FieldConfiguration = {
    totalZones: 8,
    rowsPerHalf: 4,
    columns: 8,
    halves: {
      top: {
        id: 'top',
        name: 'Top Half',
        startZone: 0,
        zoneCount: 4,
        display: {
          mirrorColumns: true,
          cardRotation: 180,
          position: {
            top: 0,
            left: 0,
          },
        },
        interaction: {
          interactive: false,
        },
      },
      bottom: {
        id: 'bottom',
        name: 'Bottom Half',
        startZone: 4,
        zoneCount: 4,
        display: {
          mirrorColumns: false,
          cardRotation: 0,
          position: {
            top: 520, // 4 rows * 130px per row
            left: 0,
          },
        },
        interaction: {
          interactive: true,
        },
      },
    },

    /**
     * Get field half config by zone number
     */
    getHalfByZone(zone: number): FieldHalfConfig {
      if (zone >= 0 && zone < 4) {
        return this.halves.top;
      } else if (zone >= 4 && zone < 8) {
        return this.halves.bottom;
      } else {
        throw new Error(`Invalid zone number: ${zone}`);
      }
    },

    /**
     * Get display variant by zone number
     */
    getVariantByZone(zone: number): 'home' | 'away' {
      return zone >= 4 ? 'home' : 'away';
    },

    /**
     * Check if zone is in top half
     */
    isTopHalf(zone: number): boolean {
      return zone >= 0 && zone < 4;
    },

    /**
     * Check if zone is in bottom half
     */
    isBottomHalf(zone: number): boolean {
      return zone >= 4 && zone < 8;
    },
  };

  return config;
};

/**
 * Default field configuration
 */
export const FIELD_CONFIG = createFieldConfig();
