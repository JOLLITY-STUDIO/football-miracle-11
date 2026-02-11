import React from 'react';
import { SynergyPanel } from './SynergyPanel';
import { BaseCard } from './BaseCard';
import { penaltyCards, type SynergyCard } from '../data/cards';

interface Props {
  aiSynergyHand: SynergyCard[];
  playerSynergyHand: SynergyCard[];
  selectedSynergyCards: SynergyCard[];
  onSynergySelect: (card: SynergyCard) => void;
  synergyDeckCount: number;
  synergyDiscardCount: number;
  onOpenPile: (pile: 'deck' | 'discard') => void;
  turnPhase: string;
  playerActiveSynergy: SynergyCard[];
  aiActiveSynergy: SynergyCard[];
}

// 66x43mm ratio is approximately 1.535
// For vertical cards, it's 43x66mm ratio (~0.65)
// We'll use BaseCard's size logic for consistency
const STACK_W = 100; // Slightly smaller to fit better
const STACK_H = 154; // Maintain ratio

export const RightPanel: React.FC<Props> = ({
  aiSynergyHand,
  playerSynergyHand,
  selectedSynergyCards,
  onSynergySelect,
  synergyDeckCount,
  synergyDiscardCount,
  onOpenPile,
  turnPhase,
  playerActiveSynergy,
  aiActiveSynergy,
}) => {
  const isEndPhase = turnPhase === 'end';

  return (
    <div
      className="w-[500px] relative flex h-full bg-stone-900 border-l border-white/5 overflow-hidden z-20 transform-style-3d"
      style={{ transform: 'translateZ(0px)' }}
    >
      <div className="absolute inset-y-0 left-0 right-[-100px] bg-gradient-to-l from-stone-900 via-stone-900/90 to-transparent pointer-events-none" />
      
      <div className="relative flex h-full w-full p-6 gap-8 z-10 justify-center">
        
        {/* 1. Synergy Board - Unified Board */}
        <div className="relative w-[320px] flex flex-col bg-[#C62918] rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden border border-white/20 flex-shrink-0">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern-7.png')]" />
          
          <div className="relative flex-1 flex flex-col justify-between py-6">
            {/* Opponent Label (Upside down for them) */}
            <div className="py-2 flex flex-col items-center">
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] rotate-180">
                Opponent Synergy
              </div>
              <div className="w-12 h-1 bg-white/10 rounded-full mt-1 rotate-180" />
            </div>

            <div className="flex-1 flex flex-col justify-start">
              <SynergyPanel
                synergyHand={isEndPhase ? aiActiveSynergy : aiSynergyHand}
                isAi={true}
                revealed={isEndPhase}
                transparent={true}
              />
            </div>
            
            <div className="flex items-center justify-center py-4">
              <div className="w-full border-t-2 border-dashed border-white/10 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 py-1 bg-[#C62918] rounded-full border border-white/10 shadow-lg">
                  <span className="text-white/40 text-[9px] font-black tracking-[0.5em] uppercase whitespace-nowrap">
                    BATTLE FRONT
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col justify-end">
              <SynergyPanel
                synergyHand={isEndPhase ? playerActiveSynergy : playerSynergyHand}
                selectedCards={selectedSynergyCards}
                onSelect={onSynergySelect}
                isAi={false}
                revealed={isEndPhase}
                transparent={true}
              />
            </div>

            {/* Player Label */}
            <div className="py-2 flex flex-col items-center">
              <div className="w-12 h-1 bg-white/10 rounded-full mb-1" />
              <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">
                Your Synergy
              </div>
            </div>
          </div>

          {/* Decorative shine */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* 2. Draw Area - Vertical Stacks outside synergy panel */}
        <div className="flex-shrink-0 w-[160px] flex flex-col justify-around py-2 items-center">
          
          {/* Penalty Kick Stack (Top) - Blue Stack */}
          <div className="relative flex flex-col items-center group">
            <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Penalty Defense</span>
            <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
              {[3, 2, 1, 0].map((i) => (
                <div 
                  key={i}
                  className="absolute inset-0 border-[1.5px] border-black/80 rounded-lg shadow-md flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                  style={{ 
                    transform: `translate(${i * -1.5}px, ${i * -2.5}px)`,
                    zIndex: 10 - i,
                    backgroundColor: '#3690CF',
                    boxShadow: i === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : 'none'
                  }}
                >
                  {/* Card Back Design */}
                  <div className="absolute inset-0 bg-[#3690CF]" />
                  
                  {/* Dark Blue Accents */}
                  <div className="absolute inset-2 border border-[#0E598B]/30 rounded-md" />
                  
                  <div className="relative flex flex-col items-center p-2 text-center h-full justify-between w-full">
                    {/* Top Text */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-white font-black uppercase tracking-[0.2em] leading-none">PENALTY</span>
                      <span className="text-[7px] text-white/80 font-bold uppercase tracking-[0.1em]">DEFENSE</span>
                    </div>

                    {/* Large Football with Dark Background */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#0E598B] rounded-full opacity-40 blur-sm" />
                      <div className="relative w-14 h-14 bg-[#0E598B] rounded-full flex items-center justify-center border-2 border-white/20">
                        <span className="text-4xl filter drop-shadow-md">⚽</span>
                      </div>
                    </div>

                    {/* Glove Icon and Bottom Text */}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                        <span className="text-xl text-white">🧤</span>
                      </div>
                      <div className="w-8 h-0.5 bg-white/40 rounded-full" />
                    </div>
                  </div>

                  {/* Corner detail */}
                  <div className="absolute top-0 right-0 w-6 h-6 bg-[#0E598B]/20 rounded-bl-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#0E598B]/20 rounded-tr-2xl" />
                </div>
              ))}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-stone-900 font-black text-xs rounded-full flex items-center justify-center border-2 border-stone-900 shadow-xl z-20">
                {penaltyCards.length}
              </div>
            </div>
          </div>

          {/* Synergy Card Deck (Middle) - Green Stack */}
          <div className="relative flex flex-col items-center cursor-pointer group" onClick={() => onOpenPile('deck')}>
            <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Synergy Deck</span>
            <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
              {[5, 4, 3, 2, 1, 0].map((i) => (
                <div 
                  key={i}
                  className="absolute inset-0 border-[1.5px] border-black/80 rounded-lg shadow-md flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                  style={{ 
                    transform: `translate(${i * -1.5}px, ${i * -2.5}px)`,
                    zIndex: 10 - i,
                    backgroundColor: '#106327',
                    boxShadow: i === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : 'none'
                  }}
                >
                  {/* Card Back Design */}
                  <div className="absolute inset-0 bg-[#106327]" />
                  
                  {/* Dark Green Accents */}
                  <div className="absolute inset-2 border border-[#083d18]/30 rounded-md" />
                  
                  <div className="relative flex flex-col items-center p-2 text-center h-full justify-between w-full">
                    {/* Top Text */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-white font-black uppercase tracking-[0.2em] leading-none">SYNERGY</span>
                      <span className="text-[7px] text-white/80 font-bold uppercase tracking-[0.1em]">DECK</span>
                    </div>

                    {/* Synergy Symbol with Dark Background */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#083d18] rounded-full opacity-40 blur-sm" />
                      <div className="relative w-14 h-14 bg-[#083d18] rounded-full flex items-center justify-center border-2 border-white/20">
                        <span className="text-4xl filter drop-shadow-md">🃏</span>
                      </div>
                    </div>

                    {/* Bottom detail */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[7px] text-white/60 font-black tracking-widest">山札</span>
                      <div className="w-8 h-0.5 bg-white/40 rounded-full" />
                    </div>
                  </div>

                  {/* Corner detail */}
                  <div className="absolute top-0 right-0 w-6 h-6 bg-[#083d18]/20 rounded-bl-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 bg-[#083d18]/20 rounded-tr-2xl" />
                </div>
              ))}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-stone-900 font-black text-xs rounded-full flex items-center justify-center border-2 border-stone-900 shadow-xl z-20">
                {synergyDeckCount}
              </div>
            </div>
          </div>

          {/* Synergy Discard (Bottom) - Grey Stack */}
          <div className="relative flex flex-col items-center cursor-pointer group" onClick={() => onOpenPile('discard')}>
            <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Discard Pile</span>
            <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
              {[2, 1, 0].map((i) => (
                <div 
                  key={i}
                  className="absolute inset-0 border-[1.5px] border-black/80 rounded-lg shadow-md flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                  style={{ 
                    transform: `translate(${i * -1.5}px, ${i * -2.5}px)`,
                    zIndex: 10 - i,
                    backgroundColor: synergyDiscardCount > 0 ? '#333' : '#444',
                    boxShadow: i === 0 ? '0 4px 6px -1px rgba(0, 0, 0, 0.5)' : 'none'
                  }}
                >
                  {/* Card Back Design */}
                  <div className="absolute inset-0 bg-[#333]" />
                  
                  {/* Dark Accents */}
                  <div className="absolute inset-2 border border-black/30 rounded-md" />
                  
                  <div className="relative flex flex-col items-center p-2 text-center h-full justify-between w-full">
                    {/* Top Text */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] text-white font-black uppercase tracking-[0.2em] leading-none">DISCARD</span>
                      <span className="text-[7px] text-white/80 font-bold uppercase tracking-[0.1em]">PILE</span>
                    </div>

                    {/* Glove Symbol with Dark Background */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black rounded-full opacity-40 blur-sm" />
                      <div className="relative w-14 h-14 bg-black rounded-full flex items-center justify-center border-2 border-white/20">
                        <span className="text-4xl filter drop-shadow-md">🧤</span>
                      </div>
                    </div>

                    {/* Bottom detail */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[7px] text-white/60 font-black tracking-widest">墓地</span>
                      <div className="w-8 h-0.5 bg-white/40 rounded-full" />
                    </div>
                  </div>

                  {/* Corner detail */}
                  <div className="absolute top-0 right-0 w-6 h-6 bg-black/20 rounded-bl-2xl" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 bg-black/20 rounded-tr-2xl" />
                </div>
              ))}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-white text-stone-900 font-black text-xs rounded-full flex items-center justify-center border-2 border-stone-900 shadow-xl z-20">
                {synergyDiscardCount}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          transform: rotate(180deg);
        }
      `}} />
    </div>
  );
};
