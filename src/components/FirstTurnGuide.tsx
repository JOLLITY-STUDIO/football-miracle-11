import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FirstTurnGuideProps {
  show: boolean;
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const FirstTurnGuide: React.FC<FirstTurnGuideProps> = ({
  show,
  onDismiss,
  autoHide = true,
  autoHideDelay = 5000,
}) => {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (show && autoHide) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [show, autoHide, autoHideDelay]);

  const handleDismiss = () => {
    setDismissed(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  if (!show || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[250] p-4"
        onClick={handleDismiss}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl border-4 border-blue-400 shadow-2xl max-w-2xl w-full overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-blue-900/50 px-8 py-6 border-b-2 border-blue-400/30">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-7xl mb-4 text-center"
            >
              🎯
            </motion.div>
            <h3 className="text-4xl font-black text-white text-center tracking-wider">
              FIRST TURN
            </h3>
          </div>

          {/* Content */}
          <div className="px-8 py-6 space-y-6">
            {/* Main explanation */}
            <div className="bg-blue-900/30 rounded-xl p-6 border-2 border-blue-400/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">ℹ️</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    Why is Team Action skipped?
                  </h4>
                  <p className="text-blue-100 text-base leading-relaxed">
                    Since there are <span className="font-bold text-yellow-300">no players on the field yet</span>, 
                    you cannot form tactical icons (Pass/Press). Therefore, the Team Action phase is 
                    <span className="font-bold text-yellow-300"> automatically skipped</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* What to do */}
            <div className="bg-green-900/30 rounded-xl p-6 border-2 border-green-400/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">✨</div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">
                    What should you do?
                  </h4>
                  <ol className="text-green-100 text-base space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-300">1.</span>
                      <span>Select a player card from your hand at the bottom</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-300">2.</span>
                      <span>Click on a highlighted zone on the field to place it</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-green-300">3.</span>
                      <span>Start building your tactical formation!</span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Turn flow preview */}
            <div className="bg-purple-900/30 rounded-xl p-6 border-2 border-purple-400/20">
              <div className="flex items-start gap-4">
                <div className="text-4xl">📋</div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-white mb-3">
                    Normal Turn Flow
                  </h4>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex-1 bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600">
                      <div className="text-2xl mb-1">⚡</div>
                      <div className="font-bold text-white">Team Action</div>
                      <div className="text-gray-400 text-xs mt-1">Pass/Press</div>
                    </div>
                    <div className="text-white text-xl">→</div>
                    <div className="flex-1 bg-blue-600/50 rounded-lg p-3 text-center border-2 border-blue-400">
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="font-bold text-white">Athlete Action</div>
                      <div className="text-blue-200 text-xs mt-1">Place/Shoot</div>
                    </div>
                    <div className="text-white text-xl">→</div>
                    <div className="flex-1 bg-gray-700/50 rounded-lg p-3 text-center border border-gray-600">
                      <div className="text-2xl mb-1">✓</div>
                      <div className="font-bold text-white">End Turn</div>
                      <div className="text-gray-400 text-xs mt-1">Switch</div>
                    </div>
                  </div>
                  <div className="mt-3 text-center text-xs text-purple-200">
                    From the 2nd turn onwards, you'll follow this complete flow
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-blue-900/50 px-8 py-4 border-t-2 border-blue-400/30 flex justify-between items-center">
            <div className="text-sm text-blue-200">
              💡 This guide will auto-close in {Math.ceil(autoHideDelay / 1000)}s
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDismiss}
              className="bg-white text-blue-900 px-6 py-2 rounded-lg font-bold hover:bg-blue-100 transition-colors"
            >
              Got it! 👍
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
