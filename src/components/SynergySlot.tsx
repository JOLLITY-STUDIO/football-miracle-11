import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { SynergyCard } from '../data/cards';
import { SynergyCardComponent } from './SynergyCard';

interface Props {
  cards: SynergyCard[];
  type: 'attack' | 'defense' | 'special';
  isAi?: boolean;
  onSelect?: ((card: SynergyCard) => void) | undefined;
  selectedCards?: SynergyCard[];
  revealed?: boolean;
}

export const SynergySlot: React.FC<Props> = ({
  cards,
  type,
  isAi = false,
  onSelect,
  selectedCards = [],
  revealed = false,
}) => {
  const colorMap = {
    attack: '#E53935',
    defense: '#1E88E5',
    special: '#43A047',
  };

  const labelMap = {
    attack: '进攻 (RED)',
    defense: '防守 (BLUE)',
    special: '战术 (GREEN)',
  };

  const totalStars = cards.reduce((sum, card) => sum + (card.stars || 0), 0);

  return (
    <div className="relative group">
      <div className="flex items-center gap-3">
        {/* Slot Label (Hidden on AI side or styled differently) */}
        {!isAi && (
          <div className="text-[10px] font-bold text-white/40 uppercase tracking-tighter w-12 text-right">
            {labelMap[type].split(' ')[0]}
          </div>
        )}

        {/* Stacked Cards Area */}
        <div 
          className={clsx(
            "w-[104px] h-[70px] rounded-lg border-2 border-dashed flex items-center justify-center relative transition-colors duration-300",
            isAi ? "border-purple-500/20" : "border-white/10"
          )}
          style={{
            backgroundColor: `${colorMap[type]}10`,
          }}
        >
          {cards.length === 0 ? (
            <div className="text-[10px] text-white/5 font-black uppercase tracking-widest">EMPTY</div>
          ) : (
            <div className="relative w-[96px] h-[62px]">
              {cards.map((card, i) => (
                <motion.div
                  key={card.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: i,
                    transform: isAi 
                      ? `translateY(${i * 2}px) translateX(${i * -2}px)` // Opponent side offset
                      : `translateY(-${i * 2}px) translateX(${i * 2}px)`, // Player side offset
                  }}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: (isAi && !revealed) ? 180 : 0 }}
                >
                  <SynergyCardComponent
                    card={card}
                    size="tiny"
                    faceDown={isAi && !revealed} // AI cards revealed in showdown
                    selected={selectedCards.some(c => c.id === card.id)}
                    onClick={() => !isAi && onSelect?.(card)}
                  />
                </motion.div>
              ))}

              {/* Power/Star Accumulation Display */}
              {revealed && totalStars > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.5, filter: 'brightness(1)' }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: [1, 1.2, 1],
                    filter: ['brightness(1)', 'brightness(2)', 'brightness(1.2)']
                  }}
                  transition={{ 
                    duration: 0.8,
                    times: [0, 0.5, 1],
                    ease: "easeOut"
                  }}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 bg-gradient-to-r from-yellow-600 to-yellow-400 px-3 py-1 rounded-full border-2 border-white shadow-[0_0_20px_rgba(234,179,8,0.6)]"
                >
                  <span className="text-[12px] font-black text-black drop-shadow-sm">+{totalStars}</span>
                  <span className="text-[10px] text-black/80">★</span>
                  
                  {/* Glowing pulse effect */}
                  <motion.div 
                    animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-yellow-400 blur-md -z-10"
                  />
                </motion.div>
              )}

              {/* Stack Count Indicator */}
              <div className={clsx(
                "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-[8px] font-bold z-50",
                cards.length > 1 ? "opacity-100" : "opacity-0"
              )}>
                {cards.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
