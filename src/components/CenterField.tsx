import React from 'react';
import type { PlayerCard } from '../data/cards';
import type { PlayerActionType } from '../game/gameLogic';
import { GameField, COLS, ROWS } from './GameField';

interface Props {
  playerField: any;
  aiField: any;
  selectedCard: PlayerCard | null;
  onSlotClick: (zone: number, startCol: number) => void;
  onAttackClick: (zone: number, slot: number) => void;
  currentTurn: 'player' | 'ai';
  turnPhase: string;
  isFirstTurn: boolean;
  lastPlacedCard: PlayerCard | null;
  onCardMouseEnter: (card: PlayerCard, event?: React.MouseEvent) => void;
  onCardMouseLeave: () => void;
  onInstantShotClick?: (zone: number, slot: number) => void;
  instantShotMode?: any;
  currentAction?: PlayerActionType;
  setupStep?: number;
  rotation?: number;
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
  setupStep = 4,
  rotation = 0,
}) => {
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
      <div 
        className="relative border-[6px] border-white/80 overflow-hidden shadow-2xl"
        style={{
          width: `${PITCH_WIDTH + BORDER_THICKNESS * 2}px`,
          height: `${PITCH_HEIGHT + BORDER_THICKNESS * 2}px`,
          backgroundColor: '#2d5a27' // Natural dark grass base
        }}
      >
        {/* Grass Pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(90deg, 
                rgba(0,0,0,0.05) 50%, 
                transparent 50%
              ),
              repeating-linear-gradient(0deg,
                rgba(255,255,255,0.02) 0px,
                rgba(255,255,255,0.02) 1px,
                transparent 1px,
                transparent 2px
              )
            `,
            backgroundSize: `${(PITCH_WIDTH / COLS) * 2}px 100%, 100% 2px`,
            backgroundColor: '#356b2d' // Natural lighter grass
          }}
        />

        {/* Noise/Texture for Grass */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
        
        {/* Field Lines & Overlays */}
        <div className="absolute inset-0 pointer-events-none z-30">
          {/* Mowed lines effect */}
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent 0, transparent 40px, rgba(0,0,0,0.1) 40px, rgba(0,0,0,0.1) 80px)' }} />
          
          {/* Outer Boundary Glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]" />
        </div>
        
        {/* Center Line and Circle */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/80 pointer-events-none shadow-[0_0_15px_rgba(255,255,255,0.3)] z-30" />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-[4px] border-white/80 rounded-full pointer-events-none shadow-[0_0_20px_rgba(255,255,255,0.3)] z-30"
          style={{ width: '300px', height: '300px' }} 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.6)] z-30" />
        
        {/* Goals and Areas (Proportional to cells) */}
        {/* Opponent Area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30">
          {/* Penalty Area */}
          <div 
            className="border-b-[4px] border-x-[4px] border-white/80 bg-white/5 shadow-[inset_0_-20px_50px_rgba(255,255,255,0.05)]"
            style={{ width: '500px', height: '180px' }}
          />
          {/* Goal Area */}
          <div 
            className="absolute top-0 border-b-[4px] border-x-[4px] border-white/80 bg-white/5"
            style={{ width: '240px', height: '70px' }}
          />
          {/* Penalty Arc */}
          <div 
            className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[160px] h-[60px] border-b-[4px] border-white/80 rounded-b-full bg-transparent"
            style={{ clipPath: 'inset(0 0 -100% 0)' }}
          />
          {/* Penalty Spot */}
          <div className="absolute top-[140px] w-2.5 h-2.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
        </div>

        {/* Player Area */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-30">
          {/* Penalty Arc */}
          <div 
            className="absolute bottom-[180px] left-1/2 -translate-x-1/2 w-[160px] h-[60px] border-t-[4px] border-white/80 rounded-t-full bg-transparent"
          />
          {/* Penalty Spot */}
          <div className="absolute bottom-[140px] w-2.5 h-2.5 bg-white/90 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          {/* Goal Area */}
          <div 
            className="absolute bottom-0 border-t-[4px] border-x-[4px] border-white/80 bg-white/5"
            style={{ width: '240px', height: '70px' }}
          />
          {/* Penalty Area */}
          <div 
            className="border-t-[4px] border-x-[4px] border-white/80 bg-white/5 shadow-[inset_0_20px_50px_rgba(255,255,255,0.05)]"
            style={{ width: '500px', height: '180px' }}
          />
        </div>
        
        {/* Corners */}
        <div className="absolute top-0 left-0 w-12 h-12 border-r-[4px] border-b-[4px] border-white/70 rounded-br-full pointer-events-none z-30" />
        <div className="absolute top-0 right-0 w-12 h-12 border-l-[4px] border-b-[4px] border-white/70 rounded-bl-full pointer-events-none z-30" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-r-[4px] border-t-[4px] border-white/70 rounded-tr-full pointer-events-none z-30" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-l-[4px] border-t-[4px] border-white/70 rounded-tl-full pointer-events-none z-30" />
        
        {/* Ambient Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-4 top-4 w-20 h-14 rotate-[8deg] opacity-[0.08] bg-[radial-gradient(circle_at_40%_60%,_rgba(255,255,255,0.8),_transparent_60%)]" />
          <div className="absolute right-6 bottom-4 w-24 h-16 -rotate-[6deg] opacity-[0.08] bg-[radial-gradient(circle_at_60%_40%,_rgba(255,255,255,0.8),_transparent_60%)]" />
        </div>

        {/* Game Field Content - Positioned inside the green area */}
        <div className="absolute inset-0 z-10">
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
            onInstantShotClick={onInstantShotClick}
            instantShotMode={instantShotMode}
            setupStep={setupStep}
            rotation={rotation}
          />
        </div>
      </div>
    </div>
  );
};
