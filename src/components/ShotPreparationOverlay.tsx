import React from 'react';
import { SynergyCardComponent } from './SynergyCard';
import type { SynergyCard } from '../data/cards';
import type { GameState, GameAction } from '../game/gameLogic';

interface ShotPreparationOverlayProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
  playSound: (sound: string) => void;
}

export const ShotPreparationOverlay: React.FC<ShotPreparationOverlayProps> = ({
  gameState,
  dispatch,
  playSound
}) => {
  const { shotPreparationPhase, tempAttackerSynergy, tempDefenderSynergy, playerSynergyHand, aiSynergyHand, currentTurn } = gameState;

  if (shotPreparationPhase === 'none') return null;

  const isPlayerAttacking = currentTurn === 'player';
  const isPlayerDefending = currentTurn === 'ai';
  const attackerHand = isPlayerAttacking ? playerSynergyHand : aiSynergyHand;
  const defenderHand = isPlayerDefending ? playerSynergyHand : aiSynergyHand;

  const handleSelectAttackerSynergy = (card: SynergyCard) => {
    playSound('click');
    dispatch({ type: 'SELECT_ATTACKER_PREPARATION_SYNERGY', card });
  };

  const handleConfirmAttackerSynergy = () => {
    playSound('click');
    dispatch({ type: 'CONFIRM_ATTACKER_PREPARATION_SYNERGY' });
  };

  const handleSelectDefenderSynergy = (card: SynergyCard) => {
    playSound('click');
    dispatch({ type: 'SELECT_DEFENDER_PREPARATION_SYNERGY', card });
  };

  const handleConfirmDefenderSynergy = () => {
    playSound('click');
    dispatch({ type: 'CONFIRM_DEFENDER_PREPARATION_SYNERGY' });
  };

  const handleStartDuel = () => {
    playSound('whistle');
    dispatch({ type: 'START_DUEL_FROM_PREPARATION' });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 pointer-events-auto">
      <div className="bg-stone-900 border border-white/20 rounded-2xl p-6 max-w-3xl w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {shotPreparationPhase === 'attacker_synergy_selection' && 'Attacker Synergy Selection'}
            {shotPreparationPhase === 'defender_synergy_selection' && 'Defender Synergy Selection'}
            {shotPreparationPhase === 'ready_for_duel' && 'Preparation Complete'}
          </h2>
          <p className="text-white/70">
            {shotPreparationPhase === 'attacker_synergy_selection' && 'Select synergy cards to enhance your attack'}
            {shotPreparationPhase === 'defender_synergy_selection' && 'Select synergy cards to strengthen your defense'}
            {shotPreparationPhase === 'ready_for_duel' && 'All preparations complete. Ready to start duel?'}
          </p>
        </div>

        {/* Attacker Synergy Selection */}
        {shotPreparationPhase === 'attacker_synergy_selection' && (
          <div className="space-y-6">
            {/* Available Synergy Cards */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Available Synergy Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {attackerHand.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectAttackerSynergy(card)}
                    className={`cursor-pointer transition-all hover:scale-105 ${tempAttackerSynergy.some(c => c.id === card.id) ? 'ring-2 ring-yellow-500' : ''}`}
                  >
                    <SynergyCardComponent card={card} showBack={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Synergy Cards */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Selected Synergy Cards ({tempAttackerSynergy.length}/3)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tempAttackerSynergy.map((card) => (
                  <div key={card.id}>
                    <SynergyCardComponent card={card} showBack={false} />
                  </div>
                ))}
                {tempAttackerSynergy.length === 0 && (
                  <div className="col-span-full text-center text-white/50 py-4">
                    No synergy cards selected
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={handleConfirmAttackerSynergy}
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all hover:scale-105"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        )}

        {/* Defender Synergy Selection */}
        {shotPreparationPhase === 'defender_synergy_selection' && (
          <div className="space-y-6">
            {/* Available Synergy Cards */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Available Synergy Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {defenderHand.map((card) => (
                  <div
                    key={card.id}
                    onClick={() => handleSelectDefenderSynergy(card)}
                    className={`cursor-pointer transition-all hover:scale-105 ${tempDefenderSynergy.some(c => c.id === card.id) ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <SynergyCardComponent card={card} showBack={false} />
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Synergy Cards */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Selected Synergy Cards ({tempDefenderSynergy.length}/2)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {tempDefenderSynergy.map((card) => (
                  <div key={card.id}>
                    <SynergyCardComponent card={card} showBack={false} />
                  </div>
                ))}
                {tempDefenderSynergy.length === 0 && (
                  <div className="col-span-full text-center text-white/50 py-4">
                    No synergy cards selected
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={handleConfirmDefenderSynergy}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all hover:scale-105"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        )}

        {/* Ready for Duel */}
        {shotPreparationPhase === 'ready_for_duel' && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-stone-800 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Preparation Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-white/80">
                  <span>Attacker Synergy Cards:</span>
                  <span>{tempAttackerSynergy.length}</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Defender Synergy Cards:</span>
                  <span>{tempDefenderSynergy.length}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={handleStartDuel}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-lg hover:from-green-600 hover:to-teal-600 transition-all hover:scale-105 text-lg"
              >
                Start Duel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
