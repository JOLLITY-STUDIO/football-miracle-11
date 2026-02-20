import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { AthleteCard, TacticalIcon, SkillIconType } from '../data/cards';
import { SkillEffectBadge } from './SkillEffectBadge';
import { BaseCard } from './BaseCard';
import { logger } from '../utils/logger';

// Type alias for clarity
type athleteCardType = AthleteCard;

// Icon position type for half icons
type IconPosition = 'slot-topLeft' | 'slot-topRight' | 'slot-middleLeft' | 'slot-middleRight' | 'slot-bottomLeft' | 'slot-bottomRight';

interface Props {
  card: athleteCardType;
  onClick?: () => void;
  onMouseEnter?: (event?: React.MouseEvent) => void;
  onMouseLeave?: () => void;
  selected?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
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
  large: { width: 198, height: 130 },
  xlarge: { width: 297, height: 195 }
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
  return 'bg-transparent';
};

const getIconImage = (icon: SkillIconType): string => {
  switch (icon) {
    case 'attack': return '/icons/icon-shoot.svg';
    case 'defense': return '/icons/icon-defense.svg';
    case 'pass': return '/icons/icon-pass.png';
    case 'press': return '/icons/icon-press.svg';
    case 'breakthrough': return '/icons/icon-shoot.svg';
    case 'breakthroughAll': return '/icons/icon-shoot.svg';
    default: return '/icons/icon-shoot.svg';
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

const AthleteCardComponent: React.FC<Props> = ({ 
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

  // 计算自适应字体大小的函数
  const calculateFontSize = (text: string, maxLength: number, baseSize: number, minSize: number): number => {
    if (!text) return baseSize;
    const ratio = Math.min(1, maxLength / text.length);
    return Math.max(minSize, baseSize * ratio);
  };

  // 计算自适应字体大小
  const nicknameFontSize = calculateFontSize(card.nickname, 10, 0.75, 0.5); // 10字符限制，基础12px，最小8px
  const realNameFontSize = calculateFontSize(card.realName, 15, 0.5625, 0.4375); // 15字符限制，基础9px，最小7px

  // 计算半圆图标大小，用于边距设置
  const cardWidth = SIZE_CONFIG[size || 'medium'].width;
  const halfIconDiameter = cardWidth / 6; // 直径为卡片宽度的1/6
  const iconRadius = halfIconDiameter / 2;

  const renderHalfIcon = (iconPos: { type: TacticalIcon; position: IconPosition }, index: number) => {
    const info = getHalfIconInfo(iconPos.position);
    if (!info) return null;
    
    const iconColor = getIconColor(iconPos.type);
    const iconImage = getIconImage(iconPos.type);
    
    // 使用外部计算的图标半径
    const radius = iconRadius;
    
    // Check if this is a shot icon and if it's been used
    const isShotIcon = iconPos.type === 'attack';
    const isUsed = isShotIcon && (usedShotIcons?.includes(index) || false);
    
    // 调整裁剪路径，使用圆形裁剪确保显示正确的半圆形
    const clipPathStyle = {
      top: `circle(50% at 50% 0%)`, // 显示下半部分（凹进顶部的半圆）
      bottom: `circle(50% at 50% 100%)`, // 显示上半部分（凹进底部的半圆）
      left: `circle(50% at 0% 50%)`, // 显示右半部分（凹进左侧的半圆）
      right: `circle(50% at 100% 50%)` // 显示左半部分（凹进右侧的半圆）
    }[info.edge] || 'circle(50% at 50% 50%)';
    
    // 统一所有图标的容器大小，确保图标图片大小一致
    const containerSize = halfIconDiameter;
    const containerStyle: React.CSSProperties = {
      position: 'absolute',
      width: `${containerSize}px`,
      height: `${containerSize}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 15,
      overflow: 'visible',
      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
      ...(info.edge === 'top' ? { top: 0, left: info.pos, transform: 'translateX(-50%)' } :
          info.edge === 'bottom' ? { bottom: 0, left: info.pos, transform: 'translateX(-50%)' } :
          info.edge === 'left' ? { top: info.pos, left: 0, transform: 'translateY(-50%)' } :
          { top: info.pos, right: 0, transform: 'translateY(-50%)' })
    };

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
        {/* 图标 - 与完整图标保持一致的大小，只显示半圆区域 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            clipPath: clipPathStyle,
            position: 'relative',
            zIndex: 3
          }}
        >
          <img
            src={iconImage}
            alt={iconPos.type}
            style={{ 
              width: `${containerSize}px`, // 使用容器大小，让图标自然居中显示
              height: `${containerSize}px`,
              objectFit: 'contain', 
              filter: isUsed ? 'grayscale(100%)' : 'none',
              // 移动图标以显示正确的半部分
              transform: info.edge === 'top' ? 'translateY(-50%)' : 
                         info.edge === 'bottom' ? 'translateY(50%)' : 
                         info.edge === 'left' ? 'translateX(-50%)' : 
                         info.edge === 'right' ? 'translateX(50%)' : 'none'
            }}
          />
        </div>
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
            disabled && "cursor-not-allowed",
            card.isStar && "border-2 border-yellow-400"
          )}
          style={{
            width: '100%',
            height: '100%',
            boxSizing: 'border-box',
            ...(card.isStar && {
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.6), 0 0 30px rgba(251, 191, 36, 0.3)'
            })
          }}
          onClick={() => {
            logger.debug('Player card clicked:', card.nickname, 'ID:', card.id);
            onClick?.();
          }}
          draggable={draggable}
          onDragStart={() => onDragStart?.(card)}
          onDragEnd={() => onDragEnd?.()}
      >
        {/* Front Face - 横版布局 左右各半 */}
        <div
          className={clsx(
            "absolute inset-0 flex rounded-lg"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* 明星卡标记 - 显示在整张卡的中间 */}
          {card.isStar && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
              <span className="text-yellow-400 text-4xl drop-shadow-lg">⭐</span>
            </div>
          )}
          
          {/* 明星卡闪卡效果装饰层 */}
          {card.isStar && (
            <div className="absolute inset-0 z-30 pointer-events-none">
              {/* 主闪烁效果 - 线性对角线渐变 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent animate-shimmer"></div>
              {/* 辅助光晕效果 */}
              <div className="absolute inset-0 bg-gradient-radial from-yellow-400/10 via-transparent to-transparent animate-pulse"></div>
              {/* 金色边框 */}
              <div className="absolute inset-0 border-2 border-yellow-400/70 rounded-lg"></div>
            </div>
          )}
          {/* 左边1/2：透明背景 + 位置颜色叠加 */}
          <div className={clsx("relative w-1/2 h-full border-r border-black/30 rounded-l-lg", cardBg)}>
            {card.imageUrl ? (
              <img 
                src={card.imageUrl} 
                alt={card.nickname}
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
            )}
            
            {/* 位置颜色叠加层 - 已移除，保持红色背景纯净 */}

            {/* 移除攻击力显示，因为游戏规则中没有 power 概念 */}
          </div>

          {/* 右边1/2：信息区域 */}
          <div 
            className="relative w-1/2 h-full bg-white/90 backdrop-blur-sm flex flex-col justify-center items-center rounded-r-lg"
            style={{ padding: `${iconRadius}px` }} // 使用半圆图标半径作为边距
          >
            <div className="flex flex-col items-center justify-center space-y-1 w-full">
              {/* 位置标签 - 徽章样式 */}
              <div className="bg-stone-800 px-2 py-0.5 rounded-md shadow-sm mb-1">
                <span className="text-xs font-black tracking-wider leading-none text-white">
                  {card.positionLabel}
                </span>
              </div>
              
              {/* 绰号 */}
              <div className="font-black tracking-widest leading-none whitespace-nowrap overflow-hidden text-ellipsis" style={{ 
                ...textStrokeStyle, 
                maxWidth: '100%',
                fontSize: `${nicknameFontSize}rem`
              }}>
                {card.nickname}
              </div>

              {/* 球员名字 */}
              <div 
                className="font-bold text-center leading-tight truncate px-1" 
                style={{ 
                  ...textStrokeStyle, 
                  maxWidth: `calc(100% - ${iconRadius}px)`,
                  fontSize: `${realNameFontSize}rem`
                }}
              >
                {card.realName}
              </div>

              {/* 技能图标区域- 与文字信息紧凑排列*/}
              <div className="flex items-center justify-center space-x-1 pt-1">
                {/* 技能图标*/}
                {card.skills?.map((skill, index) => (
                  <React.Fragment key={`skill-${index}`}>
                    {/* 技能图标*/}
                    <div className="w-5 h-5 flex items-center justify-center">
                      <img
                        src={getIconImage(skill.type)}
                        alt={skill.description || skill.type}
                        className="w-full h-full object-contain"
                        style={{
                          filter: 'none'
                        }}
                      />
                    </div>
                    {/* 技能效果徽章 - 只有带闪电效果的技能才显示*/}
                    {skill.hasLightning && skill.effect && skill.effect !== 'none' && (
                      <div className="w-5 h-5 flex items-center justify-center">
                        <div className="relative">
                          <SkillEffectBadge 
                            effect={skill.effect} 
                            size="small"
                            showLabel={false}
                          />
                          {/* 闪电效果 - 模拟速攻技能的视觉效果 */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-full h-full rounded-full bg-yellow-400/30 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* 半圆图标 - 仅在存在图标时绘制*/}
          {(() => {
            // 从tactics转换为图标位置
            const iconPositions: { type: TacticalIcon; position: IconPosition }[] = [];
            if (card.tactics?.left) {
              if (card.tactics.left.left) {
                iconPositions.push({ type: card.tactics.left.left, position: 'slot-middleLeft' });
              }
              if (card.tactics.left.top) {
                iconPositions.push({ type: card.tactics.left.top, position: 'slot-topLeft' });
              }
              if (card.tactics.left.down) {
                iconPositions.push({ type: card.tactics.left.down, position: 'slot-bottomLeft' });
              }
            }
            if (card.tactics?.right) {
              if (card.tactics.right.top) {
                iconPositions.push({ type: card.tactics.right.top, position: 'slot-topRight' });
              }
              if (card.tactics.right.down) {
                iconPositions.push({ type: card.tactics.right.down, position: 'slot-bottomRight' });
              }
              if (card.tactics.right.right) {
                iconPositions.push({ type: card.tactics.right.right, position: 'slot-middleRight' });
              }
            }
            return iconPositions.map((iconPos, index) => renderHalfIcon(iconPos, index));
          })()}
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 overflow-hidden rounded-lg border-2 border-stone-700"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {/* 统一卡牌背面设计 */}
          <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
            {/* 球服图标 */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-32 h-32 flex items-center justify-center">
                {card.isStar && (
                  <span className="text-6xl" style={{ color: '#fbbf24' }}>👕</span>
                )}
                {!card.isStar && variant === 'home' && (
                  <span className="text-6xl" style={{ color: '#FFFFFF' }}>👕</span>
                )}
                {!card.isStar && variant === 'away' && (
                  <span className="text-6xl" style={{ color: '#000000' }}>👕</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      </BaseCard>
    </div>
  );
};

export { AthleteCardComponent };
export { AthleteCardComponent as AthleteCard };



