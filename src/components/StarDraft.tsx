import React, { useState, useEffect } from 'react';
import type { athleteCard } from '../data/cards';
import type { Team } from '../data/teams';
import { getStarCardsForDraft, shuffleArray } from '../data/teams';
import { AthleteCardComponent } from './AthleteCard';

interface StarDraftProps {
  team: Team;
  onDraftComplete: (draftedStars: athleteCard[]) => void;
}

export const StarDraft: React.FC<StarDraftProps> = ({ team, onDraftComplete }) => {
  const [round, setRound] = useState(1);
  const [availableStars, setAvailableStars] = useState<athleteCard[]>([]);
  const [currentOptions, setCurrentOptions] = useState<athleteCard[]>([]);
  const [playerDrafted, setPlayerDrafted] = useState<athleteCard[]>([]);
  const [aiDrafted, setAiDrafted] = useState<athleteCard[]>([]);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const stars = getStarCardsForDraft();
    setAvailableStars(stars);
    const options = shuffleArray(stars).slice(0, 4);
    setCurrentOptions(options);
  }, []);

  const handlePlayerPick = (card: athleteCard) => {
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
            <div className="drafted-cards" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {playerDrafted.map(card => (
                <div key={card.id}>
                  <AthleteCardComponent 
                    card={card} 
                    size="small"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="result-section">
            <h3>AI Star Players ({aiDrafted.length})</h3>
            <div className="drafted-cards" style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {aiDrafted.map(card => (
                <div key={card.id}>
                  <AthleteCardComponent 
                    card={card} 
                    size="small"
                  />
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
          <div className="options-grid" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentOptions.map(card => (
              <div 
                key={card.id} 
                onClick={() => handlePlayerPick(card)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <AthleteCardComponent 
                  card={card} 
                  size="medium"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="drafted-preview">
        <div className="preview-section">
          <h4>Your Stars</h4>
          <div className="preview-cards" style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {playerDrafted.map(card => (
              <div key={card.id}>
                <AthleteCardComponent 
                  card={card} 
                  size="tiny"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};