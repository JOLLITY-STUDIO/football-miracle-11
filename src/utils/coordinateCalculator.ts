// Coordinate calculation utilities for game field
// This module provides unified coordinate calculations for both SVG highlights and card rendering

import { FIELD_CONFIG } from '../config/fieldDimensions';

interface Coordinates {
  x: number;
  y: number;
}

interface CellDimensions {
  width: number;
  height: number;
}

interface FieldContext {
  isAi: boolean;
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
}

/**
 * Create a field context for coordinate calculations
 */
export const createFieldContext = (isAi: boolean): FieldContext => {
  return {
    isAi,
    rows: 4, // Each half has 4 rows
    cols: FIELD_CONFIG.COLS,
    cellWidth: FIELD_CONFIG.BASE_CELL_WIDTH,
    cellHeight: FIELD_CONFIG.BASE_CELL_HEIGHT
  };
};

/**
 * Calculate cell center coordinates for SVG rendering
 * Uses centered coordinate system
 */
export const calculateCellCenter = (context: FieldContext, row: number, col: number): Coordinates => {
  const { isAi, rows, cols, cellWidth, cellHeight } = context;
  
  // Reverse column positions for AI to create vertical mirror image
  const adjustedCol = isAi ? cols - 1 - col : col;
  
  // Calculate x coordinate (centered horizontally)
  const x = -cols * cellWidth / 2 + adjustedCol * cellWidth + cellWidth / 2;
  
  // Calculate y coordinate (AI in upper half, player in lower half)
  const y = isAi 
    ? -rows * cellHeight / 2 + row * cellHeight + cellHeight / 2
    : row * cellHeight + cellHeight / 2 - rows * cellHeight / 2;
  
  return { x, y };
};

/**
 * Calculate cell top-left coordinates for HTML element rendering
 * Uses absolute positioning within the field container
 */
export const calculateCellPosition = (context: FieldContext, row: number, col: number): Coordinates => {
  const { isAi, cellWidth, cellHeight } = context;
  
  // Reverse column positions for AI to create vertical mirror image
  const adjustedCol = isAi ? context.cols - 1 - col : col;
  
  // Calculate absolute positions
  // Both AI and player need to adjust for card width (cards span 2 columns)
  const x = (adjustedCol - 1) * cellWidth;
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

