import React from 'react';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  aiBench: PlayerCard[];
  playerBench: PlayerCard[];
  playerScore: number;
  aiScore: number;
  controlPosition: number;
  setupStep: number;
  isHomeTeam: boolean;
  playerSubstitutionsLeft: number;
  substitutionSelectedId?: string | undefined;
  onHoverEnter: (card: PlayerCard) => void;
  onHoverLeave: () => void;
  onSubstituteSelect: (card: PlayerCard) => void;
}

export const LeftPanel: React.FC<Props> = ({
  aiBench,
  playerBench,
  playerScore,
  aiScore,
  controlPosition,
  setupStep,
  isHomeTeam,
  playerSubstitutionsLeft,
  substitutionSelectedId,
  onHoverEnter,
  onHoverLeave,
  onSubstituteSelect,
}) => {
  return (
    <div
      className="w-[286px] h-full relative flex flex-col items-center py-6 px-4 z-20 border-r border-white/10 bg-stone-900/60 backdrop-blur-xl"
    >
      {/* 1. Opponent Area (Top) */}
      <div className="w-full flex flex-col items-center gap-4">
        {/* Opponent Bench Label (Mirrored) */}
        <div className="flex flex-col items-center opacity-40">
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-[0.4em] rotate-180">
            OPPONENT BENCH
          </div>
          <div className="w-12 h-1 bg-red-500/20 rounded-full mt-1 rotate-180" />
        </div>

        {/* Opponent Bench Cards */}
        <div className="flex flex-col gap-2 w-full items-center perspective-[1000px]">
          {aiBench.slice(0, 3).map((card, i) => (
            <div
              key={i}
              className="relative w-40 aspect-[3/2] transition-all duration-300 ease-out z-10 hover:z-50 shadow-xl group cursor-help hover:scale-105"
              style={{ transform: 'rotateY(-15deg) rotateX(-5deg)', transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors duration-300 rounded-lg z-20 pointer-events-none" />
              <PlayerCardComponent
                card={card}
                size="tiny"
                variant="away"
                disabled={true}
                onMouseEnter={() => onHoverEnter(card)}
                onMouseLeave={onHoverLeave}
              />
            </div>
          ))}
        </div>

        {/* Opponent Score (Top) */}
        <div className="mt-4 flex flex-col items-center bg-black/40 rounded-xl p-3 border border-red-500/30 shadow-lg w-24">
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">OPPONENT</div>
          <div className="text-4xl font-['Russo_One'] text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
            {aiScore.toString().padStart(2, '0')}
          </div>
        </div>
      </div>

      {/* 2. Control Track (Center) */}
      <div className="flex-1 flex flex-col items-center justify-center my-8 w-full">
        <div className="relative flex gap-1 p-1 bg-stone-800 rounded-md border border-white/20 shadow-2xl h-[300px]">
          {/* Left perspective labels */}
          <div className="flex flex-col gap-0 w-6 h-full border border-white/10 rounded-sm overflow-hidden opacity-60">
            <div className="flex-[1] bg-red-600/60 border-b border-white/5 flex items-center justify-center">
              <span className="text-[6px] text-white font-black rotate-[-90deg]">ATT</span>
            </div>
            <div className="flex-[2] bg-green-600/60 border-b border-white/5 flex items-center justify-center">
              <span className="text-[6px] text-white font-black rotate-[-90deg]">NORM</span>
            </div>
            <div className="flex-[2] bg-blue-600/60 flex items-center justify-center">
              <span className="text-[6px] text-white font-black rotate-[-90deg]">DEF</span>
            </div>
          </div>

          {/* Central track */}
          <div className="relative w-10 h-full bg-stone-950 flex flex-col rounded-sm overflow-hidden border border-white/5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
              let bgColor = "transparent";
              if (i === 0 || i === 10) bgColor = "rgba(220, 38, 38, 0.1)";
              else if (i === 1 || i === 2 || i === 8 || i === 9) bgColor = "rgba(22, 163, 74, 0.1)";
              else if (i === 3 || i === 4 || i === 6 || i === 7) bgColor = "rgba(37, 99, 235, 0.1)";
              
              return (
                <div key={i} className="flex-1 border-b border-white/5 flex items-center justify-center relative" style={{ backgroundColor: bgColor }}>
                  {i === 5 && <div className="w-full h-full bg-white/5" />}
                  <span className="absolute right-0.5 text-[6px] text-white/10 font-mono">{i}</span>
                </div>
              );
            })}

            {/* The Puck */}
            <motion.div 
              className="absolute left-0 right-0 h-[9.09%] z-20 flex items-center justify-center"
              initial={{ top: '50%', y: '-50%', opacity: 0 }}
              animate={setupStep >= 2 ? { 
                top: `${(controlPosition / 10) * 100}%`,
                y: '-50%',
                opacity: 1,
              } : { top: '50%', y: '-50%', opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-900 shadow-xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-stone-200 to-white" />
                <span className="text-stone-900 text-xs font-black relative z-10">⇅</span>
              </div>
            </motion.div>
          </div>

          {/* Right perspective labels */}
          <div className="flex flex-col gap-0 w-6 h-full border border-white/10 rounded-sm overflow-hidden opacity-60">
            <div className="flex-[2] bg-blue-600/60 border-b border-white/5 flex items-center justify-center">
              <span className="text-[6px] text-white font-black rotate-[90deg]">DEF</span>
            </div>
            <div className="flex-[2] bg-green-600/60 border-b border-white/5 flex items-center justify-center">
              <span className="text-[6px] text-white font-black rotate-[90deg]">NORM</span>
            </div>
            <div className="flex-[1] bg-red-600/60 flex items-center justify-center">
              <span className="text-[6px] text-white font-black rotate-[90deg]">ATT</span>
            </div>
          </div>
        </div>
        <div className="mt-2 text-[8px] text-white/40 font-black tracking-widest uppercase">Momentum: {controlPosition}</div>
      </div>

      {/* 3. Player Area (Bottom) */}
      <div className="w-full flex flex-col items-center gap-4 mt-auto">
        {/* Player Score (Bottom) */}
        <div className="mb-4 flex flex-col items-center bg-black/40 rounded-xl p-3 border border-green-500/30 shadow-lg w-24">
          <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1">YOU</div>
          <div className="text-4xl font-['Russo_One'] text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]">
            {playerScore.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Player Bench Cards */}
        <div className="flex flex-col gap-2 w-full items-center perspective-[1000px]">
          {playerBench.slice(0, 3).map((card) => (
            <div
              key={card.id}
              className="relative w-40 aspect-[3/2] transition-all duration-300 ease-out z-10 hover:z-50 shadow-xl group cursor-pointer hover:scale-105"
              style={{ transform: 'rotateY(-15deg) rotateX(5deg)', transformStyle: 'preserve-3d' }}
              onClick={() => onSubstituteSelect(card)}
            >
              <PlayerCardComponent
                card={card}
                size="tiny"
                variant="home"
                disabled={playerSubstitutionsLeft <= 0}
                selected={substitutionSelectedId === card.id}
                onMouseEnter={() => onHoverEnter(card)}
                onMouseLeave={onHoverLeave}
              />
              {substitutionSelectedId === card.id && (
                <div className="absolute inset-0 ring-2 ring-green-400 rounded-lg animate-pulse z-30 pointer-events-none" />
              )}
            </div>
          ))}
          {playerBench.length === 0 && <div className="text-[10px] text-white/20 uppercase py-2">No Subs</div>}
        </div>

        {/* Player Bench Label */}
        <div className="flex flex-col items-center opacity-40">
          <div className="w-12 h-1 bg-green-500/20 rounded-full mb-1" />
          <div className="text-[10px] text-green-400 font-bold uppercase tracking-[0.4em]">
            YOUR BENCH
          </div>
        </div>
      </div>
    </div>
  );
};
