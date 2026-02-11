import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { FieldZone } from '../game/gameLogic';
import { PlayerCardComponent } from './PlayerCard';
import { TacticalConnections } from './TacticalConnections';
import type { PlayerCard } from '../data/cards';
import { getZoneName } from '../data/cards';

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
  onCardMouseEnter?: (card: PlayerCard) => void;
  onCardMouseLeave?: () => void;
}

const COLS = 8;
const ROWS = 4;

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

// ... keep existing canPlaceAt function ...
const canPlaceAt = (
  card: PlayerCard,
  zone: number,
  startCol: number,
  playerField: FieldZone[],
  isFirstTurn: boolean,
  placedCards: PlacedCard[]
): boolean => {
  if (!card.zones.includes(zone)) return false;
  if (startCol < 0 || startCol > COLS - 2) return false;

  const normalizedCol = startCol % 2 === 0 ? startCol : startCol - 1;
  const slotPosition = Math.floor(normalizedCol / 2) + 1;

  const occupied = placedCards.some(
    p => p.zone === zone && (
      (normalizedCol >= p.startCol && normalizedCol < p.startCol + 2) ||
      (normalizedCol + 2 > p.startCol && normalizedCol + 2 <= p.startCol + 2)
    )
  );
  if (occupied) return false;

  if (zone === 1 && !isFirstTurn) {
    const hasAdjacent = placedCards.some(
      p => p.zone === zone && Math.abs(Math.floor(p.startCol / 2) + 1 - slotPosition) <= 1
    );
    const hasBehind = placedCards.some(
      p => p.zone === 2 && Math.abs(Math.floor(p.startCol / 2) + 1 - slotPosition) <= 1
    );
    if (!hasAdjacent && !hasBehind) return false;
  }

  return true;
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
}) => {
  const [dragOverZone, setDragOverZone] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const canPlaceCards = (turnPhase === 'playerAction' || isFirstTurn) && currentTurn === 'player';
  const playerPlaced = getPlacedCards(playerField);
  const aiPlaced = getPlacedCards(aiField);

  // Helper to render grid cells
  const renderGrid = (isAi: boolean) => {
    const fieldData = isAi ? aiField : playerField;
    const placedCards = isAi ? aiPlaced : playerPlaced;

    return (
      <div 
        ref={gridRef}
        className={clsx(
          "relative grid gap-1 overflow-visible"
        )}
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          width: '100%',
          height: '100%',
        }}
      >
        {/* Zones & Slots */}
        {fieldData.map((zone, zIdx) => (
          // We map rows based on zone index
          Array.from({ length: COLS }).map((_, colIdx) => {
            const row = zIdx; // 0 to 3
            
            const isZoneHighlight = selectedCard && selectedCard.zones.includes(zone.zone);
            const isValidPlacement = selectedCard && canPlaceAt(selectedCard, zone.zone, colIdx, playerField, isFirstTurn, playerPlaced);
            
            // Determine if this cell is part of a slot (2 columns wide)
            const slotIdx = Math.floor(colIdx / 2);
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
                  isSlotStart ? "border-x border-white/10" : "", // Vertical borders for slots
                  isSlotStart && !card ? "bg-white/5" : "", // Faint background for empty slots
                  
                  // Interaction States
                  !isAi && isValidPlacement ? "bg-green-400/40 cursor-pointer hover:bg-green-400/60 ring-2 ring-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.5)]" : "",
                  !isAi && selectedCard && !isValidPlacement && isZoneHighlight ? "bg-red-500/20" : ""
                )}
                onClick={() => !isAi && onSlotClick(zone.zone, colIdx)}
              >
                {/* Dashed Lines at Bottom of Rows */}
                {isRedLineRow && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#ef4444_10px,#ef4444_20px)] z-0 pointer-events-none opacity-80" />
                )}
                {isGreenLineRow && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#22c55e_10px,#22c55e_20px)] z-0 pointer-events-none opacity-80" />
                )}
                {isBlueLineRow && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[repeating-linear-gradient(90deg,transparent,transparent_10px,#3b82f6_10px,#3b82f6_20px)] z-0 pointer-events-none opacity-80" />
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
                    className={clsx("absolute left-0 top-0 w-[200%] h-full z-10 p-1 pointer-events-none transform-style-3d backface-hidden")}
                    style={{
                      transform: isAi 
                        ? 'rotateZ(180deg) rotateX(-45deg) translateZ(30px) scale(0.65)' 
                        : 'rotateX(-45deg) translateZ(30px) scale(0.65)',
                      transformOrigin: 'center bottom',
                      filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.7))'
                    }}
                  >
                     <motion.div
                       initial={{ opacity: 0, scale: 0.5, y: -100 }}
                       animate={{ opacity: 1, scale: 1, y: 0 }}
                       transition={{ type: "spring", stiffness: 300, damping: 20 }}
                       className="w-full h-full relative pointer-events-auto"
                     >
                        <PlayerCardComponent 
                          card={card} 
                          size="tiny"
                          faceDown={false} // Field cards are always visible
                          disabled={isAi} // AI cards are not interactive for player
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
    <div className="flex flex-col w-full h-full">
      {/* AI Field (Top Half) */}
      <div className="flex-1 min-h-0 rotate-180"> 
        {renderGrid(true)}
      </div>

      {/* Center Line Spacer - very thin, just to separate grids visually if needed */}
      {/* <div className="h-0.5 bg-white/10 w-full"></div> */}

      {/* Player Field (Bottom Half) */}
      <div className="flex-1 min-h-0">
        {renderGrid(false)}
      </div>
    </div>
  );
};
