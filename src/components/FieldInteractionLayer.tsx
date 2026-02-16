import React from 'react';
import type { athleteCard } from '../data/cards';
import { CardPlacementService } from '../game/cardPlacementService';
import { logger } from '../utils/logger';

/**
 * FieldInteractionLayer Component
 * 
 * This is THE ONLY INTERACTION LAYER for the game field.
 * It handles all click events for card placement.
 * 
 * Responsibilities:
 * - Display highlight for valid placement positions
 * - Handle click events to place cards
 * - Validate placement rules
 * - Check if cells are occupied
 * - Provide visual feedback (cursor, hover effects)
 * 
 * Architecture:
 * - This SVG layer sits ABOVE the card display layer (z-index: 1000)
 * - Cards are display-only (z-index: 100, pointerEvents: none)
 * - All user interactions go through this layer
 */

interface FieldInteractionLayerProps {
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

export const FieldInteractionLayer: React.FC<FieldInteractionLayerProps> = ({
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

  // Check if this cell is occupied (simple and direct check)
  const currentZone = playerField.find((z: any) => z.zone === zone);
  const isOccupied = currentZone?.slots.some((slot: any) => 
    slot.position === colIdx && slot.athleteCard !== null
  ) || false;
  
  // Validate placement (only if not occupied and not the second column of a card)
  const validationResult = selectedCard && !isAi && canPlaceCards && !isOccupied
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
  logger.debug('FieldInteractionLayer:', {
    zone,
    colIdx,
    isOccupied,
    selectedCard: selectedCard?.name,
    canPlaceCards,
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

  // Determine cursor style - make it more obvious
  const cursorStyle = isHighlightVisible ? 'pointer' : 'default';

  // Handle click event - THE MAIN INTERACTION POINT
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Always log clicks for debugging
    console.log('🖱️ FieldInteractionLayer CLICKED:', {
      zone,
      colIdx,
      startColForPlacement,
      isHighlightVisible,
      isOccupied,
      selectedCard: selectedCard?.name,
      canPlaceCards,
      validationResult
    });
    
    logger.debug('FieldInteractionLayer Click:', {
      zone,
      colIdx,
      startColForPlacement,
      isHighlightVisible,
      validationResult,
      selectedCard: selectedCard?.name
    });
    
    if (isHighlightVisible) {
      console.log('✅ Valid click - placing card at zone:', zone, 'col:', startColForPlacement);
      logger.debug('✓ Valid click - placing card at zone:', zone, 'col:', startColForPlacement);
      onSlotClick(zone, startColForPlacement);
    } else {
      console.log('❌ Invalid click - cell not available', {
        isOccupied,
        hasSelectedCard: !!selectedCard,
        canPlaceCards,
        validationResult
      });
      logger.debug('✗ Invalid click - cell not available');
    }
  };

  // Handle mouse enter event - for hover effects
  const handleMouseEnter = () => {
    if (isHighlightVisible) {
      logger.debug('Mouse enter valid cell:', { zone, colIdx, startColForPlacement });
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
        pointerEvents: isHighlightVisible ? 'auto' : 'none', // Only clickable when highlighted
        transition: 'all 0.2s ease'
      }}
      className={isHighlightVisible ? 'hover:opacity-80' : ''}
    />
  );
};