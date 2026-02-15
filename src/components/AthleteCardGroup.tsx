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
  // Calculate fan shape parameters
  const centerIndex = (cards.length - 1) / 2;
  const maxAngle = 45; // Maximum angle from center in degrees (increased for more pronounced fan)
  const radius = 120; // Radius of the fan in pixels (increased for more pronounced fan)

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[500px] h-[200px] pointer-events-auto flex justify-center items-end pb-2 perspective-1000">
      {/* Visual arc for debugging */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="-250 -200 500 200">
        <path 
          d={`M ${-Math.sin(Math.PI * maxAngle / 180) * radius} ${Math.cos(Math.PI * maxAngle / 180) * radius} A ${radius} ${radius} 0 0 1 ${Math.sin(Math.PI * maxAngle / 180) * radius} ${Math.cos(Math.PI * maxAngle / 180) * radius}`} 
          stroke="rgba(255, 255, 255, 0.3)" 
          strokeWidth="2" 
          fill="none"
        />
      </svg>
      <AnimatePresence>
        {cards.map((card, i) => {
          // Calculate position in fan shape with cards centered on an arc
          const angle = (i - centerIndex) * (maxAngle / centerIndex);
          const radian = (angle * Math.PI) / 180;
          const x = Math.sin(radian) * radius;
          const y = -Math.cos(radian) * radius; // Calculate y position for arc

          return (
            <motion.div
              key={card.id}
              data-testid="hand-card"
              initial={{ opacity: 0, y: 200, rotate: 0, scale: 0 }}
              animate={setupStep >= 3 || phase === 'firstHalf' || phase === 'secondHalf' ? { 
                opacity: 1, 
                y: selectedCard?.id === card.id ? y - 20 : y, 
                x: selectedCard?.id === card.id ? x : x,
                scale: selectedCard?.id === card.id ? 1.1 : 1,
                rotate: selectedCard?.id === card.id ? 0 : angle,
              } : { opacity: 0, y: 200, rotate: 0, scale: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 50 }}
              whileHover={{ 
                scale: 1.3, 
                rotate: 0, 
                zIndex: 100,
                y: y - 30,
                x: 0
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
          );
        })}
      </AnimatePresence>
    </div>
  );
};