import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  targetValue: number;
  duration?: number;
  delay?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  targetValue,
  duration = 1500,
  delay = 0,
  className = '',
  prefix = '',
  suffix = '',
  onComplete
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (targetValue === currentValue) return;
    
    setIsAnimating(true);
    const startTime = Date.now() + delay;
    const startValue = currentValue;
    
    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const nextValue = Math.round(startValue + (targetValue - startValue) * easedProgress);
      
      setCurrentValue(nextValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        onComplete?.();
      }
    };
    
    requestAnimationFrame(animate);
    
    return () => {
      // Cleanup if component unmounts during animation
      setIsAnimating(false);
    };
  }, [targetValue, duration, delay, onComplete]);

  return (
    <motion.span 
      className={className}
      animate={{
        scale: isAnimating ? [1, 1.1, 1] : 1,
        color: isAnimating ? ['#ffffff', '#fbbf24', '#ffffff'] : '#ffffff'
      }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{currentValue}{suffix}
    </motion.span>
  );
};

// Easing function for smooth animation
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3);
};

export default AnimatedCounter;
