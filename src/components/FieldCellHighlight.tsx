import React from 'react';
import type { athleteCard } from '../data/cards';
import { canPlaceCardAtSlot } from '../data/cards';

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
  getValidZones: (type: string) => number[];
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
  getValidZones,
}) => {
  const CELL_WIDTH = 99;
  const CELL_HEIGHT = 130;

  // Calculate row position
  const row = isAi ? zone : zone - 4;

  // Get valid zones for the selected card type
  const validZones = selectedCard ? getValidZones(selectedCard.type) : [];

  // Check if this is a valid zone for the player
  const isZoneValid = !isAi && selectedCard && validZones.includes(zone) && zone >= 4;

  // Column 7 (8th column) should be highlighted but maps to column 6 for placement
  // Cards can only start at columns 0-6, occupying columns [0-1], [1-2], ..., [6-7]
  // When clicking column 7, the card should be placed starting at column 6
  const isLastColumn = colIdx === 7;
  const startColForPlacement = isLastColumn ? 6 : colIdx;

  // Check if placement is allowed
  // Column 7 should be highlighted but placement starts at column 6
  const canDoPlacement = selectedCard && !isAi && canPlaceCards &&
    canPlaceCardAtSlot(selectedCard, playerField, zone, startColForPlacement, isFirstTurn);

  // Determine highlight visibility
  const isHighlightVisible = !isAi && canDoPlacement;

  // Calculate cell position
  const x = colIdx * CELL_WIDTH;
  const y = row * CELL_HEIGHT;

  // Determine fill color based on state
  const fillColor = isHighlightVisible
    ? 'rgba(255, 215, 0, 0.6)' // Golden yellow for valid placement
    : (isZoneValid
        ? 'rgba(147, 197, 114, 0.3)' // Light green for valid zone but not valid placement
        : 'transparent');

  // Determine stroke color based on state
  const strokeColor = isHighlightVisible
    ? 'rgba(255, 215, 0, 0.8)' // Golden stroke for valid placement
    : (isZoneValid
        ? 'rgba(101, 163, 13, 0.6)' // Green stroke for valid zone
        : 'transparent');

  // Determine stroke width based on state
  const strokeWidth = isHighlightVisible ? '2' : (isZoneValid ? '1' : '1');

  // Determine cursor style
  const cursorStyle = !isAi && canDoPlacement ? 'pointer' : 'default';

  // Handle click event
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAi && canDoPlacement) {
      console.log('SVG Click at zone:', zone, 'col:', colIdx, 'placement start col:', startColForPlacement);
      onSlotClick(zone, startColForPlacement);
    }
  };

  // Handle mouse enter event
  const handleMouseEnter = () => {
    if (!isAi && canDoPlacement) {
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