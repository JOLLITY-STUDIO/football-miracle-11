import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';

interface Props {
  allPlayers: PlayerCard[];
  onConfirm: (starters: PlayerCard[], subs: PlayerCard[]) => void;
}

const SquadSelect: React.FC<Props> = ({ allPlayers, onConfirm }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sortedPlayers = useMemo(() => {
    const typeOrder = { defender: 0, midfielder: 1, forward: 2 };
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
    } else if (newSelected.size < 10) {
      newSelected.add(card.id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirm = () => {
    if (selectedIds.size !== 10) return;
    const starters = sortedPlayers.filter(p => selectedIds.has(p.id));
    const subs = sortedPlayers.filter(p => !selectedIds.has(p.id));
    onConfirm(starters, subs);
  };

  const autoSelect = () => {
    const byType: { defender: PlayerCard[]; midfielder: PlayerCard[]; forward: PlayerCard[] } = { defender: [], midfielder: [], forward: [] };
    sortedPlayers.forEach(p => {
      if (p.type === 'defender' || p.type === 'midfielder' || p.type === 'forward') {
        byType[p.type].push(p);
      }
    });
    
    const selected = new Set<string>();
    const needDefenders = Math.min(4, byType.defender.length);
    const needMidfielders = Math.min(4, byType.midfielder.length);
    const needForwards = Math.max(2, 10 - needDefenders - needMidfielders);
    
    byType.defender.slice(0, needDefenders).forEach(p => selected.add(p.id));
    byType.midfielder.slice(0, needMidfielders).forEach(p => selected.add(p.id));
    byType.forward.slice(0, needForwards).forEach(p => selected.add(p.id));
    
    setSelectedIds(selected);
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-50 font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-[#2a2a2a] rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col"
        >
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-yellow-400 mb-2 tracking-wider">
              📋 SQUAD SELECTION
            </div>
            <div className="text-gray-400 font-['Roboto']">
              Choose <span className="text-white font-bold">10</span> Starters • The rest will be Substitutes
            </div>
            <div className="mt-4 flex justify-center gap-8 text-lg">
              <span className={`px-4 py-1 rounded-full ${selectedIds.size === 10 ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-stone-800 text-stone-400'}`}>
                Starters: {selectedIds.size}/10
              </span>
              <span className={`px-4 py-1 rounded-full ${13 - selectedIds.size === 3 ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-stone-800 text-stone-400'}`}>
                Subs: {13 - selectedIds.size}/3
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-5 gap-4">
              {sortedPlayers.map((card, index) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => toggleSelect(card)}
                  className={`cursor-pointer transition-all duration-200 relative p-2 rounded-xl ${
                    selectedIds.has(card.id)
                      ? 'bg-green-900/20 ring-2 ring-green-500 transform scale-105'
                      : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <PlayerCardComponent
                    card={card}
                    size="small"
                  />
                  {selectedIds.has(card.id) ? (
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="absolute top-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-[#2a2a2a]"
                    >
                      ✓
                    </motion.div>
                  ) : (
                     <div className="absolute top-0 right-0 w-8 h-8 bg-stone-700 rounded-full flex items-center justify-center shadow-lg z-10 border-2 border-[#2a2a2a] text-xs text-stone-400">
                       SUB
                     </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 flex justify-center gap-6 border-t border-gray-700 pt-6">
            <button
              onClick={autoSelect}
              className="px-8 py-3 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-bold transition-colors shadow-lg flex items-center gap-2"
            >
              <span>🤖</span> AUTO-SELECT
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedIds.size !== 10}
              className={`px-12 py-3 rounded-lg font-bold text-lg transition-all shadow-xl flex items-center gap-2 ${
                selectedIds.size === 10
                  ? 'bg-green-600 hover:bg-green-500 text-white transform hover:scale-105'
                  : 'bg-stone-700 text-stone-500 cursor-not-allowed'
              }`}
            >
              <span>✓</span> CONFIRM SQUAD
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SquadSelect;
