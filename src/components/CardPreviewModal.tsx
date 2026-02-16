import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AthleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';

interface Props {
  isOpen: boolean;
  card: AthleteCard | null;
  onClose: () => void;
}

export const CardPreviewModal: React.FC<Props> = ({ isOpen, card, onClose }) => {
  if (!isOpen || !card) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="relative max-w-4xl max-h-[80vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-2xl text-white mb-6 tracking-wider text-center">
            PLAYER CARD
          </div>

          {/* Card Display */}
          <div className="flex items-center justify-center">
            <AthleteCardComponent 
              card={card} 
              size="xlarge"
              faceDown={false}
              variant="home"
              disabled={false}
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="mt-8 px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105"
          >
            CLOSE
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
