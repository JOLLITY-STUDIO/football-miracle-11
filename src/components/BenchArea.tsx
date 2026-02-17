import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AthleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';

interface Props {
  playerBench: AthleteCard[];
  aiBench: AthleteCard[];
  onPlayerBenchClick?: (card: AthleteCard) => void;
  selectedBenchCard?: AthleteCard | null;
  isPlayerTurn: boolean;
  playerSubstitutionsLeft: number;
}

export const BenchArea: React.FC<Props> = ({
  playerBench,
  aiBench,
  onPlayerBenchClick,
  selectedBenchCard,
  isPlayerTurn,
  playerSubstitutionsLeft,
}) => {
  const displayAiBench = aiBench.slice(0, 3);
  const displayPlayerBench = playerBench.slice(0, 3);

  return (
    <div className="flex flex-col bg-stone-900/90 backdrop-blur-md rounded-xl border-2 border-stone-600 shadow-2xl w-28 overflow-hidden">
      {/* Header */}
      <div className="bg-stone-800 p-2 text-center border-b border-stone-700">
        <span className="text-stone-300 text-xs font-bold uppercase tracking-widest font-display">BENCH</span>
      </div>

      <div className="flex-1 flex flex-col p-2 gap-4">
        {/* AI Bench */}
        <div className="flex flex-col gap-1 opacity-80">
          <div className="text-center">
            <span className="text-red-400 font-bold text-[0.6rem] uppercase tracking-wider">Opponent</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <AnimatePresence>
              {[...displayAiBench].reverse().map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8, rotate: 10 }}
                  animate={{ opacity: 1, x: 0, scale: 0.9, rotate: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.8, rotate: -10 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="relative transform origin-center"
                >
                  <AthleteCardComponent
                    card={card}
                    size="tiny"
                    variant="away"
                    faceDown={false} 
                  />
                  {/* Anime-style Glow Effect */}
                  <motion.div
                    animate={{
                      scale: [0.9, 1.1, 0.9],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.3)',
                      filter: 'blur(6px)',
                      pointerEvents: 'none'
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            {displayAiBench.length === 0 && (
              <div className="h-16 w-full rounded border-2 border-dashed border-stone-700 flex items-center justify-center text-stone-600 text-[0.6rem]">
                EMPTY
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-0.5 bg-stone-700 w-full rounded-full" />

        {/* Player Bench */}
        <div className="flex flex-col gap-1">
          <div className="text-center flex items-center justify-between px-1">
            <span className="text-green-400 font-bold text-[0.6rem] uppercase tracking-wider">You</span>
            <span className="text-stone-400 text-[0.6rem] font-bold">({playerSubstitutionsLeft})</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <AnimatePresence>
              {displayPlayerBench.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, x: 20, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.8, rotate: 10 }}
                  transition={{ 
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                  className="relative transform origin-center group"
                  onClick={() => {
                    if (isPlayerTurn && playerSubstitutionsLeft > 0 && onPlayerBenchClick) {
                      onPlayerBenchClick(card);
                    }
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, 2, 0],
                    y: -5
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Anime-style Glow Effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.3)',
                      filter: 'blur(8px)',
                      pointerEvents: 'none'
                    }}
                  />
                  
                  <AthleteCardComponent
                    card={card}
                    size="tiny"
                    variant="home"
                    selected={selectedBenchCard?.id === card.id}
                    disabled={!isPlayerTurn || playerSubstitutionsLeft <= 0}
                  />
                  
                  {isPlayerTurn && playerSubstitutionsLeft > 0 && (
                    <motion.div 
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded transition-opacity cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.span 
                        className="text-white text-[0.6rem] font-bold uppercase tracking-wider border border-white px-1 rounded"
                        animate={{
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        SUB
                      </motion.span>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {displayPlayerBench.length === 0 && (
              <div className="h-16 w-full rounded border-2 border-dashed border-stone-700 flex items-center justify-center text-stone-600 text-[0.6rem]">
                EMPTY
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

