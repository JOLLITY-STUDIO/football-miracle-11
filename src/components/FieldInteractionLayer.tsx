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

import { FIELD_CONFIG } from '../config/fieldConfig';
import { FIELD_CONFIG as FIELD_DIMENSIONS } from '../config/fieldDimensions';

interface FieldInteractionLayerProps {
  halfId: 'top' | 'bottom';
  zone: number;
  colIdx: number;
  selectedCard: athleteCard | null;
  playerField: any[];
  aiField: any[];
  canPlaceCards: boolean;
  isFirstTurn: boolean;
  onSlotClick: (zone: number, startCol: number) => void;
  onCellMouseEnter: (zone: number, startCol: number) => void;
  onCellMouseLeave: () => void;
}

export const FieldInteractionLayer: React.FC<FieldInteractionLayerProps> = ({
  halfId,
  zone,
  colIdx,
  selectedCard,
  playerField,
  aiField,
  canPlaceCards,
  isFirstTurn,
  onSlotClick,
  onCellMouseEnter,
  onCellMouseLeave,
}) => {
  // 使用与球场配置一致的单元格尺寸
  const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
  const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;

  // Get field half config
  const halfConfig = FIELD_CONFIG.halves[halfId];

  // Calculate row position relative to this half
  const row = zone - halfConfig.startZone;

  // Get actual start column for placement
  const startColForPlacement = CardPlacementService.getStartColumn(colIdx);

  // Determine which field to use based on halfId
  // Bottom half (zones 4-7) uses playerField
  // Top half (zones 0-3) uses aiField
  const targetField = halfId === 'bottom' ? playerField : aiField;

  // Check if this cell is occupied (check both slots for the card)
  const currentZone = targetField.find((z: any) => z.zone === zone);
  const isOccupied = currentZone?.slots.some((slot: any) => 
    (slot.position === startColForPlacement || slot.position === startColForPlacement + 1) && slot.athleteCard !== null
  ) || false;
  
  // Debug logging before validation
  console.log('🔍 FieldInteractionLayer Pre-Validation:', {
    zone,
    colIdx,
    halfId,
    isOccupied,
    selectedCard: selectedCard?.nickname,
    canPlaceCards: {
      value: canPlaceCards,
      type: typeof canPlaceCards,
      isNotFalse: (canPlaceCards !== false)
    },
    startColForPlacement,
    halfConfigInteractive: halfConfig.interaction.interactive,
    hasSelectedCard: !!selectedCard,
    validationConditions: {
      hasSelectedCard: !!selectedCard,
      canPlaceCards: (canPlaceCards !== false),
      isInteractive: halfConfig.interaction.interactive,
      notOccupied: !isOccupied,
      allConditions: !!selectedCard && (canPlaceCards !== false) && halfConfig.interaction.interactive && !isOccupied
    }
  });

  // Validate placement (only if not occupied and not the second column of a card)
  let validationResult;
  if (selectedCard && canPlaceCards && halfConfig.interaction.interactive && !isOccupied) {
    console.log('🔧 Calling CardPlacementService.validatePlacement with:', {
      selectedCard: selectedCard.nickname,
      targetField: targetField.map(z => ({ zone: z.zone, hasCards: z.slots.some((s: any) => s.athleteCard) })),
      zone,
      startColForPlacement,
      isFirstTurn
    });
    
    const result = CardPlacementService.validatePlacement(
      selectedCard,
      targetField,
      zone,
      startColForPlacement,
      isFirstTurn
    );
    
    console.log('🔧 CardPlacementService.validatePlacement returned:', result);
    validationResult = result;
  } else {
    validationResult = { valid: false, canHighlight: false };
    console.log('🔧 Using default validation result:', validationResult);
  }
  
  // Debug: log validation result
  console.log('🔍 Validation Result:', {
    zone,
    colIdx,
    selectedCard: selectedCard?.nickname,
    targetFieldZones: targetField.map(z => z.zone),
    validationResult
  });

  // Determine highlight visibility
  // 只要验证结果有效且可以高亮，就设置为 true
  const isHighlightVisible = Boolean(validationResult.canHighlight);

  // Debug logging with more details
  console.log('🎯 FieldInteractionLayer Debug:', {
    zone,
    colIdx,
    halfId,
    isOccupied,
    selectedCard: selectedCard?.nickname,
    canPlaceCards,
    validationResult,
    isHighlightVisible,
    startColForPlacement,
    halfConfigInteractive: halfConfig.interaction.interactive,
    hasSelectedCard: !!selectedCard,
    targetField: targetField.map(z => ({ zone: z.zone, hasCards: z.slots.some((s: any) => s.athleteCard) }))
  });

  // Additional debugging for the specific issue
  console.log('🔍 isHighlightVisible Issue:', {
    validationResultCanHighlight: validationResult.canHighlight,
    isHighlightVisibleCalculated: isHighlightVisible,
    validationResultValid: validationResult.valid,
    shouldBeHighlighted: validationResult.valid && validationResult.canHighlight,
    fillColor: isHighlightVisible
      ? 'rgba(255, 215, 0, 0.6)' // Golden yellow for valid placement
      : (validationResult.valid
          ? 'rgba(239, 68, 68, 0.4)' // Red for valid zone but not valid placement
          : 'transparent'),
    strokeColor: isHighlightVisible
      ? 'rgba(255, 215, 0, 0.8)' // Golden stroke for valid placement
      : (validationResult.valid
          ? 'rgba(239, 68, 68, 0.6)' // Red stroke for valid zone
          : 'transparent')
  });

  // Debug logging
  logger.debug('FieldInteractionLayer:', {
    zone,
    colIdx,
    halfId,
    isOccupied,
    selectedCard: selectedCard?.nickname,
    canPlaceCards,
    validationResult,
    isHighlightVisible,
    startColForPlacement,
    halfConfigInteractive: halfConfig.interaction.interactive
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
      halfId,
      startColForPlacement,
      isHighlightVisible,
      isOccupied,
      selectedCard: selectedCard?.nickname,
      validationResult
    });
    
    logger.debug('FieldInteractionLayer Click:', {
      zone,
      colIdx,
      halfId,
      startColForPlacement,
      isHighlightVisible,
      validationResult,
      selectedCard: selectedCard?.nickname
    });
    
    // 只要高亮就可以点击，不受其他影响
    if (isHighlightVisible) {
      console.log('✅ Valid click - placing card at zone:', zone, 'col:', startColForPlacement);
      logger.debug('✓ Valid click - placing card at zone:', zone, 'col:', startColForPlacement);
      onSlotClick(zone, startColForPlacement);
    } else {
      console.log('❌ Invalid click - cell not available', {
        isOccupied,
        hasSelectedCard: !!selectedCard,
        validationResult
      });
      logger.debug('✗ Invalid click - cell not available');
    }
  };

  // Handle mouse enter event - for hover effects
  const handleMouseEnter = () => {
    if (isHighlightVisible) {
      logger.debug('Mouse enter valid cell:', { zone, colIdx, halfId, startColForPlacement });
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
        cursor: isHighlightVisible ? 'pointer' : 'default',
        pointerEvents: 'auto', // Always allow pointer events
        transition: 'all 0.2s ease'
      }}
      className={isHighlightVisible ? 'hover:opacity-80' : ''}
    />
  );
};