import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';

interface Props {
  cards: PlayerCard[];
  round: number;
  isPlayerTurn: boolean;
  onSelect: (index: number) => void;
  onMouseEnter?: (card: PlayerCard) => void;
  onMouseLeave?: () => void;
}

const StarCardDraft: React.FC<Props> = ({ cards, round, isPlayerTurn, onSelect, onMouseEnter, onMouseLeave }) => {
  if (cards.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-[#2a2a2a] rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-5xl w-full"
        >
          <div className="text-center mb-10">
            <div className="text-4xl font-bold text-yellow-400 mb-4 tracking-wider">
              ⭐ STAR CARD DRAFT - ROUND {round} ⭐
            </div>
            <div className={`text-2xl font-bold ${isPlayerTurn ? 'text-green-400' : 'text-red-400'}`}>
              {isPlayerTurn ? 'YOUR TURN TO PICK!' : 'AI IS CHOOSING...'}
            </div>
          </div>
          
          <div className="flex gap-8 justify-center items-center mb-8">
            {cards.map((card, index) => (
              <motion.div 
                key={card.id}
                data-testid="star-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative transition-all duration-300 ${
                  isPlayerTurn 
                    ? 'cursor-pointer' 
                    : 'opacity-70 grayscale-[0.5]'
                }`}
                whileHover={isPlayerTurn ? { scale: 1.05, y: -10 } : {}}
                onClick={() => isPlayerTurn && onSelect(index)}
              >
                {isPlayerTurn && (
                   <motion.div 
                     className="absolute -inset-4 bg-yellow-500/20 rounded-xl blur-xl"
                     initial={{ opacity: 0 }}
                     whileHover={{ opacity: 1 }}
                   />
                )}
                <div className="relative z-10">
                  <PlayerCardComponent
                    card={card}
                    size="large"
                    onMouseEnter={() => onMouseEnter?.(card)}
                    onMouseLeave={() => onMouseLeave?.()}
                  />
                  {isPlayerTurn && (
                    <motion.div 
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                      initial={{ opacity: 0, y: -10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      SELECT
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center text-gray-500 text-sm tracking-wider uppercase">
            {cards.length} cards available • Pick 1 • Remaining card will be removed
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StarCardDraft;
