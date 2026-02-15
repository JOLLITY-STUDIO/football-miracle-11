import React from 'react';
import type { SynergyCard } from '../data/cards';
import { SynergyCardComponent } from './SynergyCard';
 
interface Props {
  playerSynergyHand: SynergyCard[];
  selectedSynergyCards: SynergyCard[];
  onSynergySelect: (card: SynergyCard) => void;
}
 
export const DrawArea: React.FC<Props> = ({
  playerSynergyHand,
  selectedSynergyCards,
  onSynergySelect,
}) => {
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-between items-center gap-2 px-1">
        <span className="text-[10px] text-white/40 uppercase tracking-widest">SYNERGY</span>
      </div>
      <div className="flex gap-2">
        {playerSynergyHand.map((card) => (
          <div key={card.id} className="relative transform hover:-translate-y-4 transition-transform cursor-pointer">
            <SynergyCardComponent
              card={card}
              size="normal"
              onClick={() => onSynergySelect(card)}
              selected={selectedSynergyCards.some(c => c.id === card.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

