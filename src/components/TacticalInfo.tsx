import React from 'react';
import type { FieldZone } from '../game/gameLogic';
import { countIcons } from '../game/gameLogic';

interface TacticalInfoProps {
  playerField: FieldZone[];
  aiField: FieldZone[];
}

export const TacticalInfo: React.FC<TacticalInfoProps> = ({ playerField, aiField }) => {
  const playerPassCount = countIcons(playerField, 'pass');
  const playerPressCount = countIcons(playerField, 'press');
  const playerAttackCount = countIcons(playerField, 'attack');
  const playerDefenseCount = countIcons(playerField, 'defense');
  const playerBreakthroughCount = countIcons(playerField, 'breakthrough');

  const aiPassCount = countIcons(aiField, 'pass');
  const aiPressCount = countIcons(aiField, 'press');
  const aiAttackCount = countIcons(aiField, 'attack');
  const aiDefenseCount = countIcons(aiField, 'defense');
  const aiBreakthroughCount = countIcons(aiField, 'breakthrough');

  const renderIconBar = (iconType: string, playerCount: number, aiCount: number, color: string) => (
    <div className="icon-bar-row">
      <div className="icon-label">{iconType}</div>
      <div className="icon-bars">
        <div className="ai-bar" style={{ width: `${Math.min(aiCount * 15, 50)}%`, backgroundColor: color }}>
          {aiCount > 0 && <span className="bar-count">{aiCount}</span>}
        </div>
        <div className="vs-divider">VS</div>
        <div className="player-bar" style={{ width: `${Math.min(playerCount * 15, 50)}%`, backgroundColor: color }}>
          {playerCount > 0 && <span className="bar-count">{playerCount}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="tactical-info">
      <div className="tactical-header">
        <h3>Tactical Overview</h3>
      </div>
      
      <div className="tactical-content">
        <div className="team-labels">
          <span className="ai-label">AI</span>
          <span className="player-label">You</span>
        </div>

        <div className="icon-bars-container">
          {renderIconBar('⚔️ Attack', playerAttackCount, aiAttackCount, '#ff6b6b')}
          {renderIconBar('🛡️ Defense', playerDefenseCount, aiDefenseCount, '#4ecdc4')}
          {renderIconBar('➡️ Pass', playerPassCount, aiPassCount, '#ffd93d')}
          {renderIconBar('⬆️ Press', playerPressCount, aiPressCount, '#6c5ce7')}
          {renderIconBar('💨 Breakthrough', playerBreakthroughCount, aiBreakthroughCount, '#00cec9')}
        </div>

        <div className="tactical-summary">
          <div className="summary-section">
            <h4>Your Tactical Bonuses</h4>
            <div className="bonus-list">
              {playerAttackCount > 0 && (
                <div className="bonus-item attack">+{playerAttackCount} Attack</div>
              )}
              {playerDefenseCount > 0 && (
                <div className="bonus-item defense">+{playerDefenseCount} Defense</div>
              )}
              {playerPassCount > 0 && (
                <div className="bonus-item pass">+{playerPassCount} Pass Bonus</div>
              )}
              {playerPressCount > 0 && (
                <div className="bonus-item press">+{playerPressCount} Press Bonus</div>
              )}
              {playerBreakthroughCount > 0 && (
                <div className="bonus-item breakthrough">+{playerBreakthroughCount * 2} Breakthrough</div>
              )}
              {playerAttackCount === 0 && playerDefenseCount === 0 && playerPassCount === 0 && playerPressCount === 0 && playerBreakthroughCount === 0 && (
                <div className="no-bonus">Place cards to create tactical connections</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
