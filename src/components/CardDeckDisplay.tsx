import React from 'react';
import { motion } from 'framer-motion';

interface CardDeckDisplayProps {
  homeDeckCount: number;
  awayDeckCount: number;
  isDealing: boolean;
}

export const CardDeckDisplay: React.FC<CardDeckDisplayProps> = ({ homeDeckCount, awayDeckCount, isDealing }) => {
  if (!isDealing) return null;

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-[150] flex flex-col gap-4">
      {/* Home Deck */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-20 h-32 bg-gradient-to-b from-green-800 to-green-900 rounded-lg border-2 border-green-500/50 shadow-lg relative overflow-hidden">
          {/* Card stack effect */}
          {[...Array(Math.min(homeDeckCount, 5))].map((_, i) => (
            <motion.div
              key={`home-card-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute inset-0 bg-gradient-to-b from-green-800 to-green-900 rounded-lg border border-green-500/30"
              style={{
                transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
                zIndex: 5 - i
              }}
            />
          ))}
          {/* Deck label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold text-green-400 uppercase tracking-wider">Home</div>
              <div className="text-2xl font-bold text-white">{homeDeckCount}</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-green-400 font-bold uppercase tracking-wider">Deck</div>
      </motion.div>

      {/* Away Deck */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-20 h-32 bg-gradient-to-b from-red-800 to-red-900 rounded-lg border-2 border-red-500/50 shadow-lg relative overflow-hidden">
          {/* Card stack effect */}
          {[...Array(Math.min(awayDeckCount, 5))].map((_, i) => (
            <motion.div
              key={`away-card-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="absolute inset-0 bg-gradient-to-b from-red-800 to-red-900 rounded-lg border border-red-500/30"
              style={{
                transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
                zIndex: 5 - i
              }}
            />
          ))}
          {/* Deck label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold text-red-400 uppercase tracking-wider">Away</div>
              <div className="text-2xl font-bold text-white">{awayDeckCount}</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-red-400 font-bold uppercase tracking-wider">Deck</div>
      </motion.div>
    </div>
  );
};
