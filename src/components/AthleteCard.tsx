import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { AthleteCard, TacticalIcon, IconPosition } from '../data/cards';
import { SkillEffectBadge } from './SkillEffectBadge';
import { BaseCard } from './BaseCard';
import { logger } from '../utils/logger';

// Type alias for clarity
type athleteCardType = AthleteCard;

interface Props {
  card: athleteCardType;
  onClick?: () => void;
  onMouseEnter?: (event?: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  selected?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  faceDown?: boolean;
  draggable?: boolean;
  onDragStart?: (card: athleteCardType) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
  variant?: 'home' | 'away';
  usedShotIcons?: number[]; // Array of indices of used shot icons
}

// Size config matching BaseCard
const SIZE_CONFIG = {
  tiny: { width: 99, height: 65 },
  small: { width: 132, height: 86 },
  medium: { width: 165, height: 108 },
  large: { width: 198, height: 130 }
};

const getRoleName = (type: string) => {
  switch (type) {
    case 'forward': return 'FW';
    case 'midfielder': return 'MF';
    case 'defender': return 'DF';
    default: return 'PLAYER';
  }
};

const getCardBgColor = (type: string): string => {
  return 'bg-gradient-to-br from-gray-800 to-gray-900';
};

const getIconImage = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '/icons/attack_ball.svg';
    case 'defense': return '/icons/defense_shield.svg';
    case 'pass': return '/cards/skills/icon-pass.png';
    case 'press': return '/icons/press_up.svg';
    default: return '/icons/attack_ball.svg';
  }
};

const getIconColor = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '#22c55e';
    case 'defense': return '#3b82f6';
    case 'pass': return '#f59e0b';
    case 'press': return '#ef4444';
    default: return '#22c55e';
  }
};

const getHalfIconInfo = (position: IconPosition): { edge: 'top' | 'bottom' | 'left' | 'right'; pos: string } | null => {
  const positions: Record<IconPosition, { edge: 'top' | 'bottom' | 'left' | 'right'; pos: string }> = {
    'slot-topLeft': { edge: 'top', pos: '25%' },
    'slot-topRight': { edge: 'top', pos: '75%' },
    'slot-middleLeft': { edge: 'left', pos: '50%' },
    'slot-middleRight': { edge: 'right', pos: '50%' },
    'slot-bottomLeft': { edge: 'bottom', pos: '25%' },
    'slot-bottomRight': { edge: 'bottom', pos: '75%' },
  };
  return positions[position] || null;
};

const getThemeColor = (type: string) => {
  switch (type) {
    case 'forward': return '#dc2626'; // red-600
    case 'midfielder': return '#059669'; // emerald-600
    case 'defender': return '#2563eb'; // blue-600
    default: return '#4b5563'; // gray-600
  }
};

export const AthleteCardComponent: React.FC<Props> = ({ 
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
  variant = 'home',
  usedShotIcons
}) => {
  const roleName = getRoleName(card.type);
  const cardBg = getCardBgColor(card.type);
  const themeColor = getThemeColor(card.type);

  const textStrokeStyle: React.CSSProperties = {
    color: themeColor,
    WebkitTextStroke: '0.5px white',
    textShadow: '0 0 1px white',
    fontFamily: '"Russo One", sans-serif',
    fontWeight: '900',
    letterSpacing: '0.05em'
  };

  const renderHalfIcon = (iconPos: { type: TacticalIcon; position: IconPosition }, index: number) => {
    const info = getHalfIconInfo(iconPos.position);
    if (!info) return null;
    
    const iconColor = getIconColor(iconPos.type);
    const iconImage = getIconImage(iconPos.type);
    // 半圆直径为卡片高度的1/6
    const cardHeight = SIZE_CONFIG[size || 'medium'].height;
    const halfIconDiameter = cardHeight / 6;
    const radius = halfIconDiameter / 2;
    
    // Check if this is a shot icon and if it's been used
    const isShotIcon = iconPos.type === 'attack';
    const isUsed = isShotIcon && (usedShotIcons?.includes(index) || false);
    
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      width: info.edge === 'top' || info.edge === 'bottom' ? `${halfIconDiameter}px` : `${radius}px`,
      height: info.edge === 'top' || info.edge === 'bottom' ? `${radius}px` : `${halfIconDiameter}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      overflow: 'hidden',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
      transform: info.edge === 'top' || info.edge === 'bottom' ? 'translateX(-50%)' : 'translateY(-50%)',
      ...(info.edge === 'top' ? { top: 0, left: info.pos } :
          info.edge === 'bottom' ? { bottom: 0, left: info.pos } :
          info.edge === 'left' ? { top: info.pos, left: 0 } :
          { top: info.pos, right: 0 })
    };

    const clipPathStyle = {
      top: `polygon(0 0, 100% 0, 100% ${radius}px, 50% ${radius}px, 0 ${radius}px)`,
      bottom: `polygon(0 ${radius}px, 50% ${radius}px, 100% ${radius}px, 100% 100%, 0 100%)`,
      left: `polygon(0 0, ${radius}px 50%, 0 100%)`,
      right: `polygon(${radius}px 0, ${radius}px 100%, 100% 50%)`
    }[info.edge];

    return (
      <div
        key={`half-${iconPos.position}-${index}`}
        style={containerStyle}
      >
        {/* 背景图片的凹进部�?*/}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: card.imageUrl ? `url(${card.imageUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            clipPath: clipPathStyle,
            zIndex: 1
          }}
        />
        {/* 半透明遮罩 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            clipPath: clipPathStyle,
            zIndex: 2
          }}
        />
        {/* 图标 */}
        <img
          src={iconImage}
          alt={iconPos.type}
          style={{ 
            width: `${radius * 1.2}px`, 
            height: `${radius * 1.2}px`, 
            objectFit: 'contain', 
            position: 'relative', 
            zIndex: 3,
            filter: isUsed ? 'grayscale(100%)' : 'none'
          }}
        />
      </div>
    );
  };

  return (
    <div
      className="relative perspective-1000"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <BaseCard size={size} className="perspective-1000">
        <motion.div
          layout
          initial={false}
          animate={{
            rotateY: faceDown ? 180 : 0,
            rotate: 0,
            scale: selected ? 1.05 : 1,
            y: selected ? -5 : 0
          }}
          whileHover={{}}
          className={clsx(
            "relative preserve-3d cursor-pointer transition-shadow overflow-hidden rounded-lg",
            selected ? "z-20 shadow-[0_15px_30px_rgba(0,0,0,0.4)]" : "z-20 shadow-lg",
            disabled && "cursor-not-allowed"
          )}
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box'
          }}
          onClick={() => {
            logger.debug('Player card clicked:', card.name, 'ID:', card.id);
            onClick?.();
          }}
          draggable={draggable}
          onDragStart={() => onDragStart?.(card)}
          onDragEnd={() => onDragEnd?.()}
      >
        {/* Front Face - 横版布局 左右各半 */}
        <div
          className={clsx(
            "absolute inset-0 backface-hidden flex overflow-hidden rounded-lg"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 左边1/2：背景色区域 */}
          <div className={clsx("relative w-1/2 h-full border-r border-black/30 rounded-l-lg", cardBg)}>
            {card.imageUrl ? (
              <img 
                src={card.imageUrl} 
                alt={card.name}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
            )}
            
            {/* 明星卡标记*/}
            {card.isStar && (
              <div className="absolute top-1 left-1">
                <span className="text-yellow-400 text-lg drop-shadow-lg">⭐</span>
              </div>
            )}

            {/* 攻击力*/}
            <div className="absolute top-1 right-1 w-6 h-6 rounded bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span className="text-xs font-black text-white">
                {card.isStar ? '⭐' : ''}
              </span>
            </div>
          </div>

          {/* 右边1/2：纯白色信息区域 */}
          <div className="relative w-1/2 h-full bg-white flex flex-col justify-center items-center px-2 rounded-r-lg">
            <div className="flex flex-col items-center justify-center space-y-1">
              {/* 位置标签 - 徽章样式 */}
              <div className="bg-stone-800 px-2 py-0.5 rounded-md shadow-sm mb-1">
                <span className="text-xs font-black tracking-wider leading-none text-white">
                  {card.positionLabel}
                </span>
              </div>
              
              {/* 角色/类型 */}
              <div className="text-xs font-black tracking-widest leading-none" style={textStrokeStyle}>
                {card.name}
              </div>

              {/* 球员名字 */}
              <div className="text-[9px] font-bold text-center leading-tight truncate w-full px-1" style={textStrokeStyle}>
                {card.realName}
              </div>

              {/* 技能图标区�?- 与文字信息紧凑排�?*/}
              <div className="flex items-center justify-center space-x-1 pt-1">
                {/* 技能效果徽�?*/}
                {card.immediateEffect !== 'none' && (
                  <div className="w-5 h-5 flex items-center justify-center">
                    <SkillEffectBadge 
                      effect={card.immediateEffect} 
                      size="small"
                      showLabel={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 半圆图标 - 仅在存在图标时绘�?*/}
          {card.iconPositions?.map((iconPos, index) => renderHalfIcon(iconPos, index))}
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 backface-hidden overflow-hidden rounded-lg border-2 border-stone-700"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
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
                    strokeWidth="6"
                  />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-20 h-20 rounded-full border-4 border-yellow-400/30 flex items-center justify-center bg-black/30">
                <img src="/icons/synergy_plus_ring.svg" alt="Card Back" className="w-14 h-14 opacity-90" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      </BaseCard>
    </div>
  );
};



