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
        <div className="flex flex-col gap-4 justify-stretch h-full">
          {/* Battle Front - Shows both sides */}
          <div className="bg-[#C52B1D] border border-white/10 shadow-xl p-3 relative flex flex-col gap-4" style={{ height: '100%' }}>
            <div className="flex flex-col gap-4 flex-grow">
              {/* Opponent Battle Front */}
              <div className="bg-stone-900/60 p-2 border border-white/5 flex-grow">
                <SynergyPanel
                  synergyHand={aiActiveSynergy}
                  selectedCards={[]}
                  isAi={true}
                  revealed={isEndPhase}
                  transparent={true}
                />
              </div>
              
              {/* Middle Title */}
              <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] my-1 text-center">
                SYNERGY BATTLE FRONT
              </div>
              
              {/* Your Battle Front */}
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
        </div>

        {/* Right Side - Both Synergy Hands + Draw Area */}
        <div className="flex-shrink-0 w-[200px] flex flex-col justify-center gap-3 h-full">
          
          {/* Opponent Synergy Hand - Horizontal Version */}
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
            {/* Penalty Kick Stack (Top) - Blue Stack */}
            <div className="relative flex flex-col items-center group">
              <span className="text-[10px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Penalty Defense</span>
              <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
                {[3, 2, 1, 0].map((i) => (
                  <div 
                    key={i}
                    className="absolute inset-0 border-[2px] border-black/80 rounded-lg shadow-md flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                    style={{ 
                      transform: `translate(${i * -2}px, ${i * -3}px)`,
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
                        <span className="text-[9px] text-white font-black uppercase tracking-[0.2em] leading-none">PENALTY</span>
                        <span className="text-[8px] text-white/80 font-bold uppercase tracking-[0.1em]">DEFENSE</span>
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
                    <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-white/30 rounded-tl-md" />
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-white/30 rounded-br-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Synergy Deck Stack (Middle) - Red Stack */}
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
                    {/* Card Back Design */}
                    <div className="absolute inset-0 bg-[#C62918]" />
                    
                    {/* Dark Red Accents */}
                    <div className="absolute inset-2 border border-[#7E1D13]/30 rounded-md" />
                    
                    <div className="relative flex flex-col items-center p-2 text-center h-full justify-between w-full">
                      {/* Top Text */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] text-white font-black uppercase tracking-[0.2em] leading-none">SYNERGY</span>
                        <span className="text-[8px] text-white/80 font-bold uppercase tracking-[0.1em]">DECK</span>
                      </div>

                      {/* Large Card Icon with Dark Background */}
                      <div className="relative w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[#7E1D13] rounded-full opacity-40 blur-sm" />
                        <div className="relative w-14 h-14 bg-[#7E1D13] rounded-full flex items-center justify-center border-2 border-white/20">
                          <span className="text-4xl filter drop-shadow-md">🃏</span>
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

            {/* Discard Pile Stack (Bottom) - Black Stack */}
            <div 
              className="relative flex flex-col items-center group cursor-pointer"
              onClick={() => onOpenPile('discard')}
            >
              <span className="text-[9px] text-white/40 font-bold mb-1 uppercase tracking-tighter">Discard Pile</span>
              <div className="relative" style={{ width: `${STACK_W}px`, height: `${STACK_H}px` }}>
                {[3, 2, 1, 0].map((i) => (
                  <div 
                    key={i}
                    className="absolute inset-0 border-[1.5px] border-black/80 rounded-lg shadow-md flex flex-col items-center justify-center overflow-hidden transition-transform group-hover:translate-y-[-2px]"
                    style={{ 
                      transform: `translate(${i * -1.5}px, ${i * -2.5}px)`,
                      zIndex: 10 - i,
                      backgroundColor: '#333333',
                      boxShadow: i === 0 ? '0 3px 5px -1px rgba(0, 0, 0, 0.5)' : 'none'
                    }}
                  >
                    {/* Card Back Design */}
                    <div className="absolute inset-0 bg-[#333333]" />
                    
                    {/* Dark Gray Accents */}
                    <div className="absolute inset-2 border border-[#1A1A1A]/30 rounded-md" />
                    
                    <div className="relative flex flex-col items-center p-2 text-center h-full justify-between w-full">
                      {/* Top Text */}
                      <div className="flex flex-col items-center">
                        <span className="text-[8px] text-white font-black uppercase tracking-[0.2em] leading-none">DISCARD</span>
                        <span className="text-[7px] text-white/80 font-bold uppercase tracking-[0.1em]">PILE</span>
                      </div>

                      {/* Large Trash Icon with Dark Background */}
                      <div className="relative w-14 h-14 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[#1A1A1A] rounded-full opacity-40 blur-sm" />
                        <div className="relative w-12 h-12 bg-[#1A1A1A] rounded-full flex items-center justify-center border-2 border-white/20">
                          <span className="text-3xl filter drop-shadow-md">🗑️</span>
                        </div>
                      </div>

                      {/* Count and Bottom Text */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[12px] text-white font-bold">{synergyDiscardCount}</span>
                        <div className="w-6 h-0.5 bg-white/40 rounded-full" />
                      </div>
                    </div>

                    {/* Corner detail */}
                    <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-white/30 rounded-tl-md" />
                    <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-white/30 rounded-br-md" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Your Synergy Hand - Bottom Section */}
          <div className="bg-stone-900/80 rounded-2xl border border-white/10 shadow-xl p-2">
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
                ✕
              </button>
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
