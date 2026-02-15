import React, { useState } from 'react';
import { SynergyPanel } from './SynergyPanel';
import { BaseCard } from './BaseCard';
import { SynergyCardComponent } from './SynergyCard';
import { penaltyCards, type SynergyCard } from '../data/cards';

interface Props {
  aiSynergyHand: SynergyCard[];
  playerSynergyHand: SynergyCard[];
  selectedSynergyCards: SynergyCard[];
  onSynergySelect: (card: SynergyCard) => void;
  onSynergyMoveToDeck?: (card: SynergyCard) => void;
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
const STACK_W = 198; // Match large synergy cards width
const STACK_H = 130; // Match large synergy cards height

export const RightPanel: React.FC<Props> = ({
  aiSynergyHand,
  playerSynergyHand,
  selectedSynergyCards,
  onSynergySelect,
  onSynergyMoveToDeck,
  synergyDeckCount,
  synergyDiscardCount,
  onOpenPile,
  turnPhase,
  playerActiveSynergy,
  aiActiveSynergy,
}) => {
  const isEndPhase = turnPhase === 'end';
  const [showSynergyDetails, setShowSynergyDetails] = useState(false);

  return (
    <div
      className="w-[600px] relative flex h-full bg-stone-900 border-l border-white/5 overflow-hidden z-20 transform-style-3d"
      style={{ transform: 'translateZ(0px)' }}
    >
      <div className="absolute inset-y-0 left-0 right-[-100px] bg-gradient-to-l from-stone-900 via-stone-900/90 to-transparent pointer-events-none" />
      
      <div className="relative flex h-full w-full gap-4 z-30 flex-row items-stretch justify-center">
        {/* Left Side - Battle Front */}
        <div className="flex flex-col gap-4 justify-stretch h-full flex-grow">
          {/* Opponent Battle Front */}
          <div className="bg-[#C32A1D] border border-white/10 shadow-xl p-3 relative flex flex-col gap-2 flex-grow">
            <div className="bg-stone-900/60 p-2 border border-white/5 flex-grow">
              <SynergyPanel
                synergyHand={aiActiveSynergy}
                selectedCards={[]}
                isAi={true}
                revealed={isEndPhase}
                transparent={true}
              />
            </div>
          </div>
          
          {/* Middle Title */}
          <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] text-center">
            SYNERGY BATTLE FRONT
          </div>
          
          {/* Player Battle Front */}
          <div className="bg-[#C32A1D] border border-white/10 shadow-xl p-3 relative flex flex-col gap-2 flex-grow">
            <div className="bg-stone-900/60 p-2 border border-white/5 flex-grow">
              <SynergyPanel
                synergyHand={playerActiveSynergy}
                selectedCards={selectedSynergyCards}
                onSelect={onSynergySelect}
                isAi={false}
                revealed={isEndPhase}
                transparent={true}
              />
            </div>
          </div>
        </div>

        {/* Right Side - Draw Area + Synergy Hands */}
        <div className="flex-shrink-0 w-[200px] flex flex-col justify-between h-full">
          {/* Opponent Synergy Hand - Top */}
          <div className="bg-stone-900/80 rounded-2xl border border-white/10 shadow-xl p-2 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">
                Opponent Synergy Hand
              </div>
            </div>
            <div className="relative" style={{ height: `130px` }}>
              {aiSynergyHand.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[9px] text-white/5 font-black uppercase tracking-widest">
                  EMPTY
                </div>
              ) : (
                <div className="relative h-full flex items-center">
                  {aiSynergyHand.map((card, i) => (
                    <div 
                      key={card.id}
                      className="absolute group" 
                      style={{
                        zIndex: i,
                        left: `${i * 15}px`,
                        transform: `translateY(-${i * 0.5}px)`,
                      }}
                    >
                      <SynergyCardComponent 
                        card={card}
                        size="large"
                        faceDown={true}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Draw Area - Middle Section */}
          <div className="flex flex-col gap-2 flex-shrink-0">
            {/* Penalty Attack Stack - Flat Design */}
            <div className="relative flex flex-col items-center group">
              <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Penalty Attack</span>
              <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
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
              </div>
            </div>

            {/* Synergy Deck Stack - Red Stack */}
            <div 
              className="relative flex flex-col items-center group cursor-pointer"
              onClick={() => onOpenPile('deck')}
            >
              <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Synergy Deck</span>
              <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
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
                        {/* SVG 金色五角�?*/}
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
                        <span className="text-[14px] text-white font-bold">{synergyDeckCount}</span>
                        <div className="w-8 h-0.5 bg-white/40 rounded-full" />
                      </div>
                    </div>

                    {/* Corner detail */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl-md" />
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Penalty Defense Stack - Flat Design */}
            <div className="relative flex flex-col items-center group">
              <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Penalty Defense</span>
              <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
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
              </div>
            </div>
          </div>

          {/* Player Synergy Hand - Bottom */}
          <div className="bg-stone-900/80 rounded-2xl border border-white/10 shadow-xl p-2 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">
                Your Synergy Hand
              </div>
              <button
                onClick={() => setShowSynergyDetails(!showSynergyDetails)}
                className="text-[9px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter transition-colors"
              >
                {showSynergyDetails ? 'Hide' : 'Details'}
              </button>
            </div>
            <div className="relative" style={{ height: `130px` }}>
              {playerSynergyHand.length === 0 ? (
                <div className="h-full flex items-center justify-center text-[9px] text-white/5 font-black uppercase tracking-widest">
                  EMPTY
                </div>
              ) : (
                <div className="relative h-full flex items-center">
                  {playerSynergyHand.map((card, i) => (
                    <div 
                      key={card.id}
                      className="absolute cursor-pointer group" 
                      style={{
                        zIndex: i,
                        left: `${i * 15}px`,
                        transform: `translateY(-${i * 0.5}px)`,
                      }}
                      onClick={() => onSynergySelect(card)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        if (onSynergyMoveToDeck) {
                          onSynergyMoveToDeck(card);
                        }
                      }}
                    >
                      <SynergyCardComponent 
                        card={card}
                        size="large"
                        selected={selectedSynergyCards.some(c => c.id === card.id)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Synergy Details Modal */}
      {showSynergyDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
          <div className="bg-stone-900 rounded-2xl border border-white/10 shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-['Russo_One'] text-white">Your Synergy Cards</h2>
              <button
                onClick={() => setShowSynergyDetails(false)}
                className="text-white/40 hover:text-white text-lg"
              >
                �?              </button>
            </div>
            <div className="space-y-4">
              {playerSynergyHand.length === 0 ? (
                <div className="text-center py-8 text-white/40">
                  No synergy cards in hand
                </div>
              ) : (
                playerSynergyHand.map((card, index) => (
                  <div key={card.id} className="flex items-center gap-3 p-3 bg-stone-800/50 rounded-lg border border-white/5">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img 
                        src={card.imageUrl} 
                        alt={card.name} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-bold">{card.name}</div>
                      <div className="text-white/60 text-sm">Type: {card.type}</div>
                      <div className="text-white/60 text-sm">Stars: {card.stars}</div>
                    </div>
                    <div className="text-yellow-400 font-bold">+{card.stars}</div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSynergyDetails(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

