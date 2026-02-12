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
            <svg
              width="120"
              height="40"
              viewBox="0 0 120 40"
              className="cursor-pointer group"
              onClick={() => onTeamAction('pass')}
            >
              <defs>
                <linearGradient id="passButtonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
              {/* Button Background */}
              <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="url(#passButtonGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Button Shadow */}
              <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="2" filter="blur(2px)" />
              {/* Pass Icon */}
              <text x="20" y="25" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">👟</text>
              {/* Button Text */}
              <text x="70" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Pass ({passCount})</text>
            </svg>
          )}
          {pressCount > 0 && (
            <svg
              width="120"
              height="40"
              viewBox="0 0 120 40"
              className="cursor-pointer group"
              onClick={() => onTeamAction('press')}
            >
              <defs>
                <linearGradient id="pressButtonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
              {/* Button Background */}
              <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="url(#pressButtonGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
              {/* Button Shadow */}
              <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="none" stroke="rgba(239, 68, 68, 0.3)" strokeWidth="2" filter="blur(2px)" />
              {/* Press Icon */}
              <text x="20" y="25" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">⚡</text>
              {/* Button Text */}
              <text x="70" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Press ({pressCount})</text>
            </svg>
          )}
        </>
      )}
      {turnPhase === 'playerAction' && (
        <svg
          width="120"
          height="40"
          viewBox="0 0 120 40"
          className="cursor-pointer group"
          onClick={onPass}
        >
          <defs>
            <linearGradient id="skipButtonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4b5563" />
              <stop offset="100%" stopColor="#374151" />
            </linearGradient>
          </defs>
          {/* Button Background */}
          <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="url(#skipButtonGradient)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          {/* Button Shadow */}
          <rect x="0" y="0" width="120" height="40" rx="8" ry="8" fill="none" stroke="rgba(75, 85, 99, 0.3)" strokeWidth="2" filter="blur(2px)" />
          {/* Skip Icon */}
          <text x="20" y="25" textAnchor="middle" fill="white" fontSize="14" fontFamily="sans-serif">⏭️</text>
          {/* Button Text */}
          <text x="70" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="sans-serif">Skip Turn</text>
        </svg>
      )}
    </div>
  );
};
