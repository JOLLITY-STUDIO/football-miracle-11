import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { FieldZone, PlayerActionType } from '../game/gameLogic';
import { PlayerCardComponent } from './PlayerCard';
import { TacticalConnections } from './TacticalConnections';
import type { PlayerCard } from '../data/cards';
import { canPlaceCardAtSlot } from '../data/cards';

interface PlacedCard {
  card: PlayerCard;
  zone: number;
  startCol: number;
}

interface Props {
  playerField: FieldZone[];
  aiField: FieldZone[];
  selectedCard: PlayerCard | null;
  onSlotClick: (zone: number, startCol: number) => void;
  onAttackClick: (zone: number, startCol: number) => void;
  currentTurn: 'player' | 'ai';
  turnPhase: string;
  isFirstTurn: boolean;
  lastPlacedCard: PlayerCard | null;
  onDragStart?: (card: PlayerCard) => void;
  onDragEnd?: () => void;
  onCardMouseEnter?: (card: PlayerCard, event?: React.MouseEvent) => void;
  onCardMouseLeave?: () => void;
  onInstantShotClick?: (zone: number, slot: number) => void;
  instantShotMode?: any;
  currentAction?: PlayerActionType;
  setupStep?: number;
  rotation?: number;
}

export const COLS = 8;
export const ROWS = 4;

const getPlacedCards = (field: FieldZone[]): PlacedCard[] => {
  const placed: PlacedCard[] = [];
  field.forEach(zone => {
    zone.slots.forEach(slot => {
      if (slot.playerCard) {
        placed.push({
          card: slot.playerCard,
          zone: zone.zone,
          startCol: (slot.position - 1) * 2
        });
      }
    });
  });
  return placed;
};

export const GameField: React.FC<Props> = ({
  playerField,
  aiField,
  selectedCard,
  onSlotClick,
  onAttackClick,
  currentTurn,
  turnPhase,
  isFirstTurn,
  lastPlacedCard,
  onDragStart,
  onDragEnd,
  onCardMouseEnter,
  onCardMouseLeave,
  onInstantShotClick,
  instantShotMode,
  currentAction,
  setupStep = 4,
  rotation = 0,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);

  const isRotated = rotation === 180;

  const canPlaceCards = (turnPhase === 'playerAction' || isFirstTurn) && currentTurn === 'player' && !currentAction;
    const canShowAttackButton = currentTurn === 'player' && !currentAction;
    const playerPlaced = getPlacedCards(playerField);
  const aiPlaced = getPlacedCards(aiField);

  // Helper to render grid cells
  const renderGrid = (isAi: boolean) => {
    const fieldData = isAi ? aiField : playerField;
    const placedCards = isAi ? aiPlaced : playerPlaced;

    // Fixed dimensions based on card size 'large' (198x130)
    // One cell = 99px wide, 130px high
    const CELL_WIDTH = 99;
    const CELL_HEIGHT = 130;

    return (
      <div 
        ref={gridRef}
        className={clsx(
          "relative grid overflow-visible"
        )}
        style={{
          gridTemplateColumns: `repeat(${COLS}, ${CELL_WIDTH}px)`,
          gridTemplateRows: `repeat(${ROWS}, ${CELL_HEIGHT}px)`,
          width: `${COLS * CELL_WIDTH}px`,
          height: `${ROWS * CELL_HEIGHT}px`,
          margin: '0 auto', // Center the grid
        }}
      >
        {/* Zones & Slots */}
        {fieldData.map((zone, zIdx) => (
          // We map rows based on zone index
          Array.from({ length: COLS }).map((_, colIdx) => {
            const row = zIdx; // 0 to 3
            
            const isZoneHighlight = selectedCard && selectedCard.zones.includes(zone.zone);
            
            const slotIdx = Math.floor(colIdx / 2);
            const isValidPlacement = selectedCard && !isAi && 
              canPlaceCardAtSlot(selectedCard, playerField, zone.zone, slotIdx + 1, isFirstTurn);
            
            // Determine if this cell is part of a slot (2 columns wide)
            const isSlotStart = colIdx % 2 === 0;
            
            // Find card in this slot
            const slot = zone.slots.find(s => s.position === slotIdx + 1);
            const card = slot?.playerCard;

            // Interactive Cell
            const isShootingZone = row === 0 && colIdx > 0 && colIdx < 7;
            const isDefenseZone = row === 3 && colIdx > 0 && colIdx < 7;
            
            // Row Separator Lines (Dashed)
            const isRedLineRow = row === 0;
            const isGreenLineRow = row === 1;
            const isBlueLineRow = row === 2;

            return (
              <div 
                key={`${isAi ? 'ai' : 'p'}-${zone.zone}-${colIdx}`}
                data-testid={isSlotStart ? `field-slot-${zone.zone}-${slotIdx}` : undefined}
                data-zone={isSlotStart ? zone.zone : undefined}
                data-slot={isSlotStart ? slotIdx : undefined}
                className={clsx(
                  "relative transition-all duration-200 flex items-center justify-center",
                  // Slot Visuals
                  isSlotStart ? "border-l border-white/20" : "", // Vertical borders for slots
                  colIdx === COLS - 1 ? "border-r border-white/20" : "", // End border
                  row === 0 ? "border-t border-white/20" : "", // Top border
                  row === ROWS - 1 ? "border-b border-white/20" : "", // Bottom border
                  
                  // Simplified Grass Pattern (Vertical Stripes - only 2 colors)
                  // Using inline styles for specific HEX colors to ensure visibility
                  "z-0",

                  // Interaction States
                  !isAi && isValidPlacement ? "cursor-pointer ring-2 ring-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.5)] z-20" : "",
                  !isAi && selectedCard && !isValidPlacement && isZoneHighlight ? "z-20" : ""
                )}
                style={{
                  backgroundColor: !isAi && isValidPlacement 
                    ? 'rgba(34, 197, 94, 0.6)' // More vibrant green
                    : (!isAi && selectedCard && !isValidPlacement && isZoneHighlight 
                        ? 'rgba(239, 68, 68, 0.5)' 
                        : ((row + slotIdx) % 2 === 0 ? 'rgba(46, 125, 50, 0.4)' : 'rgba(27, 94, 32, 0.4)')), // Deeper soccer greens
                }}
                onClick={() => !isAi && onSlotClick(zone.zone, colIdx)}
              >
                {/* Dashed Lines at Bottom of Rows */}
                {isRedLineRow && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#ef4444_20px,#ef4444_40px)] z-10 pointer-events-none opacity-90" />
                )}
                {isGreenLineRow && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#22c55e_20px,#22c55e_40px)] z-10 pointer-events-none opacity-90" />
                )}
                {isBlueLineRow && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#3b82f6_20px,#3b82f6_40px)] z-10 pointer-events-none opacity-90" />
                )}

                {/* Field Marking Icons (Background) */}
            {isShootingZone && (
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none select-none">
                <span className={clsx("text-3xl filter drop-shadow-lg", isAi && "rotate-180")}>⚽</span>
              </div>
            )}
            {isDefenseZone && (
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none select-none">
                <span className={clsx("text-3xl filter drop-shadow-lg", isAi && "rotate-180")}>🛡️</span>
              </div>
            )}

                {/* Slot Marker Icon (if empty) */}
                {isSlotStart && !card && (
                  <div className="text-white/10 text-2xl font-bold select-none">+</div>
                )}

                {/* Render Card if it exists and we are at start of slot */}
                {isSlotStart && card && (
                  <div 
                    className={clsx("absolute left-0 top-0 w-[200%] h-full z-10 pointer-events-none transform-style-3d backface-hidden flex items-center justify-center")}
                    style={{
                      transform: isAi ? 'rotateX(-20deg) rotate(180deg) translateZ(1px)' : 'rotateX(-20deg) translateZ(1px)',
                      transformOrigin: 'center center',
                      filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))'
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
                         delay: setupStep === 3 ? (zIdx * 0.2 + colIdx * 0.1) : 0 
                       }}
                       className="w-full h-full relative pointer-events-auto"
                     >
                        <PlayerCardComponent 
                          card={card} 
                          size="large"
                          faceDown={false}
                          disabled={isAi}
                          onMouseEnter={(e: React.MouseEvent) => onCardMouseEnter?.(card, e)}
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
                        {slot.shotMarkers > 0 && (
                          <div className="absolute top-1 right-1 flex flex-col gap-1 z-20 pointer-events-none">
                            {Array.from({ length: slot.shotMarkers }).map((_, i) => (
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
                        {!isAi && canShowAttackButton && card.icons.includes('attack') && (
                          <button
                            data-testid="shoot-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAttackClick(zone.zone, slot.position);
                            }}
                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 h-8 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)] border-2 border-white z-20 animate-bounce flex items-center justify-center gap-1 overflow-hidden"
                            title={`射门 (基础攻击力:${card.icons.filter(i => i === 'attack').length}${slot.shotMarkers > 0 ? ` -${slot.shotMarkers} = ${Math.max(0, card.icons.filter(i => i === 'attack').length - slot.shotMarkers)}` : ''})`}
                          >
                            <span className="text-lg filter drop-shadow-md">⚽</span>
                            <span className="text-xs font-bold">
                              {Math.max(0, card.icons.filter(i => i === 'attack').length - slot.shotMarkers)}
                            </span>
                          </button>
                        )}
                     </motion.div>
                  </div>
                )}
              </div>
            );
          })
        ))}
        
        {/* 战术图标连接线 */}
        <TacticalConnections 
          playerField={playerField} 
          aiField={aiField} 
          gridRef={gridRef}
          isAi={isAi}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full h-full border-[6px] border-white/30 rounded-sm bg-stone-900/50 relative overflow-hidden">
      {/* Center Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[4px] bg-white/40 -translate-y-1/2 z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[4px] border-white/40 rounded-full z-20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/40 rounded-full z-20" />

      {/* Top Field (Opponent if normal, Player if rotated) */}
      <div className={clsx("flex-1 min-h-0 relative", isRotated ? "" : "rotate-180")}> 
        {renderGrid(!isRotated)}
      </div>

      {/* Bottom Field (Player if normal, Opponent if rotated) */}
      <div className={clsx("flex-1 min-h-0 relative", isRotated ? "rotate-180" : "")}>
        {renderGrid(isRotated)}
      </div>
    </div>
  );
};
