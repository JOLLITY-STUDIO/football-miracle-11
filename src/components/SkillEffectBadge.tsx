import React from 'react';
import { motion } from 'framer-motion';
import type { SkillEffectType } from '../data/cards';
import clsx from 'clsx';

interface Props {
  effect: SkillEffectType;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const getEffectInfo = (effect: SkillEffectType) => {
  switch (effect) {
    case 'move_control_1':
      return {
        icon: '🎯',
        label: '控制+1',
        description: '移动1张卡片',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.2)'
      };
    case 'move_control_2':
      return {
        icon: '🎯',
        label: '控制+2',
        description: '移动2张卡片',
        color: '#8b5cf6',
        bgColor: 'rgba(139, 92, 246, 0.3)'
      };
    case 'draw_synergy_1':
      return {
        icon: '🎴',
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
    case 'draw_synergy_plus_1':
      return {
        icon: '🎴',
        label: '抽卡+1',
        description: '抽1张协同卡',
        color: '#f59e0b',
        bgColor: 'rgba(245, 158, 11, 0.2)'
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
        icon: '⚽',
        label: '射门',
        description: '立即射门',
        color: '#ef4444',
        bgColor: 'rgba(239, 68, 68, 0.3)'
      };
    case 'ignore_defense':
      return {
        icon: '💨',
        label: '突破',
        description: '无视防守进行攻击',
        color: '#9333ea',
        bgColor: 'rgba(147, 51, 234, 0.2)'
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
      {/* Glow Effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: info.color,
          filter: 'blur(10px)',
          pointerEvents: 'none'
        }}
      />
      
      <div
        className={clsx(
          "rounded-full flex items-center justify-center border-2 shadow-lg",
          sizeClasses[size].container
        )}
        style={{
          backgroundColor: '#ffffff',
          borderColor: info.color,
          boxShadow: `0 0 15px ${info.color}40`,
          position: 'relative',
          overflow: 'hidden'
        }}
        title={info.description}
      >
        {/* Sparkle Effect */}
        <motion.div
          animate={{
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), transparent 50%)`,
            pointerEvents: 'none'
          }}
        />
        
        <motion.span 
          className={sizeClasses[size].icon}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {info.icon}
        </motion.span>
      </div>
      
      {showLabel && (
        <motion.span
          className={clsx("font-bold leading-none", sizeClasses[size].label)}
          style={{ color: info.color }}
          animate={{
            y: [0, -2, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {info.label}
        </motion.span>
      )}
    </motion.div>
  );
};

export default SkillEffectBadge;

