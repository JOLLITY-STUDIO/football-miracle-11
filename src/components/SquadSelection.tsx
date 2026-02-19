import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { athleteCard } from '../data/cards';
import type { Team } from '../data/teams';
import type { FieldZone } from '../types/game';

interface SquadSelectionProps {
  team: Team;
  draftedStars: athleteCard[];
  onComplete: (starters: athleteCard[], substitutes: athleteCard[], initialField: FieldZone[]) => void;
}

// Helper function to get valid zones based on player type
const getValidZones = (type: string): number[] => {
  switch (type) {
    case 'fw':
      return [2, 3, 4, 5]; // 前锋可放置在2-5区域
    case 'mf':
      return [1, 2, 5, 6]; // 中场只能放置�?�?�?�?�?    case 'df':
      return [0, 1, 6, 7]; // 后卫只能放置�?�?�?�?�?    default:
      return [];
  }
};

const FormationView: React.FC<{
  starters: athleteCard[];
  onBack: () => void;
  onConfirm: (field: FieldZone[]) => void;
}> = ({ starters, onBack, onConfirm }) => {
  const [placedCards, setPlacedCards] = useState<Map<string, { zone: number, slot: number }>>(new Map());
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const zones = [1, 2, 3, 4];
  const slots = [1, 2, 3, 4];

  const handleCardClick = (card: athleteCard) => {
    // If card is already placed, remove it
    if (placedCards.has(card.id)) {
      const newPlaced = new Map(placedCards);
      newPlaced.delete(card.id);
      setPlacedCards(newPlaced);
    } else {
      setSelectedCardId(card.id);
    }
  };

  const handleSlotClick = (zone: number, slot: number) => {
    if (!selectedCardId) return;

    const card = starters.find(p => p.id === selectedCardId);
    if (!card) return;

    // Check if slot is occupied
    const isOccupied = Array.from(placedCards.values()).some(p => p.zone === zone && p.slot === slot);
    if (isOccupied) return;

    // Check if zone is valid for card
    const validZones = getValidZones(card.type);
    if (!validZones.includes(zone)) {
      alert(`This player can only play in zones: ${validZones.join(', ')}`);
      return;
    }

    const newPlaced = new Map(placedCards);
    newPlaced.set(selectedCardId, { zone, slot });
    setPlacedCards(newPlaced);
    setSelectedCardId(null);
  };

  const handleConfirm = () => {
    // Convert placedCards map to FieldZone[]
    const field: FieldZone[] = [
      { zone: 1, cards: [], synergyCards: [], slots: [{ position: 1, athleteCard: null, shotMarkers: 0 }, { position: 2, athleteCard: null, shotMarkers: 0 }, { position: 3, athleteCard: null, shotMarkers: 0 }, { position: 4, athleteCard: null, shotMarkers: 0 }] },
      { zone: 2, cards: [], synergyCards: [], slots: [{ position: 1, athleteCard: null, shotMarkers: 0 }, { position: 2, athleteCard: null, shotMarkers: 0 }, { position: 3, athleteCard: null, shotMarkers: 0 }, { position: 4, athleteCard: null, shotMarkers: 0 }] },
      { zone: 3, cards: [], synergyCards: [], slots: [{ position: 1, athleteCard: null, shotMarkers: 0 }, { position: 2, athleteCard: null, shotMarkers: 0 }, { position: 3, athleteCard: null, shotMarkers: 0 }, { position: 4, athleteCard: null, shotMarkers: 0 }] },
      { zone: 4, cards: [], synergyCards: [], slots: [{ position: 1, athleteCard: null, shotMarkers: 0 }, { position: 2, athleteCard: null, shotMarkers: 0 }, { position: 3, athleteCard: null, shotMarkers: 0 }, { position: 4, athleteCard: null, shotMarkers: 0 }] },
    ];

    placedCards.forEach((pos, cardId) => {
      const card = starters.find(p => p.id === cardId);
      if (card) {
        const zoneIdx = pos.zone - 1;
        const slotIdx = pos.slot - 1;
        if (field[zoneIdx] && field[zoneIdx].slots[slotIdx]) {
          field[zoneIdx].slots[slotIdx].athleteCard = card;
        }
      }
    });

    onConfirm(field);
  };

  const autoPlace = () => {
    const newPlaced = new Map<string, { zone: number, slot: number }>();
    const usedSlots = new Set<string>();

    starters.forEach(card => {
        // Try to place in preferred zone first
        const validZones = getValidZones(card.type);
        for (const zone of validZones) {
            for (const slot of [2, 3, 1, 4]) { // Prefer middle slots
                const key = `${zone}-${slot}`;
                if (!usedSlots.has(key)) {
                    newPlaced.set(card.id, { zone, slot });
                    usedSlots.add(key);
                    return;
                }
            }
        }
    });
    setPlacedCards(newPlaced);
  };

  const isComplete = placedCards.size === 10;

  return (
    <div className="squad-selection formation-mode p-6">
      <div className="selection-header">
        <h2>Set Formation</h2>
        <p>Place your 10 starters on the field</p>
      </div>

      <div className="flex gap-8 p-4 h-[500px]">
        {/* Left: Unplaced Cards */}
        <div className="w-1/3 bg-stone-900/50 p-4 rounded-xl overflow-y-auto">
          <h3 className="text-white mb-4">Bench ({starters.length - placedCards.size} left)</h3>
          <div className="grid grid-cols-2 gap-2">
            {starters.map(card => {
              const isPlaced = placedCards.has(card.id);
              const isSelected = selectedCardId === card.id;
              if (isPlaced) return null;

              return (
                <div 
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`p-2 rounded cursor-pointer border ${isSelected ? 'border-yellow-400 bg-yellow-900/20' : 'border-stone-700 bg-stone-800'}`}
                >
                  <div className="text-xs font-bold text-white">{card.realName}</div>
                  <div className="text-[10px] text-stone-400">{card.positionLabel}</div>
                </div>
              );
            })}
          </div>
          <button onClick={autoPlace} className="mt-4 px-4 py-2 bg-blue-600 rounded text-white text-sm w-full">
            Auto Place
          </button>
        </div>

        {/* Right: Field Grid */}
        <div className="flex-1 bg-green-800/20 border-2 border-green-600/30 rounded-xl relative p-4 flex flex-col justify-between">
           {/* Zone Labels */}
           <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-around text-xs text-green-400 font-mono opacity-50">
              <span>FWD</span>
              <span>MID</span>
              <span>DEF</span>
              <span>GK</span>
           </div>

           {/* Grid */}
           {[4, 3, 2, 1].map(zone => (
             <div key={zone} className="flex-1 flex border-b border-green-600/10 last:border-0">
               {slots.map(slot => {
                 const occupiedBy = Array.from(placedCards.entries()).find(([_, pos]) => pos.zone === zone && pos.slot === slot);
                 const card = occupiedBy ? starters.find(p => p.id === occupiedBy[0]) : null;
                 
                 return (
                   <div 
                     key={slot} 
                     onClick={() => handleSlotClick(zone, slot)}
                     className={`flex-1 border-r border-green-600/10 last:border-0 flex items-center justify-center relative cursor-pointer hover:bg-white/5 transition-colors`}
                   >
                     {card ? (
                       <div className="w-20 h-28 bg-stone-800 rounded border border-white/20 flex flex-col items-center justify-center shadow-lg" onClick={(e) => { e.stopPropagation(); handleCardClick(card); }}>
                            <span className="text-xl">{card.isStar ? '⭐' : '👤'}</span>
                            <span className="text-[10px] text-white text-center px-1 leading-tight mt-1">{card.realName}</span>
                            <span className="text-[9px] text-stone-400">{card.positionLabel}</span>
                       </div>
                     ) : (
                       <div className="w-4 h-4 rounded-full bg-white/5" />
                     )}
                     <span className="absolute bottom-1 right-1 text-[8px] text-white/10">{zone}-{slot}</span>
                   </div>
                 );
               })}
             </div>
           ))}
        </div>
      </div>

      <div className="selection-actions">
        <button className="back-btn" onClick={onBack}>Back</button>
        <button
          className={`confirm-btn ${isComplete ? 'enabled' : 'disabled'}`}
          onClick={() => isComplete && handleConfirm()}
          disabled={!isComplete}
        >
          Start Match
        </button>
      </div>
    </div>
  );
};

export const SquadSelection: React.FC<SquadSelectionProps> = ({
  team,
  draftedStars,
  onComplete,
}) => {
  const [step, setStep] = useState<'select' | 'formation' | 'animating'>('select');
  const allPlayers = [...team.basePlayers, ...draftedStars];
  const [selectedStarters, setSelectedStarters] = useState<athleteCard[]>([]);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<athleteCard[]>([]);
  const [animatingSubstitutes, setAnimatingSubstitutes] = useState<athleteCard[]>([]);
  const [animationIndex, setAnimationIndex] = useState(0);

  const handleTogglePlayer = (player: athleteCard) => {
    const isStarter = selectedStarters.some(p => p.id === player.id);
    const isSubstitute = selectedSubstitutes.some(p => p.id === player.id);

    if (isStarter) {
      setSelectedStarters(prev => prev.filter(p => p.id !== player.id));
    } else if (isSubstitute) {
      setSelectedSubstitutes(prev => prev.filter(p => p.id !== player.id));
    } else {
      if (selectedStarters.length < 10) {
        setSelectedStarters(prev => [...prev, player]);
      } else if (selectedSubstitutes.length < 3) {
        setSelectedSubstitutes(prev => [...prev, player]);
      }
    }
  };

  const handleSetAsStarter = (player: athleteCard) => {
    if (selectedStarters.length < 10) {
      setSelectedSubstitutes(prev => prev.filter(p => p.id !== player.id));
      setSelectedStarters(prev => [...prev, player]);
    }
  };

  const handleSetAsSubstitute = (player: athleteCard) => {
    if (selectedSubstitutes.length < 3) {
      setSelectedStarters(prev => prev.filter(p => p.id !== player.id));
      setSelectedSubstitutes(prev => [...prev, player]);
    }
  };

  const canComplete = selectedStarters.length === 10 && selectedSubstitutes.length === 3;

  const getSelectionStatus = (player: athleteCard): 'starter' | 'substitute' | 'none' => {
    if (selectedStarters.some(p => p.id === player.id)) return 'starter';
    if (selectedSubstitutes.some(p => p.id === player.id)) return 'substitute';
    return 'none';
  };

  const handleStartAnimation = () => {
    if (canComplete) {
      setAnimatingSubstitutes(selectedSubstitutes);
      setAnimationIndex(0);
      setStep('animating');
      
      // Start animation sequence
      const animateNext = () => {
        setAnimationIndex(prev => {
          const nextIndex = prev + 1;
          if (nextIndex > selectedSubstitutes.length) {
            // Animation complete, go to formation step
            setTimeout(() => {
              setStep('formation');
            }, 500);
            return prev;
          }
          // Animate next card
          setTimeout(animateNext, 500);
          return nextIndex;
        });
      };
      
      // Start the animation sequence
      setTimeout(animateNext, 500);
    }
  };

  if (step === 'animating') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Animation Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-4xl bg-gradient-to-br from-stone-900 to-black p-8 rounded-xl border border-stone-700"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Placing Substitutes</h2>
          
          <div className="flex flex-col items-center gap-8">
            {/* Animation Area */}
            <div className="relative w-full h-64 bg-stone-800/50 rounded-lg border border-stone-700/50 flex items-center justify-center">
              {/* Substitute Bench */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-3/4 h-16 bg-stone-700 rounded-lg flex items-center justify-around">
                <span className="text-xs text-stone-400">SUB BENCH</span>
              </div>
              
              {/* Animating Cards */}
              {animatingSubstitutes.map((sub, index) => {
                const isAnimating = index < animationIndex;
                const isComplete = index < animationIndex - 1;
                
                return (
                  <motion.div
                    key={sub.id}
                    initial={{ y: -50, opacity: 0, x: Math.random() * 100 - 50 }}
                    animate={{
                      y: isComplete ? 0 : isAnimating ? [50, 0] : -50,
                      opacity: isComplete ? 1 : isAnimating ? 1 : 0,
                      x: isComplete ? index * 60 - 60 : Math.random() * 100 - 50,
                      scale: isComplete ? 0.8 : 1
                    }}
                    transition={{
                      duration: 0.5,
                      delay: isAnimating ? 0 : 0
                    }}
                    className={`absolute bottom-16 w-20 h-28 ${isComplete ? 'z-10' : 'z-20'}`}
                  >
                    <div className="w-full h-full bg-gradient-to-br from-stone-800 to-stone-900 rounded border border-stone-600 flex flex-col items-center justify-center shadow-lg">
                      <span className="text-xl">{sub.isStar ? '⭐' : '👤'}</span>
                      <span className="text-[10px] text-white text-center px-1 leading-tight mt-1">{sub.realName}</span>
                      <span className="text-[9px] text-stone-400">SUB</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Progress Indicator */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-sm text-stone-400 mb-2">
                <span>Placing substitutes</span>
                <span>{Math.min(animationIndex - 1, selectedSubstitutes.length)}/{selectedSubstitutes.length}</span>
              </div>
              <div className="w-full h-2 bg-stone-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min((animationIndex / selectedSubstitutes.length) * 100, 100)}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-green-500"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (step === 'formation') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop with blur */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        {/* Formation View Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        >
          <FormationView 
            starters={selectedStarters} 
            onBack={() => setStep('select')} 
            onConfirm={(field) => onComplete(selectedStarters, selectedSubstitutes, field)} 
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Squad Selection Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto"
      >
        <div className="squad-selection p-6">
          <div className="selection-header">
            <h2>Squad Selection</h2>
            <p>{team.name} - Select 10 starters and 3 substitutes</p>
          </div>

          <div className="selection-status">
            <div className="status-item starters-count">
              <span className="label">Starters</span>
              <span className={`count ${selectedStarters.length === 10 ? 'complete' : ''}`}>
                {selectedStarters.length}/10
              </span>
            </div>
            <div className="status-item subs-count">
              <span className="label">Substitutes</span>
              <span className={`count ${selectedSubstitutes.length === 3 ? 'complete' : ''}`}>
                {selectedSubstitutes.length}/3
              </span>
            </div>
          </div>

          <div className="selection-content">
            <div className="available-players">
              <h3>Available Players ({allPlayers.length})</h3>
              <div className="players-grid">
                {allPlayers.map(player => {
                  const status = getSelectionStatus(player);
                  return (
                    <div
                      key={player.id}
                      className={`player-card ${status} ${player.isStar ? 'star' : ''}`}
                      onClick={() => handleTogglePlayer(player)}
                    >
                      {player.isStar && <div className="star-badge">⭐</div>}
                      <div className="player-name">{player.realName}</div>
                      <div className="player-position">{player.positionLabel}</div>
                      <div className="player-stats">
                        <span className="atk">ATK:{player.icons.filter(i => i === 'attack').length}</span>
                        <span className="def">DEF:{player.icons.filter(i => i === 'defense').length}</span>
                      </div>
                      {status === 'starter' && <div className="selection-badge">START</div>}
                      {status === 'substitute' && <div className="selection-badge sub">SUB</div>}
                      <div className="player-actions">
                        {status === 'substitute' && selectedStarters.length < 10 && (
                          <button onClick={(e) => { e.stopPropagation(); handleSetAsStarter(player); }}>
                            Move to Starter
                          </button>
                        )}
                        {status === 'starter' && selectedSubstitutes.length < 3 && (
                          <button onClick={(e) => { e.stopPropagation(); handleSetAsSubstitute(player); }}>
                            Move to Sub
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="selected-squad">
              <div className="squad-section">
                <h3>Starters ({selectedStarters.length}/10)</h3>
                <div className="squad-list">
                  {selectedStarters.map(player => (
                    <div key={player.id} className="squad-item starter">
                      {player.isStar && <span className="star-icon">⭐</span>}
                      <span className="name">{player.realName}</span>
                      <span className="position">{player.positionLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="squad-section">
                <h3>Substitutes ({selectedSubstitutes.length}/3)</h3>
                <div className="squad-list">
                  {selectedSubstitutes.map(player => (
                    <div key={player.id} className="squad-item sub">
                      {player.isStar && <span className="star-icon">⭐</span>}
                      <span className="name">{player.realName}</span>
                      <span className="position">{player.positionLabel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="selection-actions">
            <button
              className={`confirm-btn ${canComplete ? 'enabled' : 'disabled'}`}
              onClick={handleStartAnimation}
              disabled={!canComplete}
            >
              {canComplete ? 'Start Match' : `Need ${10 - selectedStarters.length} starters and ${3 - selectedSubstitutes.length} substitutes`}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

