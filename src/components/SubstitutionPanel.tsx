import React from 'react';
import type { AthleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';

interface Props {
  bench: AthleteCard[];
  selectedCard?: AthleteCard;
  substitutionsLeft: number;
  onSelect: (card: AthleteCard) => void;
  onCancel: () => void;
  onStartSecondHalf: () => void;
  phase: string;
}

export const SubstitutionPanel: React.FC<Props> = ({
  bench,
  selectedCard,
  substitutionsLeft,
  onSelect,
  onCancel,
  onStartSecondHalf,
  phase,
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-stone-800 rounded-2xl p-6 max-w-4xl">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          {phase === 'halfTime' ? 'HALF TIME - Substitutions' : 'Make Substitution'}
        </h2>
        <p className="text-gray-400 text-center mb-4">
          Substitutions remaining: {substitutionsLeft}
        </p>
        
        <div className="flex gap-4 mb-6">
          {bench.map((card) => (
            <div
              key={card.id}
              className={`cursor-pointer transition-transform ${selectedCard?.id === card.id ? 'scale-110' : 'hover:scale-105'}`}
              onClick={() => onSelect(card)}
            >
              <AthleteCardComponent
                card={card}
                size="small"
                selected={selectedCard?.id === card.id}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          {selectedCard && (
            <button
              onClick={onCancel}
              className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-bold transition-all"
            >
              Cancel
            </button>
          )}
          {phase === 'halfTime' && (
            <button
              onClick={onStartSecondHalf}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold transition-all"
            >
              Start Second Half
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

