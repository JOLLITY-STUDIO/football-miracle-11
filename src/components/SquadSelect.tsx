import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';
import { playSound } from '../utils/audio';

interface Props {
  allPlayers: PlayerCard[];
  onConfirm: (starters: PlayerCard[], subs: PlayerCard[]) => void;
}

const SquadSelect: React.FC<Props> = ({ allPlayers, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sortedPlayers = useMemo(() => {
    const typeOrder = { forward: 0, midfielder: 1, defender: 2 }; // Sort by position
    return [...allPlayers].sort((a, b) => {
      const orderA = typeOrder[a.type as keyof typeof typeOrder] ?? 3;
      const orderB = typeOrder[b.type as keyof typeof typeOrder] ?? 3;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name);
    });
  }, [allPlayers]);

  const toggleSelect = (card: PlayerCard) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(card.id)) {
      newSelected.delete(card.id);
      playSound('click');
    } else if (newSelected.size < 10) {
      newSelected.add(card.id);
      playSound('draw');
    } else {
      playSound('error');
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    if (selectedIds.size !== 10) {
      playSound('error');
      return;
    }
    playSound('whistle');
    const starters = sortedPlayers.filter(p => selectedIds.has(p.id));
    const subs = sortedPlayers.filter(p => !selectedIds.has(p.id));
    onConfirm(starters, subs);
  };

  const autoSelect = () => {
    playSound('click');
    const byType: { defender: PlayerCard[]; midfielder: PlayerCard[]; forward: PlayerCard[] } = { defender: [], midfielder: [], forward: [] };
    sortedPlayers.forEach(p => {
      if (p.type === 'defender' || p.type === 'midfielder' || p.type === 'forward') {
        byType[p.type].push(p);
      }
    });
    
    const selected = new Set<string>();
    // Select best players based on position distribution
    const needForwards = Math.min(3, byType.forward.length);
    const needMidfielders = Math.min(4, byType.midfielder.length);
    const needDefenders = Math.min(3, byType.defender.length);
    
    byType.forward.slice(0, needForwards).forEach(p => selected.add(p.id));
    byType.midfielder.slice(0, needMidfielders).forEach(p => selected.add(p.id));
    byType.defender.slice(0, needDefenders).forEach(p => selected.add(p.id));
    
    // Fill remaining if needed
    if (selected.size < 10) {
      sortedPlayers.forEach(p => {
        if (selected.size < 10 && !selected.has(p.id)) {
          selected.add(p.id);
        }
      });
    }
    
    setSelectedIds(selected);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100] font-['Russo_One']"
      >
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-500/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10 max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col perspective-1000"
        >
          {/* Header */}
          <div className="relative z-10 flex flex-col items-center mb-4">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-black text-white mb-1 tracking-tighter flex items-center gap-3"
            >
              <span className="text-yellow-400 text-2xl">/</span> 
              SELECT SQUAD
              <span className="text-yellow-400 text-2xl">/</span>
            </motion.div>
            
            <div className="flex items-center gap-8 mt-2">
              <div className="flex flex-col items-center">
                <div className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Starters Required</div>
                <div className={`text-2xl font-black tabular-nums transition-colors ${selectedIds.size === 10 ? 'text-green-400' : 'text-white'}`}>
                  {selectedIds.size} <span className="text-sm text-white/20">/ 10</span>
                </div>
              </div>
              
              <div className="w-px h-8 bg-white/10" />
              
              <div className="flex flex-col items-center">
                <div className="text-[9px] text-white/40 uppercase tracking-widest mb-0.5">Substitutes</div>
                <div className="text-2xl font-black tabular-nums text-white/60">
                  {Math.max(0, allPlayers.length - selectedIds.size)} <span className="text-sm text-white/20">/ {allPlayers.length - 10}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Grid */}
          <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar mask-fade-edges">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {sortedPlayers.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: index * 0.03, type: 'spring', damping: 15 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleSelect(card)}
                  className="relative group cursor-pointer"
                >
                  <div className={`absolute -inset-1 rounded-xl blur-md transition-opacity duration-300 ${
                    selectedIds.has(card.id) ? 'bg-green-500/20 opacity-100' : 'bg-white/5 opacity-0 group-hover:opacity-100'
                  }`} />
                  
                  <div className={`relative bg-stone-900/40 rounded-lg overflow-hidden transition-all duration-300 border-2 ${
                    selectedIds.has(card.id) ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : 'border-white/5 hover:border-white/20'
                  }`}>
                    <PlayerCardComponent
                      card={card}
                      size="small"
                    />
                    
                    {/* Status Overlay */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-colors duration-300 ${
                      selectedIds.has(card.id) ? 'bg-green-500/5' : 'bg-transparent'
                    }`}>
                      <AnimatePresence>
                        {selectedIds.has(card.id) && (
                          <motion.div 
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
                          >
                            <span className="text-white text-lg">✓</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {!selectedIds.has(card.id) && (
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded border border-white/10">
                        <span className="text-[8px] font-black text-white/40">SUB</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
            <button
              onClick={autoSelect}
              className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <span className="text-lg group-hover:rotate-12 transition-transform">🤖</span>
              <div className="text-left">
                <div className="text-[8px] text-white/40 uppercase tracking-widest font-black">Optimization</div>
                <div className="text-xs font-black text-white">AUTO SELECT</div>
              </div>
            </button>

            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <div className="text-[8px] text-white/40 uppercase tracking-widest font-black">Status</div>
                <div className={`text-xs font-black ${selectedIds.size === 10 ? 'text-green-400' : 'text-yellow-500'}`}>
                  {selectedIds.size === 10 ? 'READY TO PLAY' : `NEED ${10 - selectedIds.size} MORE`}
                </div>
              </div>

              <motion.button
                whileHover={selectedIds.size === 10 ? { scale: 1.05 } : {}}
                whileTap={selectedIds.size === 10 ? { scale: 0.95 } : {}}
                onClick={handleConfirm}
                disabled={selectedIds.size !== 10}
                className={`px-8 py-3 rounded-xl font-black text-lg tracking-tight transition-all shadow-2xl flex items-center gap-2 ${
                  selectedIds.size === 10
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300 shadow-yellow-400/20'
                    : 'bg-white/5 text-white/20 cursor-not-allowed grayscale'
                }`}
              >
                CONFIRM SQUAD
                <span className="text-xl">→</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SquadSelect;
