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
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'synergy';
}

export const SynergyCardComponent: React.FC<Props> = ({ 
  card, 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  selected, 
  disabled = false,
  faceDown = false,
  size = 'large'
}) => {
  const isAttack = card.type === 'attack';
  const isDefense = card.type === 'defense';
  const isTackle = card.type === 'tackle';
  const isSpecial = card.type === 'special';
  const isSetPiece = card.type === 'setpiece';
  const isVAR = card.name.includes('VAR');

  const getBgGradient = () => {
    if (isAttack) return 'bg-gradient-to-br from-red-100 to-red-200';
    if (isDefense) return 'bg-gradient-to-br from-blue-100 to-blue-200';
    if (isTackle) return 'bg-gradient-to-br from-green-100 to-green-200';
    if (isSpecial) return 'bg-gradient-to-br from-purple-100 to-purple-200';
    if (isSetPiece) return 'bg-gradient-to-br from-yellow-100 to-yellow-200';
    return 'bg-gradient-to-br from-gray-50 to-gray-100';
  };

  const getBorderColor = () => {
    if (isAttack) return 'border-red-500';
    if (isDefense) return 'border-blue-500';
    if (isTackle) return 'border-green-500';
    if (isSpecial) return 'border-purple-500';
    if (isSetPiece) return 'border-yellow-500';
    return 'border-gray-400';
  };

  const getGlowColor = () => {
    if (isAttack) return 'from-red-500/30 to-red-700/30';
    if (isDefense) return 'from-blue-500/30 to-blue-700/30';
    if (isTackle) return 'from-green-500/30 to-green-700/30';
    if (isSpecial) return 'from-purple-500/30 to-purple-700/30';
    if (isSetPiece) return 'from-yellow-500/30 to-yellow-700/30';
    return 'from-gray-500/30 to-gray-700/30';
  };

  const getIcon = () => {
    if (isAttack) return '⚽';
    if (isDefense) return '🛡️';
    if (isTackle) return '🔄';
    if (isSpecial) return '✨';
    if (isSetPiece) return '🎯';
    return '⭐';
  };

  // 渲染星级评分
  const renderStars = (stars: number) => {
    const starElements = Array.from({ length: stars }, (_, i) => (
      <span key={i} className="text-yellow-500 text-2xl">⭐</span>
    ));
    
    // 如果星星数量 <= 3，显示在一行
    if (stars <= 3) {
      return <div className="flex items-center justify-center gap-1">{starElements}</div>;
    }
    
    // 如果星星数量 > 3，需要换行显示
    const firstRow = starElements.slice(0, 3);
    const secondRow = starElements.slice(3);
    
    return (
      <div className="flex flex-col items-center justify-center gap-1">
        <div className="flex items-center justify-center gap-1">{firstRow}</div>
        <div className="flex items-center justify-center gap-1">{secondRow}</div>
      </div>
    );
  };

  const typeLabel = 'SYNERGY CARD';

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
      transition={{ 
        duration: 0.8, 
        ease: "easeInOut",
        type: "spring",
        stiffness: 200,
        damping: 15
      }}
    >
      {/* Glow Effect */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`
          absolute inset-0 rounded-xl
          bg-gradient-to-br ${getGlowColor()}
          blur-[20px]
          pointer-events-none
        `}
      />
      
      <BaseCard 
        size={size} 
        className={`
          border-[4px] ${getBorderColor()} shadow-xl 
          ${selected ? 'ring-4 ring-yellow-400' : ''}
          transform-style-3d
        `}
      >
        {/* Front Face */}
        <div className={`
          absolute inset-0 backface-hidden overflow-hidden border-2 ${getBorderColor()}
          ${getBgGradient()}
        `}
        style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 卡片内容 - 居中布局 */}
          <div className="h-full flex flex-col items-center justify-center p-4 relative">
            {/* Tackle卡特殊标记 */}
            {isTackle && (
              <motion.div 
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold"
              >
                ⚽ TACKLE!
              </motion.div>
            )}
            
            {/* Icon */}
            <motion.span
              className="text-3xl mb-3"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {getIcon()}
            </motion.span>
            
            {/* 星级显示 - 放在中间 */}
            <motion.div 
              className="mb-3"
              animate={{
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {renderStars(card.stars)}
            </motion.div>
            
            {/* 类型标签 */}
            <motion.div 
              className="bg-gray-800 text-white px-3 py-1 rounded-md"
              animate={{
                y: [0, -2, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <span className="text-xs font-bold tracking-wider">{typeLabel}</span>
            </motion.div>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden overflow-hidden"
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {/* 统一卡牌背面设计 */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center overflow-hidden">
            {/* 大五角星背景 */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <motion.div 
                className="w-full h-full flex items-center justify-center transform rotate-90"
                animate={{
                  rotate: [90, 95, 90]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {/* SVG 金色五角星 */}
                <svg width="200" height="200" viewBox="0 0 100 100">
                  <path 
                    d="M50 0 L63 38 L100 38 L69 61 L81 100 L50 76 L19 100 L31 61 L0 38 L37 38 Z" 
                    fill="#fbbf24"
                    stroke="#fcd34d"
                    strokeWidth="6"
                  />
                </svg>
              </motion.div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <motion.div 
                className="w-16 h-16 rounded-full border-4 border-yellow-400/30 flex items-center justify-center bg-black/30"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 360]
                }}
                transition={{
                  scale: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  },
                  rotate: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }
                }}
              >
                <img src="/icons/synergy_plus_ring.svg" alt="Card Back" className="w-10 h-10 opacity-90" />
              </motion.div>
            </div>
          </div>
        </div>
      </BaseCard>
    </motion.div>
  );
};