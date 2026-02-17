import React, { useState } from 'react';
import type { AthleteCard } from '../data/cards';
import { baseathleteCards } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';

interface Props {
  onComplete: (squad: AthleteCard[], starters: AthleteCard[], substitutes: AthleteCard[]) => void;
}

export const TeamBuilder: React.FC<Props> = ({ onComplete }) => {
  const [selectedCards, setSelectedCards] = useState<AthleteCard[]>([]);
  const [step, setStep] = useState<'select' | 'starters'>('select');
  const [starters, setStarters] = useState<AthleteCard[]>([]);
  const [substitutes, setSubstitutes] = useState<AthleteCard[]>([]);

  const handleCardSelect = (card: AthleteCard) => {
    if (step === 'select') {
      const isSelected = selectedCards.some(c => c.id === card.id);
      if (isSelected) {
        setSelectedCards(selectedCards.filter(c => c.id !== card.id));
      } else if (selectedCards.length < 13) {
        setSelectedCards([...selectedCards, card]);
      }
    } else {
      const isStarter = starters.some(c => c.id === card.id);
      const isSubstitute = substitutes.some(c => c.id === card.id);
      
      if (isStarter) {
        setStarters(starters.filter(c => c.id !== card.id));
        setSubstitutes([...substitutes, card]);
      } else if (isSubstitute) {
        setSubstitutes(substitutes.filter(c => c.id !== card.id));
      } else if (starters.length < 10) {
        setStarters([...starters, card]);
      } else if (substitutes.length < 3) {
        setSubstitutes([...substitutes, card]);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (selectedCards.length === 13) {
      setStep('starters');
    }
  };

  const handleConfirmTeam = () => {
    if (starters.length === 10 && substitutes.length === 3) {
      onComplete(selectedCards, starters, substitutes);
    }
  };

  const handleAutoSelect = () => {
    const shuffled = [...baseathleteCards].sort(() => Math.random() - 0.5);
    setSelectedCards(shuffled.slice(0, 13));
  };

  const handleAutoAssign = () => {
    const shuffled = [...selectedCards].sort(() => Math.random() - 0.5);
    setStarters(shuffled.slice(0, 10));
    setSubstitutes(shuffled.slice(10, 13));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 'select' ? 'Select your squad (13/13)' : 'Assign Starters & Substitutes'}
          </h1>
          <p className="text-green-200">
            {step === 'select' 
              ? `Selected ${selectedCards.length}/13 players`
              : `Starter ${starters.length}/10 | Sub ${substitutes.length}/3`
            }
          </p>
        </div>

        {step === 'select' ? (
          <>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h2 className="text-white font-bold mb-3">Forwards ({baseathleteCards.filter(c => c.type === 'fw').length})</h2>
              <div className="flex flex-wrap gap-2">
                {baseathleteCards.filter(c => c.type === 'fw').map(card => (
                  <AthleteCardComponent
                    key={card.id}
                    card={card}
                    size="small"
                    selected={selectedCards.some(c => c.id === card.id)}
                    onClick={() => handleCardSelect(card)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h2 className="text-white font-bold mb-3">Midfielders ({baseathleteCards.filter(c => c.type === 'mf').length})</h2>
              <div className="flex flex-wrap gap-2">
                {baseathleteCards.filter(c => c.type === 'mf').map(card => (
                  <AthleteCardComponent
                    key={card.id}
                    card={card}
                    size="small"
                    selected={selectedCards.some(c => c.id === card.id)}
                    onClick={() => handleCardSelect(card)}
                  />
                ))}
              </div>
            </div>

            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h2 className="text-white font-bold mb-3">Defenders ({baseathleteCards.filter(c => c.type === 'df').length})</h2>
              <div className="flex flex-wrap gap-2">
                {baseathleteCards.filter(c => c.type === 'df').map(card => (
                  <AthleteCardComponent
                    key={card.id}
                    card={card}
                    size="small"
                    selected={selectedCards.some(c => c.id === card.id)}
                    onClick={() => handleCardSelect(card)}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleAutoSelect}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
              >
                Random Select
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedCards.length !== 13}
                className={`px-6 py-2 rounded-lg transition font-bold ${
                  selectedCards.length === 13
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                Confirm
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h2 className="text-white font-bold mb-3">Selected Players ({selectedCards.length})</h2>
              <div className="flex flex-wrap gap-2">
                {selectedCards.map(card => (
                  <div key={card.id} className="relative">
                    <AthleteCardComponent
                      card={card}
                      size="small"
                      selected={starters.some(c => c.id === card.id)}
                      onClick={() => handleCardSelect(card)}
                    />
                    {starters.some(c => c.id === card.id) && (
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 rounded">Starter</div>
                    )}
                    {substitutes.some(c => c.id === card.id) && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-1 rounded">Sub</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-900/50 rounded-lg p-4">
                <h3 className="text-green-300 font-bold mb-2">Starting XI ({starters.length}/10)</h3>
                <div className="flex flex-wrap gap-2 min-h-20">
                  {starters.map(card => (
                    <AthleteCardComponent
                      key={card.id}
                      card={card}
                      size="small"
                      onClick={() => handleCardSelect(card)}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-yellow-900/50 rounded-lg p-4">
                <h3 className="text-yellow-300 font-bold mb-2">Substitutes ({substitutes.length}/3)</h3>
                <div className="flex flex-wrap gap-2 min-h-20">
                  {substitutes.map(card => (
                    <AthleteCardComponent
                      key={card.id}
                      card={card}
                      size="small"
                      onClick={() => handleCardSelect(card)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleAutoAssign}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
              >
                Auto Assign
              </button>
              <button
                onClick={() => setStep('select')}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition"
              >
                Back
              </button>
              <button
                onClick={handleConfirmTeam}
                disabled={starters.length !== 10 || substitutes.length !== 3}
                className={`px-6 py-2 rounded-lg transition font-bold ${
                  starters.length === 10 && substitutes.length === 3
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
              >
                Start Match
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};




