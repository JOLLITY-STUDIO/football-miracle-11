import React from 'react';
import { motion } from 'framer-motion';

interface CardDeckProps {
  deckName: string;
  deckCount: number;
  deckType: 'home' | 'away' | 'star';
  isVisible: boolean;
  onClick?: () => void;
}

export const CardDeck: React.FC<CardDeckProps> = ({ 
  deckName, 
  deckCount, 
  deckType, 
  isVisible, 
  onClick 
}) => {
  if (!isVisible) return null;

  // Define deck-specific styles
  const getDeckStyles = () => {
    switch (deckType) {
      case 'home':
        return {
          bgGradient: 'from-green-800 to-green-900',
          borderColor: 'border-green-700',
          textColor: 'text-green-400',
          shadowColor: 'rgba(34, 197, 94, 0.4)'
        };
      case 'away':
        return {
          bgGradient: 'from-red-800 to-red-900',
          borderColor: 'border-red-700',
          textColor: 'text-red-400',
          shadowColor: 'rgba(239, 68, 68, 0.4)'
        };
      case 'star':
        return {
          bgGradient: 'from-yellow-800 to-yellow-900',
          borderColor: 'border-yellow-700',
          textColor: 'text-yellow-400',
          shadowColor: 'rgba(252, 211, 77, 0.4)'
        };
      default:
        return {
          bgGradient: 'from-gray-800 to-gray-900',
          borderColor: 'border-gray-700',
          textColor: 'text-gray-400',
          shadowColor: 'rgba(107, 114, 128, 0.4)'
        };
    }
  };

  const styles = getDeckStyles();

  return (
    <motion.div
      initial={{ x: 100, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: 100, opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ 
        scale: 1.05, 
        boxShadow: `0 20px 25px -5px ${styles.shadowColor}, 0 10px 10px -5px ${styles.shadowColor}`
      }}
      className={`flex flex-col items-center gap-2 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <motion.div 
        className={`w-20 h-32 bg-gradient-to-b ${styles.bgGradient} rounded-lg border-2 ${styles.borderColor} shadow-lg relative overflow-hidden`}
      >
        {/* Card stack effect */}
        {[...Array(Math.min(deckCount, 10))].map((_, i) => (
          <motion.div
            key={`${deckType}-card-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`absolute inset-0 bg-gradient-to-b ${styles.bgGradient} rounded-lg border border-${styles.borderColor}/50`}
            style={{
              transform: `translateY(${i * 2}px) rotate(${i * 0.5}deg)`,
              zIndex: deckCount - i
            }}
          />
        ))}
        {/* Deck label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className={`text-xs font-bold ${styles.textColor} uppercase tracking-wider`}>{deckName}</div>
            <div className="text-2xl font-bold text-white">{deckCount}</div>
          </div>
        </div>
      </motion.div>
      <div className={`text-xs ${styles.textColor} font-bold uppercase tracking-wider`}>Deck</div>
    </motion.div>
  );
};
