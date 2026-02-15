import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { penaltyCards, penaltyDefenseCards, penaltyDefenseCoverage } from '../data/cards';

interface Props {
  isOpen: boolean;
  onComplete: (playerPoints: number, aiPoints: number) => void;
}

// 5 Attack Zones (Left to Right)
const ATTACK_ZONES = [1, 2, 3, 4, 5];

// 点球位置映射
const PENALTY_POSITIONS = [
  { zone: 1, name: '左上', icon: '↖️' },
  { zone: 2, name: '左下', icon: '↙️' },
  { zone: 3, name: '中间', icon: '⬇️' },
  { zone: 4, name: '右上', icon: '↗️' },
  { zone: 5, name: '右下', icon: '↘️' },
];

// 获取防守卡的覆盖范围
const getDefenseCoverage = (defenseCard: typeof penaltyDefenseCards[0]) => {
  return penaltyDefenseCoverage[defenseCard.id] || [];
};

// 获取守门员X轴偏移量
const getKeeperXOffset = (defenseCard: typeof penaltyDefenseCards[0]) => {
  const coverage = getDefenseCoverage(defenseCard);
  if (coverage.length === 0) {
    return 0; // 判断失误，站在原�?  } else if (coverage.includes('左上') || coverage.includes('左下')) {
    return -120; // 向左移动
  } else if (coverage.includes('右上') || coverage.includes('右下')) {
    return 120; // 向右移动
  } else {
    return 0; // 中间位置
  }
};

// 获取守门员旋转角度
const getKeeperRotation = (defenseCard: typeof penaltyDefenseCards[0]) => {
  const coverage = getDefenseCoverage(defenseCard);
  if (coverage.length === 0) {
    return 0; // 判断失误，直立
  } else if (coverage.includes('左上') || coverage.includes('左下')) {
    return -20; // 向左倾斜
  } else if (coverage.includes('右上') || coverage.includes('右下')) {
    return 20; // 向右倾斜
  } else {
    return 0; // 直立
  }
};

export const PenaltyModal: React.FC<Props> = ({ isOpen, onComplete }) => {
  const [phase, setPhase] = useState<'aim' | 'result'>('aim');
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  const [aiDefenseCard, setAiDefenseCard] = useState<typeof penaltyDefenseCards[0] | null>(null);
  const [result, setResult] = useState<'goal' | 'saved' | null>(null);
  const [shuffledDefenseCards, setShuffledDefenseCards] = useState<typeof penaltyDefenseCards>([]);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      // 洗牌：每次打开点球模态框时重新洗牌
      const shuffled = [...penaltyDefenseCards].sort(() => Math.random() - 0.5);
      setShuffledDefenseCards(shuffled);
      
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

    // Get player penalty card based on zone
    const athleteCard = penaltyCards[selectedZone - 1];
    
    // AI selects random defense card from shuffled deck
    const availableCards = shuffledDefenseCards.length > 0 ? shuffledDefenseCards : penaltyDefenseCards;
    const aiCard = availableCards[Math.floor(Math.random() * availableCards.length)];
    if (!aiCard) return;

    setAiDefenseCard(aiCard);

    // Get defense card coverage
    const defenseCoverage = getDefenseCoverage(aiCard);
    
    // Extract shot position from player card name (e.g., "点球-左上" -> "左上")
    const shotPosition = athleteCard.name.split('-')[1];
    
    // Check Result
    // Goal if shot position is NOT in defense coverage
    const isGoal = !defenseCoverage.includes(shotPosition);
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
                     ? `translateX(${getKeeperXOffset(aiDefenseCard)}px) translateY(20px) rotate(${getKeeperRotation(aiDefenseCard)}deg)`
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
                 {/* Player Attack Cards (Flat Design) */}
                 <div className="flex gap-4">
                   {ATTACK_ZONES.map(z => (
                     <motion.div
                       key={z}
                       whileHover={{ y: -10 }}
                       onClick={() => handleZoneSelect(z)}
                       className={clsx(
                         "w-24 h-32 rounded-lg border-2 border-black/30 overflow-hidden cursor-pointer transition-colors shadow-lg",
                         selectedZone === z ? "ring-2 ring-red-500 ring-offset-2 ring-offset-black" : ""
                       )}
                     >
                       {/* Flat Design Attack Card */}
                       <div className="h-full flex">
                         {/* Left Half: Red Background */}
                         <div className="relative w-1/2 h-full border-r border-black/30 bg-gradient-to-br from-red-500 to-red-700">
                           <div className="w-full h-full flex items-center justify-center">
                             <span className="text-3xl">👟</span>
                           </div>
                            
                           {/* Attack Icon */}
                           <div className="absolute bottom-2 left-2 w-5 h-5 rounded bg-white/20 flex items-center justify-center">
                             <span className="text-xs font-black text-white">⚔️</span>
                           </div>
                         </div>
                         
                         {/* Right Half: White Info Area */}
                         <div className="relative w-1/2 h-full bg-white flex flex-col justify-center items-center px-1">
                           <div className="flex flex-col items-center justify-center space-y-2">
                             {/* Position Label */}
                             <div className="bg-red-600 px-1.5 py-0.5 rounded-md">
                               <span className="text-[8px] font-black tracking-wider text-white">ATTACK</span>
                             </div>
                              
                             {/* Zone Number */}
                             <div className="text-sm font-black tracking-wider text-center leading-none text-red-800">
                               ZONE #{z}
                             </div>
                              
                             {/* Skill Icon */}
                             <div className="flex items-center justify-center">
                               <div className="w-4 h-4 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-500">
                                 <span className="text-xs font-bold text-red-800">+1</span>
                               </div>
                             </div>
                           </div>
                         </div>
                       </div>
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
                   {result === 'goal' ? '�?GOAL!' : '🧤 SAVED!'}
                 </div>
                 
                 {/* Reveal AI Card */}
                 {aiDefenseCard && (
                   <motion.div 
                     initial={{ rotateY: 90, opacity: 0 }}
                     animate={{ rotateY: 0, opacity: 1 }}
                     className="w-40 h-56 rounded-xl border-2 border-black/30 overflow-hidden shadow-2xl"
                   >
                     {/* Flat Design Card */}
                     <div className="h-full flex">
                       {/* Left Half: Orange Background */}
                       <div className="relative w-1/2 h-full border-r border-black/30 bg-gradient-to-br from-orange-500 to-orange-700">
                         <div className="w-full h-full flex items-center justify-center">
                           <div className="text-6xl">🧤</div>
                         </div>
                          
                         {/* Goal Icon */}
                         <div className="absolute bottom-2 left-2 w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                           <span className="text-xs font-black text-white">🥅</span>
                         </div>
                       </div>
                       
                       {/* Right Half: White Info Area */}
                       <div className="relative w-1/2 h-full bg-white flex flex-col justify-center items-center px-2">
                         <div className="flex flex-col items-center justify-center space-y-3">
                           {/* Position Label */}
                           <div className="bg-orange-600 px-2 py-0.5 rounded-md">
                             <span className="text-xs font-black tracking-wider text-white">DEFENSE</span>
                           </div>
                           
                           {/* Card Name */}
                           <div className="text-xs font-black tracking-wider text-center leading-none text-orange-800">
                             {aiDefenseCard.name}
                           </div>
                           
                           {/* Coverage */}
                           <div className="flex gap-1">
                             {aiDefenseCard.coverage.map(c => (
                               <span key={c} className="w-6 h-6 rounded bg-orange-100 text-orange-800 flex items-center justify-center font-bold text-xs border border-orange-300">
                                 {c}
                               </span>
                             ))}
                           </div>
                         </div>
                       </div>
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

