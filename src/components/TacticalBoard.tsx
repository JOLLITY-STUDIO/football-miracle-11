import React from 'react';
import type { athleteCard } from '../data/cards';
import type { TacticalZone, TacticalSlot, TacticalConnection } from '../game/tactics';

interface TacticalBoardProps {
  zones: TacticalZone[];
  connections: TacticalConnection[];
  selectedCard: athleteCard | null;
  onSlotClick: (slot: TacticalSlot) => void;
  isPlayerBoard: boolean;
}

const ICON_COLORS: Record<string, string> = {
  attack: '#ff6b6b',
  defense: '#4ecdc4',
  pass: '#ffd93d',
  press: '#6c5ce7',
  breakthrough: '#00cec9',
  breakthroughAll: '#00b894',
};

export const TacticalBoard: React.FC<TacticalBoardProps> = ({
  zones,
  connections,
  selectedCard,
  onSlotClick,
  isPlayerBoard,
}) => {
  const renderSlot = (slot: TacticalSlot) => {
    const hasCard = slot.athleteCard !== null;
    const isHighlighted = selectedCard !== null && !hasCard;

    return (
      <div
        key={slot.id}
        className={`tactical-slot ${hasCard ? 'occupied' : ''} ${isHighlighted ? 'highlighted' : ''}`}
        onClick={() => onSlotClick(slot)}
      >
        {hasCard && slot.athleteCard && (
          <div className="slot-card">
            {slot.athleteCard.isStar && <div className="star-indicator">⭐</div>}
            <div className="card-name">{slot.athleteCard.realName}</div>
            <div className="card-position">{slot.athleteCard.positionLabel}</div>
            <div className="card-icons">
              {slot.athleteCard.iconPositions.map((icon, idx) => (
                <div
                  key={idx}
                  className="icon-dot"
                  style={{ backgroundColor: ICON_COLORS[icon.type] || '#888' }}
                  title={icon.type}
                />
              ))}
            </div>
          </div>
        )}
        {!hasCard && <div className="empty-slot">+</div>}
      </div>
    );
  };

  const renderConnections = () => {
    return connections.map((conn, idx) => {
      const fromParts = conn.fromSlot.split('-');
      const toParts = conn.toSlot.split('-');
      
      const fromZone = parseInt(fromParts[0] || '0') - 1;
      const fromPos = parseInt(fromParts[1] || '0') - 1;
      const toZone = parseInt(toParts[0] || '0') - 1;
      const toPos = parseInt(toParts[1] || '0') - 1;

      const fromX = fromPos * 80 + 40;
      const fromY = fromZone * 100 + 50;
      const toX = toPos * 80 + 40;
      const toY = toZone * 100 + 50;

      return (
        <line
          key={idx}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke={ICON_COLORS[conn.iconType] || '#888'}
          strokeWidth="3"
          strokeDasharray="5,5"
          className="connection-line"
        />
      );
    });
  };

  return (
    <div className={`tactical-board ${isPlayerBoard ? 'player-board' : 'ai-board'}`}>
      <div className="board-header">
        <h3>{isPlayerBoard ? 'Your Tactical Board' : 'AI Tactical Board'}</h3>
      </div>
      
      <div className="board-zones">
        <svg className="connections-layer" style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          {renderConnections()}
        </svg>
        
        {zones.map((zone) => (
          <div key={zone.id} className="tactical-zone">
            <div className="zone-label">Zone {zone.id}</div>
            <div className="zone-slots">
              {zone.slots.map(renderSlot)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

