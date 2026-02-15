// Field dimensions configuration
// All components should use these values for consistency
// Card size: 132x86px (small), each card occupies 2 cells
// Cell size: half card = 66x86px
export const FIELD_CONFIG = {
  // Grid configuration
  COLS: 8,
  ROWS: 8, // 8 rows total (4 per half)
  
  // Cell dimensions - each cell is half a card
  // Card: 132x86px, so cell: 99x130px (scaled up for better visibility)
  BASE_CELL_WIDTH: 99,
  BASE_CELL_HEIGHT: 130,
  
  // Cell aspect ratio (width/height)
  CELL_ASPECT_RATIO: 99 / 130, // Approximately 0.762
  
  // Border thickness
  BORDER_THICKNESS: 6,
  
  // Field padding (distance from border to field edge)
  FIELD_PADDING: 6,
  
  // Penalty area dimensions (1 row x 4 columns)
  PENALTY_AREA_ROWS: 1,
  PENALTY_AREA_COLS: 4,
  
  // Goal area dimensions (0.5 row x 2 columns)
  GOAL_AREA_ROWS: 0.5,
  GOAL_AREA_COLS: 2,
};

// Helper functions for dimension calculations
export const getPitchWidth = (cellWidth?: number): number => {
  const width = cellWidth || FIELD_CONFIG.BASE_CELL_WIDTH;
  return width * FIELD_CONFIG.COLS;
};

export const getPitchHeight = (cellHeight?: number): number => {
  const height = cellHeight || FIELD_CONFIG.BASE_CELL_HEIGHT;
  return height * FIELD_CONFIG.ROWS; // 8 rows total
};

export const getTotalWidth = (cellWidth?: number): number => {
  return getPitchWidth(cellWidth) + FIELD_CONFIG.BORDER_THICKNESS * 2;
};

export const getTotalHeight = (cellHeight?: number): number => {
  return getPitchHeight(cellHeight) + FIELD_CONFIG.BORDER_THICKNESS * 2;
};

export const getCellWidth = (desiredHeight?: number): number => {
  if (desiredHeight) {
    return desiredHeight * FIELD_CONFIG.CELL_ASPECT_RATIO;
  }
  return FIELD_CONFIG.BASE_CELL_WIDTH;
};

export const getCellHeight = (desiredWidth?: number): number => {
  if (desiredWidth) {
    return desiredWidth / FIELD_CONFIG.CELL_ASPECT_RATIO;
  }
  return FIELD_CONFIG.BASE_CELL_HEIGHT;
};

export const getCellDimensions = (desiredWidth?: number, desiredHeight?: number): { width: number; height: number } => {
  if (desiredWidth) {
    const height = getCellHeight(desiredWidth);
    return { width: desiredWidth, height };
  }
  if (desiredHeight) {
    const width = getCellWidth(desiredHeight);
    return { width, height: desiredHeight };
  }
  return {
    width: FIELD_CONFIG.BASE_CELL_WIDTH,
    height: FIELD_CONFIG.BASE_CELL_HEIGHT
  };
};

