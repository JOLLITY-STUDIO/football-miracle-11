import React from 'react';
import { motion } from 'framer-motion';
import type { TurnPhase } from '../types/game';

interface TurnPhaseIndicatorProps {
  currentPhase: TurnPhase;
  isFirstTurn: boolean;
  compact?: boolean;
}

export const TurnPhaseIndicator: React.FC<TurnPhaseIndicatorProps> = ({
  currentPhase,
  isFirstTurn,
  compact = false,
}) => {
  const phases = [
    { 
      id: 'teamAction', 
      name: 'Team Action', 
      icon: '⚡',
      shortName: 'Team',
      skipped: isFirstTurn 
    },
    { 
      id: 'athleteAction', 
      name: 'Athlete Action', 
      icon: '🎯',
      shortName: 'Athlete'
    },
    { 
      id: 'end', 
      name: 'End Turn', 
      icon: '✓',
      shortName: 'End'
    },
  ];

  const getPhaseStatus = (phaseId: string) => {
    const phaseIndex = phases.findIndex(p => p.id === phaseId);
    const currentIndex = phases.findIndex(p => p.id === currentPhase);
    
    if (phaseIndex < currentIndex) return 'completed';
    if (phaseIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getPhaseColor = (status: string, skipped: boolean) => {
    if (skipped) return 'bg-gray-600 border-gray-500 text-gray-400';
    if (status === 'completed') return 'bg-green-600 border-green-500 text-green-200';
    if (status === 'current') return 'bg-blue-600 border-blue-400 text-white';
    return 'bg-gray-700 border-gray-600 text-gray-400';
  };

  const getPhaseIcon = (status: string, skipped: boolean, icon: string) => {
    if (skipped) return '⏭️';
    if (status === 'completed') return '✓';
    if (status === 'current') return icon;
    return '○';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const skipped = phase.skipped || false;
          
          return (
            <React.Fragment key={phase.id}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded border
                  ${getPhaseColor(status, skipped)}
                  transition-all duration-300
                `}
              >
                <span className="text-sm">{getPhaseIcon(status, skipped, phase.icon)}</span>
                <span className="text-xs font-bold">{phase.shortName}</span>
              </motion.div>
              
              {index < phases.length - 1 && (
                <span className="text-gray-500 text-xs">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-stone-900/90 to-stone-800/90 backdrop-blur-sm rounded-xl border-2 border-white/10 p-4 shadow-xl">
      <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-3 text-center">
        Turn Progress
      </div>
      
      <div className="flex items-stretch gap-2">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const skipped = phase.skipped || false;
          const isCurrent = status === 'current';
          
          return (
            <React.Fragment key={phase.id}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ 
                  scale: isCurrent ? 1.05 : 1, 
                  opacity: 1, 
                  y: 0 
                }}
                transition={{ 
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200
                }}
                className={`
                  relative flex-1 flex flex-col items-center justify-center
                  rounded-lg border-2 p-3 min-w-[100px]
                  ${getPhaseColor(status, skipped)}
                  transition-all duration-300
                  ${isCurrent ? 'shadow-lg' : ''}
                `}
              >
                {/* Glow effect for current phase */}
                {isCurrent && (
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                    className="absolute inset-0 bg-blue-400/20 rounded-lg"
                  />
                )}
                
                {/* Icon */}
                <motion.div 
                  className="text-3xl mb-2 relative z-10"
                  animate={isCurrent ? {
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: isCurrent ? Infinity : 0,
                  }}
                >
                  {getPhaseIcon(status, skipped, phase.icon)}
                </motion.div>
                
                {/* Name */}
                <div className="text-xs font-bold uppercase tracking-wider relative z-10">
                  {phase.name}
                </div>
                
                {/* Status label */}
                {skipped && (
                  <div className="text-[8px] font-bold uppercase tracking-wider mt-1 relative z-10">
                    Skipped
                  </div>
                )}
                {status === 'current' && !skipped && (
                  <motion.div 
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[8px] font-bold uppercase tracking-wider mt-1 relative z-10"
                  >
                    In Progress
                  </motion.div>
                )}
              </motion.div>
              
              {/* Arrow between phases */}
              {index < phases.length - 1 && (
                <div className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="text-2xl text-white/30"
                  >
                    →
                  </motion.div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* First turn notice */}
      {isFirstTurn && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-center text-xs text-yellow-300 font-bold"
        >
          ⚠️ First Turn: Team Action automatically skipped
        </motion.div>
      )}
    </div>
  );
};
