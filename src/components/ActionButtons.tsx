import React from 'react';
import { useGameAudio } from '../hooks/useGameAudio';

interface ActionButtonsProps {
  turnPhase: string;
  currentTurn: string;
  passCount: number;
  pressCount: number;
  synergyDeckCount: number;
  onTeamAction: (type: 'pass' | 'press') => void;
  onSkipTeamAction: () => void;
  onShoot: () => void;
  canShoot: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  turnPhase,
  currentTurn,
  passCount,
  pressCount,
  synergyDeckCount,
  onTeamAction,
  onSkipTeamAction,
  onShoot,
  canShoot,
}) => {
  const { playSound } = useGameAudio();
  if (currentTurn !== 'player') return null;

  return (
    <div className="absolute bottom-32 right-4 flex flex-col gap-2 pointer-events-auto">
      {turnPhase === 'teamAction' && (
        <>
          <button
            onClick={() => { playSound('click'); onTeamAction('pass'); }}
            disabled={passCount === 0}
            className="py-3 px-4 bg-gradient-to-br from-[#13A740] to-[#13A740] hover:from-[#16B84A] hover:to-[#16B84A] disabled:from-[#13A740] disabled:to-[#13A740] disabled:opacity-50 text-white font-['Russo_One'] text-lg rounded-xl shadow-[0_8px_20px_rgba(19,167,64,0.2)] border border-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
            <span className="relative z-10 tracking-widest group-hover:scale-110 transition-transform inline-block">PASS</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </button>
          <button
            onClick={() => { playSound('click'); onTeamAction('press'); }}
            disabled={pressCount === 0}
            className="py-3 px-4 bg-gradient-to-br from-[#E11D48] to-[#E11D48] hover:from-[#F43F6A] hover:to-[#F43F6A] disabled:from-[#E11D48] disabled:to-[#E11D48] disabled:opacity-50 text-white font-['Russo_One'] text-lg rounded-xl shadow-[0_8px_20px_rgba(225,29,72,0.2)] border border-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
            <span className="relative z-10 tracking-widest group-hover:scale-110 transition-transform inline-block">PRESS</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </button>
          <button
            onClick={() => {
              playSound('click');
              onSkipTeamAction();
            }}
            className="py-3 px-4 bg-gradient-to-br from-gray-600/90 to-gray-800/90 hover:from-gray-500 hover:to-gray-700 text-white font-['Russo_One'] text-lg rounded-xl shadow-[0_8px_20px_rgba(75,85,99,0.2)] border border-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
            <span className="relative z-10 tracking-widest group-hover:scale-110 transition-transform inline-block">SKIP</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          </button>
        </>
      )}
      {turnPhase === 'athleteAction' && canShoot && (
        <svg
          width="120"
          height="40"
          viewBox="0 0 120 40"
          className="cursor-pointer group"
          onClick={() => { playSound('click'); onShoot(); }}
        >
          <defs>
            <linearGradient id="shootButtonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          {/* Button Background */}
          <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="url(#shootButtonGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          {/* Button Shadow */}
          <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="none" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="2" filter="blur(2px)" />
          {/* Shoot Icon */}
          <text x="20" y="25" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">⚽</text>
          {/* Button Text */}
          <text x="70" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Shoot</text>
        </svg>
      )}
    </div>
  );
};

