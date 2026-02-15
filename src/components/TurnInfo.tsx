import React from 'react';

interface Props {
  currentTurn: 'player' | 'ai';
  turnCount: number;
  phase: string;
  turnPhase: string;
  message: string;
}

export const TurnInfo: React.FC<Props> = ({ currentTurn, turnCount, phase, turnPhase, message }) => {
  const getActionPhaseText = () => {
    if (turnPhase === 'teamAction') return '球队行动';
    if (turnPhase === 'playerAction') return '球员行动';
    return '';
  };

  return (
    <div className="absolute top-4 right-4 text-right pointer-events-auto">
      <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">回合 {turnCount}</div>
      <div className="text-2xl font-bold text-white drop-shadow-md mb-2">
        {currentTurn === 'player' ? (
          <span className="text-blue-400">Your Turn</span>
        ) : (
          <span className="text-red-400">Opponent Turn</span>
        )}
      </div>
      <div className="text-sm font-bold text-yellow-400 mb-1">
        {getActionPhaseText()}
      </div>
      <div className="text-xs text-gray-300 max-w-[150px] leading-tight">
        {message}
      </div>
    </div>
  );
};
