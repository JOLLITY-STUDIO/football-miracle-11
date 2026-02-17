import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CardDeckDisplayProps {
  homeDeckCount: number;
  awayDeckCount: number;
  isDealing: boolean;
}

export const CardDeckDisplay: React.FC<CardDeckDisplayProps> = ({ homeDeckCount, awayDeckCount, isDealing }) => {
  const [showComponent, setShowComponent] = useState(isDealing);
  
  // 控制显示逻辑
  React.useEffect(() => {
    if (isDealing) {
      setShowComponent(true);
    } else {
      // 发牌完成后延迟隐藏
      const timer = setTimeout(() => {
        setShowComponent(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isDealing]);
  
  if (!showComponent) return null;

  return (
    <div className="fixed right-16 top-1/2 -translate-y-1/2 z-[200] flex flex-col gap-6">
      {/* Home Deck */}
      <motion.div
        initial={{ x: 100, opacity: 0, scale: 0.8 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 100, opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="flex flex-col items-center gap-2"
      >
        <motion.div 
          className="w-20 h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-lg relative overflow-hidden"
        >
          {/* Card stack effect */}
          {[...Array(homeDeckCount)].map((_, i) => (
            <motion.div
              key={`home-card-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50"
              style={{
                transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
                zIndex: homeDeckCount - i
              }}
            />
          ))}
          {/* Deck label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Home</div>
              <div className="text-2xl font-bold text-white">{homeDeckCount}</div>
            </div>
          </div>
        </motion.div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Deck</div>
      </motion.div>

      {/* Away Deck */}
      <motion.div
        initial={{ x: 100, opacity: 0, scale: 0.8 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 100, opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
        className="flex flex-col items-center gap-2"
      >
        <motion.div 
          className="w-20 h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-lg relative overflow-hidden"
        >
          {/* Card stack effect */}
          {[...Array(awayDeckCount)].map((_, i) => (
            <motion.div
              key={`away-card-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50"
              style={{
                transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
                zIndex: awayDeckCount - i
              }}
            />
          ))}
          {/* Deck label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Away</div>
              <div className="text-2xl font-bold text-white">{awayDeckCount}</div>
            </div>
          </div>
        </motion.div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Deck</div>
      </motion.div>
    </div>
  );
};
