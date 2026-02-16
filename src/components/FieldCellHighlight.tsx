import React from 'react';
import type { athleteCard } from '../data/cards';
import { CardPlacementService } from '../game/cardPlacementService';
import { logger } from '../utils/logger';

interface FieldCellHighlightProps {
  isAi: boolean;
  zone: number;
  colIdx: number;
  selectedCard: athleteCard | null;
  playerField: any[];
  canPlaceCards: boolean;
  isFirstTurn: boolean;
  onSlotClick: (zone: number, startCol: number) => void;
  onCellMouseEnter: (zone: number, startCol: number) => void;
  onCellMouseLeave: () => void;
}

export const FieldCellHighlight: React.FC<FieldCellHighlightProps> = ({
  isAi,
  zone,
  colIdx,
  selectedCard,
  playerField,
  canPlaceCards,
  isFirstTurn,
  onSlotClick,
  onCellMouseEnter,
  onCellMouseLeave,
}) => {
  const CELL_WIDTH = 99;
  const CELL_HEIGHT = 130;

  // Calculate row position
  const row = isAi ? zone : zone - 4;

  // Get actual start column for placement
  const startColForPlacement = CardPlacementService.getStartColumn(colIdx);

  // Validate placement
  const validationResult = selectedCard && !isAi && canPlaceCards
    ? CardPlacementService.validatePlacement(
        selectedCard,
        playerField,
        zone,
        startColForPlacement,
        isFirstTurn
      )
    : { valid: false, canHighlight: false };

  // Determine highlight visibility
  const isHighlightVisible = validationResult.canHighlight;

  // Debug logging
  logger.debug('FieldCellHighlight debug:', {
    zone,
    colIdx,
    selectedCard: selectedCard?.name,
    isAi,
    canPlaceCards,
    isFirstTurn,
    validationResult,
    isHighlightVisible
  });

  // Calculate cell position
  const x = colIdx * CELL_WIDTH;
  const y = row * CELL_HEIGHT;

  // Determine fill color based on state
  // Show different colors for different states during testing
  const fillColor = isHighlightVisible
    ? 'rgba(255, 215, 0, 0.6)' // Golden yellow for valid placement
    : (validationResult.valid
        ? 'rgba(239, 68, 68, 0.4)' // Red for valid zone but not valid placement
        : 'transparent');

  // Determine stroke color based on state
  const strokeColor = isHighlightVisible
    ? 'rgba(255, 215, 0, 0.8)' // Golden stroke for valid placement
    : (validationResult.valid
        ? 'rgba(239, 68, 68, 0.6)' // Red stroke for valid zone
        : 'transparent');

  // Determine stroke width based on state
  const strokeWidth = isHighlightVisible ? '2' : (validationResult.valid ? '1' : '1');

  // Determine cursor style
  const cursorStyle = isHighlightVisible ? 'pointer' : 'default';

  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    logger.debug('Click event triggered:', {
      zone,
      colIdx,
      isHighlightVisible,
      validationResult
    });
    if (isHighlightVisible) {
      logger.debug('SVG Click at zone:', zone, 'col:', colIdx, 'placement start col:', startColForPlacement);
      onSlotClick(zone, startColForPlacement);
    } else {
      logger.debug('Click ignored - not highlightable');
    }
  };

  // Handle mouse enter event
  const handleMouseEnter = () => {
    if (isHighlightVisible) {
      onCellMouseEnter(zone, startColForPlacement);
    }
  };

  return (
    <rect
      x={x}
      y={y}
      width={CELL_WIDTH}
      height={CELL_HEIGHT}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onCellMouseLeave}
      style={{
        cursor: cursorStyle,
        pointerEvents: 'auto'
      }}
    />
  );
};