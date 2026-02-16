import React from 'react';
import { motion } from 'framer-motion';

interface TacticalIconDisplayProps {
  attackCount: number;
  defenseCount: number;
  passCount: number;
  pressCount: number;
  isPlayer: boolean;
  compact?: boolean;
}

export const TacticalIconDisplay: React.FC<TacticalIconDisplayProps> = ({
  attackCount,
  defenseCount,
  passCount,
  pressCount,
  isPlayer,
  compact = false,
}) => {
  const icons = [
    { type: 'attack', count: attackCount, icon: '⚔️', color: '#ef4444', label: 'Attack' },
    { type: 'defense', count: defenseCount, icon: '🛡️', color: '#3b82f6', label: 'Defense' },
    { type: 'pass', count: passCount, icon: '📤', color: '#10b981', label: 'Pass' },
    { type: 'press', count: pressCount, icon: '👊', color: '#f59e0b', label: 'Press' }
  ];

  if (compact) {
    return (
      <div className="flex gap-2">
        {icons.map(icon => (
          icon.count > 0 && (
            <div 
              key={icon.type}
              className="flex items-center gap-1 bg-black/30 rounded px-2 py-1"
            >
              <span className="text-sm">{icon.icon}</span>
              <span className="text-xs font-bold text-white">{icon.count}</span>
            </div>
          )
        ))}
      </div>
    );
  }

  return (
    <div className={`
      grid grid-cols-2 gap-3 p-4 
      bg-gradient-to-br from-stone-900/90 to-stone-800/90
      rounded-xl border-2 border-white/10
      ${isPlayer ? 'shadow-blue-500/20' : 'shadow-red-500/20'} shadow-lg
    `}>
      {icons.map(icon => (
        <motion.div
          key={icon.type}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative"
        >
          <div 
            className="
              flex flex-col items-center justify-center
              bg-gradient-to-br from-stone-800 to-stone-900
              rounded-lg p-3 border border-white/5
              hover:border-white/20 transition-all
            "
            style={{
              boxShadow: `0 0 20px ${icon.color}40`
            }}
          >
            {/* Icon */}
            <div className="text-3xl mb-1">{icon.icon}</div>
            
            {/* Count */}
            <motion.div 
              key={icon.count}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-2xl font-black text-white"
            >
              {icon.count}
            </motion.div>
            
            {/* Label */}
            <div className="text-[8px] font-bold text-white/40 uppercase tracking-wider mt-1">
              {icon.label}
            </div>
          </div>
          
          {/* Glow effect when count > 0 */}
          {icon.count > 0 && (
            <motion.div
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-lg"
              style={{
                background: `radial-gradient(circle, ${icon.color}40 0%, transparent 70%)`,
                pointerEvents: 'none'
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};
