import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../utils/audio';

interface Props {
  onComplete: (winner: 'player' | 'ai', choice: 'rock' | 'paper' | 'scissors' | 'home' | 'away' | null) => void;
}

type Choice = 'rock' | 'paper' | 'scissors';
type GamePhase = 'playerChoice' | 'aiThinking' | 'reveal' | 'result' | 'selectSide';

export const RockPaperScissors: React.FC<Props> = ({ onComplete }) => {
  const [phase, setPhase] = useState<GamePhase>('playerChoice');
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [aiChoice, setAiChoice] = useState<Choice | null>(null);
  const [winner, setWinner] = useState<'player' | 'ai' | 'tie' | null>(null);
  const [selectedSide, setSelectedSide] = useState<'home' | 'away' | null>(null);

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
              }, 500);
            }, 800);
          } else {
            // Tie, restart
            setTimeout(() => {
              setPhase('playerChoice');
              setPlayerChoice(null);
              setAiChoice(null);
              setWinner(null);
            }, 500);
          }
        }, 800);
      }, 500);
    }, 500);
  };

  const handleSideSelect = (side: 'home' | 'away') => {
    playSound('draw');
    setSelectedSide(side);
    setTimeout(() => {
      onComplete('player', side);
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 font-['Russo_One']"
    >
      <div className="text-center w-full max-w-4xl px-4">
        {phase === 'playerChoice' && (
          <>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-4xl mb-12 tracking-wider"
            >
              ROCK PAPER SCISSORS
            </motion.h2>
            
            {/* AI Area (Top) */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <div className="text-2xl text-white mb-4">AI</div>
              <motion.div 
                className="text-8xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🤖
              </motion.div>
              <div className="text-gray-400">Ready</div>
            </motion.div>
            
            {/* VS Separator */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl text-yellow-400 mb-12 font-bold"
            >
              VS
            </motion.div>
            
            {/* Player Area (Bottom) */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-2xl text-white mb-6">YOUR CHOICE</div>
              <div className="flex gap-6 justify-center">
                {choices.map((choice) => (
                  <motion.button
                    key={choice}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ delay: 0.5 + choices.indexOf(choice) * 0.1 }}
                    className="flex flex-col items-center gap-2 bg-gradient-to-br from-green-700 to-green-900 p-6 rounded-xl border-4 border-green-500 shadow-lg hover:shadow-xl transition-all"
                    onClick={() => handlePlayerChoice(choice)}
                  >
                    <img src={getChoiceEmoji(choice)} alt={getChoiceName(choice)} className="w-16 h-16" />
                    <span className="text-white text-xl font-bold">{getChoiceName(choice)}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}

        {phase === 'aiThinking' && (
          <>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-4xl mb-12 tracking-wider"
            >
              AI IS THINKING...
            </motion.h2>
            
            {/* AI Area (Top) */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-12"
            >
              <div className="text-2xl text-white mb-4">AI</div>
              <motion.div 
                className="text-8xl mb-4"
                animate={{ 
                  rotate: [0, 10, -10, 10, 0],
                  scale: [1, 1.05, 1, 1.05, 1]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🤔
              </motion.div>
              <div className="text-gray-400">Deciding...</div>
            </motion.div>
            
            {/* VS Separator */}
            <div className="text-4xl text-yellow-400 mb-12 font-bold">
              VS
            </div>
            
            {/* Player Area (Bottom) */}
            <motion.div>
              <div className="text-2xl text-white mb-4">YOU</div>
              <motion.div 
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-4"
              >
                {playerChoice ? <img src={getChoiceEmoji(playerChoice)} alt={getChoiceName(playerChoice)} className="w-24 h-24" /> : <span className="text-8xl">👊</span>}
              </motion.div>
              <div className="text-gray-400">{playerChoice ? getChoiceName(playerChoice) : ''}</div>
            </motion.div>
          </>
        )}

        {phase === 'reveal' && (
          <>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-4xl mb-12 tracking-wider"
            >
              LET'S SEE...
            </motion.h2>
            
            {/* AI Area (Top) */}
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mb-12"
            >
              <div className="text-2xl text-white mb-4">AI</div>
              <motion.div 
                initial={{ scale: 0, rotate: -360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="mb-4"
              >
                {aiChoice ? <img src={getChoiceEmoji(aiChoice)} alt={getChoiceName(aiChoice)} className="w-24 h-24" /> : <span className="text-8xl">🤖</span>}
              </motion.div>
              <div className="text-gray-400">{aiChoice ? getChoiceName(aiChoice) : ''}</div>
            </motion.div>
            
            {/* VS Separator */}
            <div className="text-4xl text-yellow-400 mb-12 font-bold">
              VS
            </div>
            
            {/* Player Area (Bottom) */}
            <motion.div>
              <div className="text-2xl text-white mb-4">YOU</div>
              <motion.div 
                initial={{ scale: 0, rotate: 360 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 100 }}
                className="mb-4"
              >
                {playerChoice ? <img src={getChoiceEmoji(playerChoice)} alt={getChoiceName(playerChoice)} className="w-24 h-24" /> : <span className="text-8xl">👊</span>}
              </motion.div>
              <div className="text-gray-400">{playerChoice ? getChoiceName(playerChoice) : ''}</div>
            </motion.div>
          </>
        )}

        {phase === 'result' && (
          <>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`text-4xl mb-12 tracking-wider ${
                winner === 'player' ? 'text-green-400' : 
                winner === 'ai' ? 'text-red-400' : 'text-yellow-400'
              }`}
            >
              {winner === 'player' ? 'YOU WIN!' : winner === 'ai' ? 'AI WINS!' : 'IT\'S A TIE!'}
            </motion.h2>
            
            {/* AI Area (Top) */}
            <motion.div className="mb-12">
              <div className="text-2xl text-white mb-4">AI</div>
              <div className="mb-4">{aiChoice ? <img src={getChoiceEmoji(aiChoice)} alt={getChoiceName(aiChoice)} className="w-24 h-24" /> : <span className="text-8xl">🤖</span>}</div>
              <div className="text-gray-400">{aiChoice ? getChoiceName(aiChoice) : ''}</div>
            </motion.div>
            
            {/* VS Separator */}
            <div className="text-4xl text-yellow-400 mb-12 font-bold">
              VS
            </div>
            
            {/* Player Area (Bottom) */}
            <motion.div>
              <div className="text-2xl text-white mb-4">YOU</div>
              <div className="mb-4">{playerChoice ? <img src={getChoiceEmoji(playerChoice)} alt={getChoiceName(playerChoice)} className="w-24 h-24" /> : <span className="text-8xl">👊</span>}</div>
              <div className="text-gray-400">{playerChoice ? getChoiceName(playerChoice) : ''}</div>
            </motion.div>
            
            {winner === 'tie' && (
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-yellow-400 text-2xl mt-8"
              >
                Let's try again!
              </motion.p>
            )}
          </>
        )}

        {phase === 'selectSide' && (
          <>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-white text-4xl mb-12 tracking-wider"
            >
              CHOOSE YOUR SIDE
            </motion.h2>
            
            <div className="flex gap-6 justify-center">
              <motion.button
                initial={{ scale: 0.8, opacity: 0, x: -50 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-2 bg-gradient-to-br from-green-700 to-green-900 p-6 rounded-xl border-4 border-green-500 shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleSideSelect('home')}
              >
                <span className="text-4xl">🏠</span>
                <span className="text-white text-xl font-bold">HOME TEAM</span>
                <span className="text-green-300 text-sm">Kick off first</span>
              </motion.button>
              <motion.button
                initial={{ scale: 0.8, opacity: 0, x: 50 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-2 bg-gradient-to-br from-red-700 to-red-900 p-6 rounded-xl border-4 border-red-500 shadow-lg hover:shadow-xl transition-all"
                onClick={() => handleSideSelect('away')}
              >
                <span className="text-4xl">🏟️</span>
                <span className="text-white text-xl font-bold">AWAY TEAM</span>
                <span className="text-red-300 text-sm">Kick off second</span>
              </motion.button>
            </div>
          </>
        )}

        {phase === 'aiSelectSide' && (
          <>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-red-400 text-4xl mb-12 tracking-wider"
            >
              AI IS CHOOSING...
            </motion.h2>
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex gap-6 justify-center"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  borderColor: ['#ef4444', '#f87171', '#ef4444']
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`flex flex-col items-center gap-2 p-6 rounded-xl border-4 shadow-lg transition-all ${
                  selectedSide === 'home' 
                    ? 'bg-gradient-to-br from-green-700 to-green-900 border-green-500 scale-110' 
                    : 'bg-gradient-to-br from-stone-700 to-stone-900 border-stone-500'
                }`}
              >
                <span className="text-4xl">🏠</span>
                <span className="text-white text-xl font-bold">HOME TEAM</span>
                <span className="text-green-300 text-sm">Kick off first</span>
              </motion.div>
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  borderColor: ['#ef4444', '#f87171', '#ef4444']
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className={`flex flex-col items-center gap-2 p-6 rounded-xl border-4 shadow-lg transition-all ${
                  selectedSide === 'away' 
                    ? 'bg-gradient-to-br from-red-700 to-red-900 border-red-500 scale-110' 
                    : 'bg-gradient-to-br from-stone-700 to-stone-900 border-stone-500'
                }`}
              >
                <span className="text-4xl">🏟️</span>
                <span className="text-white text-xl font-bold">AWAY TEAM</span>
                <span className="text-red-300 text-sm">Kick off second</span>
              </motion.div>
            </motion.div>

            {selectedSide && (
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-white text-2xl mt-8"
              >
                AI chose {selectedSide === 'home' ? 'HOME' : 'AWAY'} team!
              </motion.p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

