import React from 'react';
import { motion } from 'framer-motion';
import type { TacticalIcon, SkillIconType } from '../data/cards';

interface Props {
  icons: SkillIconType[];
  size?: number;
  showConnectionLines?: boolean;
}

const getIconEmoji = (icon: SkillIconType): string => {
  switch (icon) {
    case 'attack': return '⚔️';
    case 'defense': return '🛡️';
    case 'pass': return '👟';
    case 'press': return '⬆️';
    case 'breakthrough': return '💨';
    case 'breakthroughAll': return '💥';
  }
};

const getIconColor = (icon: SkillIconType): string => {
  switch (icon) {
    case 'attack': return '#ef4444';
    case 'defense': return '#3b82f6';
    case 'pass': return '#22c55e';
    case 'press': return '#f97316';
    case 'breakthrough': return '#a855f7';
    case 'breakthroughAll': return '#ec4899';
  }
};

const getIconBgColor = (icon: SkillIconType): string => {
  return '#ffffff'; // 统一为纯白底色
};

export const HemisphereIcons: React.FC<Props> = ({
  icons,
  size = 60,
  showConnectionLines = true
}) => {
  const iconSize = size * 0.28;
  const radius = size * 0.55;
  
  const calculatePosition = (index: number, total: number) => {
    const startAngle = -160;
    const endAngle = -20;
    const angleRange = endAngle - startAngle;
    const angle = startAngle + (angleRange / (total > 1 ? total - 1 : 1)) * index;
    const radian = (angle * Math.PI) / 180;
    
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius
    };
  };

  const getConnectionPath = (fromIdx: number, toIdx: number): string => {
    const from = calculatePosition(fromIdx, icons.length);
    const to = calculatePosition(toIdx, icons.length);
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - 5;
    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
  };

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size * 0.6 }}
    >
      {/* 半球背景 */}
      <svg
        className="absolute"
        style={{ width: size, height: size * 0.8 }}
        viewBox={`${-size/2} ${-size*0.1} ${size} ${size*0.8}`}
      >
        {/* 连接�?*/}
        {showConnectionLines && icons.length > 1 && (
          <g>
            {icons.map((icon, idx) => {
              if (idx === icons.length - 1) return null;
              const nextIcon = icons[idx + 1];
              const sameType = icon === nextIcon;
              if (!sameType) return null;
              
              return (
                <motion.path
                  key={`line-${idx}`}
                  d={getConnectionPath(idx, idx + 1)}
                  stroke={getIconColor(icon)}
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.6 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* 图标 */}
      {icons.map((icon, idx) => {
        const pos = calculatePosition(idx, icons.length);
        
        return (
          <motion.div
            key={`${icon}-${idx}`}
            className="absolute flex items-center justify-center rounded-full shadow-lg border-2"
            style={{
              width: iconSize,
              height: iconSize,
              backgroundColor: getIconBgColor(icon),
              borderColor: getIconColor(icon),
              left: '50%',
              top: '50%',
              transform: `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: idx * 0.1,
              type: "spring",
              stiffness: 300
            }}
            whileHover={{ scale: 1.2 }}
            title={icon}
          >
            <span style={{ fontSize: iconSize * 0.5 }}>{getIconEmoji(icon)}</span>
          </motion.div>
        );
      })}
    </div>
  );
};

export default HemisphereIcons;

