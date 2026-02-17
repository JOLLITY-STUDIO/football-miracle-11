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
            initial={{ x: '-100%', opacity: 0, skewX: 20 }}
            animate={{ x: '0%', opacity: 1, skewX: 0 }}
            exit={{ x: '100%', opacity: 0, skewX: -20 }}
            transition={{ 
              type: 'spring', 
              stiffness: 100, 
              damping: 20,
              duration: 0.8
            }}
            className="w-full py-12 relative overflow-hidden flex flex-col items-center justify-center"
          >
            {/* Background Gradient */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/95 to-transparent transform skew-x-[-20deg]"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Sparkle Particles */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                initial={{ 
                  opacity: 0, 
                  scale: 0,
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`
                }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`
                }}
                exit={{ 
                  opacity: 0,
                  scale: 0
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 rounded-full bg-white"
                style={{ 
                  boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                  zIndex: 1
                }}
              />
            ))}
            
            {/* Content */}
            <div className="relative flex flex-col items-center justify-center gap-2 z-20">
              <motion.div 
                initial={{ scale: 0.8, y: 20, opacity: 0 }}
                animate={{ scale: 1.1, y: 0, opacity: 1 }}
                transition={{ 
                  duration: 0.6,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="text-6xl font-['Russo_One'] text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 tracking-wider filter drop-shadow-[0_0_25px_rgba(168,85,247,0.8)]"
              >
                {text}
              </motion.div>
              
              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    delay: 0.3,
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  className="text-xl text-yellow-400 font-bold tracking-wide text-center max-w-2xl filter drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]"
                >
                  {subtitle}
                </motion.div>
              )}
            </div>
            
            {/* Decor Lines */}
            <motion.div 
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent"
              animate={{
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhaseBanner;

