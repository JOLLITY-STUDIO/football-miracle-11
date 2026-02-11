import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  text: string;
  subtitle?: string; // 新增副标题
  show: boolean;
  onComplete?: () => void;
}

const PhaseBanner: React.FC<Props> = ({ text, subtitle, show, onComplete }) => {
  useEffect(() => {
    if (show && onComplete) {
      const timer = setTimeout(onComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            className="w-full py-8 relative overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-900/90 to-transparent transform skew-x-[-20deg]" />
            
            {/* Content */}
            <div className="relative flex flex-col items-center justify-center gap-2">
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="text-5xl font-['Russo_One'] text-transparent bg-clip-text bg-gradient-to-b from-white to-purple-200 tracking-wider filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              >
                {text}
              </motion.div>
              
              {/* 副标题 */}
              {subtitle && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-white/80 font-medium tracking-wide"
                >
                  {subtitle}
                </motion.div>
              )}
            </div>
            
            {/* Decor Lines */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default PhaseBanner;
