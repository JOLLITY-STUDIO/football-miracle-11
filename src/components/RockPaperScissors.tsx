import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../utils/audio';

interface Props {
  onComplete: (winner: 'player' | 'ai', choice: 'rock' | 'paper' | 'scissors' | 'home' | 'away' | null) => void;
}

type Choice = 'rock' | 'paper' | 'scissors';
type GamePhase = 'intro' | 'playerChoice' | 'aiThinking' | 'reveal' | 'result' | 'selectSide' | 'aiSelectSide';

export const RockPaperScissors: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<GamePhase>('playerChoice');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [winner, setWinner] = useState<'player' | 'ai' | 'tie' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'home' | 'away' | null>(null);
  const [countdown, setCountdown] = useState<number>(3);

  const choices: Choice[] = ['rock', 'paper', 'scissors'];

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
    playSound('pop');
    setPlayerChoice(choice);
    setPhase('aiThinking');

    // AI "thinks" for a moment
      setTimeout(() => {
        const aiPick = choices[Math.floor(Math.random() * choices.length)] as Choice;
        setAiChoice(aiPick);
        setPhase('reveal');
        playSound('cut');

        // Reveal both choices
        setTimeout(() => {
          const gameWinner = determineWinner(choice, aiPick);
        setWinner(gameWinner);
        setPhase('result');

        // Show result then move to next step
        setTimeout(() => {
          if (gameWinner === 'player') {
            setPhase('selectSide');
            playSound('cash');
          } else if (gameWinner === 'ai') {
            setPhase('aiSelectSide');
            playSound('swipe');
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
    playSound('cash');
    setSelectedSide(side);
    setTimeout(() => {
      onComplete('player', side);
    }, 800);
  };



  return createPortal(
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[200]">
      <div className="bg-black/90 border border-white/20 p-6 rounded-3xl flex flex-col items-center gap-4 shadow-[0_0_50px_rgba(255,255,255,0.3)] min-w-[300px] max-w-[400px] w-full mx-4">
      <AnimatePresence mode="wait">


        {/* Player Choice Phase */}
        {phase === 'playerChoice' && (
          <motion.div
            key="playerChoice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full"
          >
            <div className="flex flex-col items-center">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-['Russo_One'] text-white mb-4 tracking-wider"
              >
                MAKE YOUR CHOICE
              </motion.h2>
              
              <div className="text-white/60 text-xs font-bold tracking-widest uppercase text-center h-4 mb-4">
                Select Your Weapon
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              {choices.map((choice, index) => (
                <motion.button
                  key={choice}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: [0, -5, 5, 0],
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ 
                    delay: 0.5 + index * 0.1,
                    type: "spring",
                    stiffness: 200
                  }}
                  className="group relative flex flex-col items-center gap-2 bg-gradient-to-br from-blue-600 to-blue-800 p-3 rounded-lg border-2 border-blue-400 shadow-lg hover:shadow-blue-500/50 transition-all overflow-hidden min-w-[80px]"
                  onClick={() => handlePlayerChoice(choice)}
                >
                  <img 
                    src={getChoiceEmoji(choice)} 
                    alt={getChoiceName(choice)} 
                    className="w-12 h-12 relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                  />
                  <span className="text-white text-xs font-black uppercase tracking-wider relative z-10">
                    {getChoiceName(choice)}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Thinking Phase */}
        {phase === 'aiThinking' && (
          <motion.div
            key="aiThinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="flex flex-col items-center">
              <motion.h2 
                className="text-2xl font-['Russo_One'] text-white mb-4 tracking-wider"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                AI IS THINKING...
              </motion.h2>
              
              <div className="text-white/60 text-xs font-bold tracking-widest uppercase text-center h-4 mb-4">
                Calculating Strategy...
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-6">
              <div className="text-4xl">🤔</div>
              <div className="text-xl font-['Russo_One'] text-white">VS</div>
              <div>
                {playerChoice && (
                  <img 
                    src={getChoiceEmoji(playerChoice)} 
                    alt={getChoiceName(playerChoice)} 
                    className="w-16 h-16 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Reveal Phase */}
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="w-full"
          >
            <div className="flex flex-col items-center">
              <motion.h2 
                className="text-2xl font-['Russo_One'] text-white mb-4 tracking-wider"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ duration: 0.5 }}
              >
                REVEAL!
              </motion.h2>
            </div>
            
            <div className="flex justify-center items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">Opponent</div>
                {aiChoice && (
                  <img 
                    src={getChoiceEmoji(aiChoice)} 
                    alt={getChoiceName(aiChoice)} 
                    className="w-12 h-12 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]" 
                  />
                )}
              </div>
              <div className="text-xl font-['Russo_One'] text-white">VS</div>
              <div className="flex flex-col items-center">
                <div className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">You</div>
                {playerChoice && (
                  <img 
                    src={getChoiceEmoji(playerChoice)} 
                    alt={getChoiceName(playerChoice)} 
                    className="w-12 h-12 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" 
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="flex flex-col items-center">
              <motion.h2 
                initial={{ y: -30, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className={`text-2xl font-['Russo_One'] mb-4 tracking-wider ${
                  winner === 'player' ? 'text-green-400' : 
                  winner === 'ai' ? 'text-red-400' : 'text-yellow-400'
                }`}
              >
                {winner === 'player' ? 'YOU WIN!' : winner === 'ai' ? 'AI WINS!' : 'TIE!'}
              </motion.h2>
              
              <div className="text-white/60 text-xs font-bold tracking-widest uppercase text-center h-4 mb-4">
                {winner === 'tie' ? 'It\'s a tie! Let\'s try again.' : ''}
              </div>
            </div>
            
            <div className="flex justify-center items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">Opponent</div>
                {aiChoice && (
                  <img 
                    src={getChoiceEmoji(aiChoice)} 
                    alt={getChoiceName(aiChoice)} 
                    className="w-12 h-12" 
                  />
                )}
              </div>
              <div className="text-xl font-['Russo_One'] text-white">VS</div>
              <div className="flex flex-col items-center">
                <div className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">You</div>
                {playerChoice && (
                  <img 
                    src={getChoiceEmoji(playerChoice)} 
                    alt={getChoiceName(playerChoice)} 
                    className="w-12 h-12" 
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Select Side Phase */}
        {phase === 'selectSide' && (
          <motion.div
            key="selectSide"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <div className="flex flex-col items-center">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-['Russo_One'] text-green-400 mb-4 tracking-wider"
              >
                VICTORY!
              </motion.h2>
              
              <div className="text-white/60 text-xs font-bold tracking-widest uppercase text-center h-4 mb-4">
                Choose Your Side
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <motion.button
                initial={{ scale: 0, x: -50, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 bg-gradient-to-br from-green-600 to-green-800 p-3 rounded-lg border-2 border-green-400 shadow-lg hover:shadow-green-500/50 transition-all min-w-[100px]"
                onClick={() => handleSideSelect('home')}
              >
                <span className="text-3xl">🏠</span>
                <span className="text-white text-xs font-black uppercase tracking-wider">
                  Home Team
                </span>
              </motion.button>

              <motion.button
                initial={{ scale: 0, x: 50, opacity: 0 }}
                animate={{ scale: 1, x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 150, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex flex-col items-center gap-2 bg-gradient-to-br from-red-600 to-red-800 p-3 rounded-lg border-2 border-red-400 shadow-lg hover:shadow-red-500/50 transition-all min-w-[100px]"
                onClick={() => handleSideSelect('away')}
              >
                <span className="text-3xl">🏟️</span>
                <span className="text-white text-xs font-black uppercase tracking-wider">
                  Away Team
                </span>
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
            className="w-full"
          >
            <div className="flex flex-col items-center">
              <motion.h2 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-2xl font-['Russo_One'] text-red-400 mb-4 tracking-wider"
              >
                AI WINS
              </motion.h2>
              
              <div className="text-white/60 text-xs font-bold tracking-widest uppercase text-center h-4 mb-4">
                AI is choosing...
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <motion.div
                animate={{ 
                  scale: selectedSide === 'home' ? [1, 1.1, 1.1] : [1, 1.05, 1],
                }}
                transition={{ duration: 1, repeat: selectedSide ? 0 : Infinity }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 shadow-lg transition-all min-w-[100px] ${
                  selectedSide === 'home' 
                    ? 'bg-gradient-to-br from-green-600 to-green-800 border-green-400 shadow-green-500/50' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500'
                }`}
              >
                <span className="text-3xl">🏠</span>
                <span className={`text-xs font-black uppercase tracking-wider ${
                  selectedSide === 'home' ? 'text-white' : 'text-gray-400'
                }`}>
                  Home Team
                </span>
              </motion.div>

              <motion.div
                animate={{ 
                  scale: selectedSide === 'away' ? [1, 1.1, 1.1] : [1, 1.05, 1],
                }}
                transition={{ duration: 1, repeat: selectedSide ? 0 : Infinity }}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 shadow-lg transition-all min-w-[100px] ${
                  selectedSide === 'away' 
                    ? 'bg-gradient-to-br from-red-600 to-red-800 border-red-400 shadow-red-500/50' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-900 border-gray-500'
                }`}
              >
                <span className="text-3xl">🏟️</span>
                <span className={`text-xs font-black uppercase tracking-wider ${
                  selectedSide === 'away' ? 'text-white' : 'text-gray-400'
                }`}>
                  Away Team
                </span>
              </motion.div>
            </div>
            
            {selectedSide && (
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="text-white text-sm mt-4 font-['Russo_One'] tracking-wider"
              >
                AI chose {selectedSide === 'home' ? 'HOME' : 'AWAY'} team!
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>,
    document.body
  );
};
