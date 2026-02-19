import React from 'react';
import { FIELD_CONFIG } from '../config/fieldDimensions';
import type { FieldZone } from '../types/game';
import { TacticalIconMatcher } from '../game/tacticalIconMatcher';
import type { TacticalIcon } from '../data/cards';

const { COLS, BASE_CELL_WIDTH, BASE_CELL_HEIGHT } = FIELD_CONFIG;
const CELL_WIDTH = BASE_CELL_WIDTH;
const CELL_HEIGHT = BASE_CELL_HEIGHT;

interface FieldIconsProps {
  playerField?: FieldZone[];
  aiField?: FieldZone[];
  isRotated?: boolean;
  activePositions?: { zone: number; position: number }[]; // 激活的位置数组
  onCompleteIconsCalculated?: (passCount: number, pressCount: number) => void;
}

// Calculate complete tactical icons based on player field
const calculateCompleteIcons = (field: FieldZone[]): { passCount: number; pressCount: number } => {
  let passCount = 0;
  let pressCount = 0;
  
  // Logic to detect complete tactical formations
  // This checks for semicircular icon combinations that form complete icons
  field.forEach((zone, zoneIndex) => {
    zone.slots.forEach((slot, slotIndex) => {
      if (slot.athleteCard) {
        const card = slot.athleteCard;
        
        // Check for pass icons with proper semicircular combinations
        if (card.icons.includes('pass')) {
          // Check adjacent slots for complementary semicircular pass icons
          const adjacentSlots = getAdjacentSlots(field, zoneIndex, slotIndex);
          
          // Check if any adjacent card has pass icons in complementary slots
          const hasComplementaryPass = adjacentSlots.some((adjSlot, adjIndex) => {
            if (!adjSlot || !adjSlot.athleteCard) return false;
            
            // Check if adjacent card has pass icons
            if (!adjSlot.athleteCard.icons.includes('pass')) return false;
            
            // For simplicity, we'll consider any adjacent pass icon as forming a complete icon
            // In a more detailed implementation, we would check specific slot positions
            return true;
          });
          
          if (hasComplementaryPass) {
            passCount++;
          }
        }
        
        // Check for press icons with proper semicircular combinations
        if (card.icons.includes('press')) {
          // Check adjacent slots for complementary semicircular press icons
          const adjacentSlots = getAdjacentSlots(field, zoneIndex, slotIndex);
          
          // Check if any adjacent card has press icons in complementary slots
          const hasComplementaryPress = adjacentSlots.some((adjSlot, adjIndex) => {
            if (!adjSlot || !adjSlot.athleteCard) return false;
            
            // Check if adjacent card has press icons
            if (!adjSlot.athleteCard.icons.includes('press')) return false;
            
            // For simplicity, we'll consider any adjacent press icon as forming a complete icon
            // In a more detailed implementation, we would check specific slot positions
            return true;
          });
          
          if (hasComplementaryPress) {
            pressCount++;
          }
        }
      }
    });
  });
  
  return { passCount, pressCount };
};

// Get adjacent slots for a given zone and slot index
const getAdjacentSlots = (field: FieldZone[], zoneIndex: number, slotIndex: number) => {
  const adjacent = [];
  
  // Check same zone, adjacent slots
  if (slotIndex > 0 && field[zoneIndex]) {
    adjacent.push(field[zoneIndex].slots[slotIndex - 1]);
  }
  if (field[zoneIndex] && slotIndex < field[zoneIndex].slots.length - 1) {
    adjacent.push(field[zoneIndex].slots[slotIndex + 1]);
  }
  
  // Check adjacent zones, same slot
  if (zoneIndex > 0 && field[zoneIndex - 1]) {
    adjacent.push(field[zoneIndex - 1]!.slots[slotIndex]);
  }
  if (zoneIndex < field.length - 1 && field[zoneIndex + 1]) {
    adjacent.push(field[zoneIndex + 1]!.slots[slotIndex]);
  }
  
  return adjacent;
};

// 检查位置是否被激活
const isPositionActive = (zone: number, position: number, isPlayer: boolean, activePositions?: { zone: number; position: number }[]): boolean => {
  if (!activePositions || activePositions.length === 0) return false;
  return activePositions.some(pos => pos.zone === zone && pos.position === position);
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
        zIndex: activeStyle.zIndex
      })
    )
  };
};

const FieldIcons: React.FC<FieldIconsProps> = ({ 
  playerField = [], 
  aiField = [], 
  isRotated = false,
  activePositions = [],
  onCompleteIconsCalculated
}) => {
  // Calculate complete icons when component renders
  React.useEffect(() => {
    if (onCompleteIconsCalculated && playerField.length > 0) {
      const matcher = new TacticalIconMatcher(playerField);
      const iconCounts = matcher.getIconCounts();
      onCompleteIconsCalculated(iconCounts.pass, iconCounts.press);
    }
  }, [playerField, onCompleteIconsCalculated]);

  // Calculate complete icons for display
  const getAllCompleteIcons = (playerField: FieldZone[], aiField: FieldZone[]): Array<{ type: TacticalIcon; centerX: number; centerY: number }> => {
    // Combine both fields to analyze all cards
    const allFields = [...playerField, ...aiField];
    if (allFields.length === 0) return [];
    
    const matcher = new TacticalIconMatcher(allFields);
    return matcher.getCompleteIcons().map(icon => ({
      type: icon.type,
      centerX: icon.centerX,
      centerY: icon.centerY
    }));
  };

  // Get complete icons for both fields
  const allCompleteIcons = getAllCompleteIcons(playerField, aiField);

  // Determine which zones belong to which field
  const playerZones = playerField.map(z => z.zone);
  const aiZones = aiField.map(z => z.zone);
  const isPlayerTopHalf = playerZones.some(z => z < 4);
  
  // Debug: log zone information
  console.log('🎯 FieldIcons Zone Info:', {
    playerZones,
    aiZones,
    isPlayerTopHalf,
    playerFieldLength: playerField.length,
    aiFieldLength: aiField.length
  });

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 100 }}
    >
      {/* AI半场图标 */}
      {/* AI defense icons (top row) - 半圆激活区域 */}
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
                  src="/icons/icon-defense.svg"
                  alt="AI Defense"
                  style={{
                    width: getActiveIconStyle(0, colIdx, false, activePositions).width,
                    height: getActiveIconStyle(0, colIdx, false, activePositions).height,
                    objectFit: 'contain',
                    filter: getActiveIconStyle(0, colIdx, false, activePositions).filter,
                    opacity: getActiveIconStyle(0, colIdx, false, activePositions).opacity,
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </foreignObject>
          </g>
        );
      })}
      
      {/* AI attack icons (bottom of AI half) - 半圆激活区域 */}
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
                  src="/icons/icon-shoot.svg"
                  alt="AI Attack"
                  style={{
                    width: getActiveIconStyle(3, colIdx, false, activePositions).width,
                    height: getActiveIconStyle(3, colIdx, false, activePositions).height,
                    objectFit: 'contain',
                    filter: getActiveIconStyle(3, colIdx, false, activePositions).filter,
                    opacity: getActiveIconStyle(3, colIdx, false, activePositions).opacity,
                    transform: 'rotate(180deg)',
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </foreignObject>
          </g>
        );
      })}
      
      {/* 玩家半场图标 */}
      {/* Player attack icons (top of player half) - 半圆激活区域 */}
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
                  src="/icons/icon-shoot.svg"
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
      
      {/* Initial field defense icons (always visible) */}
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
                  src="/icons/icon-defense.svg"
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