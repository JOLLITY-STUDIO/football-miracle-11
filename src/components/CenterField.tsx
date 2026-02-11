import React from 'react';
import type { PlayerCard } from '../data/cards';
import { GameField } from './GameField';

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
  onCardMouseEnter: (card: PlayerCard) => void;
  onCardMouseLeave: () => void;
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
}) => {
  return (
    <div className="basis-[49.6%] relative bg-green-600 shadow-inner overflow-visible">
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            conic-gradient(
              #14532d 90deg, 
              transparent 90deg 180deg, 
              #14532d 180deg 270deg, 
              transparent 270deg
            )
          `,
          backgroundSize: '25% 25%',
        }}
      />
      <div className="absolute inset-0 pointer-events-none opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 4px)' }} />
      <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-16 rounded-full opacity-[0.08] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.6),_transparent_70%)] pointer-events-none" />
      <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-2 opacity-[0.2]" style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.6), rgba(255,255,255,0.0))' }} />
      <div className="absolute inset-0 border-[6px] border-white/40 m-4 rounded-sm pointer-events-none" />
      <div className="absolute top-1/2 left-4 right-4 h-1 bg-white/40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[4px] border-white/40 rounded-full pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 border-b-[4px] border-x-[4px] border-white/40 bg-white/5 pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 border-t-[4px] border-x-[4px] border-white/40 bg-white/5 pointer-events-none" />
      <div className="absolute top-4 left-4 w-12 h-12 border-r-[4px] border-b-[4px] border-white/40 rounded-br-full pointer-events-none" />
      <div className="absolute top-4 right-4 w-12 h-12 border-l-[4px] border-b-[4px] border-white/40 rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-12 h-12 border-r-[4px] border-t-[4px] border-white/40 rounded-tr-full pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-12 h-12 border-l-[4px] border-t-[4px] border-white/40 rounded-tl-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-12 w-20 h-14 rotate-[8deg] opacity-[0.08] bg-[radial-gradient(circle_at_40%_60%,_rgba(255,255,255,0.8),_transparent_60%)]" />
        <div className="absolute right-12 bottom-10 w-24 h-16 -rotate-[6deg] opacity-[0.08] bg-[radial-gradient(circle_at_60%_40%,_rgba(255,255,255,0.8),_transparent_60%)]" />
      </div>
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
        />
      </div>
    </div>
  );
};
