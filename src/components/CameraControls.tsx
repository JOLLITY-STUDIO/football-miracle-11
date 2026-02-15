import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  pitch: number;
  onToggleView: () => void;
  onRotationChange: (rotation: number) => void;
  rotation: number;
}

export const CameraControls: React.FC<Props> = ({ pitch, onToggleView, onRotationChange, rotation }) => {
  return (
    <div className="absolute top-24 right-6 flex flex-col gap-3 z-50">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onToggleView}
        className="w-12 h-12 bg-stone-800/80 backdrop-blur-md border-2 border-white/20 rounded-full flex items-center justify-center shadow-lg text-xl"
        title="Change Camera View"
      >
        {pitch === 0 ? '📽️' : pitch === 45 ? '🎥' : '🎬'}
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onRotationChange(rotation === 0 ? 180 : 0)}
        className="w-12 h-12 bg-stone-800/80 backdrop-blur-md border-2 border-white/20 rounded-full flex items-center justify-center shadow-lg text-xl"
        title="Rotate Board"
      >
        🔄
      </motion.button>
    </div>
  );
};

