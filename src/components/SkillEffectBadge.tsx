import React from 'react';
import { motion } from 'framer-motion';
import type { ImmediateEffectType } from '../data/cards';

interface Props {
  effect: ImmediateEffectType;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const getEffectInfo = (effect: ImmediateEffectType) => {
  switch (effect) {
    case 'move_control_1':
      return {
        icon: '🎯',
        label: '控制+1',
        description: '移动1张卡牌',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.2)'
      };
    case 'move_control_2':
      return {
        icon: '🎯',
        label: '控制+2',
        description: '移动2张卡牌',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.3)'
      };
    case 'draw_synergy_1':
      return {
        icon: '✨',
        label: '抽卡+1',
        description: '抽1张协同卡',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.2)'
      };
    case 'draw_synergy_2_choose_1':
      return {
        icon: '🎴',
        label: '二选一',
        description: '抽2张选1张',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.3)'
      };
    case 'steal_synergy':
      return {
        icon: '🗡️',
        label: '窃取',
        description: '偷取对手协同卡',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.2)'
      };
    case 'instant_shot':
      return {
        icon: '⚡',
        label: '射门',
        description: '立即射门',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.3)'
      };
    case 'none':
    default:
      return null;
  }
};

export const SkillEffectBadge: React.FC<Props> = ({
  effect,
  size = 'medium',
  showLabel = true
}) => {
  const info = getEffectInfo(effect);
  
  if (!info) return null;

  const sizeClasses = {
    small: { container: 'w-7 h-7', icon: 'text-xs', label: 'text-[8px]' },
    medium: { container: 'w-8 h-8', icon: 'text-sm', label: 'text-[10px]' },
    large: { container: 'w-10 h-10', icon: 'text-base', label: 'text-xs' }
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-0.5"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500 }}
      whileHover={{ scale: 1.1 }}
    >
      <div
        className={clsx(
          "rounded-full flex items-center justify-center border-2 shadow-lg",
          sizeClasses[size].container
        )}
        style={{
          backgroundColor: '#ffffff', // 统一为纯白底色
          borderColor: info.color
        }}
        title={info.description}
      >
        <span className={sizeClasses[size].icon}>{info.icon}</span>
      </div>
      {showLabel && (
        <span
          className={clsx("font-bold leading-none", sizeClasses[size].label)}
          style={{ color: info.color }}
        >
          {info.label}
        </span>
      )}
    </motion.div>
  );
};

import clsx from 'clsx';

export default SkillEffectBadge;
