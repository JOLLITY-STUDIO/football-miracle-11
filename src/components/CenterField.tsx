import React from 'react';
import type { PlayerCard } from '../data/cards';
import type { PlayerActionType } from '../types/game';
import GameField from './GameField';
import { FieldVisuals } from './FieldVisuals';
import { getPitchWidth, getPitchHeight, FIELD_CONFIG } from '../config/fieldDimensions';

interface Props {
  playerField: any;
  aiField: any;
  selectedCard: PlayerCard | null;
  onSlotClick: (zone: number, startCol: number) => void;
  onAttackClick: (zone: number, startCol: number) => void;
  currentTurn: 'player' | 'ai';
  turnPhase: string;
  isFirstTurn: boolean;
  lastPlacedCard: PlayerCard | null;
  onCardMouseEnter: (card: PlayerCard, event?: React.MouseEvent) => void;
  onCardMouseLeave: () => void;
  onInstantShotClick?: ((zone: number, slot: number) => void) | undefined;
  instantShotMode?: any;
  currentAction?: PlayerActionType;
  setupStep?: number;
  rotation?: number;
  shootMode?: boolean;
  selectedShootPlayer?: {zone: number, position: number} | null;
  onCloseShootMode?: () => void;
  viewSettings?: {
    pitch: number;
    rotation: number;
    zoom: number;
    height: number;
  };
}

export const CenterField: React.FC<Props> = ({
  playerField,
  aiField,
  selectedCard,
  onSlotClick,
  onAttackClick,
  currentTurn,
  turnPhase,
  isFirstTurn,
  lastPlacedCard,
  onCardMouseEnter,
  onCardMouseLeave,
  onInstantShotClick,
  instantShotMode,
  currentAction = 'none',
  setupStep = 4,
  rotation = 0,
  shootMode = false,
  selectedShootPlayer = null,
  onCloseShootMode,
  viewSettings = { pitch: 0, rotation: 0, zoom: 1, height: 0 },
}) => {
  // Calculate canPlaceCards based on game state
  const canDoAction = (turnPhase === 'playerAction' || turnPhase === 'start') && currentTurn === 'player';
  const canPlaceCards = canDoAction && currentAction === 'none';

  // Pitch dimensions matching GameField's fixed cells (8 cols * 99px, 8 rows * 130px)
  const PITCH_WIDTH = 792;
  const PITCH_HEIGHT = 1040;
  const BORDER_THICKNESS = 6;
  const RED_PADDING = 40;

  return (
    <div 
      className="relative bg-[#C62B1D] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-visible flex items-center justify-center flex-shrink-0 border-x border-white/10 center-field-container"
      style={{ 
        width: `${PITCH_WIDTH + RED_PADDING * 2 + BORDER_THICKNESS * 2}px`,
        height: '100%' 
      }}
    >
      {/* The Actual Green Pitch Area */}
      <div className="relative">
        <FieldVisuals shootMode={shootMode} onCloseShootMode={onCloseShootMode} />
        
        {/* Game Field Content - Positioned inside the green area */}
        <div className="absolute z-40 pointer-events-auto" style={{ 
          top: '6px',
          left: '6px',
          width: '792px',
          height: '1040px'
        }}>
          <GameField
            playerField={playerField}
            aiField={aiField}
            selectedCard={selectedCard}
            onSlotClick={onSlotClick}
            onAttackClick={onAttackClick}
            currentTurn={currentTurn}
            turnPhase={turnPhase}
            isFirstTurn={isFirstTurn}
            lastPlacedCard={lastPlacedCard}
            onCardMouseEnter={onCardMouseEnter}
            onCardMouseLeave={onCardMouseLeave}
            canPlaceCards={canPlaceCards}
            setupStep={setupStep}
            rotation={rotation}
            shootMode={shootMode}
            selectedShootPlayer={selectedShootPlayer}
          />
        </div>
      </div>
    </div>
  );
};
