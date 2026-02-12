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
    } else if (duelPhase === 'reveal_synergy') {
      const synergyStars = attackSynergy.reduce((sum, c) => sum + c.stars, 0);
      setDisplayAttackPower(prev => prev + synergyStars);
      
      const defSynergyStars = defenseSynergy.reduce((sum, c) => sum + c.stars, 0);
      setDisplayDefensePower(prev => prev + defSynergyStars);
    } else if (duelPhase === 'reveal_skills') {
      // Skills currently don't add to power directly in calculation but can affect logic
      // In the future, if skills add power, update here
    } else if (duelPhase === 'result') {
      setDisplayAttackPower(attackPower);
      setDisplayDefensePower(defensePower);
    }
  }, [duelPhase, attacker, attackSynergy, defenseSynergy, attackPower, defensePower]);

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
            
            {/* Attack Synergy Reveal */}
            <div className="flex gap-2 h-24">
              <AnimatePresence>
                {duelPhase !== 'init' && duelPhase !== 'reveal_attacker' && duelPhase !== 'reveal_defender' && attackSynergy.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <SynergyCardComponent card={card} size="small" />
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

            {/* Defense Synergy Reveal */}
            <div className="flex gap-2 h-24">
              <AnimatePresence>
                {duelPhase !== 'init' && duelPhase !== 'reveal_attacker' && duelPhase !== 'reveal_defender' && defenseSynergy.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ scale: 0, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <SynergyCardComponent card={card} size="small" />
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
                "text-7xl font-black italic tracking-tighter uppercase drop-shadow-2xl",
                (result === 'goal' || result === 'magicNumber') ? "text-yellow-400" : "text-gray-400"
              )}>
                {result === 'goal' && "GOAL!"}
                {result === 'magicNumber' && "MAGIC NUMBER!"}
                {result === 'saved' && "SAVED!"}
                {result === 'missed' && "MISSED!"}
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
