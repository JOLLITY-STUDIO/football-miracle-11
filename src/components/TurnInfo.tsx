import React from 'react';

interface Props {
  currentTurn: 'player' | 'ai';
  turnCount: number;
  phase: string;
  message: string;
}

export const TurnInfo: React.FC<Props> = ({ currentTurn, turnCount, phase, message }) => {
  return (
    <div className="absolute top-4 right-4 text-right pointer-events-auto">
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">TURN {turnCount}</div>
      <div className="text-2xl font-bold text-white drop-shadow-md mb-2">
        {currentTurn === 'player' ? (
          <span className="text-blue-400">YOUR TURN</span>
        ) : (
          <span className="text-red-400">OPP TURN</span>
        )}
      </div>
      <div className="text-xs text-yellow-400 max-w-[150px] leading-tight">
        {message}
      </div>
    </div>
  );
};
