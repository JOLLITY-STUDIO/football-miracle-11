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
    if (isVAR) return 'bg-gradient-to-br from-slate-800 to-black';
    if (isAttack) return 'bg-gradient-to-br from-[#F82D45] to-[#C62B1D]';
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
    return '📚';
  };

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
        size={size} 
        className={`border-[4px] border-[#1a1a1a] shadow-xl ${selected ? 'ring-4 ring-yellow-400' : ''}`}
      >
        {/* Front Face */}
        <div className={`
          absolute inset-0 backface-hidden overflow-hidden border-2 border-stone-800
          ${getBgGradient()}
          ${getBorderColor()}
        `}
        style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 卡片内容 - 左右布局 */}
          <div className="h-full flex">
            {/* 左边1/2：背景色区域 */}
            <div className="relative w-1/2 h-full border-r border-black/30">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl">{getIcon()}</div>
              </div>
              
              {/* 类型图标 */}
              <div className="absolute bottom-2 left-2 w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                <span className="text-xs font-black text-white">
                  {isAttack ? '⚔️' : isDefense ? '🛡️' : isTackle ? '👟' : '📚'}
                </span>
              </div>
            </div>
            
            {/* 右边1/2：白色信息区�?*/}
            <div className="relative w-1/2 h-full bg-white flex flex-col justify-center items-center px-2">
              <div className="flex flex-col items-center justify-center space-y-2">
                {/* 类型标签 */}
                <div className={`px-2 py-0.5 rounded-md ${isAttack ? 'bg-red-600' : isDefense ? 'bg-blue-600' : isTackle ? 'bg-purple-600' : 'bg-amber-600'}`}>
                  <span className="text-xs font-black tracking-wider text-white">{typeLabel}</span>
                </div>
                
                {/* 卡片名称 */}
                <div className="text-xs font-black tracking-wider text-center leading-none" style={{ color: isAttack ? '#dc2626' : isDefense ? '#2563eb' : isTackle ? '#8b5cf6' : '#d97706' }}>
                  {card.name}
                </div>
                
                {/* 技能�?*/}
                {card.stars > 0 && (
                  <div className="flex items-center justify-center space-x-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${isAttack ? 'bg-red-100 border-red-500' : isDefense ? 'bg-blue-100 border-blue-500' : isTackle ? 'bg-purple-100 border-purple-500' : 'bg-amber-100 border-amber-500'}`}>
                      <span className={`text-xs font-bold ${isAttack ? 'text-red-800' : isDefense ? 'text-blue-800' : isTackle ? 'text-purple-800' : 'text-amber-800'}`}>+{card.stars}</span>
                    </div>
                  </div>
                )}
              </div>
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
                {/* SVG 金色五角�?*/}
                <svg width="200" height="200" viewBox="0 0 100 100">
                  <path 
                    d="M50 0 L63 38 L100 38 L69 61 L81 100 L50 76 L19 100 L31 61 L0 38 L37 38 Z" 
                    fill="#fbbf24"
                    stroke="#fcd34d"
                    stroke-width="6"
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

