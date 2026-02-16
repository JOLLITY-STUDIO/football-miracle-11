import React from 'react';
import type { athleteCard } from '../data/cards';
import type { PlayerActionType } from '../types/game';
import GameField from './GameField';
import { FieldVisuals } from './FieldVisuals';
import { getPitchWidth, getPitchHeight, FIELD_CONFIG } from '../config/fieldDimensions';

interface Props {
  playerField: any;
  aiField: any;
  selectedCard: athleteCard | null;
  onSlotClick: (zone: number, startCol: number) => void;
  onAttackClick: (zone: number, startCol: number) => void;
  currentTurn: 'player' | 'ai';
  turnPhase: string;
  isFirstTurn: boolean;
  lastPlacedCard: athleteCard | null;
  onCardMouseEnter: (card: athleteCard, event?: React.MouseEvent) => void;
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
  // Allow card placement in teamAction, playerAction, and start phases
  const canDoAction = (turnPhase === 'teamAction' || turnPhase === 'playerAction' || turnPhase === 'start') && currentTurn === 'player';
  const canPlaceCards = canDoAction && (currentAction === 'none' || currentAction === 'organizeAttack');

  // Calculate pitch dimensions from configuration
  const PITCH_WIDTH = getPitchWidth();
  const PITCH_HEIGHT = getPitchHeight();
  const BORDER_THICKNESS = FIELD_CONFIG.BORDER_THICKNESS;
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
          top: `${FIELD_CONFIG.FIELD_PADDING}px`,
          left: `${FIELD_CONFIG.FIELD_PADDING}px`,
          width: `${PITCH_WIDTH}px`,
          height: `${PITCH_HEIGHT}px`
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

