import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { PlayerCard as PlayerCardType, TacticalIcon, IconPosition } from '../data/cards';
import { SkillEffectBadge } from './SkillEffectBadge';

interface Props {
  card: PlayerCardType;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  selected?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  faceDown?: boolean;
  draggable?: boolean;
  onDragStart?: (card: PlayerCardType) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
  variant?: 'home' | 'away';
}

const getRoleName = (type: string) => {
  switch (type) {
    case 'forward': return 'STRIKER';
    case 'midfielder': return 'PLAYMAKER';
    case 'defender': return 'DEFENDER';
    default: return 'PLAYER';
  }
};

const getCardBgColor = (type: string) => {
  switch (type) {
    case 'forward': return 'bg-gradient-to-br from-red-600 to-red-800';
    case 'midfielder': return 'bg-gradient-to-br from-emerald-600 to-emerald-800';
    case 'defender': return 'bg-gradient-to-br from-blue-600 to-blue-800';
    default: return 'bg-gradient-to-br from-gray-600 to-gray-800';
  }
};

const getIconSymbol = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '⚔️';
    case 'defense': return '🛡️';
    case 'pass': return '👟';
    case 'press': return '⚡';
    case 'breakthrough': return '💨';
    case 'breakthroughAll': return '💥';
  }
};

const getIconColor = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '#ef4444';
    case 'defense': return '#3b82f6';
    case 'pass': return '#22c55e';
    case 'press': return '#f59e0b';
    case 'breakthrough': return '#8b5cf6';
    case 'breakthroughAll': return '#ec4899';
  }
};

const getHalfIconInfo = (position: IconPosition): { top: string; side: 'left' | 'right' } => {
  const positions: Record<IconPosition, { top: string; side: 'left' | 'right' }> = {
    'slot1-topLeft': { top: '15%', side: 'left' },
    'slot1-topRight': { top: '15%', side: 'right' },
    'slot1-middleLeft': { top: '50%', side: 'left' },
    'slot1-middleRight': { top: '50%', side: 'right' },
    'slot1-bottomLeft': { top: '85%', side: 'left' },
    'slot1-bottomRight': { top: '85%', side: 'right' },
    'slot2-topLeft': { top: '15%', side: 'left' },
    'slot2-topRight': { top: '15%', side: 'right' },
    'slot2-middleLeft': { top: '50%', side: 'left' },
    'slot2-middleRight': { top: '50%', side: 'right' },
    'slot2-bottomLeft': { top: '85%', side: 'left' },
    'slot2-bottomRight': { top: '85%', side: 'right' },
  };
  return positions[position];
};

export const PlayerCardComponent: React.FC<Props> = ({ 
  card, 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  selected, 
  size = 'medium', 
  faceDown = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  disabled = false,
  variant = 'home'
}) => {
  const roleName = getRoleName(card.type);
  const cardBg = getCardBgColor(card.type);

  const cardSize = {
    tiny: { width: '100px', height: '60px' },
    small: { width: '140px', height: '84px' },
    medium: { width: '180px', height: '108px' },
    large: { width: '220px', height: '132px' }
  };

  const halfIconSize = 14;

  return (
    <div 
      className="relative perspective-1000"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        layout
        initial={false}
        animate={{ 
          rotateY: faceDown ? 180 : 0,
          scale: selected ? 1.05 : 1,
          y: selected ? -5 : 0
        }}
        whileHover={!disabled && !faceDown ? { y: -3, scale: 1.02 } : {}}
        className={clsx(
          "relative preserve-3d cursor-pointer transition-shadow rounded-lg",
          selected ? "z-20 shadow-[0_15px_30px_rgba(0,0,0,0.4)]" : "z-10 shadow-lg",
          disabled && "opacity-50 grayscale cursor-not-allowed"
        )}
        style={cardSize[size]}
        onClick={disabled ? undefined : onClick}
        draggable={draggable}
        onDragStart={() => onDragStart?.(card)}
        onDragEnd={() => onDragEnd?.()}
      >
        {/* Front Face - 横版布局 左右各半 */}
        <div 
          className={clsx(
            "absolute inset-0 backface-hidden flex rounded-lg overflow-hidden border-2 border-stone-800",
            cardBg
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 左边一半：球员画像区域 */}
          <div className="relative w-1/2 h-full bg-black/30 border-r border-black/30">
            {card.imageUrl ? (
              <img 
                src={card.imageUrl} 
                alt={card.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-600">
                <span className="text-3xl">👤</span>
              </div>
            )}
            
            {/* 明星卡标识 */}
            {card.isStar && (
              <div className="absolute top-1 left-1">
                <span className="text-yellow-400 text-lg drop-shadow-lg">★</span>
              </div>
            )}

            {/* 攻击力 */}
            <div className="absolute top-1 right-1 w-6 h-6 rounded bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xs font-black text-white">
                {card.isStar ? '★' : card.attack}
              </span>
            </div>

            {/* 左边缘凹进去的半圆图标 */}
            {card.iconPositions?.filter(ip => getHalfIconInfo(ip.position).side === 'left').map((iconPos, index) => {
              const posInfo = getHalfIconInfo(iconPos.position);
              return (
                <div
                  key={`left-indent-${index}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: posInfo.top,
                    left: '0px',
                    width: `${halfIconSize}px`,
                    height: `${halfIconSize}px`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div 
                    className="w-full h-full rounded-r-full flex items-center justify-end pr-0.5"
                    style={{
                      backgroundColor: `${getIconColor(iconPos.type)}55`,
                      boxShadow: `inset -2px 0 4px rgba(0,0,0,0.3)`
                    }}
                  >
                    <span className="text-[8px]">{getIconSymbol(iconPos.type)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 右边一半：信息区域 */}
          <div className="relative w-1/2 h-full flex flex-col justify-center items-center text-white">
            {/* 位置标签 - 最大最醒目 */}
            <div className="text-xl font-black tracking-widest drop-shadow-lg">
              {card.positionLabel}
            </div>
            
            {/* 绰号/角色 */}
            <div className="text-[10px] font-bold text-white/80 mt-0.5 tracking-wide">
              {roleName}
            </div>

            {/* 分隔线 */}
            <div className="w-12 h-0.5 bg-white/30 rounded my-1" />

            {/* 球员名字 */}
            <div className="text-xs font-bold text-center leading-tight">
              {card.name}
            </div>

            {/* 完整图标（球员自带技能）- 底部居中 */}
            {card.completeIcon && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-lg"
                  style={{
                    backgroundColor: `${getIconColor(card.completeIcon)}44`,
                    borderColor: getIconColor(card.completeIcon)
                  }}
                >
                  <span className="text-xs">{getIconSymbol(card.completeIcon)}</span>
                </div>
              </div>
            )}

            {/* 技能效果徽章 */}
            {card.immediateEffect !== 'none' && (
              <div className="absolute bottom-1 right-1">
                <SkillEffectBadge 
                  effect={card.immediateEffect} 
                  size="small"
                  showLabel={false}
                />
              </div>
            )}

            {/* 右边缘凹进去的半圆图标 */}
            {card.iconPositions?.filter(ip => getHalfIconInfo(ip.position).side === 'right').map((iconPos, index) => {
              const posInfo = getHalfIconInfo(iconPos.position);
              return (
                <div
                  key={`right-indent-${index}`}
                  className="absolute flex items-center justify-center"
                  style={{
                    top: posInfo.top,
                    right: '0px',
                    width: `${halfIconSize}px`,
                    height: `${halfIconSize}px`,
                    transform: 'translateY(-50%)',
                  }}
                >
                  <div 
                    className="w-full h-full rounded-l-full flex items-center justify-start pl-0.5"
                    style={{
                      backgroundColor: `${getIconColor(iconPos.type)}55`,
                      boxShadow: `inset 2px 0 4px rgba(0,0,0,0.3)`
                    }}
                  >
                    <span className="text-[8px]">{getIconSymbol(iconPos.type)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 backface-hidden bg-stone-800 flex items-center justify-center overflow-hidden rounded-lg border-2 border-stone-700"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center">
            <span className="text-2xl grayscale opacity-20">⚽</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
