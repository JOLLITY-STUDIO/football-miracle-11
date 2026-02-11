import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  result: 'home' | 'away';
  onComplete: () => void;
}

export const CoinToss: React.FC<Props> = ({ result, onComplete }) => {
  const [animationPhase, setAnimationPhase] = useState<'spinning' | 'landed' | 'result'>('spinning');
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setAnimationPhase('landed'), 2500);
    const timer2 = setTimeout(() => {
      setAnimationPhase('result');
      setShowResult(true);
    }, 3000);
    const timer3 = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const edgeCount = 16;
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
                <span className="text-5xl filter drop-shadow-lg">{result === 'home' ? '🏠' : '✈️'}</span>
              ) : (
                <span className="text-5xl filter drop-shadow-lg">🏠</span>
              )}
            </div>
            <div className="coin-face coin-tails border-4 border-[#B8860B]">
              <span className="text-5xl filter drop-shadow-lg">✈️</span>
            </div>
            {edges.map((i) => (
              <div 
                key={i} 
                className="coin-edge"
                style={{ transform: `rotateY(${i * (360 / edgeCount)}deg) translateZ(50px)` }}
              />
            ))}
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-amber-100 text-3xl font-bold mb-4 tracking-wider"
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
            className="text-amber-300 text-lg"
          >
            {result === 'home' 
              ? 'You win the toss! You kick off first.' 
              : 'AI wins the toss. AI kicks off first.'}
          </motion.div>
        )}
      </div>

      <style>{`
        .coin-3d {
          width: 100px;
          height: 100px;
          position: relative;
          margin: 0 auto;
          transform-style: preserve-3d;
        }
        
        .coin-face {
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: visible;
        }
        
        .coin-heads {
          background: radial-gradient(circle at 30% 30%, #FFE066 0%, #FFD700 30%, #DAA520 70%, #B8860B 100%);
          transform: translateZ(8px);
          box-shadow: inset 0 0 15px rgba(139, 90, 43, 0.5), 0 0 20px rgba(255, 215, 0, 0.5);
        }
        
        .coin-tails {
          background: radial-gradient(circle at 30% 30%, #FFE066 0%, #FFD700 30%, #DAA520 70%, #B8860B 100%);
          transform: translateZ(-8px) rotateY(180deg);
          box-shadow: inset 0 0 15px rgba(139, 90, 43, 0.5), 0 0 20px rgba(255, 215, 0, 0.5);
        }
        
        .coin-edge {
          position: absolute;
          width: 12px;
          height: 100px;
          background: linear-gradient(to bottom, #B8860B 0%, #FFD700 20%, #FFD700 80%, #B8860B 100%);
          left: 44px;
          border-left: 1px solid rgba(139, 90, 43, 0.3);
          border-right: 1px solid rgba(139, 90, 43, 0.3);
        }
        
        .coin-spinning {
          animation: coinSpin3D 2.5s ease-in-out forwards;
        }
        
        .coin-landed {
          animation: coinLand 0.5s ease-out forwards;
        }
        
        .coin-still {
          transform: rotateX(0deg) rotateY(0deg);
        }
        
        @keyframes coinSpin3D {
          0% { transform: rotateX(0deg) rotateY(0deg) translateY(0); }
          20% { transform: rotateX(540deg) rotateY(360deg) translateY(-60px); }
          40% { transform: rotateX(1080deg) rotateY(720deg) translateY(-30px); }
          60% { transform: rotateX(1620deg) rotateY(1080deg) translateY(-50px); }
          80% { transform: rotateX(2160deg) rotateY(1440deg) translateY(-15px); }
          100% { transform: rotateX(2520deg) rotateY(1800deg) translateY(0); }
        }
        
        @keyframes coinLand {
          0% { transform: scale(1.3) rotateX(2520deg) rotateY(1800deg); }
          30% { transform: scale(0.85); }
          60% { transform: scale(1.1); }
          100% { transform: scale(1) rotateX(0deg) rotateY(0deg); }
        }
      `}</style>
    </motion.div>
  );
};
