import React, { useMemo, useCallback } from 'react';
import type { FieldZone } from '../game/gameLogic';
import type { PlayerCard } from '../data/cards';
import { canPlaceCardAtSlot } from '../data/cards';

interface FieldCellProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  onClick?: () => void;
  isHighlighted?: boolean;
  isValidPlacement?: boolean;
  hasCard?: boolean;
}

const FieldCell: React.FC<FieldCellProps> = React.memo(({
  x,
  y,
  width,
  height,
  color,
  onClick,
  isHighlighted = false,
  isValidPlacement = false,
  hasCard = false,
}) => {
  const fillColor = useMemo(() => {
    if (isValidPlacement) return 'rgba(34, 197, 94, 0.3)';
    if (isHighlighted) return 'rgba(239, 68, 68, 0.3)';
    if (hasCard) return 'rgba(59, 130, 246, 0.2)';
    return 'rgba(234, 179, 8, 0.2)';
  }, [isHighlighted, isValidPlacement, hasCard]);

  const strokeColor = useMemo(() => {
    if (isValidPlacement) return '#22c55e';
    if (isHighlighted) return '#ef4444';
    if (hasCard) return '#3b82f6';
    return '#eab308';
  }, [isHighlighted, isValidPlacement, hasCard]);

  return (
    <rect
      x={x - width / 2}
      y={y - height / 2}
      width={width}
      height={height}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth="2"
      rx="8"
      ry="8"
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
    />
  );
});

FieldCell.displayName = 'FieldCell';

interface GameField3DProps {
  playerField: FieldZone[];
  aiField: FieldZone[];
  selectedCard: PlayerCard | null;
  onSlotClick: (zone: number, startCol: number) => void;
  onAttackClick?: (zone: number, slot: number) => void;
  onCardMouseEnter?: (card: PlayerCard) => void;
  onCardMouseLeave?: () => void;
  currentTurn: 'player' | 'ai';
  turnPhase: string;
  isFirstTurn: boolean;
  currentAction?: string | null;
  isHomeTeam?: boolean;
}

const GameFieldContent: React.FC<GameField3DProps> = React.memo(({
  playerField,
  aiField,
  selectedCard,
  onSlotClick,
  onAttackClick,
  onCardMouseEnter,
  onCardMouseLeave,
  currentTurn,
  turnPhase,
  isFirstTurn,
  currentAction,
}) => {
  // Adjusted to match 2D pitch dimensions
  const CELL_WIDTH = 100;
  const CELL_HEIGHT = 120;
  const COLS = 8;
  const ROWS = 4;

  const canPlaceCards = (turnPhase === 'playerAction' || isFirstTurn) && currentTurn === 'player' && !currentAction;

  const renderField = useCallback((isAi: boolean) => {
    const field = isAi ? aiField : playerField;
    const yOffset = isAi ? (CELL_HEIGHT * ROWS) / 2 : -(CELL_HEIGHT * ROWS) / 2;

    const cells: JSX.Element[] = [];
    
    field.forEach((zone, zIdx) => {
      const zoneY = yOffset + (zIdx - 1.5) * CELL_HEIGHT;
      
      zone.slots.forEach((slot, sIdx) => {
        const col = sIdx * 2;
        
        for (let c = 0; c < 2; c++) {
          const cellX = (col + c - 3.5) * CELL_WIDTH;
          const hasCard = slot.playerCard && c === 0;
          const isValidPlacement = selectedCard && 
            canPlaceCards && 
            !slot.playerCard && 
            c === 0 &&
            canPlaceCardAtSlot(selectedCard, playerField, zone.zone, sIdx + 1, isFirstTurn);

          cells.push(
            <g key={`${zIdx}-${sIdx}-${c}`}>
              <FieldCell
                x={cellX}
                y={zoneY}
                width={CELL_WIDTH}
                height={CELL_HEIGHT}
                color={hasCard ? "#f59e0b" : "#eab308"}
                onClick={() => !isAi && onSlotClick(zone.zone, col)}
                isValidPlacement={!isAi && !!isValidPlacement}
                isHighlighted={!!hasCard}
                hasCard={!!hasCard}
              />
              
              {/* 球员卡片 */}
              {hasCard && slot.playerCard && (
                <g>
                  {/* 卡片背景 */}
                  <rect
                    x={cellX - CELL_WIDTH * 0.4}
                    y={zoneY - CELL_HEIGHT * 0.4}
                    width={CELL_WIDTH * 0.8}
                    height={CELL_HEIGHT * 0.8}
                    fill="#ffffff"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    rx="4"
                    ry="4"
                  />
                  
                  {/* 卡片内容 */}
                  <text
                    x={cellX}
                    y={zoneY - 10}
                    textAnchor="middle"
                    fill="#1e3a8a"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {slot.playerCard.name}
                  </text>
                  
                  {/* 卡片装饰 */}
                  <circle
                    cx={cellX}
                    cy={zoneY + 20}
                    r={15}
                    fill="#3b82f6"
                  />
                  <text
                    x={cellX}
                    y={zoneY + 25}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    {Math.round((slot.playerCard.attack + slot.playerCard.defense) / 2)}
                  </text>
                </g>
              )}
            </g>
          );
        }
      });
    });
    
    return cells;
  }, [playerField, aiField, selectedCard, canPlaceCards, isFirstTurn, onSlotClick]);

  return (
    <>
      {/* 背景网格 */}
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        </pattern>
      </defs>
      <rect x="-960" y="-540" width="1920" height="1080" fill="url(#grid)" />
      
      {/* Player Field - Transparent grid for positioning */}
      {renderField(false)}

      {/* AI Field - Transparent grid for positioning */}
      {renderField(true)}
    </>
  );
});

GameFieldContent.displayName = 'GameFieldContent';

// CameraController removed - now using CSS transforms for 3D perspective

export const GameScene3D: React.FC<GameField3DProps> = ({ 
  isHomeTeam = true,
  ...props 
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transformStyle: 'preserve-3d',
        transformOrigin: 'center'
      }}
    >
      {/* SVG 3D渲染 */}
      <svg
        viewBox="-960 -540 1920 1080"
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d'
        }}
      >
        <GameFieldContent {...props} />
      </svg>
    </div>
  );
};
