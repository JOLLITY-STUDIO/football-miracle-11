import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SynergyPanel } from './SynergyPanel';
import { CardStack } from './CardStack';
import { SynergyCardComponent } from './SynergyCard';
import { penaltyCards, penaltyDefenseCards, type SynergyCard, type athleteCard } from '../data/cards';

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
  homeCardDeckCount: number;
  awayCardDeckCount: number;
  starCardDeckCount: number;
}

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
  homeCardDeckCount,
  awayCardDeckCount,
  starCardDeckCount
}) => {
  const [showSynergyDetails, setShowSynergyDetails] = useState(false);

  return (
    <div className="w-[600px] relative flex h-full bg-stone-900 border-l border-white/5 overflow-hidden z-20 transform-style-3d"
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
                revealed={turnPhase === 'end'}
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
                revealed={turnPhase === 'end'}
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
            {/* Penalty Attack Stack */}
            <CardStack
              id="penalty-attack-deck"
              title="Penalty Attack"
              count={penaltyCards.length}
              type="penalty-attack"
              isVisible={true}
            />

            {/* Athlete Card Decks */}
            <div className="flex flex-col gap-3">
              {/* Star Card Deck */}
              <CardStack
                id="star-card-deck"
                title="Star Cards"
                count={starCardDeckCount}
                type="star"
                isVisible={starCardDeckCount > 0}
              />

              {/* Home Team Card Deck */}
              <CardStack
                id="home-card-deck"
                title="Home Cards"
                count={homeCardDeckCount}
                type="home"
                isVisible={homeCardDeckCount > 0}
              />

              {/* Away Team Card Deck */}
              <CardStack
                id="away-card-deck"
                title="Away Cards"
                count={awayCardDeckCount}
                type="away"
                isVisible={awayCardDeckCount > 0}
              />
            </div>

            {/* Synergy Deck Stack */}
            <CardStack
              id="synergy-card-deck"
              title="Synergy Deck"
              count={synergyDeckCount}
              type="synergy"
              isVisible={true}
              onClick={() => onOpenPile('deck')}
            />

            {/* Penalty Defense Stack */}
            <CardStack
              id="penalty-defense-deck"
              title="Penalty Defense"
              count={penaltyDefenseCards.length}
              type="penalty-defense"
              isVisible={true}
            />
          </div>

          {/* Player Synergy Hand - Bottom */}
          <div className="bg-stone-900/80 rounded-2xl border border-white/10 shadow-xl p-2 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <div className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">
                Your Synergy Hand
              </div>
              <button
                onClick={() => setShowSynergyDetails(!showSynergyDetails)}
                className="text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter transition-colors"
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

      {/* Synergy Details Modal */}
      {showSynergyDetails && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
          <div className="bg-stone-900 rounded-2xl border border-white/10 shadow-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-['Russo_One'] text-white">Your Synergy Cards</h2>
              <button
                onClick={() => setShowSynergyDetails(false)}
                className="text-white/40 hover:text-white text-lg"
              >
                ×
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

export default RightPanel;