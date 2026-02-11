import React from 'react';
import { motion } from 'framer-motion';
import type { SynergyCard as SynergyCardType } from '../data/cards';
import { BaseCard } from './BaseCard';

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
        relative preserve-3d
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
        ${selected ? 'z-10' : ''}
      `}
      whileHover={!disabled && !faceDown ? { scale: 1.05, y: -5 } : {}}
      initial={false}
      animate={{ rotateY: faceDown ? 180 : 0 }}
      transition={{ duration: 0.6 }}
    >
      <BaseCard 
        size={size === 'small' ? 'small' : 'medium'} 
        className={`border-[4px] border-[#1a1a1a] shadow-xl ${selected ? 'ring-4 ring-yellow-400' : ''}`}
      >
        {/* Front Face */}
        <div className={`
          absolute inset-0 backface-hidden overflow-hidden border-2
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
            <div className="absolute inset-0 bg-white">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-full h-full flex flex-col items-center justify-center ${getBgGradient()} text-white p-2`}>
                  <div className="text-4xl mb-1">{getIcon()}</div>
                  <div className="text-[10px] font-black tracking-tighter uppercase text-center leading-none">
                    {card.name}
                  </div>
                  {card.stars > 0 && (
                    <div className="mt-1 flex gap-0.5">
                      {[...Array(card.stars)].map((_, i) => (
                        <span key={i} className="text-yellow-400 text-sm">★</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Label strip */}
          {!frontImageResolved && (
            <div className="absolute top-0 left-0 right-0 h-4 bg-black/40 flex items-center px-2">
              <span className="text-[8px] font-bold text-white tracking-widest uppercase">{typeLabel}</span>
            </div>
          )}
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden bg-stone-900 flex items-center justify-center overflow-hidden"
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <img 
            src="/cards/synergy/synergy-card-back.png" 
            alt="Synergy Card Back" 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.classList.add('bg-stone-800');
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center">
              <span className="text-3xl grayscale opacity-30">🃏</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </motion.div>
  );
};
