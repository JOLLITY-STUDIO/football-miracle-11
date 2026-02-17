import React from 'react';
import { SynergySlot } from './SynergySlot';
import type { SynergyCard } from '../data/cards';

interface Props {
  synergyHand: SynergyCard[];
  selectedCards?: SynergyCard[];
  onSelect?: ((card: SynergyCard) => void) | undefined;
  isAi?: boolean;
  revealed?: boolean;
  transparent?: boolean;
}

export const SynergyPanel: React.FC<Props> = ({
  synergyHand,
  selectedCards = [],
  onSelect,
  isAi = false,
  revealed = false,
  transparent = false,
}) => {
  // Group cards by type
  const attackCards = synergyHand.filter(c => c.type === 'attack');
  const defenseCards = synergyHand.filter(c => c.type === 'defense');
  const specialCards = synergyHand.filter(c => c.type === 'special' || c.type === 'tackle' || c.type === 'setpiece');

  return (
    <div className={`flex flex-col gap-6 p-6 ${transparent ? '' : 'bg-black/40 backdrop-blur-sm rounded-2xl border border-white/5 shadow-2xl'} ${isAi ? 'transform rotate-180' : ''}`}>
      {!transparent && (
        <div className={`text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2 text-center ${isAi ? 'transform rotate-180' : ''}`}>
          {isAi ? 'OPPONENT SYNERGY' : 'PLAYER SYNERGY'}
        </div>
      )}
      
      {/* Attack - Red */}
      <SynergySlot 
        cards={attackCards} 
        type="attack" 
        isAi={isAi} 
        onSelect={onSelect} 
        selectedCards={selectedCards} 
        revealed={revealed}
      />
      
      {/* Special/Tactical - Green */}
      <SynergySlot 
        cards={specialCards} 
        type="special" 
        isAi={isAi} 
        onSelect={onSelect} 
        selectedCards={selectedCards} 
        revealed={revealed}
      />
      
      {/* Defense - Blue */}
      <SynergySlot 
        cards={defenseCards} 
        type="defense" 
        isAi={isAi} 
        onSelect={onSelect} 
        selectedCards={selectedCards} 
        revealed={revealed}
      />
    </div>
  );
};

