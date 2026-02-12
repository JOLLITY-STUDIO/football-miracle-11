import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';

interface Props {
  cards: PlayerCard[];
  round: number;
  isPlayerTurn: boolean;
  onSelect: (index: number) => void;
  aiSelectedIndex?: number | null;
  isHomeTeam: boolean;
}

const StarCardDraft: React.FC<Props> = ({ 
  cards, 
  round, 
  isPlayerTurn, 
  onSelect, 
  aiSelectedIndex = null,
  isHomeTeam
}) => {
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
            <div className="flex justify-center gap-4 mb-2">
              <span className={`px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase border ${
                isHomeTeam 
                  ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' 
                  : 'bg-red-500/20 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
              }`}>
                {isHomeTeam ? '🏠 HOME TEAM' : '✈️ AWAY TEAM'}
              </span>
            </div>
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
                animate={{ 
                  opacity: 1, 
                  y: aiSelectedIndex === index ? -20 : 0,
                  scale: aiSelectedIndex === index ? 1.05 : 1
                }}
                transition={{ delay: index * 0.1 }}
                className={`relative transition-all duration-300 ${
                  isPlayerTurn 
                    ? 'cursor-pointer' 
                    : aiSelectedIndex === index ? 'opacity-100 scale-105' : 'opacity-70 grayscale-[0.5]'
                }`}
                whileHover={isPlayerTurn ? { 
                  scale: 1.25, 
                  y: -20,
                  zIndex: 50,
                  transition: { type: "spring", stiffness: 400, damping: 25 }
                } : {}}
                onClick={() => isPlayerTurn && onSelect(index)}
              >
                {(isPlayerTurn || aiSelectedIndex === index) && (
                   <motion.div 
                     className={`absolute -inset-6 ${aiSelectedIndex === index ? 'bg-red-500/30' : 'bg-yellow-500/20'} rounded-xl blur-2xl`}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: aiSelectedIndex === index ? 1 : 0 }}
                     whileHover={isPlayerTurn ? { opacity: 1, scale: 1.1 } : {}}
                   />
                )}
                <div className="relative z-10">
                  <PlayerCardComponent
                    card={card}
                    size="large"
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
                  {aiSelectedIndex === index && (
                    <motion.div 
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      AI PICKING...
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
