import React from 'react';
import type { FieldZone } from '../types/game';
import type { TacticalIcon } from '../data/cards';
import { getIconDisplay } from '../data/cards';

interface Connection {
  fromZone: number;
  fromSlot: number;
  toZone: number;
  toSlot: number;
  iconType: TacticalIcon;
  fromPosition: string;
  toPosition: string;
}

interface Props {
  playerField: FieldZone[];
  aiField: FieldZone[];
  gridRef: React.RefObject<HTMLDivElement>;
  isAi?: boolean;
}

// 位置映射:半圆图标的匹配关系
const MATCHING_POSITIONS: Record<string, string> = {
  'slot1-topLeft': 'slot2-topRight',
  'slot1-topRight': 'slot2-topLeft',
  'slot1-middleLeft': 'slot2-middleRight',
  'slot1-middleRight': 'slot2-middleLeft',
  'slot1-bottomLeft': 'slot2-bottomRight',
  'slot1-bottomRight': 'slot2-bottomLeft',
  'slot2-topLeft': 'slot1-topRight',
  'slot2-topRight': 'slot1-topLeft',
  'slot2-middleLeft': 'slot1-middleRight',
  'slot2-middleRight': 'slot1-middleLeft',
  'slot2-bottomLeft': 'slot1-bottomRight',
  'slot2-bottomRight': 'slot1-bottomLeft',
};

// 检查两个slot是否相邻 (同zone相邻slot或跨zone对应slot)
function areAdjacent(zone1: number, slot1: number, zone2: number, slot2: number): boolean {
  if (zone1 === zone2) {
    return Math.abs(slot1 - slot2) === 1;
  }
  if (Math.abs(zone1 - zone2) === 1) {
    return slot1 === slot2 || slot1 === slot2 + 1 || slot1 + 1 === slot2;
  }
  return false;
}

// 计算战术连接
function calculateConnections(field: FieldZone[]): Connection[] {
  const connections: Connection[] = [];
  const processed = new Set<string>();

  for (const zone of field) {
    for (const slot of zone.slots) {
      if (!slot.athleteCard) continue;

      const card = slot.athleteCard;
      
      // 遍历当前卡牌的所有图标位置
      for (const iconWithPos of card.iconPositions) {
        const matchingPos = MATCHING_POSITIONS[iconWithPos.position];
        if (!matchingPos) continue;

        // 检查相邻的所有slot
        for (const adjacentZone of field) {
          for (const adjacentSlot of adjacentZone.slots) {
            if (!adjacentSlot.athleteCard) continue;
            if (zone.zone === adjacentZone.zone && slot.position === adjacentSlot.position) continue;

            // 检查是否真的相邻
            if (!areAdjacent(zone.zone, slot.position, adjacentZone.zone, adjacentSlot.position)) {
              continue;
            }

            // 生成唯一key避免重复
            const pairKey = [
              `${zone.zone}-${slot.position}`,
              `${adjacentZone.zone}-${adjacentSlot.position}`,
              iconWithPos.type
            ].sort().join('|');

            if (processed.has(pairKey)) continue;

            // 检查是否有匹配的图标
            const hasMatch = adjacentSlot.athleteCard.iconPositions.some(
              (pos: { position: string; type: string }) => pos.position === matchingPos && pos.type === iconWithPos.type
            );

            if (hasMatch) {
              connections.push({
                fromZone: zone.zone,
                fromSlot: slot.position,
                toZone: adjacentZone.zone,
                toSlot: adjacentSlot.position,
                iconType: iconWithPos.type,
                fromPosition: iconWithPos.position,
                toPosition: matchingPos,
              });
              processed.add(pairKey);
            }
          }
        }
      }
    }
  }

  return connections;
}

// 计算卡牌在网格中的中心坐标(每个slot中心)
function getSlotCenter(zone: number, slot: number): { x: number; y: number } {
  const row = zone - 1; // zone 1-4 -> row 0-3
  const col = (slot - 1) * 2 + 1; // slot 1-4 -> col 1,3,5,7 (中心)
  
  return {
    x: (col / 8) * 100, // 转换为百分比
    y: (row / 4) * 100 + 12.5, // +12.5% 居中于行
  };
}

export const TacticalConnections: React.FC<Props> = ({ playerField, aiField, gridRef, isAi = false }) => {
  const field = isAi ? aiField : playerField;
  const connections = calculateConnections(field);

  if (connections.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[5]"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* 发光滤镜 */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* 动画虚线 */}
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0.8"/>
          <stop offset="50%" stopColor="white" stopOpacity="1"/>
          <stop offset="100%" stopColor="white" stopOpacity="0.8"/>
        </linearGradient>
      </defs>

      {connections.map((conn, idx) => {
        const from = getSlotCenter(conn.fromZone, conn.fromSlot);
        const to = getSlotCenter(conn.toZone, conn.toSlot);
        const iconDisplay = getIconDisplay(conn.iconType);

        // 计算控制点实现曲线
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const curve = Math.min(dist * 0.2, 15); // 弧度

        // 垂直方向的偏移让线条弯曲
        const offsetX = -dy / dist * curve;
        const offsetY = dx / dist * curve;
        const ctrlX = midX + offsetX;
        const ctrlY = midY + offsetY;

        const pathData = `M ${from.x} ${from.y} Q ${ctrlX} ${ctrlY} ${to.x} ${to.y}`;

        return (
          <g key={`${idx}-${conn.fromZone}-${conn.fromSlot}-${conn.toZone}-${conn.toSlot}`}>
            {/* 背景阴影线 */}
            <path
              d={pathData}
              stroke="black"
              strokeWidth="4"
              fill="none"
              opacity="0.5"
            />
            
            {/* 主连接线 */}
            <path
              data-testid="tactical-connection"
              d={pathData}
              stroke={iconDisplay.color}
              strokeWidth="2.5"
              fill="none"
              filter="url(#glow)"
              opacity="0.9"
              strokeDasharray="4 2"
            >
              {/* 虚线动画 */}
              <animate
                attributeName="stroke-dashoffset"
                from="0"
                to="6"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>

            {/* 中点图标 */}
            <g transform={`translate(${ctrlX}, ${ctrlY})`}>
              <circle
                r="8"
                fill={iconDisplay.color}
                opacity="0.9"
                filter="url(#glow)"
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize="10"
                fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {iconDisplay.symbol}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
};