import React from 'react';

interface Props {
  onStartGame: () => void;
  onStartGame3D: () => void;
  onStartAI: () => void;
  onViewRecords: () => void;
  onCardGuide: () => void;
  onViewDemos: () => void;
}

export const MainMenu: React.FC<Props> = ({ onStartGame, onStartGame3D, onStartAI, onViewRecords, onCardGuide, onViewDemos }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-400 to-green-600 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
          ⚽ Football Miracle 11
        </h1>
        <p className="text-white/80 text-lg">Light Strategy Football Card Battle</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-sm md:max-w-md">
        <button
          onClick={onStartGame}
          className="btn btn-primary text-lg py-4"
        >
          🎮 Quick Start (2D)
          <span className="block text-xs mt-1 opacity-70">Random Squad · Play Now</span>
        </button>

        <button
          onClick={onStartGame3D}
          className="btn bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-lg py-4 rounded-xl shadow-lg transition-all hover:scale-105"
        >
          🎲 Quick Start (3D)
          <span className="block text-xs mt-1 opacity-70">Three.js · True 3D Interaction</span>
        </button>
        
        <button
          onClick={onStartAI}
          className="btn btn-secondary text-lg py-4"
        >
          🤖 VS AI
          <span className="block text-xs mt-1 opacity-70">Custom Squad · Strategy Layout</span>
        </button>

        <button
          className="btn btn-secondary text-lg py-4 opacity-50 cursor-not-allowed"
          disabled
        >
          👥 VS Friend
          <span className="block text-xs mt-1 opacity-70">Coming Soon</span>
        </button>
      </div>

      <div className="mt-12 flex justify-center gap-8 w-full max-w-md px-4 flex-wrap">
        <button className="flex flex-col items-center text-white/80 hover:text-white transition-colors">
          <span className="text-2xl mb-1">🃏</span>
          <span className="text-sm">My Cards</span>
        </button>
        <button 
          onClick={onViewRecords}
          className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
        >
          <span className="text-2xl mb-1">📋</span>
          <span className="text-sm">Match History</span>
        </button>
        <button 
          onClick={onCardGuide}
          className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
        >
          <span className="text-2xl mb-1">📚</span>
          <span className="text-sm">How to Play</span>
        </button>
        <button 
          onClick={onViewDemos}
          className="flex flex-col items-center text-white/80 hover:text-white transition-colors"
        >
          <span className="text-2xl mb-1">🎲</span>
          <span className="text-sm">3D Demos</span>
        </button>
      </div>

      <div className="mt-8 text-white/60 text-sm text-center">
        <p>5 mins per game · Light Strategy</p>
        <p>Tactical Layout · One Goal Wins</p>
      </div>
    </div>
  );
};


