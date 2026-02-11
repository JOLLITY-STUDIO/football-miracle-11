import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onComplete: (playerPoints: number, aiPoints: number) => void;
}

// 5 Attack Zones (Left to Right)
const ATTACK_ZONES = [1, 2, 3, 4, 5];

// 5 Defense Cards with coverage
const DEFENSE_CARDS = [
  { id: 'save_far_left', name: 'Far Left Dive', coverage: [1, 2], icon: '⬅️' },
  { id: 'save_left', name: 'Left Dive', coverage: [2, 3], icon: '↙️' },
  { id: 'save_center', name: 'Center Block', coverage: [3], icon: '✋' },
  { id: 'save_right', name: 'Right Dive', coverage: [3, 4], icon: '↘️' },
  { id: 'save_far_right', name: 'Far Right Dive', coverage: [4, 5], icon: '➡️' },
];

export const PenaltyModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const [phase, setPhase] = useState<'aim' | 'result'>('aim');
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [aiDefenseCard, setAiDefenseCard] = useState<typeof DEFENSE_CARDS[0] | null>(null);
  const [result, setResult] = useState<'goal' | 'saved' | null>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setPhase('aim');
      setSelectedZone(null);
      setAiDefenseCard(null);
      setResult(null);
    }
  }, [isOpen]);

  const handleZoneSelect = (zone: number) => {
    if (phase !== 'aim') return;
    setSelectedZone(zone);
  };

  const handleShoot = () => {
    if (selectedZone === null) return;

    // AI Randomly picks a defense card
    const randomDefense = DEFENSE_CARDS[Math.floor(Math.random() * DEFENSE_CARDS.length)];
    if (!randomDefense) return;

    setAiDefenseCard(randomDefense);

    // Check Result
    // Goal if selectedZone is NOT in coverage
    const isGoal = !randomDefense.coverage.includes(selectedZone);
    setResult(isGoal ? 'goal' : 'saved');
    setPhase('result');

    // Report back after delay
    setTimeout(() => {
      onComplete(isGoal ? 1 : 0, isGoal ? 0 : 1); // 1-0 for goal, 0-1 for save (simplified points)
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-4xl h-[80vh] flex flex-col items-center"
        >
          {/* Header */}
          <div className="text-4xl text-white mb-8 tracking-wider drop-shadow-lg text-center">
            PENALTY KICK
            <div className="text-sm text-gray-400 font-sans mt-2 font-normal">
              {phase === 'aim' ? 'Select a target zone to shoot!' : 'Result...'}
            </div>
          </div>

          {/* Goal Visual */}
          <div className="relative w-[600px] h-[300px] border-t-8 border-x-8 border-white/80 rounded-t-lg bg-gradient-to-b from-black/50 to-green-900/20 mb-8 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)]">
            {/* Net Texture */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diamond-upholstery.png')]"></div>
            
            {/* Goalkeeper Placeholder */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-40 bg-contain bg-no-repeat bg-center z-10 transition-all duration-500"
                 style={{
                   backgroundImage: "url('images/player_card_2.webp')", // Placeholder keeper
                   filter: 'grayscale(1) brightness(0.5)',
                   transform: phase === 'result' && aiDefenseCard
                     ? `translateX(${((aiDefenseCard.coverage[0] ?? 3) - 3) * 60}px) translateY(20px) rotate(${aiDefenseCard.id.includes('left') ? -20 : aiDefenseCard.id.includes('right') ? 20 : 0}deg)`
                     : 'translateX(-50%)'
                 }}
            />

            {/* Hit Zones */}
            <div className="absolute inset-0 grid grid-cols-5 h-full">
              {ATTACK_ZONES.map((zone) => (
                <div 
                  key={zone}
                  onClick={() => handleZoneSelect(zone)}
                  className={clsx(
                    "relative border-r border-white/10 last:border-r-0 flex items-center justify-center group cursor-pointer transition-all duration-200",
                    selectedZone === zone && phase === 'aim' ? "bg-red-500/30" : "hover:bg-white/10",
                    phase === 'result' && selectedZone === zone ? (result === 'goal' ? "bg-green-500/50" : "bg-red-500/50") : ""
                  )}
                >
                  {/* Target Reticle */}
                  {selectedZone === zone && (
                    <motion.div 
                      layoutId="reticle"
                      className="w-16 h-16 border-4 border-red-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)]"
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </motion.div>
                  )}

                  {/* Zone Number (Debug/Guide) */}
                  <span className="absolute bottom-2 text-white/20 text-4xl font-bold group-hover:text-white/40">{zone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Controls / Cards Area */}
          <div className="flex-1 w-full flex flex-col items-center justify-center">
             {phase === 'aim' ? (
               <div className="flex flex-col items-center gap-6">
                 {/* Player Attack Cards (Visual Only for now) */}
                 <div className="flex gap-4">
                   {ATTACK_ZONES.map(z => (
                     <motion.div
                       key={z}
                       whileHover={{ y: -10 }}
                       onClick={() => handleZoneSelect(z)}
                       className={clsx(
                         "w-20 h-28 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-colors shadow-lg bg-gradient-to-b from-gray-800 to-black",
                         selectedZone === z ? "border-red-500 ring-2 ring-red-500 ring-offset-2 ring-offset-black" : "border-gray-600 hover:border-gray-400"
                       )}
                     >
                       <span className="text-2xl mb-1">🥅</span>
                       <span className="text-lg font-bold text-white">#{z}</span>
                     </motion.div>
                   ))}
                 </div>
                 
                 <button
                   onClick={handleShoot}
                   disabled={selectedZone === null}
                   className="px-12 py-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xl font-bold rounded-full shadow-[0_0_30px_rgba(220,38,38,0.5)] transition-all transform hover:scale-105"
                 >
                   SHOOT!
                 </button>
               </div>
             ) : (
               <div className="flex flex-col items-center gap-4">
                 <div className="text-6xl mb-4 animate-bounce">
                   {result === 'goal' ? '⚽ GOAL!' : '🧤 SAVED!'}
                 </div>
                 
                 {/* Reveal AI Card */}
                 {aiDefenseCard && (
                   <motion.div 
                     initial={{ rotateY: 90, opacity: 0 }}
                     animate={{ rotateY: 0, opacity: 1 }}
                     className="w-40 h-56 bg-gradient-to-br from-blue-800 to-blue-950 rounded-xl border-4 border-blue-500 flex flex-col items-center justify-center shadow-2xl"
                   >
                     <div className="text-6xl mb-2">{aiDefenseCard.icon}</div>
                     <div className="text-xl text-center px-2 font-bold text-white">{aiDefenseCard.name}</div>
                     <div className="mt-4 flex gap-1">
                        {aiDefenseCard.coverage.map(c => (
                          <span key={c} className="w-6 h-6 rounded bg-white text-blue-900 flex items-center justify-center font-bold text-xs">
                            {c}
                          </span>
                        ))}
                     </div>
                   </motion.div>
                 )}
               </div>
             )}
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
