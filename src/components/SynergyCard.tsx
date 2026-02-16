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
    // 统一使用白色/浅灰色背景
    return 'bg-gradient-to-br from-gray-50 to-gray-100';
  };

  const getBorderColor = () => {
    // 统一使用深灰色边框
    return 'border-gray-400';
  };

  const getIcon = () => {
    // 简化图标，使用星星
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
      transition={{ duration: 0.6 }}
    >
      <BaseCard 
        size={size} 
        className={`border-[4px] border-[#1a1a1a] shadow-xl ${selected ? 'ring-4 ring-yellow-400' : ''}`}
      >
        {/* Front Face */}
        <div className={`
          absolute inset-0 backface-hidden overflow-hidden border-2 border-gray-400
          ${getBgGradient()}
        `}
        style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 卡片内容 - 居中布局 */}
          <div className="h-full flex flex-col items-center justify-center p-4 relative">
            {/* Tackle卡特殊标记 */}
            {isTackle && (
              <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                ⚽ TACKLE!
              </div>
            )}
            
            {/* 星级显示 - 放在中间 */}
            <div className="mb-3">
              {renderStars(card.stars)}
            </div>
            
            {/* 类型标签 */}
            <div className="bg-gray-800 text-white px-3 py-1 rounded-md">
              <span className="text-xs font-bold tracking-wider">{typeLabel}</span>
            </div>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden overflow-hidden"
             style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          {/* 统一卡牌背面设计 */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center overflow-hidden">
            {/* 大五角星背景 */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <div className="w-full h-full flex items-center justify-center transform rotate-90">
                {/* SVG 金色五角星 */}
                <svg width="200" height="200" viewBox="0 0 100 100">
                  <path 
                    d="M50 0 L63 38 L100 38 L69 61 L81 100 L50 76 L19 100 L31 61 L0 38 L37 38 Z" 
                    fill="#fbbf24"
                    stroke="#fcd34d"
                    strokeWidth="6"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-16 h-16 rounded-full border-4 border-yellow-400/30 flex items-center justify-center bg-black/30">
                <img src="/icons/synergy_plus_ring.svg" alt="Card Back" className="w-10 h-10 opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </BaseCard>
    </motion.div>
  );
};