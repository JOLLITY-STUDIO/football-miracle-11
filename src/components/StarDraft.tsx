import React, { useState, useEffect } from 'react';
import type { PlayerCard } from '../data/cards';
import type { Team } from '../data/teams';
import { getStarCardsForDraft, shuffleArray } from '../data/teams';

interface StarDraftProps {
  team: Team;
  onDraftComplete: (draftedStars: PlayerCard[]) => void;
}

export const StarDraft: React.FC<StarDraftProps> = ({ team, onDraftComplete }) => {
  const [round, setRound] = useState(1);
  const [availableStars, setAvailableStars] = useState<PlayerCard[]>([]);
  const [currentOptions, setCurrentOptions] = useState<PlayerCard[]>([]);
  const [playerDrafted, setPlayerDrafted] = useState<PlayerCard[]>([]);
  const [aiDrafted, setAiDrafted] = useState<PlayerCard[]>([]);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const stars = getStarCardsForDraft();
    setAvailableStars(stars);
    const options = shuffleArray(stars).slice(0, 4);
    setCurrentOptions(options);
  }, []);

  const handlePlayerPick = (card: PlayerCard) => {
    const newPlayerDrafted = [...playerDrafted, card];
    setPlayerDrafted(newPlayerDrafted);
    
    const remaining = availableStars.filter(s => s.id !== card.id);
    setAvailableStars(remaining);
    
    setIsAiTurn(true);
    
    setTimeout(() => {
      const aiOptions = shuffleArray(remaining.filter(s => !currentOptions.some(o => o.id === s.id))).slice(0, 4);
      const aiPick = aiOptions[Math.floor(Math.random() * aiOptions.length)];
      if (aiPick) {
        const newAiDrafted = [...aiDrafted, aiPick];
        setAiDrafted(newAiDrafted);
        setAvailableStars(prev => prev.filter(s => s.id !== aiPick.id));
      }
      setIsAiTurn(false);
      
      if (round < 3) {
        setRound(round + 1);
        const nextOptions = shuffleArray(remaining.filter(s => s.id !== card.id && (!aiDrafted.length || s.id !== aiPick?.id))).slice(0, 4);
        setCurrentOptions(nextOptions);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  const handleComplete = () => {
    onDraftComplete(playerDrafted);
  };

  if (showResult) {
    return (
      <div className="star-draft">
        <div className="draft-result">
          <h2>Draft Complete!</h2>
          <div className="result-section">
            <h3>Your Star Players ({playerDrafted.length})</h3>
            <div className="drafted-cards">
              {playerDrafted.map(card => (
                <div key={card.id} className="draft-card star-card">
                  <div className="card-name">{card.realName}</div>
                  <div className="card-position">{card.positionLabel}</div>
                  <div className="card-stats">ATK:{card.attack} DEF:{card.defense}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="result-section">
            <h3>AI Star Players ({aiDrafted.length})</h3>
            <div className="drafted-cards">
              {aiDrafted.map(card => (
                <div key={card.id} className="draft-card star-card-ai">
                  <div className="card-name">{card.realName}</div>
                  <div className="card-position">{card.positionLabel}</div>
                  <div className="card-stats">ATK:{card.attack} DEF:{card.defense}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="complete-btn" onClick={handleComplete}>
            Continue to Squad Selection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="star-draft">
      <div className="draft-header">
        <h2>Star Player Draft - Round {round}/3</h2>
        <p>{team.name} - Pick your star player</p>
      </div>
      
      <div className="draft-status">
        <div className="status-item">
          <span>Your Picks: {playerDrafted.length}/3</span>
        </div>
        <div className="status-item">
          <span>AI Picks: {aiDrafted.length}/3</span>
        </div>
      </div>

      {isAiTurn ? (
        <div className="ai-thinking">
          <div className="loading-spinner"></div>
          <p>AI is selecting their star player...</p>
        </div>
      ) : (
        <div className="draft-options">
          <h3>Choose one star player:</h3>
          <div className="options-grid">
            {currentOptions.map(card => (
              <div 
                key={card.id} 
                className="draft-option star-card"
                onClick={() => handlePlayerPick(card)}
              >
                <div className="card-badge">⭐ STAR</div>
                <div className="card-name">{card.realName}</div>
                <div className="card-position">{card.positionLabel}</div>
                <div className="card-type">{card.type}</div>
                <div className="card-stats">
                  <span className="stat-atk">ATK: {card.attack}</span>
                  <span className="stat-def">DEF: {card.defense}</span>
                </div>
                <div className="card-icons">
                  {card.icons.map((icon, i) => (
                    <span key={i} className="icon-badge">{icon}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="drafted-preview">
        <div className="preview-section">
          <h4>Your Stars</h4>
          <div className="preview-cards">
            {playerDrafted.map(card => (
              <div key={card.id} className="preview-card">
                {card.realName}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
