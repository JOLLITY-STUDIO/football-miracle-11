import React, { useCallback, useRef } from 'react';
import { clsx } from 'clsx';
import type { FieldZone } from '../types/game';
import type { AthleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';
import { motion } from 'framer-motion';
import { FIELD_CONFIG } from '../config/fieldDimensions';
import FieldIcons from './FieldIcons';
import { createFieldContext, calculateCellCenter, calculateCellPosition, getFieldViewBox } from '../utils/coordinateCalculator';
import { FieldCellHighlight } from './FieldCellHighlight';
import { CardPlacementService } from '../game/cardPlacementService';
import { calculateActivatedIconPositions } from '../utils/gameUtils';

interface GameFieldProps {
  playerField: FieldZone[];
  aiField: FieldZone[];
  selectedCard: AthleteCard | null;
  onSlotClick: (zone: number, position: number) => void;
  onAttackClick: (zone: number, position: number) => void;
  onCardMouseEnter?: (card: AthleteCard) => void;
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
  lastPlacedCard?: AthleteCard | null;
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
    card: AthleteCard,
    field: FieldZone[],
    targetZone: number,
    targetPosition: number,
    isFirstTurn: boolean
  ) => {
    // Use CardPlacementService for consistent validation
    const result = CardPlacementService.validatePlacement(
      card,
      field,
      targetZone,
      targetPosition,
      isFirstTurn
    );
    return result.valid;
  }, []);

  // Helper to render grid cells
  const renderGrid = (isAi: boolean) => {
    const fieldData = isAi ? aiField : playerField;
    const CELL_WIDTH = FIELD_CONFIG.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_CONFIG.BASE_CELL_HEIGHT;
    const COLS = FIELD_CONFIG.COLS;
    const ROWS = 4; // Each half only has 4 rows
    
    // Debug: log field data
    console.log(`Rendering grid for ${isAi ? 'AI' : 'Player'}:`, {
      fieldDataLength: fieldData.length,
      zones: fieldData.map(z => z.zone),
      isAi
    });
    
    // Create field context for coordinate calculations
    const fieldContext = createFieldContext(isAi);

    return (
      <div 
        ref={gridRef}
        className={clsx(
          "relative overflow-visible flex items-center justify-center"
        )}
        style={{
          width: `${COLS * CELL_WIDTH}px`,
          height: `${ROWS * CELL_HEIGHT}px`,
          zIndex: isAi ? 100 : 101, // Player field has higher z-index
          pointerEvents: 'auto',
          position: 'absolute',
          top: isAi ? 0 : `${ROWS * CELL_HEIGHT}px`,
          left: '50%',
          transform: 'translateX(-50%)' // Center horizontally
        }}
      >
        {/* SVG 3D Rendering */}
        <svg
          viewBox={`0 0 ${COLS * CELL_WIDTH} ${ROWS * CELL_HEIGHT}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'rotateX(-20deg) scale(1)',
            transformStyle: 'preserve-3d',
            pointerEvents: 'auto',
            zIndex: 500
          }}
        >
          {/* Zones & Slots */}
          {fieldData.map((zone, zIdx) => {
            // Only render respective half zones
            // AI only renders zones 0-3
            // Player only renders zones 4-7
            if (isAi && zone.zone >= 4) return null;
            if (!isAi && zone.zone < 4) return null;
            
            // Calculate correct row position
            // AI cards render at top of field (rows 0-3)
            // Player cards render at bottom of field (rows 0-3, relative to their half)
            const row = isAi ? zone.zone : zone.zone - 4;
            
            return (
              <React.Fragment key={`zone-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => (
                  <g key={`${isAi ? 'ai' : 'p'}-${zone.zone}-${colIdx}`}>
                    {/* Cell Background - Show for all 8 columns */}
                    <FieldCellHighlight
                      isAi={isAi}
                      zone={zone.zone}
                      colIdx={colIdx}
                      selectedCard={selectedCard}
                      playerField={playerField}
                      canPlaceCards={canPlaceCards}
                      isFirstTurn={isFirstTurn}
                      onSlotClick={onSlotClick}
                      onCellMouseEnter={handleCellMouseEnter}
                      onCellMouseLeave={handleCellMouseLeave}
                    />
                  </g>
                ))}
              </React.Fragment>
            );
          })}
        </svg>
        
        {/* Render Cards and other HTML elements */}
      <div 
        className="relative w-full h-full"
        style={{
          pointerEvents: 'none',
          zIndex: 250 // Higher z-index to ensure cards are visible above SVG
        }}
      >
          {fieldData.map((zone, zIdx) => {
            // Only render respective half zones
            // AI only renders zones 0-3
            // Player only renders zones 4-7
            if (isAi && zone.zone >= 4) return null;
            if (!isAi && zone.zone < 4) return null;
            
            // Calculate correct row position (relative to respective half)
            // AI cards render at top of field (rows 0-3)
            // Player cards render at bottom of field (rows 0-3, relative to their half)
            const row = isAi ? zone.zone : zone.zone - 4;
            
            return (
              <React.Fragment key={`${isAi ? 'ai' : 'p'}-cards-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => {
                  // Find card in this slot
                  const slot = zone.slots.find(s => s.position === colIdx);
                  const card = slot?.athleteCard;

                  // Debug: log card rendering
                  if (card && !isAi) {
                  }

                  // Calculate cell position (absolute positioning within the field container)
                  const { x: cellX, y: cellY } = calculateCellPosition(fieldContext, row, colIdx);

                  // Render Card if it exists and we are at start of card (check if previous column has same card)
                  const prevSlot = zone.slots.find(s => s.position === colIdx - 1);
                  const prevCard = prevSlot?.athleteCard;
                  const isCardStart = card && (!prevCard || prevCard.id !== card.id);

                  if (isCardStart) {
                    return (
                      <div
                        key={`${isAi ? 'ai' : 'p'}-card-${zone.zone}-${colIdx}`}
                        className={clsx("absolute transform-style-3d backface-hidden")}
                        style={{
                          left: `${cellX}px`,
                          top: `${cellY}px`,
                          width: `${CELL_WIDTH * 2}px`,
                          height: `${CELL_HEIGHT}px`,
                          transform: isAi ? 'rotateX(-20deg) rotate(180deg) translateZ(1px)' : 'rotateX(-20deg) translateZ(1px)',
                          transformOrigin: 'center center',
                          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
                          zIndex: 300,
                          pointerEvents: 'auto',
                          margin: 0,
                          padding: 0,
                          boxSizing: 'border-box'
                        }}
                      >
                         <motion.div
                           initial={false}
                           animate={{ 
                             opacity: 1, 
                             scale: 1, 
                             y: 0,
                             rotateY: 0,
                             z: 0
                           }}
                           exit={{ opacity: 0 }}
                           transition={{ 
                             type: "spring", 
                             stiffness: 80, 
                             damping: 15
                           }}
                           className="w-full h-full relative"
                         >
                            <AthleteCardComponent 
                              card={card} 
                              size="large"
                              faceDown={false}
                              variant={isAi ? "away" : "home"}
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
                              className="absolute inset-0 bg-white pointer-events-none mix-blend-overlay z-50"
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
                                    title={`射门标记 ${i+1} (削弱攻击�?${i+1})`}
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
                              <div className="absolute inset-0 bg-yellow-500/30 z-10 pointer-events-none animate-pulse" />
                            )}
                         </motion.div>
                      </div>
                    );
                  }

                  // Render card preview when hovering over valid placement
                  const startCol = colIdx === 7 ? 6 : colIdx;
                  // Only show preview at the correct position (for col 7, show at col 6; for others, show at their own position)
                  const shouldShowPreview = !card && !isAi && selectedCard && hoveredZone === zone.zone && hoveredSlot === startCol && startCol === colIdx;
                  
                  // Only show preview when hovering over valid placement position
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
                        {selectedCard && (
                          <AthleteCardComponent
                            card={selectedCard}
                            size="large"
                            faceDown={false}
                            disabled={true}
                            usedShotIcons={[]}
                          />
                        )}
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
          viewBox={`-${FIELD_CONFIG.COLS * FIELD_CONFIG.BASE_CELL_WIDTH / 2} -${FIELD_CONFIG.ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT / 2} ${FIELD_CONFIG.COLS * FIELD_CONFIG.BASE_CELL_WIDTH} ${FIELD_CONFIG.ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT}`}
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
      <div className="flex-1 min-h-0 relative flex items-center justify-center" style={{ position: 'relative', width: `${FIELD_CONFIG.COLS * FIELD_CONFIG.BASE_CELL_WIDTH}px`, height: `${FIELD_CONFIG.ROWS * FIELD_CONFIG.BASE_CELL_HEIGHT}px` }}>
        {/* Field Icons - Render only once */}
        <FieldIcons 
          playerField={playerField}
          aiField={aiField}
          activePositions={calculateActivatedIconPositions(playerField, aiField)}
        />
        {/* Render AI field (top half) */}
        {renderGrid(true)}
        {/* Render Player field (bottom half) */}
        {renderGrid(false)}
      </div>
    </div>
  );
};

export default GameField;
