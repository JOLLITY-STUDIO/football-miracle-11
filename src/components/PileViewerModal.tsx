import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SynergyCardComponent } from './SynergyCard';
import type { SynergyCard } from '../data/cards';

interface Props {
  isOpen: boolean;
  title: string;
  cards: SynergyCard[];
  onClose: () => void;
  type: 'deck' | 'discard';
}

export const PileViewerModal: React.FC<Props> = ({ isOpen, title, cards, onClose, type }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-stone-900 border-2 border-stone-700 rounded-xl p-6 w-[90vw] max-w-4xl max-h-[80vh] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type === 'deck' ? '🎴' : '🗑️'}</span>
                <h2 className="text-2xl font-bold text-white uppercase tracking-widest">{title}</h2>
                <span className="text-white/40 font-mono text-sm">({cards.length})</span>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-2 custom-scrollbar">
              {cards.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/20 gap-4">
                  <span className="text-4xl">{type === 'deck' ? '📭' : '🧹'}</span>
                  <p className="text-lg uppercase tracking-widest">Empty Pile</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cards.map((card, index) => (
                    <div key={`${card.id}-${index}`} className="relative group">
                       {/* Index Badge */}
                       <div className="absolute -top-2 -left-2 w-6 h-6 bg-black/80 border border-white/20 rounded-full flex items-center justify-center text-xs text-white/60 z-10 font-mono">
                         {index + 1}
                       </div>
                       
                       <SynergyCardComponent 
                         card={card} 
                         size="normal"
                         disabled={true} // View only
                       />
                       
                       {/* Type Overlay if needed */}
                       {type === 'deck' && (
                         <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors pointer-events-none rounded-lg" />
                       )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
               <button 
                 onClick={onClose}
                 className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded text-sm font-bold uppercase tracking-widest transition-colors"
               >
                 Close
               </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

