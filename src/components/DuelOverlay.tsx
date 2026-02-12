import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard, SynergyCard, ShotResult, DuelPhase } from '../game/gameLogic';
import { PlayerCardComponent } from './PlayerCard';
import { SynergyCardComponent } from './SynergyCard';
import clsx from 'clsx';

interface DuelOverlayProps {
  duelPhase: DuelPhase;
  attacker: PlayerCard;
  defender: PlayerCard | null;
  attackSynergy: SynergyCard[];
  defenseSynergy: SynergyCard[];
  attackPower: number;
  defensePower: number;
  result: ShotResult;
  activatedSkills: {
    attackerSkills: string[];
    defenderSkills: string[];
  };
  onAdvance: () => void;
  isPlayerAttacking: boolean;
  attackerUsedShotIcons?: number[];
  onShotIconSelect?: (iconIndex: number) => void;
}

export const DuelOverlay: React.FC<DuelOverlayProps> = ({
  duelPhase,
  attacker,
  defender,
  attackSynergy,
  defenseSynergy,
  attackPower,
  defensePower,
  result,
  activatedSkills,
  onAdvance,
  isPlayerAttacking,
  attackerUsedShotIcons,
  onShotIconSelect
}) => {
  const [displayAttackPower, setDisplayAttackPower] = useState(0);
  const [displayDefensePower, setDisplayDefensePower] = useState(0);
  const [selectedShotIcon, setSelectedShotIcon] = useState<number | null>(null);

  // Handle shot icon selection
  const handleShotIconConfirm = () => {
    if (selectedShotIcon !== null && onShotIconSelect) {
      onShotIconSelect(selectedShotIcon);
      setSelectedShotIcon(null);
    }
  };

  // Auto-advance logic
  useEffect(() => {
    if (duelPhase !== 'none' && duelPhase !== 'result') {
      // Different delays for different phases for better rhythm
      const delays: Record<DuelPhase, number> = {
        'none': 0,
        'init': 2500,           // Longer intro
        'select_shot_icon': 0,   // Manual selection - no auto advance
        'reveal_attacker': 2000,
        'reveal_defender': 2000,
        'reveal_synergy': 3500,  // Longer for synergy reveal & flip
        'reveal_skills': 3000,   // Longer for skill activation
        'summary': 4000,         // Time for summary reading
        'result': 0              // Wait for manual click
      };
      
      const timer = setTimeout(() => {
        onAdvance();
      }, delays[duelPhase] || 1500);
      
      return () => clearTimeout(timer);
    }
  }, [duelPhase, onAdvance]);

  // AI auto-select shot icon with visible delay
  useEffect(() => {
    if (duelPhase === 'select_shot_icon' && !isPlayerAttacking && onShotIconSelect) {
      const allAttackIndices: number[] = ((attacker as any).iconPositions || [])
        .map((p: any, idx: number) => (p.type === 'attack' ? idx : -1))
        .filter((idx: number) => idx >= 0);
      const available = allAttackIndices.filter(idx => !(attackerUsedShotIcons || []).includes(idx));
      const choice = available[0] ?? null;
      if (choice !== null) {
        const t = setTimeout(() => onShotIconSelect(choice), 1200);
        return () => clearTimeout(t);
      }
    }
  }, [duelPhase, isPlayerAttacking, onShotIconSelect, attacker, attackerUsedShotIcons]);

  // Power counter animation
  useEffect(() => {
    if (duelPhase === 'reveal_attacker') {
      const baseAttack = attacker.icons.filter(i => i === 'attack').length;
      setDisplayAttackPower(baseAttack);
    } else if (duelPhase === 'reveal_defender') {
      if (defender) {
        const baseDef = defender.icons.filter(i => i === 'defense').length;
        setDisplayDefensePower(baseDef);
      }
    } else if (duelPhase === 'reveal_synergy') {
      // Animate synergy addition
      const synergyStars = attackSynergy.reduce((sum, c) => sum + c.stars, 0);
      const defSynergyStars = defenseSynergy.reduce((sum, c) => sum + c.stars, 0);
      
      // Reveal cards first, then add power
      const timer = setTimeout(() => {
        setDisplayAttackPower(prev => prev + synergyStars);
        setDisplayDefensePower(prev => prev + defSynergyStars);
      }, 1000); // Wait 1s for the card flip animation feel
      return () => clearTimeout(timer);
    } else if (duelPhase === 'reveal_skills') {
      // Show skill bonuses
      const attackerSkillBonus = activatedSkills.attackerSkills.length;
      const defenderSkillBonus = activatedSkills.defenderSkills.length;
      
      const timer = setTimeout(() => {
        if (attackerSkillBonus > 0) setDisplayAttackPower(prev => prev + attackerSkillBonus);
        if (defenderSkillBonus > 0) setDisplayDefensePower(prev => prev + defenderSkillBonus);
      }, 800);
      return () => clearTimeout(timer);
    } else if (duelPhase === 'summary' || duelPhase === 'result') {
      setDisplayAttackPower(attackPower);
      setDisplayDefensePower(defensePower);
    }
  }, [duelPhase, attacker, defender, attackSynergy, defenseSynergy, attackPower, defensePower, activatedSkills]);

  if (duelPhase === 'none') return null;

  const getPhaseInfo = () => {
    switch (duelPhase) {
      case 'init': return { stage: 'Stage 1: Preparation', step: 'Step 1.1: Initialization', desc: 'Attacker and Defender meet for a decisive moment.' };
      case 'reveal_attacker': return { stage: 'Stage 2: Base Power', step: 'Step 2.1: Attacker Base', desc: 'Calculating the striker\'s fundamental power.' };
      case 'reveal_defender': return { stage: 'Stage 2: Base Power', step: 'Step 2.2: Defender Base', desc: 'Measuring the wall\'s initial resistance.' };
      case 'reveal_synergy': return { stage: 'Stage 3: Buffs', step: 'Step 3.1: Synergy Reveal', desc: 'Revealing face-down synergy cards for both teams.' };
      case 'reveal_skills': return { stage: 'Stage 3: Buffs', step: 'Step 3.2: Skill Activation', desc: 'Special player abilities and mental triggers!' };
      case 'summary': return { stage: 'Stage 4: Conclusion', step: 'Step 4.1: Final Comparison', desc: 'Total forces compared. Who will prevail?' };
      case 'result': return { stage: 'Stage 4: Conclusion', step: 'Step 4.2: Final Outcome', desc: 'The dust settles. The whistle blows.' };
      default: return { stage: '', step: '', desc: '' };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* Background Particles/Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-500/20 via-transparent to-red-500/20 rounded-full blur-[120px]" 
        />
      </div>

      <div className="relative w-full h-full max-w-7xl flex flex-col items-center justify-center">
        
        {/* Phase Info Overlay */}
        <motion.div 
          key={duelPhase}
          initial={{ opacity: 0, y: -40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          className="absolute top-10 flex flex-col items-center gap-2"
        >
          <div className="px-4 py-1 bg-white/10 rounded-full border border-white/20">
            <div className="text-yellow-400 font-black tracking-[0.4em] uppercase text-[10px]">{phaseInfo.stage}</div>
          </div>
          <div className="text-5xl font-black tracking-tighter text-white uppercase italic drop-shadow-2xl">{phaseInfo.step}</div>
          <div className="text-white/50 text-xs font-bold tracking-[0.2em] mt-1 uppercase">{phaseInfo.desc}</div>
        </motion.div>

        <div className="flex items-center justify-between w-full px-16 gap-4">
          
          {/* Attacker Side */}
          <motion.div 
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-8 flex-1"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-blue-400 uppercase tracking-[0.3em]">Attacking Force</div>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
            </div>

            <div className="relative group">
               <motion.div 
                 animate={{ scale: [1, 1.05, 1] }}
                 transition={{ duration: 4, repeat: Infinity }}
                 className="absolute -inset-8 bg-blue-500/20 rounded-full blur-[60px] group-hover:bg-blue-500/30 transition-all duration-500" 
               />
               <PlayerCardComponent card={attacker} size="large" usedShotIcons={attackerUsedShotIcons} />
               
               {/* Shot Icon Selection */}
               {duelPhase === 'select_shot_icon' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="absolute -inset-4 bg-black/80 rounded-lg flex flex-col items-center justify-center gap-2 backdrop-blur-sm"
                 >
                   <div className="text-xs font-black text-white uppercase tracking-wider">Select Shot Icon</div>
                  <div className="flex gap-1">
                    {(attacker as any).iconPositions?.map((iconPos: any, index: number) => {
                      if (iconPos.type === 'attack') {
                        const isUsed = attackerUsedShotIcons?.includes(index);
                        const isSelected = selectedShotIcon === index;
                        return (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedShotIcon(index)}
                            className={clsx(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                              isUsed ? "bg-gray-800 text-gray-400 cursor-not-allowed" : 
                              isSelected ? "bg-blue-500 text-white ring-2 ring-blue-300" : 
                              "bg-white text-blue-600 hover:bg-blue-100"
                            )}
                            disabled={isUsed}
                          >
                            ⚽
                          </motion.button>
                        );
                      }
                      return null;
                    })}
                  </div>
                   {selectedShotIcon !== null && (
                     <motion.button
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       onClick={handleShotIconConfirm}
                       className="mt-2 px-4 py-1 bg-green-500 text-white text-xs font-black uppercase tracking-wider rounded-full hover:bg-green-600 transition-colors"
                     >
                       Confirm
                     </motion.button>
                   )}
                 </motion.div>
               )}
               
               {/* Attacker Power Badge */}
               <motion.div 
                 key={displayAttackPower}
                 initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                 animate={{ scale: 1, opacity: 1, rotate: 0 }}
                 className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-4 border-white flex flex-col items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] z-20"
               >
                 <span className="text-3xl font-black text-white italic">{displayAttackPower}</span>
                 <span className="text-[9px] font-black text-white/80 uppercase tracking-tighter">Power</span>
               </motion.div>
            </div>
               
            {/* Attacker Power Breakdown */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 w-56 text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-white/60">Base Strength</span>
                <span className="text-white text-sm">{attacker.icons.filter(i => i === 'attack').length}</span>
              </div>
              <div className={clsx("flex justify-between items-center transition-all duration-500", (duelPhase === 'reveal_synergy' || duelPhase === 'reveal_skills' || duelPhase === 'summary' || duelPhase === 'result') ? "text-blue-400 scale-105" : "opacity-20")}>
                <span>Synergy Boost</span>
                <span className="text-sm">+{attackSynergy.reduce((sum, c) => sum + c.stars, 0)}</span>
              </div>
              <div className={clsx("flex justify-between items-center transition-all duration-500", (duelPhase === 'reveal_skills' || duelPhase === 'summary' || duelPhase === 'result') ? "text-blue-400 scale-105" : "opacity-20")}>
                <span>Skill Activation</span>
                <span className="text-sm">+{activatedSkills.attackerSkills.length}</span>
              </div>
            </motion.div>

            {/* Attacker Activated Skills */}
            <div className="flex flex-wrap justify-center gap-2 h-10">
              <AnimatePresence>
                {(duelPhase === 'reveal_skills' || duelPhase === 'result') && activatedSkills.attackerSkills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg border border-white/40 shadow-xl uppercase tracking-[0.1em] italic"
                  >
                    {skill}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
               
            {/* Attack Synergy Reveal */}
            <div className="flex gap-3 h-28">
              <AnimatePresence>
                {(duelPhase !== 'none') && attackSynergy.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      rotateY: (duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender') ? 180 : 0, 
                      opacity: 1 
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 260, 
                      damping: 20,
                      delay: i * 0.15 
                    }}
                  >
                    <SynergyCardComponent 
                      card={card} 
                      size="small" 
                      faceDown={duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender'}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* VS Center */}
          <div className="flex flex-col items-center gap-6">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                filter: ['drop-shadow(0 0 20px rgba(255,255,255,0.4))', 'drop-shadow(0 0 50px rgba(255,255,255,0.8))', 'drop-shadow(0 0 20px rgba(255,255,255,0.4))']
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl font-black text-white italic drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]"
            >
              VS
            </motion.div>
            <div className="w-[1px] h-64 bg-gradient-to-b from-transparent via-white/30 to-transparent relative">
              <motion.div 
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 -translate-x-1/2 w-1.5 h-16 bg-gradient-to-b from-transparent via-yellow-400 to-transparent blur-[2px]"
              />
            </div>
          </div>

          {/* Defender Side */}
          <motion.div 
            initial={{ x: 200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-8 flex-1"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-xs font-black text-red-400 uppercase tracking-[0.3em]">Defensive Wall</div>
              <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-red-400 to-transparent" />
            </div>

            <div className="relative group min-h-[300px] flex items-center justify-center">
              {defender ? (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 2 }}
                    className="absolute -inset-8 bg-red-500/20 rounded-full blur-[60px] group-hover:bg-red-500/30 transition-all duration-500" 
                  />
                  <PlayerCardComponent card={defender} size="large" />
                  
                  {/* Defender Power Badge */}
                  <motion.div 
                    key={displayDefensePower}
                    initial={{ scale: 0.5, opacity: 0, rotate: 20 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    className="absolute -top-8 -left-8 w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-700 border-4 border-white flex flex-col items-center justify-center shadow-[0_0_40px_rgba(220,38,38,0.6)] z-20"
                  >
                    <span className="text-3xl font-black text-white italic">{displayDefensePower}</span>
                    <span className="text-[9px] font-black text-white/80 uppercase tracking-tighter">Power</span>
                  </motion.div>
                </>
              ) : (
                <div className="w-[200px] h-[280px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/10 bg-white/5 backdrop-blur-sm">
                  <span className="text-4xl mb-4 opacity-20">🛡️</span>
                  <span className="font-black uppercase tracking-[0.2em] text-[10px] text-center px-6">Open Goal - No Defender</span>
                </div>
              )}
            </div>

            {/* Defender Power Breakdown */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2 w-56 text-[10px] font-black uppercase tracking-widest text-white/40 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                <span className="text-white/60">Team Defense</span>
                <span className="text-white text-sm">{defender ? defender.icons.filter(i => i === 'defense').length : 0}</span>
              </div>
              <div className={clsx("flex justify-between items-center transition-all duration-500", (duelPhase === 'reveal_synergy' || duelPhase === 'reveal_skills' || duelPhase === 'summary' || duelPhase === 'result') ? "text-red-400 scale-105" : "opacity-20")}>
                <span>Synergy Boost</span>
                <span className="text-sm">+{defenseSynergy.reduce((sum, c) => sum + c.stars, 0)}</span>
              </div>
              <div className={clsx("flex justify-between items-center transition-all duration-500", (duelPhase === 'reveal_skills' || duelPhase === 'summary' || duelPhase === 'result') ? "text-red-400 scale-105" : "opacity-20")}>
                <span>Skill Activation</span>
                <span className="text-sm">+{activatedSkills.defenderSkills.length}</span>
              </div>
            </motion.div>

            {/* Defender Activated Skills */}
            <div className="flex flex-wrap justify-center gap-2 h-10">
              <AnimatePresence>
                {(duelPhase === 'reveal_skills' || duelPhase === 'result') && activatedSkills.defenderSkills.map((skill, i) => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    className="px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-lg border border-white/40 shadow-xl uppercase tracking-[0.1em] italic"
                  >
                    {skill}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Defense Synergy Reveal */}
            <div className="flex gap-3 h-28">
              <AnimatePresence>
                {(duelPhase !== 'none') && defenseSynergy.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      rotateY: (duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender') ? 180 : 0, 
                      opacity: 1 
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 260, 
                      damping: 20,
                      delay: i * 0.15 
                    }}
                  >
                    <SynergyCardComponent 
                      card={card} 
                      size="small" 
                      faceDown={duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender'}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Summary Overlay */}
        <AnimatePresence>
          {duelPhase === 'summary' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              className="absolute inset-0 flex items-center justify-center z-40 bg-black/40 backdrop-blur-sm"
            >
              <div className="bg-gradient-to-b from-stone-800 to-stone-900 border-2 border-white/20 p-10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col items-center gap-6 max-w-md w-full mx-4">
                <div className="text-yellow-400 font-black tracking-[0.4em] uppercase text-xs">Duel Summary</div>
                <div className="w-full flex justify-between items-center text-white px-4">
                  <div className="flex flex-col items-center">
                    <div className="text-blue-400 text-xs font-bold uppercase mb-1">Attack</div>
                    <div className="text-6xl font-black italic">{attackPower}</div>
                  </div>
                  <div className="text-4xl font-black italic text-white/20">VS</div>
                  <div className="flex flex-col items-center">
                    <div className="text-red-400 text-xs font-bold uppercase mb-1">Defense</div>
                    <div className="text-6xl font-black italic">{defensePower}</div>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-white/10" />
                
                <div className="w-full flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-blue-400/80">
                      <span>Attacker Breakdown</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/80 bg-white/5 px-3 py-1.5 rounded border border-white/5">
                      <span>Base + Synergy + Skills</span>
                      <span className="font-mono">
                        {attacker.icons.filter(i => i === 'attack').length} + {attackSynergy.reduce((sum, c) => sum + c.stars, 0)} + {activatedSkills.attackerSkills.length} = {attackPower}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-red-400/80">
                      <span>Defender Breakdown</span>
                    </div>
                    <div className="flex justify-between text-xs text-white/80 bg-white/5 px-3 py-1.5 rounded border border-white/5">
                      <span>Base + Synergy + Skills</span>
                      <span className="font-mono">
                        {defender ? defender.icons.filter(i => i === 'defense').length : 0} + {defenseSynergy.reduce((sum, c) => sum + c.stars, 0)} + {activatedSkills.defenderSkills.length} = {defensePower}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-white/10" />
                <div className="text-center text-white/60 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {attackPower > defensePower ? (
                    <span className="text-blue-400 animate-pulse">The attack breaks through!</span>
                  ) : attackPower === defensePower ? (
                    <span className="text-yellow-400 animate-pulse">A perfect balance of forces!</span>
                  ) : (
                    <span className="text-red-400 animate-pulse">The defense holds firm!</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Announcement */}
        <AnimatePresence>
          {duelPhase === 'result' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="absolute bottom-10 flex flex-col items-center gap-4 z-50"
            >
              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className={clsx(
                  "text-9xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_60px_rgba(255,255,255,0.5)]",
                  (result === 'goal' || result === 'magicNumber') ? "text-yellow-400" : "text-gray-400"
                )}
              >
                {result === 'goal' && "GOAL!"}
                {result === 'magicNumber' && "MAGIC!"}
                {result === 'saved' && "SAVED!"}
                {result === 'missed' && "MISSED!"}
              </motion.div>
              
              <div className="px-10 py-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xl flex items-center gap-8 shadow-2xl">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Final Attack</span>
                  <span className="text-4xl font-black italic text-white">{attackPower}</span>
                </div>
                <div className="w-[2px] h-10 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Final Defense</span>
                  <span className="text-4xl font-black italic text-white">{defensePower}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onAdvance}
                className="mt-4 px-12 py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-xl text-white font-black uppercase tracking-[0.3em] transition-all backdrop-blur-md shadow-xl"
              >
                Continue Match
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
