import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AthleteCardComponent } from './AthleteCard';
import type { athleteCard } from '../data/cards';

interface CardStackProps {
  id: string;
  title: string;
  count: number;
  type: 'star' | 'home' | 'away' | 'synergy' | 'penalty-attack' | 'penalty-defense';
  isVisible: boolean;
  onClick?: () => void;
}

// 66x43mm ratio is approximately 1.535
// For vertical cards, it's 43x66mm ratio (~0.65)
const STACK_W = 198; // Match large synergy cards width
const STACK_H = 130; // Match large synergy cards height

export const CardStack: React.FC<CardStackProps> = ({
  id,
  title,
  count,
  type,
  isVisible,
  onClick,
}) => {
  const renderCardContent = () => {
    switch (type) {
      case 'star':
      case 'home':
      case 'away':
        return (
          <>
            {[2, 1, 0].map((i) => (
              <div 
                key={i}
                className="absolute inset-0 border-[2px] border-black/80 rounded-lg shadow-md overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                style={{ 
                  transform: `translate(${i * -1.5}px, ${i * -2}px)`,
                  zIndex: 10 - i,
                  boxShadow: i === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : 'none'
                }}
              >
                <AthleteCardComponent
                  card={{ 
                    id: `temp_${type}_${i}`, 
                    nickname: '', 
                    realName: '', 
                    type: 'fw', 
                    positionLabel: '', 
                    isStar: type === 'star', 
                    unlocked: true, 
                    unlockCondition: '', 
                    icons: [],
                    tactics: {},
                    rotatedTactics: {},
                    immediateEffect: 'none' 
                  }} as athleteCard
                  size="large"
                  faceDown={true}
                  variant={type === 'away' ? 'away' : 'home'}
                  disabled={true}
                />
              </div>
            ))}
            {/* Card Count */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              {count}
            </div>
          </>
        );
      case 'synergy':
        return (
          <>
            {[3, 2, 1, 0].map((i) => (
              <div 
                key={i}
                className="absolute inset-0 border-[2px] border-black/80 rounded-lg shadow-md flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                style={{ 
                  transform: `translate(${i * -2}px, ${i * -3}px)`,
                  zIndex: 10 - i,
                  backgroundColor: '#C62918',
                  boxShadow: i === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : 'none'
                }}
              >
                {/* Card Back Design - Purple Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-purple-900" />
                
                {/* 大五角星背景 */}
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="w-full h-full flex items-center justify-center transform rotate-90">
                    {/* SVG 金色五角星*/}
                    <svg width="200" height="200" viewBox="0 0 100 100">
                      <path 
                        d="M50 0 L63 38 L100 38 L69 61 L81 100 L50 76 L19 100 L31 61 L0 38 L37 38 Z" 
                        fill="#fbbf24"
                        stroke="#fcd34d"
                        strokeWidth="6"
                      />
                    </svg>
                  </div>
                </div>
                
                <div className="relative flex flex-col items-center p-2 text-center h-full justify-between w-full z-10">
                  {/* Top Text */}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] text-white font-black uppercase tracking-[0.2em] leading-none">SYNERGY</span>
                    <span className="text-[8px] text-white/80 font-bold uppercase tracking-[0.1em]">DECK</span>
                  </div>

                  {/* Large Card Icon */}
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <div className="relative w-18 h-18 flex items-center justify-center border-2 border-yellow-400/30 rounded-full bg-black/30">
                      <img src="/icons/synergy_plus_ring.svg" alt="Synergy" className="w-14 h-14 opacity-90" />
                    </div>
                  </div>

                  {/* Count and Bottom Text */}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[14px] text-white font-bold">{count}</span>
                    <div className="w-8 h-0.5 bg-white/40 rounded-full" />
                  </div>
                </div>

                {/* Corner detail */}
                <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl-md" />
                <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br-md" />
              </div>
            ))}
          </>
        );
      case 'penalty-attack':
        return (
          <>
            {[3, 2, 1, 0].map((i) => (
              <div 
                key={i}
                className="absolute inset-0 border-[2px] border-black/80 rounded-lg shadow-md overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                style={{ 
                  transform: `translate(${i * -2}px, ${i * -3}px)`,
                  zIndex: 10 - i,
                  backgroundColor: '#DC2626',
                  boxShadow: i === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : 'none'
                }}
              >
                {/* Front Face - Flat Design */}
                <div className="h-full flex">
                  {/* Left Half: Red Background */}
                  <div className="relative w-1/2 h-full border-r border-black/30 bg-gradient-to-br from-red-500 to-red-700">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">👟</span>
                    </div>
                    
                    {/* Attack Icon */}
                    <div className="absolute bottom-2 left-2 w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                      <span className="text-xs font-black text-white">⚔️</span>
                    </div>
                  </div>
                  
                  {/* Right Half: White Info Area */}
                  <div className="relative w-1/2 h-full bg-white flex flex-col justify-center items-center px-2">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {/* Position Label */}
                      <div className="bg-red-600 px-2 py-0.5 rounded-md">
                        <span className="text-xs font-black tracking-wider text-white">ATTACK</span>
                      </div>
                      
                      {/* Card Name */}
                      <div className="text-xs font-black tracking-wider text-center leading-none text-red-800">
                        PENALTY
                      </div>
                      
                      {/* Skill Icon */}
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-500">
                          <span className="text-xs font-bold text-red-800">+1</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Penalty Attack Count */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {count}
            </div>
          </>
        );
      case 'penalty-defense':
        return (
          <>
            {[3, 2, 1, 0].map((i) => (
              <div 
                key={i}
                className="absolute inset-0 border-[2px] border-black/80 rounded-lg shadow-md overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                style={{ 
                  transform: `translate(${i * -2}px, ${i * -3}px)`,
                  zIndex: 10 - i,
                  backgroundColor: '#F59E0B',
                  boxShadow: i === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : 'none'
                }}
              >
                {/* Front Face - Flat Design */}
                <div className="h-full flex">
                  {/* Left Half: Orange Background */}
                  <div className="relative w-1/2 h-full border-r border-black/30 bg-gradient-to-br from-orange-500 to-orange-700">
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl">🧤</span>
                    </div>
                    
                    {/* Goal Icon */}
                    <div className="absolute bottom-2 left-2 w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                      <span className="text-xs font-black text-white">🥅</span>
                    </div>
                  </div>
                  
                  {/* Right Half: White Info Area */}
                  <div className="relative w-1/2 h-full bg-white flex flex-col justify-center items-center px-2">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      {/* Position Label */}
                      <div className="bg-orange-600 px-2 py-0.5 rounded-md">
                        <span className="text-xs font-black tracking-wider text-white">PENALTY</span>
                      </div>
                      
                      {/* Card Name */}
                      <div className="text-xs font-black tracking-wider text-center leading-none text-orange-800">
                        DEFENSE
                      </div>
                      
                      {/* Skill Icons */}
                      <div className="flex items-center justify-center space-x-1">
                        <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center border-2 border-orange-500">
                          <span className="text-xs">🧤</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Penalty Defense Count */}
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
              {count}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && count > 0 && (
        <motion.div
          key={id}
          id={id}
          data-deck-type={type}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 200, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={`relative flex flex-col items-center group ${onClick ? 'cursor-pointer' : ''}`}
          onClick={onClick}
        >
          <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">{title}</span>
          <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
            {renderCardContent()}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
