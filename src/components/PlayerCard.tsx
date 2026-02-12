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
    case 'attack': return '⚽';
    case 'defense': return '🛡️';
    case 'pass': return '👟';
    case 'press': return '⚡';
    case 'breakthrough': return '💨';
    case 'breakthroughAll': return '💥';
  }
};

const getIconColor = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '#22c55e';
    case 'defense': return '#3b82f6';
    case 'pass': return '#f59e0b';
    case 'press': return '#ef4444';
    case 'breakthrough': return '#8b5cf6';
    case 'breakthroughAll': return '#ec4899';
  }
};

const getHalfIconInfo = (position: IconPosition): { edge: 'top' | 'bottom' | 'left' | 'right'; pos: string } => {
  const positions: Record<IconPosition, { edge: 'top' | 'bottom' | 'left' | 'right'; pos: string }> = {
    'slot1-topLeft': { edge: 'top', pos: '25%' },
    'slot1-topRight': { edge: 'top', pos: '75%' },
    'slot1-middleLeft': { edge: 'left', pos: '50%' },
    'slot1-middleRight': { edge: 'right', pos: '50%' },
    'slot1-bottomLeft': { edge: 'bottom', pos: '25%' },
    'slot1-bottomRight': { edge: 'bottom', pos: '75%' },
    'slot2-topLeft': { edge: 'top', pos: '25%' },
    'slot2-topRight': { edge: 'top', pos: '75%' },
    'slot2-middleLeft': { edge: 'left', pos: '50%' },
    'slot2-middleRight': { edge: 'right', pos: '50%' },
    'slot2-bottomLeft': { edge: 'bottom', pos: '25%' },
    'slot2-bottomRight': { edge: 'bottom', pos: '75%' },
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

  const halfIconSize = 24;

  const renderHalfIcon = (iconPos: { type: TacticalIcon; position: IconPosition }, index: number) => {
    const info = getHalfIconInfo(iconPos.position);
    const iconColor = getIconColor(iconPos.type);
    const iconSymbol = getIconSymbol(iconPos.type);
    const radius = halfIconSize / 2;
    
    let containerStyle: React.CSSProperties = {};
    let iconStyle: React.CSSProperties = {};
    
    if (info.edge === 'top') {
      containerStyle = {
        top: '0px',
        left: info.pos,
        width: `${halfIconSize}px`,
        height: `${radius}px`,
        transform: 'translateX(-50%)',
        borderRadius: `0 0 ${radius}px ${radius}px`,
        backgroundColor: `${iconColor}66`,
        boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)`
      };
      iconStyle = {
        fontSize: '12px',
        transform: 'translateY(1px)'
      };
    } else if (info.edge === 'bottom') {
      containerStyle = {
        bottom: '0px',
        left: info.pos,
        width: `${halfIconSize}px`,
        height: `${radius}px`,
        transform: 'translateX(-50%)',
        borderRadius: `${radius}px ${radius}px 0 0`,
        backgroundColor: `${iconColor}66`,
        boxShadow: `inset 0 2px 4px rgba(0,0,0,0.4), 0 -1px 2px rgba(0,0,0,0.3)`
      };
      iconStyle = {
        fontSize: '12px',
        transform: 'translateY(-1px)'
      };
    } else if (info.edge === 'left') {
      containerStyle = {
        top: info.pos,
        left: '0px',
        width: `${radius}px`,
        height: `${halfIconSize}px`,
        transform: 'translateY(-50%)',
        borderRadius: `0 ${radius}px ${radius}px 0`,
        backgroundColor: `${iconColor}66`,
        boxShadow: `inset -2px 0 4px rgba(0,0,0,0.4), 1px 0 2px rgba(0,0,0,0.3)`
      };
      iconStyle = {
        fontSize: '12px',
        transform: 'translateX(1px)'
      };
    } else {
      containerStyle = {
        top: info.pos,
        right: '0px',
        width: `${radius}px`,
        height: `${halfIconSize}px`,
        transform: 'translateY(-50%)',
        borderRadius: `${radius}px 0 0 ${radius}px`,
        backgroundColor: `${iconColor}66`,
        boxShadow: `inset 2px 0 4px rgba(0,0,0,0.4), -1px 0 2px rgba(0,0,0,0.3)`
      };
      iconStyle = {
        fontSize: '12px',
        transform: 'translateX(-1px)'
      };
    }

    return (
      <div
        key={`half-${index}`}
        className="absolute flex items-center justify-center z-10"
        style={containerStyle}
      >
        <span style={iconStyle}>{iconSymbol}</span>
      </div>
    );
  };

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
          disabled && "cursor-not-allowed"
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
          </div>

          {/* 半圆图标 - 分布在四边（凹进去的效果） */}
          {card.iconPositions?.map((iconPos, index) => renderHalfIcon(iconPos, index))}
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
