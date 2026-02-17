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
      <div className="flex items-center gap-3 flex-row">

        {/* Left Indicator Square */}
        <div 
          className="w-8 h-8 rounded border-2 border-white flex items-center justify-center"
          style={{
            backgroundColor: colorMap[type],
          }}
        >
          <img src="/icons/attack_ball.svg" alt="Attack" className="w-6 h-6" />
        </div>
        
        {/* Card Slot */}
        <div 
          className="w-[206px] h-[138px] rounded-lg border-2 border-white flex items-center justify-center relative transition-colors duration-300"
          style={{
            backgroundColor: `${colorMap[type]}20`,
          }}
        >
          {cards.length === 0 ? (
            <div className="text-[12px] text-white/5 font-black uppercase tracking-widest">EMPTY</div>
          ) : (
            <div className="relative w-[198px] h-[130px]">
              {cards.map((card, i) => (
                <motion.div
                  key={card.id}
                  className="absolute inset-0"
                  style={{
                    zIndex: i,
                    transform: `translateY(-${i * 4}px) translateX(${i * 4}px)`,
                  }}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
                  animate={{ opacity: 1, scale: 1, rotateY: (isAi && !revealed) ? 180 : 0 }}
                >
                  <SynergyCardComponent
                    card={card}
                    size="large"
                    faceDown={isAi && !revealed}
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
                  className={`absolute -bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1 bg-gradient-to-r from-yellow-600 to-yellow-400 px-4 py-2 rounded-full border-2 border-white shadow-[0_0_20px_rgba(234,179,8,0.6)] ${isAi ? 'transform rotate-180' : ''}`}
                >
                  <span className="text-[14px] font-black text-black drop-shadow-sm">+{totalStars}</span>
                  <span className="text-[12px] text-black/80">星</span>
                  
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
                "absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black/80 border border-white/20 flex items-center justify-center text-[10px] font-bold z-50",
                cards.length > 1 ? "opacity-100" : "opacity-0"
              )}>
                {cards.length}
              </div>
            </div>
          )}
        </div>
        
        {/* Right Indicator Square */}
        <div 
          className="w-8 h-8 rounded border-2 border-white flex items-center justify-center"
          style={{
            backgroundColor: type === 'attack' ? 'transparent' : colorMap[type],
            opacity: type === 'attack' ? 0 : 1,
          }}
        >
          {type === 'defense' || type === 'special' ? '🛡️' : ''}
        </div>
      </div>
    </div>
  );
};
