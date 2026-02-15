import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { athleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';

interface AthleteCardGroupProps {
  cards: athleteCard[];
  selectedCard: athleteCard | null;
  setupStep: number;
  phase: string;
  onCardSelect: (card: athleteCard) => void;
}

export const AthleteCardGroup: React.FC<AthleteCardGroupProps> = ({
  cards,
  selectedCard,
  setupStep,
  phase,
  onCardSelect,
}) => {
  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[400px] h-32 pointer-events-auto flex justify-center items-end pb-2 perspective-1000">
      <AnimatePresence>
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            data-testid="hand-card"
            initial={{ opacity: 0, y: 200, rotate: 0, scale: 0 }}
            animate={setupStep >= 3 || phase === 'firstHalf' || phase === 'secondHalf' ? { 
              opacity: 1, 
              y: selectedCard?.id === card.id ? -20 : 0, 
              scale: selectedCard?.id === card.id ? 1.1 : 1,
              rotate: selectedCard?.id === card.id ? 0 : (i - (cards.length - 1) / 2) * 4, 
              x: (i - (cards.length - 1) / 2) * -40 
            } : { opacity: 0, y: 200, rotate: 0, scale: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            whileHover={{ 
              scale: 1.3, 
              rotate: 0, 
              zIndex: 100,
              y: -30
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative origin-bottom cursor-pointer shadow-2xl"
            style={{ zIndex: selectedCard?.id === card.id ? 100 : i }}
          >
            <AthleteCardComponent
              card={card}
              onClick={() => onCardSelect(card)}
              selected={selectedCard?.id === card.id}
              size="small" 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};