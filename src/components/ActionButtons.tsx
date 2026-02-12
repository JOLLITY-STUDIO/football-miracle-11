import React from 'react';

interface Props {
  turnPhase: string;
  currentTurn: 'player' | 'ai';
  passCount: number;
  pressCount: number;
  synergyDeckCount: number;
  onTeamAction: (type: 'pass' | 'press') => void;
  onPass: () => void;
}

export const ActionButtons: React.FC<Props> = ({
  turnPhase,
  currentTurn,
  passCount,
  pressCount,
  synergyDeckCount,
  onTeamAction,
  onPass,
}) => {
  if (currentTurn !== 'player') return null;

  return (
    <div className="absolute bottom-32 right-4 flex flex-col gap-2 pointer-events-auto">
      {turnPhase === 'teamAction' && (
        <>
          {passCount > 0 && (
            <button
              onClick={() => onTeamAction('pass')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
            >
              👟 Pass ({passCount})
            </button>
          )}
          {pressCount > 0 && (
            <button
              onClick={() => onTeamAction('press')}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
            >
              ⚡ Press ({pressCount})
            </button>
          )}
        </>
      )}
      {turnPhase === 'playerAction' && (
        <button
          onClick={onPass}
          className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-lg"
        >
          ⏭️ Skip Turn
        </button>
      )}
    </div>
  );
};
