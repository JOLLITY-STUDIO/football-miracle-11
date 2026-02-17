import React from 'react';
import { motion } from 'framer-motion';
import type { athleteCard } from '../data/cards';

interface DeckDisplayProps {
  homeDeck: athleteCard[];
  awayDeck: athleteCard[];
  starDeck: athleteCard[];
  isVisible: boolean;
}

export const DeckDisplay: React.FC<DeckDisplayProps> = ({ homeDeck, awayDeck, starDeck, isVisible }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="fixed bottom-8 right-8 z-[200] flex flex-col gap-4"
    >
      {/* Star Deck */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-20 h-32 bg-gradient-to-b from-yellow-800 to-yellow-900 rounded-lg border-2 border-yellow-700 shadow-lg relative overflow-hidden">
          {/* Card stack effect */}
          {[...Array(Math.min(starDeck.length, 5))].map((_, i) => (
            <div
              key={`star-card-${i}`}
              className="absolute inset-0 bg-gradient-to-b from-yellow-800 to-yellow-900 rounded-lg border border-yellow-700/50"
              style={{
                transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
                zIndex: 5 - i
              }}
            />
          ))}
          {/* Deck label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Star</div>
              <div className="text-2xl font-bold text-white">{starDeck.length}</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Deck</div>
      </motion.div>
      
      {/* Home Deck */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-20 h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-lg relative overflow-hidden">
          {/* Card stack effect */}
          {[...Array(Math.min(homeDeck.length, 5))].map((_, i) => (
            <div
              key={`home-card-${i}`}
              className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50"
              style={{
                transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
                zIndex: 5 - i
              }}
            />
          ))}
          {/* Deck label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Home</div>
              <div className="text-2xl font-bold text-white">{homeDeck.length}</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Deck</div>
      </motion.div>
      
      {/* Away Deck */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="w-20 h-32 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-gray-700 shadow-lg relative overflow-hidden">
          {/* Card stack effect */}
          {[...Array(Math.min(awayDeck.length, 5))].map((_, i) => (
            <div
              key={`away-card-${i}`}
              className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/50"
              style={{
                transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
                zIndex: 5 - i
              }}
            />
          ))}
          {/* Deck label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Away</div>
              <div className="text-2xl font-bold text-white">{awayDeck.length}</div>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Deck</div>
      </motion.div>
    </motion.div>
  );
};
