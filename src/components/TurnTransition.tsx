import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TurnTransitionProps {
  turn: 'player' | 'ai';
  onComplete?: () => void;
}

export const TurnTransition: React.FC<TurnTransitionProps> = ({ turn, onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, 2000); // Display for 2 seconds
    return () => clearTimeout(timer);
  }, [turn, onComplete]);

  const isPlayer = turn === 'player';
  const text = isPlayer ? "YOUR TURN" : "OPPONENT TURN";
  const subText = isPlayer ? "Make your move" : "Wait for opponent";
  const primaryColor = isPlayer ? "bg-blue-600" : "bg-red-600";
  const secondaryColor = isPlayer ? "from-blue-900" : "from-red-900";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

          {/* Main Banner Container */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`relative w-full h-32 ${primaryColor}/90 flex items-center justify-center overflow-hidden border-y-4 border-white/20`}
          >
            {/* Background Effects */}
            <div className={`absolute inset-0 bg-gradient-to-r ${secondaryColor} to-black opacity-80`} />
            <div className="absolute inset-0 bg-[url('/images/pattern_dot.png')] opacity-20 mix-blend-overlay" />
            
            {/* Animated Stripes */}
            <motion.div 
              animate={{ x: [-100, 100] }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />

            {/* Text Content */}
            <div className="relative z-10 text-center">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
                style={{ fontFamily: "'Anton', sans-serif" }} // Assuming a font is available, or fallback
              >
                {text}
              </motion.h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="h-1 w-32 bg-white mx-auto my-2"
              />
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="text-xl font-bold text-white/80 tracking-widest uppercase"
              >
                {subText}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
