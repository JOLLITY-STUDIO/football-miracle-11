import React from 'react';
import { motion } from 'framer-motion';
import { TacticalIconMatcher } from '../game/tacticalIconMatcher';
import type { FieldZone } from '../types/game';
import type { TacticalIcon } from '../data/cards';
import { FIELD_CONFIG } from '../config/fieldConfig';
import { FIELD_CONFIG as FIELD_DIMENSIONS } from '../config/fieldDimensions';

interface CompleteIconsOverlayProps {
  playerField: FieldZone[];
  aiField?: FieldZone[];
  onIconCountsCalculated?: (counts: Record<TacticalIcon, number>) => void;
  onIconClick?: (icon: any) => void;
}

/**
 * 完整图标覆盖层组件
 * 显示由相邻卡片半圆图标拼合而成的完整图标
 */
export const CompleteIconsOverlay: React.FC<CompleteIconsOverlayProps> = ({
  playerField,
  aiField = [],
  onIconCountsCalculated,
  onIconClick
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
      const playerCounts = playerMatcher.getPlayerIconCounts();
      onIconCountsCalculated(playerCounts);
    }
  }, [playerMatcher, onIconCountsCalculated]);

  /**
   * 获取图标的SVG路径或图片
   */
  const getIconImage = (type: TacticalIcon): string => {
    switch (type) {
      case 'attack':
        return '/icons/icon-shoot.svg';
      case 'defense':
        return '/icons/icon-defense.svg';
      case 'pass':
        return '/icons/icon-pass.png';
      case 'press':
        return '/icons/icon-press.svg';
      default:
        return '/icons/icon-shoot.svg';
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
   * 计算AI半场完整图标的变换后坐标
   */
  const calculateAICoordinates = (x: number, y: number) => {
    // 场地宽度
    const fieldWidth = FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    
    // AI半场的球员是水平翻转显示的，所以图标位置也需要水平翻转
    // 这样图标才能显示在对应的球员位置旁边
    const mirroredX = fieldWidth - x;
    // 垂直位置保持不变
    const adjustedY = y;
    
    return { x: mirroredX, y: adjustedY };
  };

  /**
   * 将场地坐标转换为SVG坐标系坐标
   */
  const convertToSVGCoordinates = (x: number, y: number) => {
    // 场地宽度
    const fieldWidth = FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH;
    // 场地高度
    const fieldHeight = FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT;
    
    // SVG坐标系以场地中心为原点
    // 转换为相对于中心的坐标
    const svgX = x - fieldWidth / 2;
    const svgY = y - fieldHeight / 2;
    
    return { x: svgX, y: svgY };
  };

  /**
   * 渲染单个完整图标
   */
  const renderCompleteIcon = (icon: any, index: number, isPlayer: boolean) => {
    const iconColor = getIconColor(icon.type);
    const iconImage = getIconImage(icon.type);

    // 计算最终坐标
    let finalX = icon.centerX;
    let finalY = icon.centerY;
    let transform = '';

    if (!isPlayer) {
      // 为AI图标应用变换
      const aiCoords = calculateAICoordinates(icon.centerX, icon.centerY);
      finalX = aiCoords.x;
      finalY = aiCoords.y;
      // 应用180度旋转
      transform = `rotate(180 ${finalX} ${finalY})`;
    }

    // 转换坐标到SVG坐标系
    const svgCoords = convertToSVGCoordinates(finalX, finalY);
    finalX = svgCoords.x;
    finalY = svgCoords.y;

    // 生成更唯一的键，基于图标位置和类型
    const uniqueKey = `${isPlayer ? 'player' : 'ai'}-${icon.type}-${Math.round(finalX)}-${Math.round(finalY)}`;

    // 处理图标点击
    const handleIconClick = () => {
      if (icon.type === 'attack' && onIconClick) {
        onIconClick(icon);
      }
    };

    return (
      <motion.g
        key={uniqueKey}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          delay: index * 0.1,
          type: "spring",
          stiffness: 300,
          damping: 20
        }}
        onClick={handleIconClick}
        style={{
          cursor: icon.type === 'attack' ? 'pointer' : 'default'
        }}
      >
        {/* 发光效果 */}
        <circle
          cx={finalX}
          cy={finalY}
          r="35"
          fill={iconColor}
          opacity="0.3"
          filter="blur(8px)"
        />
        
        {/* 主图标背景 */}
        <circle
          cx={finalX}
          cy={finalY}
          r="25"
          fill="rgba(255, 255, 255, 0.9)"
          stroke={iconColor}
          strokeWidth="3"
        />
        
        {/* 图标图片 */}
        <image
          x={finalX - 20}
          y={finalY - 20}
          width="40"
          height="40"
          href={iconImage}
          transform={transform}
          style={{
            filter: `drop-shadow(0 2px 4px rgba(0,0,0,0.3))`
          }}
        />

        {/* 脉冲动画 */}
        <motion.circle
          cx={finalX}
          cy={finalY}
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
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1000 }}
      viewBox={`-${FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH / 2} -${FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT / 2} ${FIELD_CONFIG.columns * FIELD_DIMENSIONS.BASE_CELL_WIDTH} ${FIELD_CONFIG.rowsPerHalf * 2 * FIELD_DIMENSIONS.BASE_CELL_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      {/* 渲染玩家的完整图标 */}
      {playerCompleteIcons.map((icon, index) => {
        console.log('Player icon position:', { x: icon.centerX, y: icon.centerY, type: icon.type });
        return renderCompleteIcon(icon, index, true);
      })}
      
      {/* 渲染AI的完整图标 */}
      {aiCompleteIcons.map((icon, index) => {
        console.log('AI icon position:', { x: icon.centerX, y: icon.centerY, type: icon.type });
        return renderCompleteIcon(icon, index, false);
      })}
    </svg>
  );
};
