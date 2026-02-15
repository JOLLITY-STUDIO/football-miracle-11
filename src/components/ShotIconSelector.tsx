import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface ShotIcon {
  index: number;
  type: 'attack' | 'defense' | 'press' | 'synergy';
  isUsed: boolean;
  isSelected: boolean;
  isAvailable: boolean;
}

interface ShotIconSelectorProps {
  icons: ShotIcon[];
  onIconSelect: (index: number) => void;
  isPlayerTurn: boolean;
  isAIThinking?: boolean;
}

export const ShotIconSelector: React.FC<ShotIconSelectorProps> = ({
  icons,
  onIconSelect,
  isPlayerTurn,
  isAIThinking = false
}) => {
  const attackIcons = icons.filter(icon => icon.type === 'attack');

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-black/80 rounded-2xl border border-white/20 backdrop-blur-xl">
      <div className="text-center">
        <div className="text-white font-black text-sm uppercase tracking-wider mb-1">
          {isPlayerTurn ? 'Select Shot Icon' : 'AI Selecting Shot Icon'}
        </div>
        <div className="text-white/60 text-xs">
          Choose an attack icon to activate
        </div>
      </div>

      <div className="flex gap-3">
        {attackIcons.map((icon) => (
          <motion.button
            key={icon.index}
            whileHover={!icon.isUsed && !isAIThinking ? { scale: 1.1 } : {}}
            whileTap={!icon.isUsed && !isAIThinking ? { scale: 0.95 } : {}}
            onClick={() => !icon.isUsed && !isAIThinking && onIconSelect(icon.index)}
            className={clsx(
              "relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 border-2",
              icon.isUsed 
                ? "bg-gray-900 border-gray-600 cursor-not-allowed opacity-50" 
                : icon.isSelected
                ? "bg-blue-500 border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                : "bg-white border-white/30 hover:bg-blue-100 hover:border-blue-400"
            )}
            disabled={icon.isUsed || isAIThinking}
          >
            {/* Icon Content */}
            <div className={clsx(
              "text-2xl",
              icon.isUsed ? "text-gray-500" : "text-blue-600"
            )}>
              �?            </div>

            {/* Used Indicator */}
            {icon.isUsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-8 h-8 bg-black/80 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </motion.div>
            )}

            {/* Selection Indicator */}
            {icon.isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white"
              >
                <span className="text-white text-xs font-bold">✓</span>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* AI Thinking Indicator */}
      {isAIThinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-yellow-400 text-xs"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full"
          />
          <span>AI is thinking...</span>
        </motion.div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-xs text-white/60">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white rounded border border-white/30"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded border border-blue-300"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-900 rounded border border-gray-600"></div>
          <span>Used</span>
        </div>
      </div>
    </div>
  );
};

export default ShotIconSelector;
