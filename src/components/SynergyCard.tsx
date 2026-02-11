import React from 'react';
import { motion } from 'framer-motion';
import type { SynergyCard as SynergyCardType } from '../data/cards';

interface Props {
  card: SynergyCardType;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  selected?: boolean;
  disabled?: boolean;
  faceDown?: boolean;
  size?: 'small' | 'normal';
}

export const SynergyCardComponent: React.FC<Props> = ({ 
  card, 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  selected, 
  disabled = false,
  faceDown = false,
  size = 'normal'
}) => {
  const isAttack = card.type === 'attack';
  const isDefense = card.type === 'defense';
  const isTackle = card.type === 'tackle';
  const isSpecial = card.type === 'special';
  const isSetPiece = card.type === 'setpiece';
  const isVAR = card.name.includes('VAR');

  const getBgGradient = () => {
    if (isVAR) return 'bg-gradient-to-br from-slate-800 to-black';
    if (isAttack) return 'bg-gradient-to-br from-red-800 to-red-950';
    if (isDefense) return 'bg-gradient-to-br from-blue-800 to-blue-950';
    if (isTackle) return 'bg-gradient-to-br from-purple-800 to-purple-950';
    if (isSetPiece) return 'bg-gradient-to-br from-orange-600 to-orange-800';
    return 'bg-gradient-to-br from-amber-700 to-amber-900';
  };

  const getBorderColor = () => {
    if (isVAR) return 'border-cyan-400';
    if (isAttack) return 'border-red-600';
    if (isDefense) return 'border-blue-600';
    if (isTackle) return 'border-purple-600';
    if (isSetPiece) return 'border-orange-500';
    return 'border-amber-500';
  };

  const getIcon = () => {
    if (isVAR) return '📺';
    if (isAttack) return '⚔️';
    if (isDefense) return '🛡️';
    if (isTackle) return '👟';
    if (isSetPiece) return '🚩';
    return '⭐';
  };

  const dimensions = 'w-48 h-28';
  const frontImage = card.stars === 1 
    ? (isTackle ? '/cards/synergy/synergy-card-1-trackle.png' : '/cards/synergy/synergy-card-1.png')
    : undefined;
  const frontImageStars2 = card.stars === 2 ? '/cards/synergy/synergy-card-2.png' : undefined;
  const frontImageResolved = frontImage || frontImageStars2;
  const typeLabel = isTackle ? 'TACKLE!' : isAttack ? 'ATTACK!' : isDefense ? 'DEFENSE!' : isSetPiece ? 'SET PIECE' : isSpecial ? 'SPECIAL' : '';

  return (
    <motion.div
      onClick={disabled ? undefined : onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative ${dimensions} rounded-[2rem] cursor-pointer
        shadow-xl preserve-3d border-[6px] border-[#1a1a1a] overflow-hidden
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : ''}
        ${selected ? 'ring-4 ring-yellow-400 z-10' : ''}
      `}
      whileHover={!disabled && !faceDown ? { scale: 1.05, y: -5 } : {}}
      initial={false}
      animate={{ rotateY: faceDown ? 180 : 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Front Face */}
      <div className={`
        absolute inset-0 backface-hidden rounded-[1.5rem] overflow-hidden border-2
        ${getBgGradient()}
        ${getBorderColor()}
      `}
      style={{ backfaceVisibility: 'hidden' }}
      >
        {frontImageResolved ? (
          <img 
            src={frontImageResolved} 
            alt="Synergy Card Front"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 rounded-[1.5rem] bg-white">
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="100%" height="100%" viewBox="0 0 200 120" className="opacity-80">
                <path d="M100 10 L115 55 L165 55 L125 85 L140 130 L100 100 L60 130 L75 85 L35 55 L85 55 Z" fill="#e5e7eb" />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              {Array.from({ length: Math.min(5, card.stars) }).map((_, i) => (
                <svg key={i} width="42" height="42" viewBox="0 0 42 42">
                  <path d="M21 3 L25 15 L38 15 L27 23 L31 35 L21 28 L11 35 L15 23 L4 15 L17 15 Z" fill="#fbbf24" stroke="#ef4444" strokeWidth="2" />
                </svg>
              ))}
            </div>
            {typeLabel && (
              <div className="absolute bottom-2 right-3 text-amber-700 font-black italic text-sm tracking-wider">{typeLabel}</div>
            )}
          </div>
        )}

        {/* Left Sidebar: Type & Stars */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-black/40 flex flex-col items-center justify-between py-2 border-r border-white/10 z-10">
           <div className="flex flex-col items-center gap-0.5 mt-2">
             {[...Array(card.stars)].map((_, i) => (
               <span key={i} className="text-[8px] leading-none text-yellow-400 drop-shadow-[0_0_2px_rgba(250,204,21,0.5)]">★</span>
             ))}
           </div>
           <div className="text-[0.6rem] font-bold text-white uppercase tracking-wider font-['Russo_One'] -rotate-90 whitespace-nowrap mb-6">
              {isAttack ? 'ATTACK' : isDefense ? 'DEFENSE' : isTackle ? 'TACKLE' : isSetPiece ? 'SET PIECE' : 'SPECIAL'}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="absolute inset-0 left-8 flex flex-col p-2 justify-between z-10">
           <div className="flex justify-between items-start">
              <div className="text-[0.6rem] font-black text-white/90 uppercase tracking-tighter leading-tight w-[70%] drop-shadow-sm">
                {card.name}
              </div>
              <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xs shadow-inner">
                {getIcon()}
              </div>
           </div>

           <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[0.5rem] text-white/50 uppercase font-bold tracking-widest">Power</span>
                <span className="text-xl font-black text-white leading-none drop-shadow-md">+{card.value}</span>
              </div>
              <div className="text-[0.5rem] text-white/30 font-bold uppercase italic tracking-tighter">
                Magic Eleven
              </div>
           </div>
        </div>
      </div>

      <div 
        className="absolute inset-0 backface-hidden rounded-[1.5rem] bg-[#1a1a1a] flex items-center justify-center overflow-hidden"
        style={{ 
          backfaceVisibility: 'hidden', 
          transform: 'rotateY(180deg)' 
        }}
      >
        <img 
          src="/cards/synergy/synergy-card-back.png" 
          alt="Synergy Card Back" 
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
};
