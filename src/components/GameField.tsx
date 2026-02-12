import React, { useRef, useState } from 'react';
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
  onInstantShotClick?: ((zone: number, slot: number) => void) | undefined;
  instantShotMode?: any;
  currentAction?: PlayerActionType;
  setupStep?: number;
  rotation?: number;
}

export const COLS = 8;
export const ROWS = 4;
export const CELL_WIDTH = 99;
export const CELL_HEIGHT = 130;

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
  const [isRotated, setIsRotated] = useState(false);

  const playerPlaced = getPlacedCards(playerField);
  const aiPlaced = getPlacedCards(aiField);

  const canPlaceCards = (turnPhase === 'playerAction' || isFirstTurn) && currentTurn === 'player' && !currentAction;

  // Helper to render grid cells
  const renderGrid = (isAi: boolean) => {
    const fieldData = isAi ? aiField : playerField;
    const placedCards = isAi ? aiPlaced : playerPlaced;

    return (
      <div 
        ref={gridRef}
        className={clsx(
          "relative overflow-visible flex items-center justify-center"
        )}
        style={{
          width: `${COLS * CELL_WIDTH}px`,
          height: `${ROWS * CELL_HEIGHT}px`,
          zIndex: 100,
          pointerEvents: 'auto'
        }}
      >
        {/* Interactive Layer - HTML divs for reliable click detection */}
        <div
          className="absolute top-0 left-0 w-full h-full z-10 pointer-events-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${COLS}, ${CELL_WIDTH}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_HEIGHT}px)`
          }}
        >
          {fieldData.map((zone, zIdx) => {
            const row = zIdx; // 0 to 3
            
            return (
              <React.Fragment key={`zone-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => {
                  const isZoneHighlight = selectedCard && selectedCard.zones.includes(zone.zone);
                  
                  const slotIdx = Math.floor(colIdx / 2);
                  const isValidPlacement = selectedCard && !isAi && 
                    canPlaceCardAtSlot(selectedCard, playerField, zone.zone, slotIdx + 1, isFirstTurn);
                  
                  // Determine if this cell is part of a slot (2 columns wide)
                  const isSlotStart = colIdx % 2 === 0;
                  
                  // Find card in this slot
                  const slot = zone.slots.find(s => s.position === slotIdx + 1);
                  const card = slot?.playerCard;

                  return (
                    <div
                      key={`${isAi ? 'ai' : 'p'}-${zone.zone}-${colIdx}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isAi && isValidPlacement) {
                          console.log('Click at zone:', zone.zone, 'col:', colIdx);
                          onSlotClick(zone.zone, colIdx);
                        }
                      }}
                      style={{
                        backgroundColor: !isAi && isValidPlacement 
                          ? 'rgba(34, 197, 94, 0.6)' // More vibrant green
                          : (!isAi && selectedCard && !isValidPlacement && isZoneHighlight 
                              ? 'rgba(239, 68, 68, 0.5)' 
                              : ((row + slotIdx) % 2 === 0 ? 'rgba(46, 125, 50, 0.4)' : 'rgba(27, 94, 32, 0.4)')),
                        border: !isAi && isValidPlacement 
                          ? '2px solid #22c55e' 
                          : '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px',
                        cursor: !isAi && isValidPlacement ? 'pointer' : 'default',
                        position: 'relative',
                        zIndex: 10
                      }}
                    >
                      {/* Slot Marker Icon (if empty) */}
                      {isSlotStart && !card && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            color: 'rgba(255,255,255,0.1)',
                            fontSize: '24px',
                            fontWeight: 'bold'
                          }}
                        >
                          +
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* SVG 3D Visual Layer - for 3D effects only */}
        <svg
          width={`${COLS * CELL_WIDTH}`}
          height={`${ROWS * CELL_HEIGHT}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            zIndex: 5,
            pointerEvents: 'none'
          }}
        >
          {/* Zones & Slots - Visual only */}
          {fieldData.map((zone, zIdx) => {
            const row = zIdx; // 0 to 3
            
            return (
              <React.Fragment key={`svg-zone-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => {
                  const slotIdx = Math.floor(colIdx / 2);
                  const isSlotStart = colIdx % 2 === 0;
                  
                  // Calculate cell position
                  const cellX = colIdx * CELL_WIDTH;
                  const cellY = row * CELL_HEIGHT;

                  return (
                    <g key={`svg-${isAi ? 'ai' : 'p'}-${zone.zone}-${colIdx}`}>
                      {/* Cell Background - Visual only */}
                      <rect
                        x={cellX}
                        y={cellY}
                        width={CELL_WIDTH}
                        height={CELL_HEIGHT}
                        fill="transparent"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="1"
                        rx="8"
                        ry="8"
                      />
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
            pointerEvents: 'none',
            zIndex: 15
          }}
        >
          {fieldData.map((zone, zIdx) => {
            const row = zIdx; // 0 to 3
            
            return (
              <React.Fragment key={`cards-${zone.zone}`}>
                {Array.from({ length: COLS }).map((_, colIdx) => {
                  const slotIdx = Math.floor(colIdx / 2);
                  const isSlotStart = colIdx % 2 === 0;
                  
                  // Find card in this slot
                  const slot = zone.slots.find(s => s.position === slotIdx + 1);
                  const card = slot?.playerCard;

                  // Calculate cell position
                  const cellX = colIdx * CELL_WIDTH;
                  const cellY = row * CELL_HEIGHT;

                  // Render Card if it exists and we are at start of slot
                  if (isSlotStart && card) {
                    return (
                      <div 
                        key={`card-${zone.zone}-${slotIdx}`}
                        className={clsx("absolute left-0 top-0 w-[200%] h-full pointer-events-auto transform-style-3d backface-hidden flex items-center justify-center")}
                        style={{
                          left: `${cellX}px`,
                          top: `${cellY}px`,
                          transform: isAi ? 'rotateX(-20deg) rotate(180deg) translateZ(1px)' : 'rotateX(-20deg) translateZ(1px)',
                          transformOrigin: 'center center',
                          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
                          zIndex: 20
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
                           className="w-full h-full relative"
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
                            {!isAi && canPlaceCards && card.icons.includes('attack') && (
                              <button
                                data-testid="shoot-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAttackClick(zone.zone, slot.position);
                                }}
                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-2 h-8 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-[0_0_10px_rgba(220,38,38,0.8)] border-2 border-white z-20 animate-bounce flex items-center justify-center gap-1 overflow-hidden"
                                title={`射门 (基础攻击力:${card.icons.filter(i => i === 'attack').length}${slot.shotMarkers > 0 ? ` -${slot.shotMarkers} = ${Math.max(0, card.icons.filter(i => i === 'attack').length - slot.shotMarkers)}` : ''})`}
                                style={{
                                  zIndex: 30
                                }}
                              >
                                <span className="text-lg filter drop-shadow-md">⚽</span>
                                <span className="text-xs font-bold">
                                  {Math.max(0, card.icons.filter(i => i === 'attack').length - slot.shotMarkers)}
                                </span>
                              </button>
                            )}
                         </motion.div>
                      </div>
                    );
                  }
                  return null;
                })}
              </React.Fragment>
            );
          })}
        </div>

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
