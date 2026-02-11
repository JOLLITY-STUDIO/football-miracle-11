import React, { useState } from 'react';
import type { PlayerCard } from '../data/cards';
import type { Team } from '../data/teams';
import type { FieldZone } from '../game/gameLogic';

interface SquadSelectionProps {
  team: Team;
  draftedStars: PlayerCard[];
  onComplete: (starters: PlayerCard[], substitutes: PlayerCard[], initialField: FieldZone[]) => void;
}

const FormationView: React.FC<{
  starters: PlayerCard[];
  onBack: () => void;
  onConfirm: (field: FieldZone[]) => void;
}> = ({ starters, onBack, onConfirm }) => {
  const [placedCards, setPlacedCards] = useState<Map<string, { zone: number, slot: number }>>(new Map());
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const zones = [1, 2, 3, 4];
  const slots = [1, 2, 3, 4];

  const handleCardClick = (card: PlayerCard) => {
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
    if (!card.zones.includes(zone)) {
      alert(`This player can only play in zones: ${card.zones.join(', ')}`);
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
      { zone: 1, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 2, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 3, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
      { zone: 4, slots: [{ position: 1, playerCard: null, shotMarkers: 0 }, { position: 2, playerCard: null, shotMarkers: 0 }, { position: 3, playerCard: null, shotMarkers: 0 }, { position: 4, playerCard: null, shotMarkers: 0 }] },
    ];

    placedCards.forEach((pos, cardId) => {
      const card = starters.find(p => p.id === cardId);
      if (card) {
        const zoneIdx = pos.zone - 1;
        const slotIdx = pos.slot - 1;
        if (field[zoneIdx] && field[zoneIdx].slots[slotIdx]) {
          field[zoneIdx].slots[slotIdx].playerCard = card;
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
        for (const zone of card.zones) {
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
    <div className="squad-selection formation-mode">
      <div className="selection-header">
        <h2>Set Formation</h2>
        <p>Place your 10 starters on the field</p>
      </div>

      <div className="flex gap-8 p-8 h-[600px]">
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
  const [step, setStep] = useState<'select' | 'formation'>('select');
  const allPlayers = [...team.basePlayers, ...draftedStars];
  const [selectedStarters, setSelectedStarters] = useState<PlayerCard[]>([]);
  const [selectedSubstitutes, setSelectedSubstitutes] = useState<PlayerCard[]>([]);

  const handleTogglePlayer = (player: PlayerCard) => {
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

  const handleSetAsStarter = (player: PlayerCard) => {
    if (selectedStarters.length < 10) {
      setSelectedSubstitutes(prev => prev.filter(p => p.id !== player.id));
      setSelectedStarters(prev => [...prev, player]);
    }
  };

  const handleSetAsSubstitute = (player: PlayerCard) => {
    if (selectedSubstitutes.length < 3) {
      setSelectedStarters(prev => prev.filter(p => p.id !== player.id));
      setSelectedSubstitutes(prev => [...prev, player]);
    }
  };

  const canComplete = selectedStarters.length === 10 && selectedSubstitutes.length === 3;

  const getSelectionStatus = (player: PlayerCard): 'starter' | 'substitute' | 'none' => {
    if (selectedStarters.some(p => p.id === player.id)) return 'starter';
    if (selectedSubstitutes.some(p => p.id === player.id)) return 'substitute';
    return 'none';
  };

  if (step === 'formation') {
    return (
      <FormationView 
        starters={selectedStarters} 
        onBack={() => setStep('select')} 
        onConfirm={(field) => onComplete(selectedStarters, selectedSubstitutes, field)} 
      />
    );
  }

  return (
    <div className="squad-selection">
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
                    <span className="atk">ATK:{player.attack}</span>
                    <span className="def">DEF:{player.defense}</span>
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
          onClick={() => canComplete && onComplete(selectedStarters, selectedSubstitutes)}
          disabled={!canComplete}
        >
          {canComplete ? 'Start Match' : `Need ${10 - selectedStarters.length} starters and ${3 - selectedSubstitutes.length} substitutes`}
        </button>
      </div>
    </div>
  );
};
