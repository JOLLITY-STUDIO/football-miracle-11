import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerActionType } from '../types/game';

interface OperationGuideProps {
  currentTurn: 'player' | 'ai';
  turnPhase: string;
  selectedCard: any | null;
  canShoot: boolean;
  passCount: number;
  pressCount: number;
  isFirstTurn: boolean;
}

export const OperationGuide: React.FC<OperationGuideProps> = ({
  currentTurn,
  turnPhase,
  selectedCard,
  canShoot,
  passCount,
  pressCount,
  isFirstTurn,
}) => {
  if (currentTurn !== 'player') return null;

  const getGuideContent = () => {
    // 团队行动阶段
    if (turnPhase === 'teamAction') {
      if (isFirstTurn) {
        return {
          title: 'FIRST TURN',
          message: 'No team actions available. Place your first player!',
          icon: '👤',
          color: 'blue'
        };
      }
      
      const actions = [];
      if (passCount > 0) actions.push(`Pass (${passCount})`);
      if (pressCount > 0) actions.push(`Press (${pressCount})`);
      
      return {
        title: 'TEAM ACTION PHASE',
        message: actions.length > 0 
          ? `Available: ${actions.join(' or ')}` 
          : 'No team actions available',
        icon: '⚡',
        color: 'green'
      };
    }

    // 球员行动阶段
    if (turnPhase === 'playerAction') {
      if (selectedCard) {
        return {
          title: 'PLACE CARD',
          message: 'Click on a highlighted zone to place your player',
          icon: '👆',
          color: 'yellow',
          pulse: true
        };
      }
      
      if (canShoot) {
        return {
          title: 'PLAYER ACTION',
          message: 'Place a card OR shoot with an attacker',
          icon: '⚽',
          color: 'red'
        };
      }
      
      return {
        title: 'PLAYER ACTION',
        message: 'Select a card from your hand to place',
        icon: '🃏',
        color: 'blue'
      };
    }

    // 射门阶段
    if (turnPhase === 'shooting') {
      return {
        title: 'SHOOTING PHASE',
        message: 'Select synergy cards to boost your attack',
        icon: '🎯',
        color: 'red',
        pulse: true
      };
    }

    return null;
  };

  const content = getGuideContent();
  if (!content) return null;

  const colorClasses = {
    blue: 'from-blue-500/90 to-blue-600/90 border-blue-400',
    green: 'from-green-500/90 to-green-600/90 border-green-400',
    yellow: 'from-yellow-500/90 to-yellow-600/90 border-yellow-400',
    red: 'from-red-500/90 to-red-600/90 border-red-400'
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
      >
        <div 
          className={`
            bg-gradient-to-r ${colorClasses[content.color]}
            border-2 rounded-xl shadow-2xl
            px-6 py-3 flex items-center gap-3
            ${content.pulse ? 'animate-pulse' : ''}
          `}
        >
          <div className="text-3xl">{content.icon}</div>
          <div>
            <div className="text-xs font-black text-white/80 uppercase tracking-wider">
              {content.title}
            </div>
            <div className="text-sm font-bold text-white">
              {content.message}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
