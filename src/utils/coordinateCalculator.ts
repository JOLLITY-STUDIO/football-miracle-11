// Coordinate calculation utilities for game field
// This module provides unified coordinate calculations for both SVG highlights and card rendering

import { FIELD_CONFIG as FIELD_DIMENSIONS } from '../config/fieldDimensions';
import { FIELD_CONFIG } from '../config/fieldConfig';

interface Coordinates {
  x: number;
  y: number;
}

interface CellDimensions {
  width: number;
  height: number;
}

interface FieldContext {
  halfId: 'top' | 'bottom';
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  mirrorColumns: boolean;
}

/**
 * Create a field context for coordinate calculations
 */
export const createFieldContext = (halfId: 'top' | 'bottom'): FieldContext => {
  const halfConfig = FIELD_CONFIG.halves[halfId];
  
  return {
    halfId,
    rows: FIELD_CONFIG.rowsPerHalf,
    cols: FIELD_CONFIG.columns,
    cellWidth: FIELD_DIMENSIONS.BASE_CELL_WIDTH,
    cellHeight: FIELD_DIMENSIONS.BASE_CELL_HEIGHT,
    mirrorColumns: halfConfig.display.mirrorColumns
  };
};

/**
 * Create a field context by zone number
 */
export const createFieldContextByZone = (zone: number): FieldContext => {
  const halfConfig = FIELD_CONFIG.getHalfByZone(zone);
  return createFieldContext(halfConfig.id);
};

/**
 * Calculate cell center coordinates for SVG rendering
 * Uses centered coordinate system
 */
export const calculateCellCenter = (context: FieldContext, row: number, col: number): Coordinates => {
  const { rows, cols, cellWidth, cellHeight, mirrorColumns } = context;
  
  // Reverse column positions if mirroring is enabled
  const adjustedCol = mirrorColumns ? cols - 1 - col : col;
  
  // Calculate x coordinate (centered horizontally)
  const x = -cols * cellWidth / 2 + adjustedCol * cellWidth + cellWidth / 2;
  
  // Calculate y coordinate based on half position
  const isTopHalf = context.halfId === 'top';
  const y = isTopHalf 
    ? -rows * cellHeight / 2 + row * cellHeight + cellHeight / 2
    : row * cellHeight + cellHeight / 2 - rows * cellHeight / 2;
  
  return { x, y };
};

/**
 * Calculate cell top-left coordinates for HTML element rendering
 * Uses absolute positioning within the field container
 */
export const calculateCellPosition = (context: FieldContext, row: number, col: number): Coordinates => {
  const { cellWidth, cellHeight } = context;
  
  // Calculate absolute positions
  const x = col * cellWidth;
  const y = row * cellHeight;
  
  return { x, y };
};

/**
 * Calculate cell boundaries for SVG rect elements
 */
export const calculateCellBounds = (context: FieldContext, row: number, col: number): {
  x: number;
  y: number;
  width: number;
  height: number;
} => {
  const center = calculateCellCenter(context, row, col);
  
  return {
    x: center.x - context.cellWidth / 2,
    y: center.y - context.cellHeight / 2,
    width: context.cellWidth,
    height: context.cellHeight
  };
};

/**
 * Get SVG viewBox string for a field half
 */
export const getFieldViewBox = (context: FieldContext): string => {
  const { cols, rows, cellWidth, cellHeight } = context;
  
  const width = cols * cellWidth;
  const height = rows * cellHeight;
  
  return `-${width / 2} -${height / 2} ${width} ${height}`;
};

/**
 * Get field container dimensions
 */
export const getFieldDimensions = (context: FieldContext): CellDimensions => {
  return {
    width: context.cols * context.cellWidth,
    height: context.rows * context.cellHeight
  };
};

