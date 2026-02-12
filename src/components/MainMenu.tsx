import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onStartGame: () => void;
  onStartGame3D: () => void;
  onStartAI: () => void;
  onViewRecords: () => void;
  onCardGuide: () => void;
  onViewDemos: () => void;
}

export const MainMenu: React.FC<Props> = ({ onStartGame, onStartGame3D, onStartAI, onViewRecords, onCardGuide, onViewDemos }) => {
  const [floatingIcons, setFloatingIcons] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [showUpdates, setShowUpdates] = useState(false);

  const updates = [
    {
      version: "0.0.2",
      date: "2026-02-13",
      description: "Enhanced duel system with shot icon selection, improved homepage animations"
    },
    {
      version: "0.0.1", 
      date: "2026-02-12",
      description: "Initial release with core gameplay mechanics"
    }
  ];

  useEffect(() => {
    // Generate floating football icons
    const icons = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setFloatingIcons(icons);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-600 to-emerald-700 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-10">
        {floatingIcons.map((icon) => (
          <motion.div
            key={icon.id}
            className="absolute text-4xl"
            style={{ left: `${icon.x}%`, top: `${icon.y}%` }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              y: {
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: icon.delay,
              },
              rotate: {
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: icon.delay,
              },
            }}
          >
            ⚽
          </motion.div>
        ))}
      </div>

      {/* Stadium Lights Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      
      {/* Stadium Lines */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 right-0 h-px bg-white" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
        <div className="absolute top-3/4 left-0 right-0 h-px bg-white" />
        <div className="absolute top-0 bottom-0 left-1/4 w-px bg-white" />
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white" />
        <div className="absolute top-0 bottom-0 left-3/4 w-px bg-white" />
      </div>
      
      {/* Corner Flags */}
      <div className="absolute top-4 left-4 text-2xl animate-pulse">🚩</div>
      <div className="absolute top-4 right-4 text-2xl animate-pulse">🚩</div>
      <div className="absolute bottom-4 left-4 text-2xl animate-pulse">🚩</div>
      <div className="absolute bottom-4 right-4 text-2xl animate-pulse">🚩</div>
      
      {/* Main Title with Enhanced Animation */}
      <motion.div 
        className="text-center mb-12 z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <motion.h1 
          className="text-6xl font-black text-white mb-4 drop-shadow-2xl"
          animate={{ 
            textShadow: [
              "0 0 20px rgba(255,255,255,0.5)",
              "0 0 40px rgba(255,255,255,0.8)",
              "0 0 20px rgba(255,255,255,0.5)"
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ⚽ FOOTBALL MIRACLE 11
        </motion.h1>
        <motion.p 
          className="text-white/90 text-xl font-medium tracking-wide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Light Strategy Football Card Battle
        </motion.p>
      </motion.div>

      <motion.div 
        className="flex flex-col gap-4 w-full max-w-sm md:max-w-md z-10"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <motion.button
          onClick={onStartGame}
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white text-lg py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          🎮 Quick Start (2D)
          <span className="block text-xs mt-1 opacity-70">Random Squad · Play Now</span>
        </motion.button>

        <motion.button
          onClick={onStartGame3D}
          className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:via-pink-500 hover:to-indigo-500 text-white text-lg py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          🎲 Quick Start (3D)
          <span className="block text-xs mt-1 opacity-70">Three.js · True 3D Interaction</span>
        </motion.button>
        
        <motion.button
          onClick={onStartAI}
          className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white text-lg py-4 rounded-xl shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          🤖 VS AI
          <span className="block text-xs mt-1 opacity-70">Custom Squad · Strategy Layout</span>
        </motion.button>

        <motion.button
          className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white text-lg py-4 rounded-xl shadow-lg opacity-60 cursor-not-allowed"
          disabled
          whileHover={{ scale: 1.01 }}
        >
          👥 VS Friend
          <span className="block text-xs mt-1 opacity-70">Coming Soon</span>
        </motion.button>
      </motion.div>

      <motion.div 
        className="mt-12 flex justify-center gap-8 w-full max-w-md px-4 flex-wrap z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <motion.button 
          className="flex flex-col items-center text-white/80 hover:text-white transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300">🃏</span>
          <span className="text-sm font-medium">My Cards</span>
        </motion.button>
        <motion.button 
          onClick={onViewRecords}
          className="flex flex-col items-center text-white/80 hover:text-white transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300">📋</span>
          <span className="text-sm font-medium">Match History</span>
        </motion.button>
        <motion.button 
          onClick={onCardGuide}
          className="flex flex-col items-center text-white/80 hover:text-white transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300">📚</span>
          <span className="text-sm font-medium">How to Play</span>
        </motion.button>
        <motion.button 
          onClick={onViewDemos}
          className="flex flex-col items-center text-white/80 hover:text-white transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-3xl mb-2 group-hover:rotate-12 transition-transform duration-300">🎲</span>
          <span className="text-sm font-medium">3D Demos</span>
        </motion.button>
      </motion.div>

      <motion.div 
        className="mt-8 text-white/70 text-sm text-center z-10 space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
      >
        <p className="font-medium">5 mins per game · Light Strategy</p>
        <p>Tactical Layout · One Goal Wins</p>
        <div className="mt-4 p-3 bg-black/20 rounded-lg backdrop-blur-sm">
          <p className="text-xs opacity-80">⚠️ English Version Only</p>
          <p className="text-xs opacity-60">Use browser translate for other languages</p>
        </div>
        
        {/* Updates Section */}
        <div className="mt-4">
          <motion.button
            onClick={() => setShowUpdates(!showUpdates)}
            className="text-xs text-white/60 hover:text-white transition-colors underline"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📢 View Updates
          </motion.button>
          
          <AnimatePresence>
            {showUpdates && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-black/30 rounded-lg backdrop-blur-sm max-w-md mx-auto"
              >
                <div className="space-y-2">
                  {updates.map((update, index) => (
                    <div key={update.version} className="text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-yellow-400">v{update.version}</span>
                        <span className="text-xs text-white/50">{update.date}</span>
                      </div>
                      <p className="text-xs text-white/80 mt-1">{update.description}</p>
                      {index < updates.length - 1 && <div className="h-px bg-white/10 mt-2" />}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};


