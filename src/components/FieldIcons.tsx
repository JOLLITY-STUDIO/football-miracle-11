import React from 'react';
import { FIELD_CONFIG } from '../config/fieldDimensions';
import type { FieldZone } from '../types/game';

const { ROWS, COLS, BASE_CELL_WIDTH, BASE_CELL_HEIGHT } = FIELD_CONFIG;
const CELL_WIDTH = BASE_CELL_WIDTH;
const CELL_HEIGHT = BASE_CELL_HEIGHT;

interface FieldIconsProps {
  isRotated?: boolean;
  playerField?: FieldZone[];
  aiField?: FieldZone[];
}

const getIconDisplay = (type: 'attack' | 'defense' | 'pass' | 'speed') => {
  switch (type) {
    case 'attack':
      return {
        image: '/images/icons/attack.svg',
        color: 'text-red-500'
      };
    case 'defense':
      return {
        image: '/images/icons/shield.svg',
        color: 'text-blue-500'
      };
    case 'pass':
      return {
        image: '/images/icons/target.svg',
        color: 'text-green-500'
      };
    case 'speed':
      return {
        image: '/images/icons/speed.svg',
        color: 'text-yellow-500'
      };
    default:
      return {
        image: '/images/icons/speed.svg',
        color: 'text-gray-500'
      };
  }
};

const FieldIcons: React.FC<FieldIconsProps> = ({ isRotated = false, playerField = [], aiField = [] }) => {
  const hasPlayerAtPosition = (zone: number, slot: number, isPlayer: boolean): boolean => {
    const field = isPlayer ? playerField : aiField;
    const targetZone = field.find(z => z.zone === zone);
    if (!targetZone) return false;
    const slotData = targetZone.slots.find(s => s.position === slot);
    return slotData?.playerCard !== undefined;
  };

  const getIconOpacity = (zone: number, slot: number, isPlayer: boolean): number => {
    if (hasPlayerAtPosition(zone, slot, isPlayer)) {
      return 1.0;
    }
    return 0.1;
  };

  const getIconFilter = (zone: number, slot: number, isPlayer: boolean, baseColor: string): string => {
    if (hasPlayerAtPosition(zone, slot, isPlayer)) {
      return `drop-shadow(0 0 12px ${baseColor}) drop-shadow(0 0 24px ${baseColor})`;
    }
    return `drop-shadow(0 0 4px rgba(255,255,255,0.3))`;
  };

  const getIconSize = (zone: number, slot: number, isPlayer: boolean): number => {
    if (hasPlayerAtPosition(zone, slot, isPlayer)) {
      return 48;
    }
    return 32;
  };

  const getIconTransform = (zone: number, slot: number, isPlayer: boolean): string => {
    if (hasPlayerAtPosition(zone, slot, isPlayer)) {
      return 'translateY(-8px)';
    }
    return 'translateY(0)';
  };

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    >
      {/* AI半场图标 (zones 0-3) */}
      {Array.from({ length: ROWS / 2 }).map((_, row) => {
        const actualRow = isRotated ? 3 - row : row;
        
        return Array.from({ length: COLS }).map((_, colIdx) => {
          const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
          const y = actualRow * CELL_HEIGHT + CELL_HEIGHT / 2;
          
          // AI进攻图标 (top row, zones 0) - 第一行除了第一列和最后一列
          if (actualRow === 0 && colIdx > 0 && colIdx < 7) {
            const iconSize = getIconSize(0, colIdx, false);
            const iconTransform = getIconTransform(0, colIdx, false);
            return (
              <g key={`ai-attack-${actualRow}-${colIdx}`}>
                <foreignObject
                  x={x - 20}
                  y={y - 20}
                  width={40}
                  height={40}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: getIconOpacity(0, colIdx, false),
                      transform: iconTransform,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img
                      src={getIconDisplay('attack').image}
                      alt="AI Attack"
                      style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        objectFit: 'contain',
                        filter: getIconFilter(0, colIdx, false, 'rgba(255,0,0,0.8)'),
                        opacity: 0.7,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          }
          
          // AI防守图标 (bottom of AI half, zones 3) - 最后一行除了第一列和最后一列
          if (actualRow === 3 && colIdx > 0 && colIdx < 7) {
            const iconSize = getIconSize(3, colIdx, false);
            const iconTransform = getIconTransform(3, colIdx, false);
            return (
              <g key={`ai-defense-${actualRow}-${colIdx}`}>
                <foreignObject
                  x={x - 20}
                  y={y - 20}
                  width={40}
                  height={40}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: getIconOpacity(3, colIdx, false),
                      transform: iconTransform,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img
                      src={getIconDisplay('defense').image}
                      alt="AI Defense"
                      style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        objectFit: 'contain',
                        filter: getIconFilter(3, colIdx, false, 'rgba(0,119,255,0.8)'),
                        opacity: 0.7,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          }
          
          return null;
        });
      })}
      
      {/* 玩家半场图标 (zones 4-7) */}
      {Array.from({ length: ROWS / 2 }).map((_, row) => {
        const actualRow = isRotated ? 7 - (row + 4) : row + 4;
        
        return Array.from({ length: COLS }).map((_, colIdx) => {
          const x = colIdx * CELL_WIDTH + CELL_WIDTH / 2;
          const y = actualRow * CELL_HEIGHT + CELL_HEIGHT / 2;
          
          // 玩家进攻图标 (top of player half, zones 4) - 第一行除了第一列和最后一列
          if (actualRow === 4 && colIdx > 0 && colIdx < 7) {
            const iconSize = getIconSize(4, colIdx, true);
            const iconTransform = getIconTransform(4, colIdx, true);
            return (
              <g key={`player-attack-${actualRow}-${colIdx}`}>
                <foreignObject
                  x={x - 20}
                  y={y - 20}
                  width={40}
                  height={40}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: getIconOpacity(4, colIdx, true),
                      transform: iconTransform,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img
                      src={getIconDisplay('attack').image}
                      alt="Player Attack"
                      style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        objectFit: 'contain',
                        filter: getIconFilter(4, colIdx, true, 'rgba(0,255,0,0.8)'),
                        opacity: 0.7,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          }
          
          // 玩家防守图标 (bottom of player half, zones 7) - 最后一行除了第一列和最后一列
          if (actualRow === 7 && colIdx > 0 && colIdx < 7) {
            const iconSize = getIconSize(7, colIdx, true);
            const iconTransform = getIconTransform(7, colIdx, true);
            return (
              <g key={`player-defense-${actualRow}-${colIdx}`}>
                <foreignObject
                  x={x - 20}
                  y={y - 20}
                  width={40}
                  height={40}
                >
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: getIconOpacity(7, colIdx, true),
                      transform: iconTransform,
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <img
                      src={getIconDisplay('defense').image}
                      alt="Player Defense"
                      style={{
                        width: `${iconSize}px`,
                        height: `${iconSize}px`,
                        objectFit: 'contain',
                        filter: getIconFilter(7, colIdx, true, 'rgba(100,149,237,0.8)'),
                        opacity: 0.7,
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </div>
                </foreignObject>
              </g>
            );
          }
          
          return null;
        });
      })}
      

    </svg>
  );
};

export default FieldIcons;