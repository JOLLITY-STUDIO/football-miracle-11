import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../utils/audio';

interface Props {
  text: string;
  subtitle?: string;
  show: boolean;
  onComplete?: () => void;
  durationMs?: number;
  soundType?: 'whistle' | 'whistle_long' | 'cheer' | 'snap' | 'ding' | 'none';
}

const PhaseBanner: React.FC<Props> = ({ 
  text, 
  subtitle, 
  show, 
  onComplete, 
  durationMs = 2000,
  soundType = 'snap'
}) => {
  useEffect(() => {
    // 横幅显示时播放音效
    if (show && soundType && soundType !== 'none') {
      playSound(soundType);
    }
  }, [show, soundType]);

  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, durationMs);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete, durationMs]);

  return (
    <AnimatePresence mode="wait">
      {show && (
        <div key="phase-banner" className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="w-full py-12 relative overflow-hidden flex flex-col items-center justify-center"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/95 to-transparent transform skew-x-[-20deg]" />
            
            {/* Content */}
            <div className="relative flex flex-col items-center justify-center gap-2">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="text-6xl font-['Russo_One'] text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 tracking-wider filter drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]"
              >
                {text}
              </motion.div>
              
              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-yellow-400 font-bold tracking-wide text-center max-w-2xl"
                >
                  {subtitle}
                </motion.div>
              )}
            </div>
            
            {/* Decor Lines */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhaseBanner;

