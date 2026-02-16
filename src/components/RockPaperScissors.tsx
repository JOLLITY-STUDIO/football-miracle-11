import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../utils/audio';

interface Props {
  onComplete: (winner: 'player' | 'ai', choice: 'rock' | 'paper' | 'scissors' | 'home' | 'away' | null) => void;
}

type Choice = 'rock' | 'paper' | 'scissors';
type GamePhase = 'intro' | 'playerChoice' | 'aiThinking' | 'reveal' | 'result' | 'selectSide' | 'aiSelectSide';

export const RockPaperScissors: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [winner, setWinner] = useState<'player' | 'ai' | 'tie' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'home' | 'away' | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const choices: Choice[] = ['rock', 'paper', 'scissors'];

  // Intro animation
  useEffect(() => {
    if (phase === 'intro') {
      const timer = setTimeout(() => {
        setPhase('playerChoice');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const getChoiceEmoji = (choice: Choice): string => {
    switch (choice) {
      case 'rock': return '/cards/rps/hand-rock-solid-svgrepo-com.svg';
      case 'paper': return '/cards/rps/icon-paper.svg';
      case 'scissors': return '/cards/rps/icon-scissors.svg';
    }
  };

  const getChoiceName = (choice: Choice): string => {
    switch (choice) {
      case 'rock': return 'Rock';
      case 'paper': return 'Paper';
      case 'scissors': return 'Scissors';
    }
  };

  const determineWinner = (player: Choice, ai: Choice): 'player' | 'ai' | 'tie' => {
    if (player === ai) return 'tie';
    if (
      (player === 'rock' && ai === 'scissors') ||
      (player === 'paper' && ai === 'rock') ||
      (player === 'scissors' && ai === 'paper')
    ) {
      return 'player';
    }
    return 'ai';
  };

  const handlePlayerChoice = (choice: Choice) => {
    playSound('draw');
    setPlayerChoice(choice);
    setPhase('aiThinking');

    // AI "thinks" for a moment
    setTimeout(() => {
      const aiPick = choices[Math.floor(Math.random() * choices.length)];
      setAiChoice(aiPick);
      setPhase('reveal');
      playSound('flip');

      // Reveal both choices
      setTimeout(() => {
        const gameWinner = determineWinner(choice, aiPick);
        setWinner(gameWinner);
        setPhase('result');

        // Show result then move to next step
        setTimeout(() => {
          if (gameWinner === 'player') {
            setPhase('selectSide');
            playSound('cheer');
          } else if (gameWinner === 'ai') {
            setPhase('aiSelectSide');
            playSound('swosh');
            setTimeout(() => {
              const aiSide = Math.random() > 0.5 ? 'home' : 'away';
              setSelectedSide(aiSide);
              setTimeout(() => {
                onComplete('ai', aiSide);
              }, 1500);
            }, 1000);
          } else {
            // Tie, restart
            setTimeout(() => {
              setPhase('playerChoice');
              setPlayerChoice(null);
              setAiChoice(null);
              setWinner(null);
            }, 1500);
          }
        }, 1500);
      }, 800);
    }, 800);
  };

  const handleSideSelect = (side: 'home' | 'away') => {
    playSound('draw');
    setSelectedSide(side);
    setTimeout(() => {
      onComplete('player', side);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center z-50 font-['Russo_One'] overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="w-full h-full"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.3) 0%, transparent 50%)',
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      <div className="relative text-center w-full max-w-5xl px-4">
        <AnimatePresence mode="wait">
          {/* Intro Phase */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="space-y-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="text-9xl mb-8"
              >
                ⚔️
              </motion.div>
              <motion.h1 
                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 tracking-wider"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                ROCK PAPER SCISSORS
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-2xl text-blue-300"
              >
                Winner chooses Home or Away!
              </motion.p>
            </motion.div>
          )}

          {/* Player Choice Phase */}
          {phase === 'playerChoice' && (
            <motion.div
              key="playerChoice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl font-black text-white mb-16 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              >
                MAKE YOUR CHOICE
              </motion.h2>
              
              {/* AI Area (Top) */}
              <motion.div 
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-16"
              >
                <div className="inline-block bg-gradient-to-br from-red-600/30 to-red-900/30 backdrop-blur-sm border-2 border-red-500/50 rounded-2xl px-8 py-6 shadow-2xl">
                  <div className="text-xl text-red-300 mb-3 font-bold uppercase tracking-widest">Opponent</div>
                  <motion.div 
                    className="text-8xl mb-3"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, -5, 5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    🤖
                  </motion.div>
                  <div className="text-red-200 text-lg">Ready to battle</div>
                </div>
              </motion.div>
              
              {/* VS Separator */}
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="relative mb-16"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(234, 179, 8, 0.5)',
                      '0 0 40px rgba(234, 179, 8, 0.8)',
                      '0 0 20px rgba(234, 179, 8, 0.5)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-5xl font-black px-12 py-4 rounded-full border-4 border-yellow-300"
                >
                  VS
                </motion.div>
              </motion.div>
              
              {/* Player Area (Bottom) */}
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="text-2xl text-blue-300 mb-8 font-bold uppercase tracking-widest">Select Your Weapon</div>
                <div className="flex gap-8 justify-center">
                  {choices.map((choice, index) => (
                    <motion.button
                      key={choice}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      whileHover={{ 
                        scale: 1.15,
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.3 }
                      }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ 
                        delay: 0.5 + index * 0.1,
                        type: "spring",
                        stiffness: 200
                      }}
                      className="group relative flex flex-col items-center gap-4 bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-2xl border-4 border-blue-400 shadow-2xl hover:shadow-blue-500/50 transition-all overflow-hidden"
                      onClick={() => handlePlayerChoice(choice)}
                    >
                      {/* Glow effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-blue-400/0 to-blue-600/0 group-hover:from-blue-400/30 group-hover:to-blue-600/30 transition-all"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                        }}
                      />
                      <img 
                        src={getChoiceEmoji(choice)} 
                        alt={getChoiceName(choice)} 
                        className="w-24 h-24 relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                      />
                      <span className="text-white text-2xl font-black uppercase tracking-wider relative z-10">
                        {getChoiceName(choice)}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* AI Thinking Phase */}
          {phase === 'aiThinking' && (
            <motion.div
              key="aiThinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h2 
                className="text-5xl font-black text-white mb-16 tracking-wider"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(255,255,255,0.5)',
                    '0 0 40px rgba(255,255,255,0.8)',
                    '0 0 20px rgba(255,255,255,0.5)',
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                AI IS THINKING...
              </motion.h2>
              
              {/* AI Area (Top) */}
              <motion.div className="mb-16">
                <div className="inline-block bg-gradient-to-br from-red-600/30 to-red-900/30 backdrop-blur-sm border-2 border-red-500/50 rounded-2xl px-8 py-6 shadow-2xl">
                  <div className="text-xl text-red-300 mb-3 font-bold uppercase tracking-widest">Opponent</div>
                  <motion.div 
                    className="text-8xl mb-3"
                    animate={{ 
                      rotate: [0, 15, -15, 15, 0],
                      scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    🤔
                  </motion.div>
                  <motion.div 
                    className="text-red-200 text-lg"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    Calculating...
                  </motion.div>
                </div>
              </motion.div>
              
              {/* VS Separator */}
              <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-5xl font-black px-12 py-4 rounded-full border-4 border-yellow-300 mb-16">
                VS
              </div>
              
              {/* Player Area (Bottom) */}
              <motion.div>
                <div className="inline-block bg-gradient-to-br from-blue-600/30 to-blue-900/30 backdrop-blur-sm border-2 border-blue-500/50 rounded-2xl px-8 py-6 shadow-2xl">
                  <div className="text-xl text-blue-300 mb-3 font-bold uppercase tracking-widest">You</div>
                  <motion.div 
                    initial={{ scale: 0, rotate: 360 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="mb-3"
                  >
                    {playerChoice && (
                      <img 
                        src={getChoiceEmoji(playerChoice)} 
                        alt={getChoiceName(playerChoice)} 
                        className="w-24 h-24 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" 
                      />
                    )}
                  </motion.div>
                  <div className="text-blue-200 text-lg font-bold">
                    {playerChoice ? getChoiceName(playerChoice) : ''}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Reveal Phase */}
          {phase === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
            >
              <motion.h2 
                className="text-5xl font-black text-white mb-16 tracking-wider"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5 }}
              >
                REVEAL!
              </motion.h2>
              
              {/* AI Area (Top) */}
              <motion.div className="mb-16">
                <div className="inline-block bg-gradient-to-br from-red-600/30 to-red-900/30 backdrop-blur-sm border-2 border-red-500/50 rounded-2xl px-8 py-6 shadow-2xl">
                  <div className="text-xl text-red-300 mb-3 font-bold uppercase tracking-widest">Opponent</div>
                  <motion.div 
                    initial={{ scale: 0, rotate: -360, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 10 }}
                    className="mb-3"
                  >
                    {aiChoice && (
                      <img 
                        src={getChoiceEmoji(aiChoice)} 
                        alt={getChoiceName(aiChoice)} 
                        className="w-24 h-24 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" 
                      />
                    )}
                  </motion.div>
                  <div className="text-red-200 text-lg font-bold">
                    {aiChoice ? getChoiceName(aiChoice) : ''}
                  </div>
                </div>
              </motion.div>
              
              {/* VS Separator */}
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{ duration: 0.8 }}
                className="inline-block bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 text-5xl font-black px-12 py-4 rounded-full border-4 border-yellow-300 mb-16"
              >
                VS
              </motion.div>
              
              {/* Player Area (Bottom) */}
              <motion.div>
                <div className="inline-block bg-gradient-to-br from-blue-600/30 to-blue-900/30 backdrop-blur-sm border-2 border-blue-500/50 rounded-2xl px-8 py-6 shadow-2xl">
                  <div className="text-xl text-blue-300 mb-3 font-bold uppercase tracking-widest">You</div>
                  <motion.div 
                    initial={{ scale: 0, rotate: 360, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 150, damping: 10 }}
                    className="mb-3"
                  >
                    {playerChoice && (
                      <img 
                        src={getChoiceEmoji(playerChoice)} 
                        alt={getChoiceName(playerChoice)} 
                        className="w-24 h-24 drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]" 
                      />
                    )}
                  </motion.div>
                  <div className="text-blue-200 text-lg font-bold">
                    {playerChoice ? getChoiceName(playerChoice) : ''}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Result Phase */}
          {phase === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h2 
                initial={{ y: -50, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`text-7xl font-black mb-16 tracking-wider drop-shadow-2xl ${
                  winner === 'player' ? 'text-green-400' : 
                  winner === 'ai' ? 'text-red-400' : 'text-yellow-400'
                }`}
                style={{
                  textShadow: winner === 'player' 
                    ? '0 0 40px rgba(74, 222, 128, 0.8)' 
                    : winner === 'ai'
                    ? '0 0 40px rgba(248, 113, 113, 0.8)'
                    : '0 0 40px rgba(250, 204, 21, 0.8)'
                }}
              >
                {winner === 'player' ? '🎉 YOU WIN! 🎉' : winner === 'ai' ? '💔 AI WINS! 💔' : '🤝 TIE! 🤝'}
              </motion.h2>
              
              <div className="flex justify-center items-center gap-12 mb-8">
                {/* AI Result */}
                <motion.div
                  animate={{
                    scale: winner === 'ai' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.5, repeat: winner === 'ai' ? Infinity : 0 }}
                >
                  <div className={`backdrop-blur-sm border-4 rounded-2xl px-8 py-6 shadow-2xl min-w-[200px] flex flex-col items-center ${
                    winner === 'ai' 
                      ? 'bg-gradient-to-br from-red-600/50 to-red-900/50 border-red-400' 
                      : 'bg-gradient-to-br from-red-600/20 to-red-900/20 border-red-500/30'
                  }`}>
                    <div className="text-xl text-red-300 mb-3 font-bold uppercase tracking-widest">Opponent</div>
                    <div className="mb-3 flex justify-center items-center">
                      {aiChoice && (
                        <img 
                          src={getChoiceEmoji(aiChoice)} 
                          alt={getChoiceName(aiChoice)} 
                          className="w-24 h-24" 
                        />
                      )}
                    </div>
                    <div className="text-red-200 text-lg font-bold text-center">
                      {aiChoice ? getChoiceName(aiChoice) : ''}
                    </div>
                  </div>
                </motion.div>

                {/* VS */}
                <div className="text-5xl font-black text-yellow-400">VS</div>

                {/* Player Result */}
                <motion.div
                  animate={{
                    scale: winner === 'player' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{ duration: 0.5, repeat: winner === 'player' ? Infinity : 0 }}
                >
                  <div className={`backdrop-blur-sm border-4 rounded-2xl px-8 py-6 shadow-2xl min-w-[200px] flex flex-col items-center ${
                    winner === 'player' 
                      ? 'bg-gradient-to-br from-blue-600/50 to-blue-900/50 border-blue-400' 
                      : 'bg-gradient-to-br from-blue-600/20 to-blue-900/20 border-blue-500/30'
                  }`}>
                    <div className="text-xl text-blue-300 mb-3 font-bold uppercase tracking-widest">You</div>
                    <div className="mb-3 flex justify-center items-center">
                      {playerChoice && (
                        <img 
                          src={getChoiceEmoji(playerChoice)} 
                          alt={getChoiceName(playerChoice)} 
                          className="w-24 h-24" 
                        />
                      )}
                    </div>
                    <div className="text-blue-200 text-lg font-bold text-center">
                      {playerChoice ? getChoiceName(playerChoice) : ''}
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {winner === 'tie' && (
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-yellow-300 text-3xl mt-8 font-bold"
                >
                  Let's try again! 🔄
                </motion.p>
              )}
            </motion.div>
          )}

          {/* Select Side Phase */}
          {phase === 'selectSide' && (
            <motion.div
              key="selectSide"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 mb-8 tracking-wider"
              >
                🏆 VICTORY! 🏆
              </motion.h2>
              
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl text-white mb-16 font-bold"
              >
                Choose Your Side
              </motion.p>
              
              <div className="flex gap-10 justify-center">
                {/* Home Team */}
                <motion.button
                  initial={{ scale: 0, x: -100, opacity: 0 }}
                  animate={{ scale: 1, x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 150, delay: 0.3 }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -2, 2, 0],
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex flex-col items-center gap-4 bg-gradient-to-br from-green-600 to-green-800 p-10 rounded-3xl border-4 border-green-400 shadow-2xl hover:shadow-green-500/50 transition-all overflow-hidden min-w-[280px]"
                  onClick={() => handleSideSelect('home')}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-green-400/0 to-green-600/0 group-hover:from-green-400/30 group-hover:to-green-600/30"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  
                  <motion.span 
                    className="text-7xl relative z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                    }}
                  >
                    🏠
                  </motion.span>
                  <span className="text-white text-3xl font-black uppercase tracking-wider relative z-10">
                    Home Team
                  </span>
                  <div className="bg-green-900/50 px-4 py-2 rounded-lg relative z-10">
                    <span className="text-green-200 text-sm font-bold">✓ First Draft Pick</span>
                  </div>
                  <div className="bg-green-900/50 px-4 py-2 rounded-lg relative z-10">
                    <span className="text-green-200 text-sm font-bold">✓ Home Advantage</span>
                  </div>
                </motion.button>

                {/* Away Team */}
                <motion.button
                  initial={{ scale: 0, x: 100, opacity: 0 }}
                  animate={{ scale: 1, x: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 150, delay: 0.4 }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, 2, -2, 0],
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative flex flex-col items-center gap-4 bg-gradient-to-br from-red-600 to-red-800 p-10 rounded-3xl border-4 border-red-400 shadow-2xl hover:shadow-red-500/50 transition-all overflow-hidden min-w-[280px]"
                  onClick={() => handleSideSelect('away')}
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-400/0 to-red-600/0 group-hover:from-red-400/30 group-hover:to-red-600/30"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  
                  <motion.span 
                    className="text-7xl relative z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0.5,
                    }}
                  >
                    🏟️
                  </motion.span>
                  <span className="text-white text-3xl font-black uppercase tracking-wider relative z-10">
                    Away Team
                  </span>
                  <div className="bg-red-900/50 px-4 py-2 rounded-lg relative z-10">
                    <span className="text-red-200 text-sm font-bold">✓ Second Draft Pick</span>
                  </div>
                  <div className="bg-red-900/50 px-4 py-2 rounded-lg relative z-10">
                    <span className="text-red-200 text-sm font-bold">✓ Underdog Spirit</span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* AI Select Side Phase */}
          {phase === 'aiSelectSide' && (
            <motion.div
              key="aiSelectSide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500 mb-8 tracking-wider"
              >
                💔 AI WINS 💔
              </motion.h2>
              
              <motion.p
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                animate={{
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="text-3xl text-white mb-16 font-bold"
              >
                AI is choosing...
              </motion.p>
              
              <div className="flex gap-10 justify-center">
                {/* Home Team Option */}
                <motion.div
                  animate={{ 
                    scale: selectedSide === 'home' ? [1, 1.15, 1.15] : [1, 1.05, 1],
                    borderColor: selectedSide === 'home' 
                      ? ['#4ade80', '#22c55e', '#4ade80']
                      : ['#6b7280', '#9ca3af', '#6b7280']
                  }}
                  transition={{ duration: 1, repeat: selectedSide ? 0 : Infinity }}
                  className={`flex flex-col items-center gap-4 p-10 rounded-3xl border-4 shadow-2xl transition-all min-w-[280px] ${
                    selectedSide === 'home' 
                      ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400 shadow-green-500/50' 
                      : 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500'
                  }`}
                >
                  <motion.span 
                    className="text-7xl"
                    animate={{
                      scale: selectedSide === 'home' ? [1, 1.2, 1] : 1,
                      rotate: selectedSide === 'home' ? [0, 10, -10, 0] : 0,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                  >
                    🏠
                  </motion.span>
                  <span className={`text-3xl font-black uppercase tracking-wider ${
                    selectedSide === 'home' ? 'text-white' : 'text-gray-400'
                  }`}>
                    Home Team
                  </span>
                  <div className={`px-4 py-2 rounded-lg ${
                    selectedSide === 'home' ? 'bg-green-900/50' : 'bg-gray-800/50'
                  }`}>
                    <span className={`text-sm font-bold ${
                      selectedSide === 'home' ? 'text-green-200' : 'text-gray-400'
                    }`}>
                      ✓ First Draft Pick
                    </span>
                  </div>
                </motion.div>

                {/* Away Team Option */}
                <motion.div
                  animate={{ 
                    scale: selectedSide === 'away' ? [1, 1.15, 1.15] : [1, 1.05, 1],
                    borderColor: selectedSide === 'away' 
                      ? ['#f87171', '#ef4444', '#f87171']
                      : ['#6b7280', '#9ca3af', '#6b7280']
                  }}
                  transition={{ duration: 1, repeat: selectedSide ? 0 : Infinity }}
                  className={`flex flex-col items-center gap-4 p-10 rounded-3xl border-4 shadow-2xl transition-all min-w-[280px] ${
                    selectedSide === 'away' 
                      ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-red-500/50' 
                      : 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500'
                  }`}
                >
                  <motion.span 
                    className="text-7xl"
                    animate={{
                      scale: selectedSide === 'away' ? [1, 1.2, 1] : 1,
                      rotate: selectedSide === 'away' ? [0, -10, 10, 0] : 0,
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                  >
                    🏟️
                  </motion.span>
                  <span className={`text-3xl font-black uppercase tracking-wider ${
                    selectedSide === 'away' ? 'text-white' : 'text-gray-400'
                  }`}>
                    Away Team
                  </span>
                  <div className={`px-4 py-2 rounded-lg ${
                    selectedSide === 'away' ? 'bg-red-900/50' : 'bg-gray-800/50'
                  }`}>
                    <span className={`text-sm font-bold ${
                      selectedSide === 'away' ? 'text-red-200' : 'text-gray-400'
                    }`}>
                      ✓ Second Draft Pick
                    </span>
                  </div>
                </motion.div>
              </div>

              {selectedSide && (
                <motion.p 
                  initial={{ y: 20, opacity: 0, scale: 0.8 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="text-white text-3xl mt-12 font-black"
                >
                  AI chose {selectedSide === 'home' ? '🏠 HOME' : '🏟️ AWAY'} team!
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

