import React from 'react';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';
import clsx from 'clsx';

interface Props {
  aiBench: PlayerCard[];
  playerBench: PlayerCard[];
  playerSubstitutionsLeft: number;
  substitutionSelectedId?: string | undefined;
  onHoverEnter: (card: PlayerCard) => void;
  onHoverLeave: () => void;
  onSubstituteSelect: (card: PlayerCard) => void;
}

export const LeftPanel: React.FC<Props> = ({
  aiBench,
  playerBench,
  playerSubstitutionsLeft,
  substitutionSelectedId,
  onHoverEnter,
  onHoverLeave,
  onSubstituteSelect,
}) => {
  return (
    <div
      className="w-[420px] relative flex flex-col justify-between p-6 z-20 transform-style-3d border-r border-white/5 bg-stone-900/40"
      style={{ transform: 'translateZ(0px)' }}
    >
      <div className="relative flex flex-col items-center w-full pl-0">
        <div className="relative z-10 text-[10px] text-red-400 font-bold uppercase tracking-widest mb-2 w-full text-left pl-2 border-b border-red-500/20 pb-1 flex items-center gap-2">
          <span>OPP BENCH</span>
          <span className="text-[8px] opacity-50">({aiBench.length})</span>
        </div>
        <div className="flex flex-col gap-3 w-full items-center perspective-[1000px] mt-2">
          {aiBench.slice(0, 3).map((card, i) => (
            <div
              key={i}
              className="relative w-48 aspect-[3/2] transition-all duration-300 ease-out z-10 hover:z-50 shadow-xl group cursor-help hover:scale-105"
              style={{ transform: 'rotateY(-20deg) rotateX(-10deg)', transformStyle: 'preserve-3d' }}
            >
              <div className="absolute -bottom-2 left-2 right-2 h-3 rounded-lg bg-black/50 blur-sm opacity-60" />
              <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors duration-300 rounded-lg z-20 pointer-events-none" />
              <PlayerCardComponent
                card={card}
                size="tiny"
                variant="away"
                disabled={true}
                onMouseEnter={() => onHoverEnter(card)}
                onMouseLeave={onHoverLeave}
              />
              <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-stone-800/95 border-l border-red-500/30 rounded-r-md group-hover:opacity-0 transition-opacity pointer-events-none">
                <span className="text-[8px] text-red-400 -rotate-90 whitespace-nowrap font-mono">BENCH</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative flex flex-col items-center w-full pl-0 mt-auto">
        <div className="relative z-10 text-[10px] text-green-400 font-bold uppercase tracking-widest mb-2 w-full text-left pl-2 border-t border-green-500/20 pt-1 flex items-center gap-2">
          <span>YOUR BENCH</span>
          <span className="text-[8px] opacity-50">({playerSubstitutionsLeft} Subs)</span>
        </div>
        <div className="flex flex-col gap-3 w-full items-center perspective-[1000px]">
          {playerBench.slice(0, 3).map((card) => (
            <div
              key={card.id}
              className="relative w-48 aspect-[3/2] transition-all duration-300 ease-out z-10 hover:z-50 shadow-xl group cursor-pointer hover:scale-105"
              style={{ transform: 'rotateY(-20deg) rotateX(10deg)', transformStyle: 'preserve-3d' }}
              onClick={() => onSubstituteSelect(card)}
            >
              <div className="absolute -bottom-2 left-2 right-2 h-3 rounded-lg bg-black/50 blur-sm opacity-60" />
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
              <div
                className={clsx(
                  'absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-stone-800/95 border-l rounded-r-md group-hover:opacity-0 transition-opacity',
                  substitutionSelectedId === card.id ? 'border-green-400 bg-green-900/50' : 'border-green-500/30'
                )}
              >
                <span className="text-[8px] text-green-400 -rotate-90 whitespace-nowrap font-mono">SUB</span>
              </div>
            </div>
          ))}
          {playerBench.length === 0 && <div className="pl-4 text-[10px] text-white/20 uppercase py-4">Empty</div>}
        </div>
      </div>
    </div>
  );
};
