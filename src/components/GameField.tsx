import React, { useCallback, useRef, useMemo } from 'react';
import { clsx } from 'clsx';
import type { FieldZone } from '../types/game';
import type { AthleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';
import { motion } from 'framer-motion';
import { FIELD_CONFIG as FIELD_DIMENSIONS } from '../config/fieldDimensions';
import { FIELD_CONFIG } from '../config/fieldConfig';
import FieldIcons from './FieldIcons';
import { CompleteIconsOverlay } from './CompleteIconsOverlay';
import { createFieldContext, createFieldContextByZone, calculateCellCenter, calculateCellPosition, getFieldViewBox } from '../utils/coordinateCalculator';
import { FieldInteractionLayer } from './FieldInteractionLayer';
import { logger } from '../utils/logger';
import { CardPlacementService } from '../game/cardPlacementService';
import { calculateActivatedIconPositions } from '../utils/gameUtils';
import { TacticalIconMatcher } from '../game/tacticalIconMatcher';

interface GameFieldProps {
  playerField: FieldZone[];
  aiField: FieldZone[];
  selectedCard: AthleteCard | null;
  onSlotClick: (zone: number, position: number) => void;
  onAttackClick: (zone: number, position: number) => void;
  onCardMouseEnter?: (card: AthleteCard) => void;
  onCardMouseLeave?: () => void;
  onCardClick?: (card: AthleteCard) => void;
  shootMode?: boolean;
  selectedShootPlayer?: {zone: number, position: number} | null;
  canPlaceCards?: boolean;
  isFirstTurn: boolean;
  setupStep: number;
  isRotated?: boolean;
  hoveredZone?: number | null;
  hoveredSlot?: number | null;
  onCompleteIconsCalculated?: (counts: Record<string, number>) => void;
  onIconClick?: (icon: any) => void;
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
  onCardClick,
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
  rotation = 0,
  onCompleteIconsCalculated,
  onIconClick
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  // 计算完整图标
  const playerCompleteIcons = useMemo(() => {
    const matcher = new TacticalIconMatcher(playerField);
    return matcher.getCompleteIcons();
  }, [playerField]);

  // 检查是否有完整的进攻图标
  const hasCompleteAttackIcons = useMemo(() => {
    return playerCompleteIcons.some(icon => icon.type === 'attack');
  }, [playerCompleteIcons]);

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
  const renderGrid = (halfId: 'top' | 'bottom') => {
    const halfConfig = FIELD_CONFIG.halves[halfId];
    const fieldData = halfId === 'top' ? aiField : playerField;
    const CELL_WIDTH = FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    const CELL_HEIGHT = FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    const COLS = FIELD_CONFIG.columns;
    const ROWS = FIELD_CONFIG.rowsPerHalf;
    
    // Debug: log field data
    logger.debug(`Rendering grid for ${halfId} half:`, {
      fieldDataLength: fieldData.length,
      zones: fieldData.map(z => z.zone),
      halfId
    });
    
    // Create field context for coordinate calculations
    const fieldContext = createFieldContext(halfId);

    return (
      <div 
        ref={gridRef}
        className={clsx(
          "relative overflow-visible flex items-center justify-center"
        )}
        style={{
          width: `${COLS * CELL_WIDTH}px`,
          height: `${ROWS * CELL_HEIGHT}px`,
          zIndex: halfId === 'top' ? 100 : 101, // Bottom half has higher z-index
          pointerEvents: 'auto',
          position: 'absolute',
          top: halfConfig.display.position.top,
          left: '50%',
          transform: 'translateX(-50%)' // Center horizontally
        }}
      >
        {/* SVG Highlight Layer - THE ONLY INTERACTION LAYER */}
        {/* This layer handles ALL click events for card placement */}
        <svg
          viewBox={`0 0 ${COLS * CELL_WIDTH} ${ROWS * CELL_HEIGHT}`}
          onClick={(e) => {
            console.log('🎯 SVG Container clicked!', {
              target: e.target,
              currentTarget: e.currentTarget,
              halfId,
              selectedCard: selectedCard?.name,
              canPlaceCards
            });
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'rotateX(-20deg) scale(1)',
            transformStyle: 'preserve-3d',
            pointerEvents: 'auto', // This layer captures all clicks
            zIndex: 1000, // Highest z-index - above everything
            cursor: selectedCard && canPlaceCards ? 'pointer' : 'default',
            border: '2px solid red' // DEBUG: Shows SVG container bounds
          }}
        >
          {/* Zones & Slots - Highlight rectangles */}
          {fieldData.map((zone, zIdx) => {
            // Check if zone belongs to this half
            const zoneHalfConfig = FIELD_CONFIG.getHalfByZone(zone.zone);
            if (zoneHalfConfig.id !== halfId) return null;
            
            // Calculate correct row position relative to this half
            const row = zone.zone - zoneHalfConfig.startZone;
            
            return (
              <React.Fragment key={`zone-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => (
                  <g key={`${halfId}-${zone.zone}-${colIdx}`}>
                    {/* Interaction Cell - Handles all clicks */}
                    <FieldInteractionLayer
                      halfId={halfId}
                      zone={zone.zone}
                      colIdx={colIdx}
                      selectedCard={selectedCard}
                      playerField={playerField}
                      aiField={aiField}
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
        
        {/* Card Display Layer - DISPLAY ONLY, NO INTERACTION */}
        {/* This layer only shows cards, all clicks go through SVG layer above */}
      <div 
        className="relative w-full h-full"
        style={{
          pointerEvents: 'none', // 修改为none，让点击事件穿透到交互层
          zIndex: 2000 // Higher z-index, above SVG interaction layer
        }}
      >
          {fieldData.map((zone, zIdx) => {
            // Check if zone belongs to this half
            const zoneHalfConfig = FIELD_CONFIG.getHalfByZone(zone.zone);
            if (zoneHalfConfig.id !== halfId) return null;
            
            // Calculate correct row position relative to this half
            const row = zone.zone - zoneHalfConfig.startZone;
            
            // Ensure row is within valid range
            if (row < 0 || row >= ROWS) return null;
            
            // Debug: log zone data
            logger.debug(`Processing zone ${zone.zone} in ${halfId} half:`, {
              slotCount: zone.slots.length,
              hasCards: zone.slots.some(s => s.athleteCard),
              rowPosition: row
            });
            
            return (
              <React.Fragment key={`${halfId}-cards-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => {
                  // Find card in this slot
                  const slot = zone.slots.find(s => s.position === colIdx);
                  // Debug: log slot data
                  if (slot) {
                    logger.debug(`Found slot at position ${colIdx}:`, {
                      hasAthleteCard: !!slot.athleteCard,
                      athleteCardName: slot.athleteCard?.name,
                      slotPosition: slot.position
                    });
                  } else {
                    logger.debug(`No slot found at position ${colIdx} in zone ${zone.zone}`);
                  }
                  const card = slot?.athleteCard;

                  // Debug: log card rendering
                  if (card) {
                    logger.debug(`Found card: ${card.nickname} at zone ${zone.zone}, slot ${colIdx}, half: ${halfId}`);
                  } else if (slot && slot.athleteCard) {
                    logger.debug(`Slot has athleteCard but card is undefined:`, slot.athleteCard);
                  }

                  // Calculate cell position (absolute positioning within the field container)
                  let { x: cellX, y: cellY } = calculateCellPosition(fieldContext, row, colIdx);
                  
                  // Adjust position for rotated AI cards to prevent overflow
                  if (halfId === 'top' && zoneHalfConfig.display.cardRotation === 180) {
                    // For AI cards rotated 180 degrees, adjust left position to account for card width
                    // This prevents the card from overflowing the field boundary after rotation
                    cellX -= CELL_WIDTH; // Subtract one cell width to compensate for rotation
                  }

                  // Render Card if it exists and we are at start of card (check if previous column has same card)
                  const prevSlot = zone.slots.find(s => s.position === colIdx - 1);
                  const prevCard = prevSlot?.athleteCard;
                  // Allow card to start at any column, not just even columns
                  const isCardStart = card && (!prevCard || prevCard.id !== card.id);
                  
                  // Debug: log isCardStart calculation
                  if (card) {
                    logger.debug(`Card start check for ${card.nickname} at zone ${zone.zone}, slot ${colIdx}:`, {
                      colIdx,
                      colIsEven: colIdx % 2 === 0,
                      hasPrevCard: !!prevCard,
                      prevCardSame: prevCard && prevCard.id === card.id,
                      isCardStart
                    });
                  }

                  if (isCardStart) {
                    return (
                      <div
                        key={`${halfId}-card-${zone.zone}-${colIdx}`}
                        className={clsx("absolute transform-style-3d backface-hidden")}
                        style={{
                          left: `${cellX}px`,
                          top: `${cellY}px`,
                          width: `${CELL_WIDTH * 2}px`,
                          height: `${CELL_HEIGHT}px`,
                          transform: `rotateX(-20deg) rotate(${zoneHalfConfig.display.cardRotation}deg) translateZ(1px)`,
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
                              variant={FIELD_CONFIG.getVariantByZone(zone.zone)}
                              disabled={zoneHalfConfig.interaction.interactive === false}
                              usedShotIcons={slot.usedShotIcons || []}
                              onMouseEnter={() => onCardMouseEnter?.(card)}
                              onMouseLeave={() => onCardMouseLeave?.()}
                              onClick={() => onCardClick?.(card)}
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
                            
                            {/* Attack Button Overlay - Removed to unify shooting through shoot button */}
                            
                            {/* Shoot Mode Highlight */}
                            {zoneHalfConfig.interaction.interactive && shootMode && card.icons.includes('attack') && hasCompleteAttackIcons && (
                              <div className="absolute inset-0 bg-yellow-500/30 z-10 pointer-events-none animate-pulse" />
                            )}
                         </motion.div>
                      </div>
                    );
                  }

                  // Render card preview when hovering over valid placement
                  const startCol = colIdx === 7 ? 6 : colIdx;
                  // Only show preview at the correct position (for col 7, show at col 6; for others, show at their own position)
                  const shouldShowPreview = !card && zoneHalfConfig.interaction.interactive && selectedCard && hoveredZone === zone.zone && hoveredSlot === startCol && startCol === colIdx;
                  
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
                          transform: `rotateX(-20deg) rotate(${zoneHalfConfig.display.cardRotation}deg) translateZ(1px)`,
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
          viewBox={`-${FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH / 2} -${FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT / 2} ${FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH} ${FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT}`}
        >
          {/* Horizontal Grid Lines */}
          {Array.from({ length: FIELD_CONFIG.rowsPerHalf * 2 + 1 }).map((_, rowIdx) => {
            const y = -FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT / 2 + rowIdx * FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
            return (
              <line
                key={`h-line-${rowIdx}`}
                x1={-FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH / 2}
                y1={y}
                x2={FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH / 2}
                y2={y}
                stroke="#000000"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            );
          })}
          {/* Vertical Grid Lines */}
          {Array.from({ length: FIELD_CONFIG.columns + 1 }).map((_, colIdx) => {
            const x = -FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH / 2 + colIdx * FIELD_DIMENSIONS.BASE_CELL_WIDTH;
            return (
              <line
                key={`v-line-${colIdx}`}
                x1={x}
                y1={-FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT / 2}
                x2={x}
                y2={FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT / 2}
                stroke="#000000"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Single 8-row grid container - Render both AI and Player fields */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center" style={{ position: 'relative', width: `${FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH}px`, height: `${FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT}px` }}>
        {/* Field Icons - Render only once */}
        <FieldIcons 
          playerField={playerField}
          aiField={aiField}
          activePositions={calculateActivatedIconPositions(playerField, aiField)}
        />
        
        {/* Complete Icons Overlay - 显示拼合的完整图标 */}
        {onCompleteIconsCalculated && (
          <CompleteIconsOverlay
            playerField={playerField}
            aiField={aiField}
            onIconCountsCalculated={onCompleteIconsCalculated}
            onIconClick={onIconClick}
          />
        )}
        
        {/* Render top half */}
        {renderGrid('top')}
        {/* Render bottom half */}
        {renderGrid('bottom')}
      </div>
    </div>
  );
};

export default GameField;
