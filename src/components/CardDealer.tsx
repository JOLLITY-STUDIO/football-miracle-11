import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardDealerProps {
  isDealing: boolean;
  type: 'player' | 'ai' | 'synergy';
}

export const CardDealer: React.FC<CardDealerProps> = ({ isDealing, type }) => {
  if (!isDealing) return null;

  // Configuration for different types of cards (relative to 1920x1080 container)
  const config = {
    player: {
      count: 10,
      color: '#1e3a8a', // Blue
      label: 'PLAYER',
      startX: 1600,
      startY: 540,
      targetX: 960,
      targetY: 1000,
    },
    ai: {
      count: 10,
      color: '#7f1d1d', // Red
      label: 'OPPONENT',
      startX: 1600,
      startY: 540,
      targetX: 960,
      targetY: 80,
    },
    synergy: {
      count: 5,
      color: '#106327', // Green
      label: 'SYNERGY',
      startX: 1600,
      startY: 540,
      targetX: 1600,
      targetY: 540, // Just a pop-up effect for now or fly to slots
    }
  };

  const { count, color, label, startX, startY, targetX, targetY } = config[type];

  return (
    <AnimatePresence>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={`${type}-${i}`}
          initial={{ 
            x: startX,
            y: startY,
            z: 50 + (i * 2),
            rotateY: 0,
            rotateZ: 0,
            opacity: 0,
            scale: 0.2
          }}
          animate={{ 
            x: [startX, startX, targetX + (i - count/2) * 40],
            y: [startY, startY - 100, targetY],
            z: [50, 200, 0],
            rotateY: [0, 90, 180],
            rotateZ: [0, 15, (i - count/2) * 2],
            opacity: [0, 1, 1, 0],
            scale: [0.2, 1.2, 1.0, 0.8]
          }}
          transition={{ 
            duration: 2.0,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
          className="absolute w-[132px] h-[86px] rounded-xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center border-2 border-white/30 z-[200] pointer-events-none transform-style-3d overflow-hidden"
          style={{ 
            backgroundColor: color,
            backfaceVisibility: 'hidden',
            left: 0,
            top: 0
          }}
        >
          {/* Card Back Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.1),_transparent_70%)]" />
          <div className="absolute inset-2 border border-white/10 rounded-lg" />
          
          <div className="text-[10px] font-black text-white/60 mb-1 tracking-[0.2em]">{label}</div>
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 shadow-inner">
            <span className="text-2xl filter drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">🎴</span>
          </div>
          <div className="mt-2 w-8 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full" />
          
          {/* Shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full"
            animate={{ x: ['100%', '-100%'] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

