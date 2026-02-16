import React from 'react';
import { motion } from 'framer-motion';
import { TacticalIconMatcher } from '../game/tacticalIconMatcher';
import type { FieldZone } from '../types/game';
import type { TacticalIcon } from '../data/cards';

interface CompleteIconsOverlayProps {
  playerField: FieldZone[];
  aiField?: FieldZone[];
  onIconCountsCalculated?: (counts: Record<TacticalIcon, number>) => void;
}

/**
 * 完整图标覆盖层组件
 * 显示由相邻卡片半圆图标拼合而成的完整图标
 */
export const CompleteIconsOverlay: React.FC<CompleteIconsOverlayProps> = ({
  playerField,
  aiField = [],
  onIconCountsCalculated
}) => {
  // 分析玩家场地的完整图标
  const playerMatcher = React.useMemo(() => {
    return new TacticalIconMatcher(playerField);
  }, [playerField]);

  // 分析AI场地的完整图标
  const aiMatcher = React.useMemo(() => {
    return new TacticalIconMatcher(aiField);
  }, [aiField]);

  // 获取所有完整图标
  const playerCompleteIcons = playerMatcher.getCompleteIcons();
  const aiCompleteIcons = aiMatcher.getCompleteIcons();

  // 计算图标数量并通知父组件
  React.useEffect(() => {
    if (onIconCountsCalculated) {
      const playerCounts = playerMatcher.getIconCounts();
      onIconCountsCalculated(playerCounts);
    }
  }, [playerMatcher, onIconCountsCalculated]);

  /**
   * 获取图标的SVG路径或图片
   */
  const getIconImage = (type: TacticalIcon): string => {
    switch (type) {
      case 'attack':
        return '/icons/attack_ball.svg';
      case 'defense':
        return '/icons/defense_shield.svg';
      case 'pass':
        return '/cards/skills/icon-pass.png';
      case 'press':
        return '/icons/press_up.svg';
      default:
        return '/icons/attack_ball.svg';
    }
  };

  /**
   * 获取图标的颜色
   */
  const getIconColor = (type: TacticalIcon): string => {
    switch (type) {
      case 'attack':
        return '#ef4444'; // 红色
      case 'defense':
        return '#3b82f6'; // 蓝色
      case 'pass':
        return '#10b981'; // 绿色
      case 'press':
        return '#f59e0b'; // 橙色
      default:
        return '#6b7280'; // 灰色
    }
  };

  /**
   * 渲染单个完整图标
   */
  const renderCompleteIcon = (icon: any, index: number, isPlayer: boolean) => {
    const iconColor = getIconColor(icon.type);
    const iconImage = getIconImage(icon.type);

    return (
      <motion.g
        key={`${isPlayer ? 'player' : 'ai'}-complete-${icon.type}-${index}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: index * 0.1,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
      >
        {/* 发光效果 */}
        <circle
          cx={icon.centerX}
          cy={icon.centerY}
          r="35"
          fill={iconColor}
          opacity="0.3"
          filter="blur(8px)"
        />
        
        {/* 主图标背景 */}
        <circle
          cx={icon.centerX}
          cy={icon.centerY}
          r="25"
          fill="rgba(255, 255, 255, 0.9)"
          stroke={iconColor}
          strokeWidth="3"
        />
        
        {/* 图标图片 */}
        <foreignObject
          x={icon.centerX - 20}
          y={icon.centerY - 20}
          width="40"
          height="40"
        >
          <img
            src={iconImage}
            alt={`Complete ${icon.type} icon`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`
            }}
          />
        </foreignObject>

        {/* 脉冲动画 */}
        <motion.circle
          cx={icon.centerX}
          cy={icon.centerY}
          r="25"
          fill="none"
          stroke={iconColor}
          strokeWidth="2"
          opacity="0.6"
          animate={{
            r: [25, 35, 25],
            opacity: [0.6, 0.2, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.g>
    );
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1000 }}
    >
      {/* 渲染玩家的完整图标 */}
      {playerCompleteIcons.map((icon, index) => 
        renderCompleteIcon(icon, index, true)
      )}
      
      {/* 渲染AI的完整图标 */}
      {aiCompleteIcons.map((icon, index) => 
        renderCompleteIcon(icon, index, false)
      )}
    </svg>
  );
};