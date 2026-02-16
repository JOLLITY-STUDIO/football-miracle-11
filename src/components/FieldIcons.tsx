import React from 'react';
import { FIELD_CONFIG } from '../config/fieldDimensions';
import type { FieldZone } from '../types/game';

const { COLS, BASE_CELL_WIDTH, BASE_CELL_HEIGHT } = FIELD_CONFIG;
const CELL_WIDTH = BASE_CELL_WIDTH;
const CELL_HEIGHT = BASE_CELL_HEIGHT;

interface FieldIconsProps {
  playerField?: FieldZone[];
  aiField?: FieldZone[];
  isRotated?: boolean;
  activePositions?: { zone: number; position: number }[]; // 激活的位置数组
}

// 检查位置是否被激活
const isPositionActive = (zone: number, position: number, isPlayer: boolean, activePositions?: { zone: number; position: number }[]): boolean => {
  if (!activePositions || activePositions.length === 0) return false;
  return activePositions.some(pos => pos.zone === zone && pos.position === position && pos.zone >= 4 === isPlayer);
};

// 获取激活图标的样式
const getActiveIconStyle = (zone: number, position: number, isPlayer: boolean, activePositions?: { zone: number; position: number }[]) => {
  const isActive = isPositionActive(zone, position, isPlayer, activePositions);
  
  // 基础样式
  const baseStyle = {
    width: '40px',
    height: '40px',
    opacity: 0.7,
    filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))',
    transform: isPlayer ? 'translateY(0)' : 'rotate(180deg)',
    zIndex: 1,
  };
  
  // 激活样式
  if (isActive) {
    return {
      width: '56px',
      height: '56px',
      opacity: 1.0,
      filter: `drop-shadow(0 0 12px rgba(255,255,255,0.9)) drop-shadow(0 0 20px rgba(255,255,255,0.9))`,
      transform: isPlayer ? 'translateY(-12px)' : 'rotate(180deg) translateY(-12px)',
      zIndex: 20,
    };
  }
  
  return baseStyle;
};

// 创建图标元素的样式
const createIconStyle = (zone: number, position: number, isPlayer: boolean, activePositions?: { zone: number; position: number }[]) => {
  const activeStyle = getActiveIconStyle(zone, position, isPlayer, activePositions);
  
  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    ...Object.fromEntries(
      Object.entries({
        width: activeStyle.width,
        height: activeStyle.height,
        opacity: activeStyle.opacity,
        filter: activeStyle.filter,
        transform: activeStyle.transform,
        zIndex: activeStyle.zIndex
      })
    )
  };
};

const FieldIcons: React.FC<FieldIconsProps> = ({ 
  playerField = [], 
  aiField = [], 
  isRotated = false,
  activePositions = []
}) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {/* AI半场图标 (zones 0-3) */}
      {/* AI defense icons (top row, zones 0) - 半圆激活区域 */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        // 创建半圆激活区域 - 从左到右
        const isInActiveZone = (colIdx > 0 && colIdx < 7);
        const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
        const y = 0 * CELL_HEIGHT + CELL_HEIGHT / 2;
        
        if (!isInActiveZone) return null;
        
        return (
          <g key={`ai-defense-0-${colIdx}`}>
            <foreignObject
              x={x - 28}
              y={y - 28}
              width={56}
              height={56}
            >
              <div style={createIconStyle(0, colIdx, false, activePositions)}>
                <img
                  src="/icons/defense_shield.svg"
                  alt="AI Defense"
                  style={{
                    width: getActiveIconStyle(0, colIdx, false, activePositions).width,
                    height: getActiveIconStyle(0, colIdx, false, activePositions).height,
                    objectFit: 'contain',
                    filter: getActiveIconStyle(0, colIdx, false, activePositions).filter,
                    opacity: getActiveIconStyle(0, colIdx, false, activePositions).opacity,
                    transform: getActiveIconStyle(0, colIdx, false, activePositions).transform,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </foreignObject>
          </g>
        );
      })}
      
      {/* AI attack icons (bottom of AI half, zones 3) - 半圆激活区域 */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        // 创建半圆激活区域 - 从左到右
        const isInActiveZone = (colIdx > 0 && colIdx < 7);
        const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
        const y = 3 * CELL_HEIGHT + CELL_HEIGHT / 2;
        
        if (!isInActiveZone) return null;
        
        return (
          <g key={`ai-attack-3-${colIdx}`}>
            <foreignObject
              x={x - 28}
              y={y - 28}
              width={56}
              height={56}
            >
              <div style={createIconStyle(3, colIdx, false, activePositions)}>
                <img
                  src="/icons/attack_ball.svg"
                  alt="AI Attack"
                  style={{
                    width: getActiveIconStyle(3, colIdx, false, activePositions).width,
                    height: getActiveIconStyle(3, colIdx, false, activePositions).height,
                    objectFit: 'contain',
                    filter: getActiveIconStyle(3, colIdx, false, activePositions).filter,
                    opacity: getActiveIconStyle(3, colIdx, false, activePositions).opacity,
                    transform: getActiveIconStyle(3, colIdx, false, activePositions).transform,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </foreignObject>
          </g>
        );
      })}
      
      {/* 玩家半场图标 (zones 4-7) */}
      {/* Player attack icons (top of player half, zones 4) - 半圆激活区域 */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        // 创建半圆激活区域 - 从左到右
        const isInActiveZone = (colIdx > 0 && colIdx < 7);
        const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
        const y = 4 * CELL_HEIGHT + CELL_HEIGHT / 2;
        
        if (!isInActiveZone) return null;
        
        return (
          <g key={`player-attack-4-${colIdx}`}>
            <foreignObject
              x={x - 28}
              y={y - 28}
              width={56}
              height={56}
            >
              <div style={createIconStyle(4, colIdx, true, activePositions)}>
                <img
                  src="/icons/attack_ball.svg"
                  alt="Player Attack"
                  style={{
                    width: getActiveIconStyle(4, colIdx, true, activePositions).width,
                    height: getActiveIconStyle(4, colIdx, true, activePositions).height,
                    objectFit: 'contain',
                    filter: getActiveIconStyle(4, colIdx, true, activePositions).filter,
                    opacity: getActiveIconStyle(4, colIdx, true, activePositions).opacity,
                    transform: getActiveIconStyle(4, colIdx, true, activePositions).transform,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </foreignObject>
          </g>
        );
      })}
      
      {/* Player defense icons (bottom of player half, zones 7) - 半圆激活区域 */}
      {Array.from({ length: COLS }).map((_, colIdx) => {
        // 创建半圆激活区域 - 从左到右
        const isInActiveZone = (colIdx > 0 && colIdx < 7);
        const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
        const y = 7 * CELL_HEIGHT + CELL_HEIGHT / 2;
        
        if (!isInActiveZone) return null;
        
        return (
          <g key={`player-defense-7-${colIdx}`}>
            <foreignObject
              x={x - 28}
              y={y - 28}
              width={56}
              height={56}
            >
              <div style={createIconStyle(7, colIdx, true, activePositions)}>
                <img
                  src="/icons/defense_shield.svg"
                  alt="Player Defense"
                  style={{
                    width: getActiveIconStyle(7, colIdx, true, activePositions).width,
                    height: getActiveIconStyle(7, colIdx, true, activePositions).height,
                    objectFit: 'contain',
                    filter: getActiveIconStyle(7, colIdx, true, activePositions).filter,
                    opacity: getActiveIconStyle(7, colIdx, true, activePositions).opacity,
                    transform: getActiveIconStyle(7, colIdx, true, activePositions).transform,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </foreignObject>
          </g>
        );
      })}

    </svg>
  );
};

export default FieldIcons;