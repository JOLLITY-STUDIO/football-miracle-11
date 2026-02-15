import React, { useCallback, useRef } from 'react';
import { clsx } from 'clsx';
import type { FieldZone } from '../types/game';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';
import { motion } from 'framer-motion';
import { FIELD_CONFIG } from '../config/fieldDimensions';

const getIconDisplay = (type: 'attack' | 'defense' | 'pass' | 'speed') => {
  switch (type) {
    case 'attack':
      return {
        image: '/images/icons/attack.svg',
        color: 'text-red-500'
      };
    case 'defense':
      return {
        image: '/images/icons/shield.svg',
        color: 'text-blue-500'
      };
    case 'pass':
      return {
        image: '/images/icons/target.svg',
        color: 'text-green-500'
      };
    case 'speed':
      return {
        image: '/images/icons/speed.svg',
        color: 'text-yellow-500'
      };
    default:
      return {
        image: '/images/icons/speed.svg',
        color: 'text-gray-500'
      };
  }
};

interface GameFieldProps {
  playerField: FieldZone[];
  aiField: FieldZone[];
  selectedCard: PlayerCard | null;
  onSlotClick: (zone: number, position: number) => void;
  onAttackClick: (zone: number, position: number) => void;
  onCardMouseEnter?: (card: PlayerCard) => void;
  onCardMouseLeave?: () => void;
  shootMode?: boolean;
  selectedShootPlayer?: {zone: number, position: number} | null;
  canPlaceCards?: boolean;
  isFirstTurn: boolean;
  setupStep: number;
  isRotated?: boolean;
  hoveredZone?: number | null;
  hoveredSlot?: number | null;
  handleCellMouseEnter?: (zone: number, slot: number) => void;
  handleCellMouseLeave?: () => void;
  currentTurn?: 'player' | 'ai';
  turnPhase?: string;
  lastPlacedCard?: PlayerCard | null;
  onInstantShotClick?: (zone: number, slot: number) => void;
  instantShotMode?: any;
  rotation?: number;
}

const GameField: React.FC<GameFieldProps> = ({
  playerField,
  aiField,
  selectedCard,
  onSlotClick,
  onAttackClick,
  onCardMouseEnter,
  onCardMouseLeave,
  canPlaceCards = true,
  isFirstTurn,
  setupStep,
  isRotated = false,
  hoveredZone = null,
  hoveredSlot = null,
  handleCellMouseEnter = () => {},
  handleCellMouseLeave = () => {},
  shootMode = false,
  selectedShootPlayer = null,
  currentTurn,
  turnPhase,
  lastPlacedCard,
  onInstantShotClick,
  instantShotMode,
  rotation = 0
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // Helper function to check if card can be placed at specific slot
  const canPlaceCardAtSlot = useCallback((
    card: PlayerCard,
    field: FieldZone[],
    targetZone: number,
    targetPosition: number,
    isFirstTurn: boolean
  ) => {
    // Check if zone is allowed for this card
    if (!card.zones.includes(targetZone)) {
      return false;
    }

    // Find the zone in the field
    const zone = field.find(z => z.zone === targetZone);
    if (!zone) return false;

    // Check if slot exists and is empty
    const slot = zone.slots.find(s => s.position === targetPosition);
    if (!slot || slot.playerCard) {
      return false;
    }

    // Special check for first turn: only allow placement in first 7 columns
    // Cards span 2 columns, so max start position is 6 (occupies columns 6 and 7)
    // This ensures cards are placed within the first 7 columns (0-6)
    if (isFirstTurn && targetPosition > 6) {
      return false;
    }

    // For cards that span 2 columns, check if the next slot is also empty
    // Only check if the next slot exists (for column 6, check column 7)
    if (targetPosition < 7) {
      const nextSlot = zone.slots.find(s => s.position === targetPosition + 1);
      if (!nextSlot || nextSlot.playerCard) {
        return false;
      }
    }

    return true;
  }, []);

  // Helper to render grid cells
  const renderGrid = (isAi: boolean) => {
    const fieldData = isAi ? aiField : playerField;
    const CELL_WIDTH = FIELD_CONFIG.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_CONFIG.BASE_CELL_HEIGHT;
    const COLS = FIELD_CONFIG.COLS;
    const ROWS = 4; // Each half only has 4 rows

    return (
      <div 
        ref={gridRef}
        className={clsx(
          "relative overflow-visible flex items-center justify-center"
        )}
        style={{
          width: `${COLS * CELL_WIDTH}px`,
          height: `${ROWS * CELL_HEIGHT}px`,
          zIndex: isAi ? 101 : 100, // AI field has higher z-index
          pointerEvents: 'auto',
          position: 'absolute',
          top: isAi ? 0 : `${ROWS * CELL_HEIGHT}px` // Position AI half at top, player half at bottom
        }}
      >
        {/* SVG 3D渲染 */}
        <svg
          viewBox="-396 -260 792 520"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            pointerEvents: 'auto',
            zIndex: 200
          }}
        >
          {/* Zones & Slots */}
          {fieldData.map((zone, zIdx) => {
            // 只渲染各自半场的区域
            // AI 只渲染 zones 0-3
            // 玩家只渲染 zones 4-7
            if (isAi && zone.zone >= 4) return null;
            if (!isAi && zone.zone < 4) return null;
            
            // 计算正确的行位置
            // AI 卡片渲染在球场上方（行 0-3）
            // 玩家卡片渲染在球场下方（行 0-3，相对于各自半场）
            const row = isAi ? zone.zone : zone.zone - 4;
            
            return (
              <React.Fragment key={`zone-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => {
                  const isZoneHighlight = !isAi && selectedCard && selectedCard.zones.includes(zone.zone) && zone.zone >= 4; // Only highlight player's half (zones 4-7)
                  
                  const startColForValidation = colIdx === 7 ? 6 : colIdx;
                  const isValidPlacement = selectedCard && !isAi && 
                    canPlaceCardAtSlot(selectedCard, playerField, zone.zone, startColForValidation, isFirstTurn) && 
                    zone.zone >= 4; // Only allow placement in player's half (zones 4-7)
                  
                  // Find card in this slot
                  const slot = zone.slots.find(s => s.position === colIdx);
                  const card = slot?.playerCard;

                  // Calculate cell position (centered coordinate system for 4-row half)
                  const x = -COLS * CELL_WIDTH / 2 + colIdx * CELL_WIDTH + CELL_WIDTH / 2;
                  const y = -ROWS * CELL_HEIGHT / 2 + row * CELL_HEIGHT + CELL_HEIGHT / 2;
                  
                  // Show highlight for all valid placement positions
                  const isHighlightVisible = !isAi && isValidPlacement;
                  
                  return (
                    <g key={`${isAi ? 'ai' : 'p'}-${zone.zone}-${colIdx}`}>
                      {/* Cell Background */}
                      <rect
                        x={x - CELL_WIDTH / 2}
                        y={y - CELL_HEIGHT / 2}
                        width={CELL_WIDTH}
                        height={CELL_HEIGHT}
                        fill={isHighlightVisible 
                          ? 'rgba(255, 215, 0, 0.6)' // Golden yellow for valid placement
                          : (!isAi && selectedCard && !isValidPlacement && isZoneHighlight 
                              ? 'rgba(239, 68, 68, 0.5)' 
                              : 'transparent')}
                        stroke={isHighlightVisible 
                          ? 'rgba(255, 215, 0, 0.8)' // Golden stroke for valid placement
                          : 'transparent'}
                        strokeWidth={isHighlightVisible ? '2' : '1'}
                        rx="8"
                        ry="8"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAi && isValidPlacement) {
                            // Use startColForValidation for actual placement
                            console.log('SVG Click at zone:', zone.zone, 'col:', colIdx, 'using startCol:', startColForValidation);
                            onSlotClick(zone.zone, startColForValidation);
                          }
                        }}
                        onMouseEnter={() => {
                          if (!isAi && isValidPlacement) {
                            handleCellMouseEnter(zone.zone, startColForValidation);
                          }
                        }}
                        onMouseLeave={handleCellMouseLeave}
                        style={{ 
                          cursor: !isAi && isValidPlacement ? 'pointer' : 'default',
                          pointerEvents: 'auto'
                        }}
                      />
                      
                      {/* Slot Marker Icon (if empty) */}
                      {!card && (
                        <>
                          {/* Fixed Tactical Icons on Field */}
                          {((row === 0 || row === 3) && colIdx > 0 && colIdx < 7) && (
                            <foreignObject
                              x={x - 20}
                              y={y - 20}
                              width={40}
                              height={40}
                              style={{ pointerEvents: 'none' }}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0.1 // 降低透明度，使其更淡
                                }}
                              >
                                <img
                                  src={getIconDisplay(row === 0 ? 'attack' : 'defense').image}
                                  alt={row === 0 ? 'attack' : 'defense'}
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    objectFit: 'contain',
                                    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
                                    opacity: 0.7 // 降低图标本身的透明度
                                  }}
                                />
                              </div>
                            </foreignObject>
                          )}
                        </>
                      )}
                    </g>
                  );
                })}
              </React.Fragment>
            );
          })}
        </svg>

        {/* Render Cards and other HTML elements */}
      <div 
        className="relative w-full h-full"
        style={{
          pointerEvents: 'auto',
          zIndex: 5 // Lower z-index to ensure cards are visible above this container
        }}
      >
          {fieldData.map((zone, zIdx) => {
            // 只渲染各自半场的区域
            // AI 只渲染 zones 0-3
            // 玩家只渲染 zones 4-7
            if (isAi && zone.zone >= 4) return null;
            if (!isAi && zone.zone < 4) return null;
            
            // 计算正确的行位置（相对于各自半场）
            // AI 卡片渲染在球场上方（行 0-3）
            // 玩家卡片渲染在球场下方（行 0-3，相对于各自半场）
            const row = isAi ? zone.zone : zone.zone - 4;
            
            return (
              <React.Fragment key={`${isAi ? 'ai' : 'p'}-cards-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => {
                  // Find card in this slot
                  const slot = zone.slots.find(s => s.position === colIdx);
                  const card = slot?.playerCard;

                  // Calculate cell position (absolute positioning within 8-row field)
                  // AI 卡片渲染在球场上方（行 0-3）
                  // 玩家卡片渲染在球场下方（行 4-7）
                  const cellX = colIdx * CELL_WIDTH;
                  const cellY = isAi ? row * CELL_HEIGHT : (row + 4) * CELL_HEIGHT;

                  // Render Card if it exists and we are at start of card (check if previous column has same card)
                  const prevSlot = zone.slots.find(s => s.position === colIdx - 1);
                  const isCardStart = card && (!prevSlot?.playerCard || prevSlot.playerCard.id !== card.id);

                  if (isCardStart) {
                    return (
                      <div 
                        key={`${isAi ? 'ai' : 'p'}-card-${zone.zone}-${colIdx}`}
                        className={clsx("absolute left-0 top-0 w-[200%] h-full pointer-events-auto transform-style-3d backface-hidden flex items-center justify-center")}
                        style={{
                          left: `${cellX}px`,
                          top: `${cellY}px`,
                          width: `${CELL_WIDTH * 2}px`,
                          height: `${CELL_HEIGHT}px`,
                          transform: isAi ? 'rotateX(-20deg) rotate(180deg) translateZ(1px)' : 'rotateX(-20deg) translateZ(1px)',
                          transformOrigin: 'center center',
                          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
                          zIndex: 200 // Higher z-index to ensure cards are visible
                        }}
                      >
                         <motion.div
                           initial={setupStep < 4 ? { 
                             opacity: 0, 
                             scale: 0.2, 
                             y: isAi ? -500 : 500,
                             rotateY: 180,
                             z: 500
                           } : { opacity: 1, scale: 1, y: 0, rotateY: 0, z: 0 }}
                           animate={setupStep >= 3 ? { 
                             opacity: 1, 
                             scale: 1, 
                             y: 0,
                             rotateY: 0,
                             z: 0
                           } : { 
                             opacity: 0, 
                             scale: 0.2, 
                             y: isAi ? -500 : 500,
                             rotateY: 180,
                             z: 500
                           }}
                           transition={{ 
                             type: "spring", 
                             stiffness: 80, 
                             damping: 15,
                             delay: setupStep === 3 ? (row * 0.2 + colIdx * 0.1) : 0 
                           }}
                           className="w-full h-full relative"
                         >
                            <PlayerCardComponent 
                              card={card} 
                              size="large"
                              faceDown={false}
                              disabled={isAi}
                              usedShotIcons={slot.usedShotIcons || []}
                              onMouseEnter={() => onCardMouseEnter?.(card)}
                              onMouseLeave={() => onCardMouseLeave?.()}
                            />

                            {/* Summon Effect (Flash) */}
                            <motion.div
                              initial={{ opacity: 0.8, scale: 1.2 }}
                              animate={{ opacity: 0, scale: 1.5 }}
                              transition={{ duration: 0.6, ease: "easeOut" }}
                              className="absolute inset-0 bg-white rounded-lg pointer-events-none mix-blend-overlay z-50"
                            />

                            {/* Shot Markers (Black Tokens) - Floating above card */}
                            {(slot.shotMarkers || 0) > 0 && (
                              <div className="absolute top-1 right-1 flex flex-col gap-1 z-20 pointer-events-none">
                                {Array.from({ length: slot.shotMarkers || 0 }).map((_, i: number) => (
                                  <div 
                                    key={i}
                                    data-testid="shot-marker"
                                    className="w-5 h-5 rounded-full bg-black border border-stone-600 shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex items-center justify-center"
                                    style={{
                                      background: 'radial-gradient(circle at 30% 30%, #333 0%, #000 100%)'
                                    }}
                                    title={`射门标记 ${i+1} (削弱攻击力-${i+1})`}
                                  >
                                    <span className="text-[8px] text-white/80 font-bold">-{i+1}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Attack Button Overlay */}
                            {!isAi && card.icons.includes('attack') && (shootMode || (canPlaceCards)) && (
                              <svg
                                data-testid="shoot-button"
                                width="80"
                                height="32"
                                viewBox="0 0 80 32"
                                className={`absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 cursor-pointer ${shootMode ? 'animate-pulse' : 'animate-bounce'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAttackClick(zone.zone, colIdx);
                                }}
                              >
                                <defs>
                                  <linearGradient id={`attackButtonGradient-${zone.zone}-${colIdx}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={shootMode ? "#f59e0b" : "#dc2626"} />
                                    <stop offset="100%" stopColor={shootMode ? "#d97706" : "#b91c1c"} />
                                  </linearGradient>
                                </defs>
                                {/* Button Background */}
                                <rect x="0" y="0" width="80" height="32" rx="16" ry="16" fill={`url(#attackButtonGradient-${zone.zone}-${colIdx})`} stroke="white" strokeWidth={shootMode ? 3 : 2} />
                                {/* Button Shadow */}
                                <rect x="0" y="0" width="80" height="32" rx="16" ry="16" fill="none" stroke={shootMode ? "rgba(245,158,11,0.8)" : "rgba(220,38,38,0.8)"} strokeWidth={shootMode ? 6 : 4} filter="blur(2px)" />
                                {/* Soccer Ball Icon */}
                                <text x="20" y="22" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">⚽</text>
                                {/* Attack Power */}
                                <text x="60" y="22" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                                  {Math.max(0, card.icons.filter((i: string) => i === 'attack').length - (slot.shotMarkers || 0))}
                                </text>
                              </svg>
                            )}
                            
                            {/* Shoot Mode Highlight */}
                            {!isAi && shootMode && card.icons.includes('attack') && (
                              <div className="absolute inset-0 bg-yellow-500/30 rounded-lg z-10 pointer-events-none animate-pulse" />
                            )}
                         </motion.div>
                      </div>
                    );
                  }

                  // Render card preview when hovering over valid placement
                  const startCol = colIdx === 7 ? 6 : colIdx;
                  // Only show preview at the correct position (for col 7, show at col 6; for others, show at their own position)
                  const shouldShowPreview = !card && !isAi && selectedCard && hoveredZone === zone.zone && hoveredSlot === startCol && startCol === colIdx;
                  if (shouldShowPreview) {
                    return (
                      <div
                        key={`preview-${zone.zone}-${colIdx}`}
                        className={clsx("absolute left-0 top-0 pointer-events-none transform-style-3d backface-hidden flex items-center justify-center opacity-80")}
                        style={{
                          left: `${startCol * CELL_WIDTH}px`,
                          top: `${cellY}px`,
                          width: `${CELL_WIDTH * 2}px`,
                          height: `${CELL_HEIGHT}px`,
                          transform: 'rotateX(-20deg) translateZ(1px)',
                          transformOrigin: 'center center',
                          zIndex: 15
                        }}
                      >
                        <PlayerCardComponent
                          card={selectedCard}
                          size="large"
                          faceDown={false}
                          disabled={true}
                          usedShotIcons={[]}
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full relative overflow-hidden">
      {/* Center Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-white/40 -translate-y-1/2 z-20" />

      {/* Grid Lines for Debugging - Only render once */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <svg
          width="100%"
          height="100%"
          viewBox="-396 -520 792 1040"
        >
          {/* Horizontal Grid Lines */}
          {Array.from({ length: FIELD_CONFIG.ROWS + 1 }).map((_, rowIdx) => {
            const y = -FIELD_CONFIG.ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT / 2 + rowIdx * FIELD_CONFIG.BASE_CELL_HEIGHT;
            return (
              <line
                key={`h-line-${rowIdx}`}
                x1={-FIELD_CONFIG.COLS * FIELD_CONFIG.BASE_CELL_WIDTH / 2}
                y1={y}
                x2={FIELD_CONFIG.COLS * FIELD_CONFIG.BASE_CELL_WIDTH / 2}
                y2={y}
                stroke="#000000"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            );
          })}
          {/* Vertical Grid Lines */}
          {Array.from({ length: FIELD_CONFIG.COLS + 1 }).map((_, colIdx) => {
            const x = -FIELD_CONFIG.COLS * FIELD_CONFIG.BASE_CELL_WIDTH / 2 + colIdx * FIELD_CONFIG.BASE_CELL_WIDTH;
            return (
              <line
                key={`v-line-${colIdx}`}
                x1={x}
                y1={-FIELD_CONFIG.ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT / 2}
                x2={x}
                y2={FIELD_CONFIG.ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT / 2}
                stroke="#000000"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Single 8-row grid container - Render both AI and Player fields */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center" style={{ position: 'relative', width: '792px', height: '1040px' }}>
        {/* Render AI field (top half) */}
        {renderGrid(true)}
        {/* Render Player field (bottom half) */}
        {renderGrid(false)}
      </div>
    </div>
  );
};

export default GameField;