import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard, SynergyCard, ShotResult, DuelPhase } from '../game/gameLogic';
import { PlayerCardComponent } from './PlayerCard';
import { SynergyCardComponent } from './SynergyCard';
import ShotIconSelector from './ShotIconSelector';
import AnimatedCounter from './AnimatedCounter';
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

  // Enhanced shot icon selection with better visual feedback
  const [isAIThinking, setIsAIThinking] = useState(false);
  
  // Screen shake effect for high-impact moments
  const [shouldShake, setShouldShake] = useState(false);
  
  // Countdown progress bar state
  const [progress, setProgress] = useState(100);
  
  const handleShotIconConfirm = () => {
    if (selectedShotIcon !== null && onShotIconSelect) {
      onShotIconSelect(selectedShotIcon);
      setSelectedShotIcon(null);
    }
  };

  // Create enhanced shot icon data for the selector
  const getShotIcons = () => {
    const icons: any[] = (attacker as any).iconPositions || [];
    return icons.map((iconPos: any, index: number) => ({
      index,
      type: iconPos.type,
      isUsed: attackerUsedShotIcons?.includes(index) || false,
      isSelected: selectedShotIcon === index,
      isAvailable: iconPos.type === 'attack' && !attackerUsedShotIcons?.includes(index)
    }));
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
      
      const delay = delays[duelPhase] || 1500;
      
      // Reset progress and start countdown
      setProgress(100);
      const interval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (delay / 50))));
      }, 50);
      
      const timer = setTimeout(() => {
        onAdvance();
      }, delay);
      
      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [duelPhase, onAdvance]);

  // AI auto-select shot icon with visible delay and thinking state
  useEffect(() => {
    if (duelPhase === 'select_shot_icon' && !isPlayerAttacking && onShotIconSelect) {
      setIsAIThinking(true);
      const allAttackIndices: number[] = ((attacker as any).iconPositions || [])
        .map((p: any, idx: number) => (p.type === 'attack' ? idx : -1))
        .filter((idx: number) => idx >= 0);
      const available = allAttackIndices.filter(idx => !(attackerUsedShotIcons || []).includes(idx));
      const choice = available[0] ?? null;
      if (choice !== null) {
        const t = setTimeout(() => {
          setIsAIThinking(false);
          onShotIconSelect(choice);
        }, 1200);
        return () => {
          clearTimeout(t);
          setIsAIThinking(false);
        };
      } else {
        setIsAIThinking(false);
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

  // Trigger screen shake on high-impact moments
  useEffect(() => {
    if (duelPhase === 'reveal_synergy') {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    } else if (duelPhase === 'result') {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 800);
      return () => clearTimeout(timer);
    }
  }, [duelPhase]);

  if (duelPhase === 'none') return null;

  const getPhaseInfo = () => {
    switch (duelPhase) {
      case 'init': return { stage: 'Stage 1: Preparation', step: 'Step 1.1: Initialization', desc: 'Attacker and Defender meet for a decisive moment.' };
      case 'reveal_attacker': return { stage: 'Stage 2: Base Power', step: 'Step 2.1: Attacker Base', desc: 'Calculating the striker\'s fundamental power.' };
      case 'reveal_defender': return { stage: 'Stage 2: Base Power', step: 'Step 2.2: Defender Base', desc: 'Measuring the wall\'s initial resistance.' };
      case 'defender_synergy_selection': return { stage: 'Stage 3: Buffs', step: 'Step 3.1: Defender Synergy Selection', desc: 'Defender chooses synergy cards to counter the attack.' };
      case 'reveal_synergy': return { stage: 'Stage 3: Buffs', step: 'Step 3.2: Synergy Reveal', desc: 'Revealing face-down synergy cards for both teams.' };
      case 'reveal_skills': return { stage: 'Stage 3: Buffs', step: 'Step 3.3: Skill Activation', desc: 'Special player abilities and mental triggers!' };
      case 'summary': return { stage: 'Stage 4: Conclusion', step: 'Step 4.1: Final Comparison', desc: 'Total forces compared. Who will prevail?' };
      case 'result': return { stage: 'Stage 4: Conclusion', step: 'Step 4.2: Final Outcome', desc: 'The dust settles. The whistle blows.' };
      default: return { stage: '', step: '', desc: '' };
    }
  };

  const phaseInfo = getPhaseInfo();

  return (
    <motion.div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl overflow-hidden"
      animate={shouldShake ? {
        x: [0, -5, 5, -5, 5, -3, 3, 0],
        y: [0, -5, 5, -5, 5, -3, 3, 0]
      } : {}}
      transition={{ duration: 0.5 }}
    >
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

      {/* Heartbeat Animation - Pulsing Background */}
      {duelPhase !== 'none' && duelPhase !== 'result' && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: duelPhase === 'reveal_synergy' ? 0.8 : 
                      duelPhase === 'reveal_skills' ? 0.6 : 
                      duelPhase === 'summary' ? 0.4 : 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: `radial-gradient(circle at center, ${duelPhase === 'reveal_synergy' || duelPhase === 'reveal_skills' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.2)'} 0%, transparent 70%)`
          }}
        />
      )}

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
          
          {/* Countdown Progress Bar */}
          {duelPhase !== 'none' && duelPhase !== 'result' && duelPhase !== 'select_shot_icon' && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.05 }}
              className="mt-3 h-1 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full overflow-hidden"
              style={{ width: '200px' }}
            >
              <motion.div
                animate={{
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="h-full bg-white/50"
              />
            </motion.div>
          )}
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
               
               {/* Enhanced Shot Icon Selection */}
               {duelPhase === 'select_shot_icon' && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="absolute -inset-8"
                 >
                   <ShotIconSelector
                     icons={getShotIcons()}
                     onIconSelect={(index) => setSelectedShotIcon(index)}
                     isPlayerTurn={isPlayerAttacking}
                     isAIThinking={isAIThinking}
                   />
                   {selectedShotIcon !== null && isPlayerAttacking && (
                     <motion.button
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       onClick={handleShotIconConfirm}
                       className="mt-4 px-6 py-2 bg-green-500 text-white text-sm font-black uppercase tracking-wider rounded-full hover:bg-green-600 transition-colors mx-auto block"
                     >
                       Confirm Shot
                     </motion.button>
                   )}
                 </motion.div>
               )}
               
               {/* Enhanced Attacker Power Badge with Animated Counter */}
               <motion.div 
                 key={`attack-${displayAttackPower}`}
                 initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                 animate={{ scale: 1, opacity: 1, rotate: 0 }}
                 className="absolute -top-8 -right-8 w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 border-4 border-white flex flex-col items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.6)] z-20"
               >
                 <AnimatedCounter 
                   targetValue={displayAttackPower}
                   className="text-3xl font-black text-white italic"
                   duration={1500}
                 />
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
                    transition={{ delay: i * 0.2, type: 'spring', stiffness: 300 }}
                    className="relative px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg border border-white/40 shadow-xl uppercase tracking-[0.1em] italic overflow-hidden"
                  >
                    {/* Glow effect */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.2, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-blue-400 rounded-lg blur-md"
                    />
                    {/* Sparkle particles */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0"
                    >
                      {[...Array(4)].map((_, j) => (
                        <motion.div
                          key={j}
                          animate={{ 
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            delay: j * 0.3,
                            ease: 'easeInOut'
                          }}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                          style={{
                            top: `${20 + j * 20}%`,
                            left: `${10 + j * 25}%`
                          }}
                        />
                      ))}
                    </motion.div>
                    <span className="relative z-10">{skill}</span>
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
                    <motion.div
                      animate={{
                        rotateY: (duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender') ? 180 : 0,
                      }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 20,
                        delay: i * 0.15 + (duelPhase === 'reveal_synergy' ? 0.5 : 0)
                      }}
                    >
                      <SynergyCardComponent 
                        card={card} 
                        size="small" 
                        faceDown={duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender'}
                      />
                    </motion.div>
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
                    <AnimatedCounter 
                      targetValue={displayDefensePower}
                      className="text-3xl font-black text-white italic"
                      duration={1500}
                    />
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
                    transition={{ delay: i * 0.2, type: 'spring', stiffness: 300 }}
                    className="relative px-4 py-1.5 bg-red-600 text-white text-[10px] font-black rounded-lg border border-white/40 shadow-xl uppercase tracking-[0.1em] italic overflow-hidden"
                  >
                    {/* Glow effect */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.2, 0.5]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-red-400 rounded-lg blur-md"
                    />
                    {/* Sparkle particles */}
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0"
                    >
                      {[...Array(4)].map((_, j) => (
                        <motion.div
                          key={j}
                          animate={{ 
                            scale: [0, 1, 0],
                            opacity: [0, 1, 0]
                          }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity, 
                            delay: j * 0.3,
                            ease: 'easeInOut'
                          }}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                          style={{
                            top: `${20 + j * 20}%`,
                            right: `${10 + j * 25}%`
                          }}
                        />
                      ))}
                    </motion.div>
                    <span className="relative z-10">{skill}</span>
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
                    <motion.div
                      animate={{
                        rotateY: (duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender') ? 180 : 0,
                      }}
                      transition={{ 
                        type: 'spring', 
                        stiffness: 260, 
                        damping: 20,
                        delay: i * 0.15 + (duelPhase === 'reveal_synergy' ? 0.5 : 0)
                      }}
                    >
                      <SynergyCardComponent 
                        card={card} 
                        size="small" 
                        faceDown={duelPhase === 'init' || duelPhase === 'reveal_attacker' || duelPhase === 'reveal_defender'}
                      />
                    </motion.div>
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
              {/* Particle Explosion Effect */}
              <div className="absolute inset-0 pointer-events-none">
                {result === 'goal' && (
                  <>
                    {[...Array(30)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          x: 0, 
                          y: 0, 
                          scale: 0, 
                          opacity: 1 
                        }}
                        animate={{
                          x: (Math.random() - 0.5) * 800,
                          y: (Math.random() - 0.5) * 800,
                          scale: [0, 1.5, 0],
                          opacity: [1, 1, 0],
                          rotate: Math.random() * 360
                        }}
                        transition={{ 
                          duration: 1.5, 
                          delay: i * 0.02,
                          ease: "easeOut" 
                        }}
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: ['#FFD700', '#FFA500', '#FF6347', '#FF4500'][Math.floor(Math.random() * 4)],
                          left: '50%',
                          top: '50%',
                          filter: 'blur(1px)'
                        }}
                      />
                    ))}
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={`star-${i}`}
                        initial={{ 
                          x: 0, 
                          y: 0, 
                          scale: 0, 
                          opacity: 1,
                          rotate: 0
                        }}
                        animate={{
                          x: (Math.random() - 0.5) * 600,
                          y: (Math.random() - 0.5) * 600,
                          scale: [0, 2, 0],
                          opacity: [1, 0.8, 0],
                          rotate: Math.random() * 720
                        }}
                        transition={{ 
                          duration: 2, 
                          delay: i * 0.03,
                          ease: "easeOut" 
                        }}
                        className="absolute text-4xl"
                        style={{
                          left: '50%',
                          top: '50%',
                          filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))'
                        }}
                      >
                        ⭐
                      </motion.div>
                    ))}
                  </>
                )}
                {result === 'saved' && (
                  <>
                    {[...Array(20)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          x: 0, 
                          y: 0, 
                          scale: 0, 
                          opacity: 1 
                        }}
                        animate={{
                          x: (Math.random() - 0.5) * 600,
                          y: (Math.random() - 0.5) * 600,
                          scale: [0, 1.2, 0],
                          opacity: [1, 1, 0],
                          rotate: Math.random() * 360
                        }}
                        transition={{ 
                          duration: 1.2, 
                          delay: i * 0.03,
                          ease: "easeOut" 
                        }}
                        className="absolute w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD'][Math.floor(Math.random() * 3)],
                          left: '50%',
                          top: '50%',
                          filter: 'blur(1px)'
                        }}
                      />
                    ))}
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={`shield-${i}`}
                        initial={{ 
                          x: 0, 
                          y: 0, 
                          scale: 0, 
                          opacity: 1,
                          rotate: 0
                        }}
                        animate={{
                          x: (Math.random() - 0.5) * 500,
                          y: (Math.random() - 0.5) * 500,
                          scale: [0, 1.5, 0],
                          opacity: [1, 0.8, 0],
                          rotate: Math.random() * 540
                        }}
                        transition={{ 
                          duration: 1.8, 
                          delay: i * 0.04,
                          ease: "easeOut" 
                        }}
                        className="absolute text-3xl"
                        style={{
                          left: '50%',
                          top: '50%',
                          filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))'
                        }}
                      >
                        🛡️
                      </motion.div>
                    ))}
                  </>
                )}
                {result === 'missed' && (
                  <>
                    {[...Array(15)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ 
                          x: 0, 
                          y: 0, 
                          scale: 0, 
                          opacity: 1 
                        }}
                        animate={{
                          x: (Math.random() - 0.5) * 400,
                          y: (Math.random() - 0.5) * 400,
                          scale: [0, 1, 0],
                          opacity: [1, 0.6, 0],
                          rotate: Math.random() * 360
                        }}
                        transition={{ 
                          duration: 1, 
                          delay: i * 0.04,
                          ease: "easeOut" 
                        }}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: ['#9CA3AF', '#6B7280', '#4B5563'][Math.floor(Math.random() * 3)],
                          left: '50%',
                          top: '50%',
                          filter: 'blur(1px)'
                        }}
                      />
                    ))}
                  </>
                )}
              </div>

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

              {/* Celebration Messages for Goals */}
              {result === 'goal' && (
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl font-black text-yellow-300 uppercase tracking-widest drop-shadow-lg"
                  >
                    ⚽ INCREDIBLE SHOT! ⚽
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-lg font-bold text-white/80 uppercase tracking-wide"
                  >
                    The crowd goes wild!
                  </motion.div>
                </div>
              )}

              {/* Celebration Messages for Saves */}
              {result === 'saved' && (
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl font-black text-blue-300 uppercase tracking-widest drop-shadow-lg"
                  >
                    🛡️ MAGNIFICENT SAVE! 🛡️
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-lg font-bold text-white/80 uppercase tracking-wide"
                  >
                    The defense stands tall!
                  </motion.div>
                </div>
              )}

              {/* Celebration Messages for Missed */}
              {result === 'missed' && (
                <div className="flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl font-black text-gray-400 uppercase tracking-widest drop-shadow-lg"
                  >
                    😢 SO CLOSE! 😢
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-lg font-bold text-white/60 uppercase tracking-wide"
                  >
                    Better luck next time!
                  </motion.div>
                </div>
              )}
              
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
    </motion.div>
  );
};
