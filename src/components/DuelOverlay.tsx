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
  isPlayerAttacking
}) => {
  const [displayAttackPower, setDisplayAttackPower] = useState(0);
  const [displayDefensePower, setDisplayDefensePower] = useState(0);

  // Auto-advance logic
  useEffect(() => {
    if (duelPhase !== 'none' && duelPhase !== 'result') {
      const timer = setTimeout(() => {
        onAdvance();
      }, 1500); // 1.5s per phase
      return () => clearTimeout(timer);
    }
  }, [duelPhase, onAdvance]);

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
      
      // Small delay to let cards reveal first
      const timer = setTimeout(() => {
        setDisplayAttackPower(prev => prev + synergyStars);
        setDisplayDefensePower(prev => prev + defSynergyStars);
      }, 500);
      return () => clearTimeout(timer);
    } else if (duelPhase === 'reveal_skills') {
      // In the current logic, skills are part of the final power calculation in gameLogic
      // But we can show the "impact" here if we wanted to be precise.
      // For now, we'll just show the badges.
    } else if (duelPhase === 'result') {
      setDisplayAttackPower(attackPower);
      setDisplayDefensePower(defensePower);
    }
  }, [duelPhase, attacker, defender, attackSynergy, defenseSynergy, attackPower, defensePower]);

  if (duelPhase === 'none') return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden">
      <div className="relative w-full h-full max-w-6xl flex flex-col items-center justify-center">
        
        {/* Phase Title */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-12 text-4xl font-black tracking-widest text-white uppercase italic"
        >
          {duelPhase === 'init' && "Prepare for Duel!"}
          {duelPhase === 'reveal_attacker' && "Attacker Steps Up!"}
          {duelPhase === 'reveal_defender' && "Defense Prepares!"}
          {duelPhase === 'reveal_synergy' && "Synergy Boost!"}
          {duelPhase === 'reveal_skills' && "Skill Activation!"}
          {duelPhase === 'result' && "Result!"}
        </motion.div>

        <div className="flex items-center justify-between w-full px-20 gap-20">
          
          {/* Attacker Side */}
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-xl font-bold text-blue-400 uppercase tracking-widest">Attacker</div>
            <div className="relative">
               <PlayerCardComponent card={attacker} size="large" />
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center shadow-2xl"
               >
                 <span className="text-2xl font-black text-white">{displayAttackPower}</span>
               </motion.div>
               </div>
               
               {/* Attacker Activated Skills */}
               <div className="flex flex-wrap justify-center gap-2 mt-2 h-10">
                 <AnimatePresence>
                   {duelPhase === 'reveal_skills' && activatedSkills.attackerSkills.map((skill, i) => (
                     <motion.div
                       key={skill}
                       initial={{ opacity: 0, scale: 0.5, y: 10 }}
                       animate={{ opacity: 1, scale: 1, y: 0 }}
                       className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full border border-white/50 shadow-lg"
                     >
                       {skill}
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
               
               {/* Attack Synergy Reveal */}
            <div className="flex gap-2 h-24">
              <AnimatePresence>
                {(duelPhase !== 'none') && attackSynergy.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
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
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="text-6xl font-black text-white italic drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">VS</div>
            <div className="w-1 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
          </motion.div>

          {/* Defender Side */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="text-xl font-bold text-red-400 uppercase tracking-widest">Defender</div>
            <div className="relative min-h-[300px] flex items-center justify-center">
              {defender ? (
                <>
                  <PlayerCardComponent card={defender} size="large" />
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-red-600 border-4 border-white flex items-center justify-center shadow-2xl"
                  >
                    <span className="text-2xl font-black text-white">{displayDefensePower}</span>
                  </motion.div>
                  </>
                ) : (
                  <div className="w-[180px] h-[260px] border-4 border-dashed border-white/20 rounded-xl flex items-center justify-center text-white/20 font-black uppercase tracking-tighter text-center px-4">
                    No Defender
                  </div>
                )}
              </div>

              {/* Defender Activated Skills */}
              <div className="flex flex-wrap justify-center gap-2 mt-2 h-10">
                <AnimatePresence>
                  {duelPhase === 'reveal_skills' && activatedSkills.defenderSkills.map((skill, i) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, scale: 0.5, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full border border-white/50 shadow-lg"
                    >
                      {skill}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Defense Synergy Reveal */}
            <div className="flex gap-2 h-24">
              <AnimatePresence>
                {(duelPhase !== 'none') && defenseSynergy.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
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

        {/* Result Announcement */}
        <AnimatePresence>
          {duelPhase === 'result' && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="absolute bottom-20 flex flex-col items-center gap-6"
            >
              <div className={clsx(
                "text-7xl font-black italic tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]",
                (result === 'goal' || result === 'magicNumber') ? "text-yellow-400" : "text-gray-400"
              )}>
                {result === 'goal' && "GOAL!"}
                {result === 'magicNumber' && "MAGIC NUMBER!"}
                {result === 'saved' && "SAVED!"}
                {result === 'missed' && "MISSED!"}
              </div>
              
              <div className="text-white/60 font-bold uppercase tracking-widest text-sm">
                Final Power: {attackPower} vs {defensePower}
              </div>
              
              <button 
                onClick={onAdvance}
                className="px-10 py-4 bg-white text-black font-black uppercase tracking-widest rounded-full hover:bg-yellow-400 transition-colors shadow-2xl"
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
