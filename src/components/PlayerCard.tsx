import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { PlayerCard as PlayerCardType, TacticalIcon, IconPosition } from '../data/cards';
import { SkillEffectBadge } from './SkillEffectBadge';

interface Props {
  card: PlayerCardType;
  onClick?: () => void;
  onMouseEnter?: (event?: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  selected?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  faceDown?: boolean;
  draggable?: boolean;
  onDragStart?: (card: PlayerCardType) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
  variant?: 'home' | 'away';
  usedShotIcons?: number[]; // Array of indices of used shot icons
}

const getRoleName = (type: string) => {
  switch (type) {
    case 'forward': return 'FW';
    case 'midfielder': return 'MF';
    case 'defender': return 'DF';
    default: return 'PLAYER';
  }
};

const getCardBgColor = (type: string) => {
  // 统一使用深色渐变背景，确保所有卡片背景一致
  return 'bg-gradient-to-br from-gray-800 to-gray-900';
};

const getIconImage = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '/icons/attack_ball.svg';
    case 'defense': return '/icons/defense_shield.svg';
    case 'pass': return '/cards/skills/icon-pass.png';
    case 'press': return '/icons/press_up.svg';
    case 'breakthrough': return '/cards/skills/icon-shoot.png';
    case 'breakthroughAll': return '/cards/skills/icon-shoot.png';
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

const getThemeColor = (type: string) => {
  switch (type) {
    case 'forward': return '#dc2626'; // red-600
    case 'midfielder': return '#059669'; // emerald-600
    case 'defender': return '#2563eb'; // blue-600
    default: return '#4b5563'; // gray-600
  }
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
  variant = 'home',
  usedShotIcons
}) => {
  const roleName = getRoleName(card.type);
  const cardBg = getCardBgColor(card.type);
  const themeColor = getThemeColor(card.type);

  const cardSize = {
    tiny: { width: '100px', height: '60px' },
    small: { width: '140px', height: '84px' },
    medium: { width: '180px', height: '108px' },
    large: { width: '220px', height: '132px' }
  };

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
    const halfIconDiameter = cardSize[size].height.replace('px', '') as unknown as number / 6;
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
        {/* 背景图片的凹进部分 */}
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
          "relative preserve-3d cursor-pointer transition-shadow rounded-lg overflow-hidden",
          selected ? "z-20 shadow-[0_15px_30px_rgba(0,0,0,0.4)]" : "z-20 shadow-lg",
          disabled && "cursor-not-allowed"
        )}
        style={{
          ...cardSize[size],
          boxSizing: 'border-box',
          minWidth: cardSize[size].width,
          minHeight: cardSize[size].height,
          maxWidth: cardSize[size].width,
          maxHeight: cardSize[size].height
        }}
        onClick={() => {
          console.log('Player card clicked:', card.name, 'ID:', card.id);
          onClick?.();
        }}
        draggable={draggable}
        onDragStart={() => onDragStart?.(card)}
        onDragEnd={() => onDragEnd?.()}
      >
        {/* Front Face - 横版布局 左右各半 */}
        <div 
          className={clsx(
            "absolute inset-0 backface-hidden flex rounded-lg overflow-hidden border-2 border-stone-800"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 左边1/2：背景色区域 */}
          <div className={clsx("relative w-1/2 h-full border-r border-black/30", cardBg)}>
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

          {/* 右边1/2：纯白色信息区域 */}
          <div className="relative w-1/2 h-full bg-white flex flex-col justify-center items-center px-2">
            <div className="flex flex-col items-center justify-center space-y-1">
              {/* 位置标签 - 徽章样式 */}
              <div className="bg-stone-800 px-2 py-0.5 rounded-md shadow-sm mb-1">
                <span className="text-xs font-black tracking-wider leading-none text-white">
                  {card.positionLabel}
                </span>
              </div>
              
              {/* 角色/类型 */}
              <div className="text-xs font-black tracking-widest leading-none" style={textStrokeStyle}>
                {getRoleName(card.type)}
              </div>

              {/* 球员名字 */}
              <div className="text-[9px] font-bold text-center leading-tight truncate w-full px-1" style={textStrokeStyle}>
                {card.realName}
              </div>

              {/* 技能图标区域 - 与文字信息紧凑排列 */}
              <div className="flex items-center justify-center space-x-1 pt-1">
                {/* 完整图标（球员自带技能） */}
                {card.completeIcon && (
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center border-2 shadow-lg"
                    style={{
                      backgroundColor: '#ffffff',
                      borderColor: getIconColor(card.completeIcon)
                    }}
                  >
                    <img src={getIconImage(card.completeIcon)} alt={card.completeIcon} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                  </div>
                )}

                {/* 技能效果徽章 */}
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

          {/* 半圆图标 - 仅在存在图标时绘制 */}
          {card.iconPositions?.map((iconPos, index) => renderHalfIcon(iconPos, index))}
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 backface-hidden bg-stone-800 flex items-center justify-center overflow-hidden rounded-lg border-2 border-stone-700"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <img 
            src="/icons/home_card_back.svg" 
            alt="Card Back (Home)" 
            className="w-full h-full object-cover"
          />
        </div>
      </motion.div>
    </div>
  );
};
