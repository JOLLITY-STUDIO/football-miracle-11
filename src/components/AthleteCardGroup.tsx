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
    <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[80%] h-48 pointer-events-auto flex justify-center items-end pb-4 perspective-1000 z-50">
      <AnimatePresence>
        {cards.map((card, i) => {
          const centerIndex = (cards.length - 1) / 2;
          const offset = i - centerIndex;
          
          return (
            <motion.div
              key={card.id}
              data-testid="hand-card"
              initial={{ opacity: 0, y: 200, rotate: 0, scale: 0 }}
              animate={setupStep >= 3 || phase === 'firstHalf' || phase === 'secondHalf' ? { 
                opacity: 1, 
                y: selectedCard?.id === card.id ? -20 : 5 - Math.abs(offset) * 2, 
                scale: selectedCard?.id === card.id ? 1.1 : 1,
                rotate: selectedCard?.id === card.id ? 0 : offset * 5, 
                x: (offset) * 85 
              } : { opacity: 0, y: 200, rotate: 0, scale: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              whileHover={{ 
                scale: 1.3, 
                rotate: 0, 
                zIndex: 100,
                y: -30,
                x: 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative origin-center cursor-pointer shadow-2xl"
              style={{ zIndex: selectedCard?.id === card.id ? 100 : i }}
            >
              <AthleteCardComponent
                card={card}
                onClick={() => onCardSelect(card)}
                selected={selectedCard?.id === card.id}
                size="small" 
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className="absolute bottom-20 text-center text-[10px] text-white/40 uppercase tracking-widest font-bold w-full">
        YOUR HAND: {cards.length}
      </div>
    </div>
  );
};