import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDeck } from './CardDeck';

interface CardDeckManagerProps {
  homeDeckCount: number;
  awayDeckCount: number;
  starDeckCount: number;
  isVisible: boolean;
  onDeckClick?: (deckType: 'home' | 'away' | 'star') => void;
}

export const CardDeckManager: React.FC<CardDeckManagerProps> = ({ 
  homeDeckCount, 
  awayDeckCount, 
  starDeckCount, 
  isVisible, 
  onDeckClick 
}) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="fixed right-16 top-1/2 -translate-y-1/2 z-[200] flex flex-col gap-6"
    >
      {/* Star Deck */}
      <CardDeck 
        deckName="Star"
        deckCount={starDeckCount}
        deckType="star"
        isVisible={starDeckCount > 0}
        onClick={() => onDeckClick?.('star')}
      />
      
      {/* Home Deck */}
      <CardDeck 
        deckName="Home"
        deckCount={homeDeckCount}
        deckType="home"
        isVisible={homeDeckCount > 0}
        onClick={() => onDeckClick?.('home')}
      />
      
      {/* Away Deck */}
      <CardDeck 
        deckName="Away"
        deckCount={awayDeckCount}
        deckType="away"
        isVisible={awayDeckCount > 0}
        onClick={() => onDeckClick?.('away')}
      />
    </motion.div>
  );
};
