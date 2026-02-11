import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { PlayerCardComponent } from './PlayerCard';
import type { PlayerCard } from '../data/cards';

interface Props {
  playerScore: number;
  aiScore: number;
  turnCount: number;
  currentTurn: 'player' | 'ai';
  aiHandCount: number;
  aiSubstitutionsLeft: number;
}

// Mock card for face-down display
const mockFaceDownCard: PlayerCard = {
  id: 'mock',
  name: '',
  realName: '',
  type: 'forward', // Default to red back, or we could randomize
  positionLabel: '',
  attack: 0,
  defense: 0,
  zones: [],
  isStar: false,
  unlocked: true,
  unlockCondition: '',
  icons: [],
  iconPositions: [],
  completeIcon: null,
  immediateEffect: 'none'
};

export const GameHUD: React.FC<Props> = ({
  playerScore,
  aiScore,
  turnCount,
  currentTurn,
  aiHandCount,
  aiSubstitutionsLeft,
}) => {
  return (
    <div className="absolute top-0 left-0 right-0 p-4 z-40 pointer-events-none flex justify-between items-start">
      {/* Left: Opponent Status (Simplified) */}
      <div className="flex flex-col items-start gap-2 pointer-events-auto">
        <div className="flex gap-[-20px]">
           {Array.from({ length: aiHandCount }).map((_, i) => (
             <motion.div
               key={i}
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               style={{ marginLeft: i > 0 ? -15 : 0 }}
             >
               <PlayerCardComponent
                 card={{...mockFaceDownCard, type: i % 3 === 0 ? 'forward' : i % 3 === 1 ? 'midfielder' : 'defender'}} // Vary backs for visual interest
                 size="tiny"
                 faceDown={true}
                 disabled={true}
               />
             </motion.div>
           ))}
        </div>
        <div className="flex gap-1 ml-1">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1.5 h-1.5 rounded-full ${i < aiSubstitutionsLeft ? 'bg-red-500' : 'bg-white/20'}`}
            />
          ))}
        </div>
      </div>

      {/* Center: Scoreboard & Turn Info */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-6 bg-black/60 backdrop-blur-md px-8 py-2 rounded-full border border-white/10 shadow-2xl">
           {/* Opponent Score */}
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Opponent</span>
             <span className="text-3xl font-['Russo_One'] text-white leading-none">{aiScore}</span>
           </div>

           {/* VS / Turn Timer */}
           <div className="flex flex-col items-center px-4 border-x border-white/10">
             <div className="text-xs text-gray-400 font-mono mb-1">TURN {turnCount}</div>
             <div className={clsx(
               "text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider",
               currentTurn === 'player' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
             )}>
               {currentTurn === 'player' ? 'Your Turn' : 'AI Turn'}
             </div>
           </div>

           {/* Player Score */}
           <div className="flex flex-col items-center">
             <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">You</span>
             <span className="text-3xl font-['Russo_One'] text-white leading-none">{playerScore}</span>
           </div>
        </div>
      </div>

      {/* Right: Empty for now or AI Synergy Status */}
      <div className="w-20"></div> 
    </div>
  );
};
