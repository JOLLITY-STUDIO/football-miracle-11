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
  onHoverEnter: (card: PlayerCard, event?: React.MouseEvent) => void;
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
    <div className="h-full flex z-20 shadow-[10px_0_30px_rgba(0,0,0,0.5)] overflow-hidden">
      {/* 1. Substitutes Area (Left - Dark) */}
      <div className="w-[130px] h-full bg-[#0a0a0a] relative flex flex-col items-center py-8 px-2 border-r border-white/5">
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, #444 0%, transparent 80%)' }} />
        
        {/* Opponent Bench (Top) */}
        <div className="flex-1 w-full flex flex-col gap-6 items-center">
          <div className="text-[7px] text-red-500/50 font-black tracking-[0.2em] uppercase mb-[-10px]">Opponent Subs</div>
          {[0, 1, 2].map((idx) => {
            const card = aiBench[idx];
            return (
              <div key={`ai-sub-slot-${idx}`} className="relative group">
                {/* Slot Label Background */}
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/5 rounded-full" />
                
                <div
                  className="relative w-24 aspect-[3/2] transition-all duration-300 perspective-[800px]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {card ? (
                    <div className="w-full h-full hover:scale-110 transition-transform duration-300" style={{ transform: 'rotateY(15deg)' }}>
                      <div className="absolute inset-0 bg-red-500/5 group-hover:bg-transparent transition-colors duration-300 rounded-lg z-20 pointer-events-none" />
                      <PlayerCardComponent
                        card={card}
                        size="tiny"
                        variant="away"
                        disabled={false}
                        onMouseEnter={(e) => onHoverEnter(card, e)}
                        onMouseLeave={onHoverLeave}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full border border-white/5 rounded-lg bg-white/[0.02] flex items-center justify-center">
                      <span className="text-[8px] text-white/10 font-black tracking-widest uppercase">EMPTY</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Divider/Label */}
        <div className="h-px w-8 bg-white/10 my-4" />

        {/* Player Bench (Bottom) */}
        <div className="flex-1 w-full flex flex-col gap-6 items-center justify-end">
          {[0, 1, 2].map((idx) => {
            const card = playerBench[idx];
            return (
              <div key={`player-sub-slot-${idx}`} className="relative group">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/5 rounded-full" />
                
                <div
                  className="relative w-24 aspect-[3/2] transition-all duration-300 perspective-[800px]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {card ? (
                    <div 
                      className={clsx(
                        "w-full h-full hover:scale-110 transition-transform duration-300 cursor-pointer",
                        substitutionSelectedId === card.id ? "scale-105" : ""
                      )} 
                      style={{ transform: 'rotateY(15deg)' }}
                      onClick={() => onSubstituteSelect(card)}
                    >
                      <PlayerCardComponent
                        card={card}
                        size="tiny"
                        variant="home"
                        disabled={playerSubstitutionsLeft <= 0}
                        selected={substitutionSelectedId === card.id}
                        onMouseEnter={(e) => onHoverEnter(card, e)}
                        onMouseLeave={onHoverLeave}
                      />
                      {substitutionSelectedId === card.id && (
                        <div className="absolute inset-0 ring-2 ring-yellow-400 rounded-lg animate-pulse z-30 pointer-events-none" />
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full border border-white/5 rounded-lg bg-white/[0.02] flex items-center justify-center">
                      <span className="text-[8px] text-white/10 font-black tracking-widest uppercase">EMPTY</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Control Panel (Right - Red/Orange) */}
      <div 
        className="w-[190px] h-full relative flex flex-col items-center py-6 px-4"
        style={{ 
          backgroundColor: '#C62A18',
          backgroundImage: 'linear-gradient(135deg, #D43D2A 0%, #C62A18 50%, #B02314 100%)',
          boxShadow: 'inset 5px 0 15px rgba(0,0,0,0.2)'
        }}
      >
        {/* SUB Tabs */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-12 -translate-x-full z-30 pointer-events-none">
          {/* Away Tabs */}
          <div className="flex flex-col gap-[3.25rem]">
            {[3, 2, 1].map(num => (
              <div key={`away-tab-${num}`} className="bg-[#D43D2A] px-2 py-1.5 rounded-l-md border-y border-l border-white/20 shadow-[-2px_0_5px_rgba(0,0,0,0.3)] pointer-events-auto">
                <span className="text-[7px] text-white font-black rotate-180 block whitespace-nowrap">SUB 0{num}</span>
              </div>
            ))}
          </div>
          {/* Home Tabs */}
          <div className="flex flex-col gap-[3.25rem]">
            {[1, 2, 3].map(num => (
              <div key={`home-tab-${num}`} className="bg-[#B02314] px-2 py-1.5 rounded-l-md border-y border-l border-white/20 shadow-[-2px_0_5px_rgba(0,0,0,0.3)] pointer-events-auto">
                <span className="text-[7px] text-white font-black whitespace-nowrap">SUB 0{num}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 1. Opponent Score (Top) */}
        <div className="w-full bg-[#0a0a0a] rounded-lg p-2 border border-white/10 shadow-2xl mb-4">
          <div className="flex justify-between items-center mb-1 px-1">
            <span className={clsx(
              "text-[10px] font-black tracking-tighter px-2 py-0.5 rounded",
              isHomeTeam ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
            )}>
              {isHomeTeam ? 'AWAY' : 'HOME'}
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded flex items-center justify-center py-2 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '4px 4px' }} />
            <span className="text-3xl font-['Russo_One'] text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] z-10">
              {aiScore.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* 2. Momentum Track (Center) */}
        <div className="flex-1 w-full flex flex-col items-center justify-center my-2">
          {/* Momentum Track Labels */}
          <div className="w-full flex justify-between px-2 mb-1">
            <div className="flex flex-col items-center">
              <span className={clsx(
                "text-[10px] font-black px-2 py-0.5 rounded",
                isHomeTeam ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
              )}>
                {isHomeTeam ? 'HOME' : 'AWAY'}
              </span>
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                <span className="text-[10px] text-white">↑</span>
              </div>
            </div>
            <div className="bg-white/10 px-2 rounded-sm flex items-center">
              <span className="text-[8px] text-white font-black">MOMENTUM</span>
            </div>
            <div className="flex flex-col items-center">
              <span className={clsx(
                "text-[10px] font-black px-2 py-0.5 rounded",
                isHomeTeam ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
              )}>
                {isHomeTeam ? 'AWAY' : 'HOME'}
              </span>
              <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center mt-0.5">
                <span className="text-[10px] text-white rotate-180">↑</span>
              </div>
            </div>
          </div>

          {/* Main Momentum Rail */}
          <div className="relative flex gap-1 p-1 bg-black/40 rounded-lg border border-white/10 shadow-inner h-[280px]">
            {/* Left labels */}
            <div className="flex flex-col w-5 h-full rounded overflow-hidden">
              <div className="flex-[1] bg-red-600/80 border-b border-white/5 flex items-center justify-center">
                <span className="text-[6px] text-white font-black rotate-[-90deg]">ATT</span>
              </div>
              <div className="flex-[2] bg-green-600/80 border-b border-white/5 flex items-center justify-center">
                <span className="text-[6px] text-white font-black rotate-[-90deg]">NORM</span>
              </div>
              <div className="flex-[2] bg-blue-600/80 flex items-center justify-center">
                <span className="text-[6px] text-white font-black rotate-[-90deg]">DEF</span>
              </div>
            </div>

            {/* The Rail */}
            <div className="relative w-10 h-full bg-[#050505] rounded border border-white/5 flex flex-col">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                <div key={i} className="flex-1 border-b border-white/5 relative">
                  {i === 5 && <div className="absolute inset-0 bg-white/5" />}
                  <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/5" />
                </div>
              ))}
              
              {/* The Puck */}
              <motion.div 
                className="absolute left-0 right-0 h-[9.09%] z-20 flex items-center justify-center"
                initial={{ top: '50%', y: '-50%', opacity: 0 }}
                animate={setupStep >= 2 ? { 
                  top: `${(controlPosition / 10) * 100}%`,
                  y: '-50%',
                  opacity: 1,
                } : { top: '50%', y: '-50%', opacity: 0 }}
                transition={{ type: "spring", stiffness: 150, damping: 15 }}
              >
                <div className="w-8 h-8 rounded-full bg-stone-100 border-2 border-stone-800 shadow-[0_3px_10px_rgba(0,0,0,0.6)] flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full border border-stone-300 flex items-center justify-center bg-stone-200">
                    <span className="text-stone-900 text-[10px] font-black">⇅</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right labels */}
            <div className="flex flex-col w-5 h-full rounded overflow-hidden">
              <div className="flex-[2] bg-blue-600/80 border-b border-white/5 flex items-center justify-center">
                <span className="text-[6px] text-white font-black rotate-[90deg]">DEF</span>
              </div>
              <div className="flex-[2] bg-green-600/80 border-b border-white/5 flex items-center justify-center">
                <span className="text-[6px] text-white font-black rotate-[90deg]">NORM</span>
              </div>
              <div className="flex-[1] bg-red-600/80 flex items-center justify-center">
                <span className="text-[6px] text-white font-black rotate-[90deg]">ATT</span>
              </div>
            </div>
          </div>
          
          {/* Game Logo in Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 flex flex-col items-center">
            <div className="text-[12px] text-white font-black italic tracking-tighter leading-none">MAGIC</div>
            <div className="text-[10px] text-white font-light tracking-[0.4em] leading-none mt-1">ELEVEN</div>
          </div>
        </div>

        {/* 3. Player Score (Bottom) */}
        <div className="w-full bg-[#0a0a0a] rounded-lg p-2 border border-white/10 shadow-2xl mt-4">
          <div className="bg-[#1a1a1a] rounded flex items-center justify-center py-2 relative overflow-hidden mb-1">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '4px 4px' }} />
            <span className="text-3xl font-['Russo_One'] text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)] z-10">
              {playerScore.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex justify-between items-center px-1">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
            <span className={clsx(
              "text-[10px] font-black tracking-tighter px-2 py-0.5 rounded",
              isHomeTeam ? "bg-blue-500/20 text-blue-400" : "bg-red-500/20 text-red-400"
            )}>
              {isHomeTeam ? 'HOME' : 'AWAY'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
