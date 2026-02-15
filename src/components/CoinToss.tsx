import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/audio';

interface Props {
  result: 'home' | 'away';
  onComplete: () => void;
}

export const CoinToss: React.FC<Props> = ({ result, onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState<'spinning' | 'landed' | 'result'>('spinning');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    playSound('ding');

    const timer1 = setTimeout(() => {
      setAnimationPhase('landed');
      playSound('flip');
    }, 1200);

    const timer2 = setTimeout(() => {
      setAnimationPhase('result');
      setShowResult(true);
      if (result === 'home') {
        playSound('cheer');
      } else {
        playSound('swosh');
      }
    }, 1500);

    const timer3 = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const edgeCount = 32;
  const edges = Array.from({ length: edgeCount }, (_, i) => i);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-['Russo_One']"
    >
      <div className="text-center">
        <div className="mb-12" style={{ perspective: '1000px' }}>
          <div 
            className={`coin-3d ${
              animationPhase === 'spinning' ? 'coin-spinning' : 
              animationPhase === 'landed' ? 'coin-landed' : 'coin-still'
            }`}
          >
            <div className="coin-face coin-heads border-4 border-[#B8860B]">
              {animationPhase === 'result' || animationPhase === 'landed' ? (
                <span className="text-2xl font-black text-black/80 tracking-tighter filter drop-shadow-sm">{result === 'home' ? 'HOME' : 'AWAY'}</span>
              ) : (
                <span className="text-2xl font-black text-black/80 tracking-tighter filter drop-shadow-sm">HOME</span>
              )}
            </div>
            <div className="coin-face coin-tails border-4 border-[#B8860B]">
              <span className="text-2xl font-black text-black/80 tracking-tighter filter drop-shadow-sm">AWAY</span>
            </div>
            {edges.map((i) => (
              <div 
                key={i}
                className="coin-edge-segment"
                style={{
                  transform: `rotateZ(${i * (360 / edgeCount)}deg) translateY(-60px) rotateX(90deg)`
                }}
              />
            ))}
          </div>
        </div>

<motion.div 
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-amber-100 text-3xl font-bold mb-4 tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
>
  {animationPhase === 'spinning' && 'COIN TOSS...'}
  {animationPhase === 'landed' && 'AND THE RESULT IS...'}
  {animationPhase === 'result' && (
    <motion.span 
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1.2, opacity: 1 }}
      className={result === 'home' ? 'text-green-400' : 'text-red-400'}
    >
      {result === 'home' ? 'HOME TEAM' : 'AWAY TEAM'}
    </motion.span>
  )}
</motion.div>

{showResult && (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-amber-300 text-lg font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
  >
    {result === 'home' 
      ? 'You win the toss! You kick off first.' 
      : 'AI wins the toss. AI kicks off first.'}
  </motion.div>
)}
</div>

<style>{`
.coin-3d {
  width: 120px;
  height: 120px;
  position: relative;
  margin: 0 auto;
  transform-style: preserve-3d;
  transition: transform 0.5s ease-out;
}

.coin-face {
  position: absolute;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backface-visibility: hidden;
  border: 4px solid #B8860B;
}

.coin-heads {
  background: radial-gradient(circle at 30% 30%, #FFE066 0%, #FFD700 30%, #DAA520 70%, #B8860B 100%);
  transform: translateZ(6px);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
}

.coin-tails {
  background: radial-gradient(circle at 30% 30%, #FFE066 0%, #FFD700 30%, #DAA520 70%, #B8860B 100%);
  transform: translateZ(-6px) rotateY(180deg);
  box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
}

.coin-edge-segment {
  position: absolute;
  width: 14px; /* Increased width slightly to overlap */
  height: 12px; /* thickness */
  left: 53px; /* Adjusted to center better */
  top: 54px;
  background: #DAA520; /* Solid gold base */
  border-left: 1px solid rgba(0,0,0,0.1); /* Subtle segment lines */
  transform-style: preserve-3d;
}

.coin-spinning {
  animation: coinSpin3D 1.2s ease-in-out forwards;
}

.coin-landed {
  animation: coinLand 0.5s ease-out forwards;
}

.coin-still {
  transform: rotateX(0deg) rotateY(0deg);
}

@keyframes coinSpin3D {
  0% { transform: rotateX(0deg) rotateY(0deg) translateY(0) scale(1); }
  20% { transform: rotateX(540deg) rotateY(360deg) translateY(-150px) scale(1.2); }
  40% { transform: rotateX(1080deg) rotateY(720deg) translateY(-100px) scale(1.4); }
  60% { transform: rotateX(1620deg) rotateY(1080deg) translateY(-130px) scale(1.3); }
  80% { transform: rotateX(2160deg) rotateY(1440deg) translateY(-40px) scale(1.1); }
  100% { transform: rotateX(2520deg) rotateY(1800deg) translateY(0) scale(1); }
}

@keyframes coinLand {
  0% { transform: scale(1) rotateX(2520deg) rotateY(1800deg); }
  30% { transform: scale(0.9) rotateX(0deg) rotateY(0deg); }
  60% { transform: scale(1.1); }
  100% { transform: scale(1) rotateX(0deg) rotateY(0deg); }
}
`}</style>
    </motion.div>
  );
};

