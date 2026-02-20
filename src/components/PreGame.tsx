import React, { useState } from 'react';
import type { athleteCard } from '../data/cards';
import type { Team } from '../data/teams';
import { homeTeam, awayTeam } from '../data/teams';
import { StarDraft } from './StarDraft';
import { SquadSelection } from './SquadSelection';

interface PreGameProps {
  onComplete: (playerStarters: athleteCard[], playerSubs: athleteCard[], initialField: any[]) => void;
  onComplete3D: (playerStarters: athleteCard[], playerSubs: athleteCard[], initialField: any[]) => void;
  onBack: () => void;
}

type PreGamePhase = 'team-select' | 'star-draft' | 'squad-selection' | 'choose-renderer';

export const PreGame: React.FC<PreGameProps> = ({ onComplete, onComplete3D, onBack }) => {
  const [phase, setPhase] = useState<PreGamePhase>('team-select');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [draftedStars, setDraftedStars] = useState<athleteCard[]>([]);
  const [finalSquad, setFinalSquad] = useState<{ starters: athleteCard[]; substitutes: athleteCard[]; field: any[] } | null>(null);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setPhase('star-draft');
  };

  const handleDraftComplete = (stars: athleteCard[]) => {
    setDraftedStars(stars);
    setPhase('squad-selection');
  };

  const handleSquadComplete = (starters: athleteCard[], substitutes: athleteCard[], field: any[]) => {
    setFinalSquad({ starters, substitutes, field });
    setPhase('choose-renderer');
  };

  if (phase === 'choose-renderer' && finalSquad) {
    return (
      <div className="pre-game choose-renderer">
        <div className="choose-renderer-container">
          <h2>Choose Render Mode</h2>
          <p>Select how you want to play the game</p>
          <div className="renderer-options">
            <div className="renderer-option" onClick={() => onComplete(finalSquad.starters, finalSquad.substitutes, finalSquad.field)}>
              <div className="renderer-badge">2D</div>
              <h3>Classic 2D</h3>
              <p>CSS Transformations</p>
              <p className="renderer-desc">Fast performance, simple UI</p>
            </div>
            <div className="renderer-option" onClick={() => onComplete3D(finalSquad.starters, finalSquad.substitutes, finalSquad.field)}>
              <div className="renderer-badge">3D</div>
              <h3>True 3D</h3>
              <p>Three.js Rendering</p>
              <p className="renderer-desc">Real 3D interaction, accurate clicks</p>
            </div>
          </div>
          <button className="back-btn" onClick={() => setPhase('squad-selection')}>Back to Squad</button>
        </div>
      </div>
    );
  }

  if (phase === 'team-select') {
    return (
      <div className="pre-game team-select">
        <div className="team-select-container">
          <h2>Select Your Team</h2>
          <p>Choose which team to manage</p>
          <div className="team-options">
            <div className="team-option home" onClick={() => handleTeamSelect(homeTeam)} style={{ borderColor: '#FF5252', backgroundColor: 'rgba(255, 82, 82, 0.1)' }}>
              <div className="team-badge" style={{ backgroundColor: '#FF5252' }}>HOME</div>
              <h3>{homeTeam.name}</h3>
              <p>{homeTeam.basePlayers.length} base players</p>
              <div className="team-preview">
                {homeTeam.basePlayers.slice(0, 5).map(p => (
                  <span key={p.id} className="mini-player">{p.nickname}</span>
                ))}
              </div>
            </div>
            <div className="team-option away" onClick={() => handleTeamSelect(awayTeam)} style={{ borderColor: '#2196F3', backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
              <div className="team-badge" style={{ backgroundColor: '#2196F3' }}>AWAY</div>
              <h3>{awayTeam.name}</h3>
              <p>{awayTeam.basePlayers.length} base players</p>
              <div className="team-preview">
                {awayTeam.basePlayers.slice(0, 5).map(p => (
                  <span key={p.id} className="mini-player">{p.nickname}</span>
                ))}
              </div>
            </div>
          </div>
          <button className="back-btn" onClick={onBack}>Back to Menu</button>
        </div>
      </div>
    );
  }

  if (phase === 'star-draft' && selectedTeam) {
    return (
      <StarDraft team={selectedTeam} onDraftComplete={handleDraftComplete} />
    );
  }

  if (phase === 'squad-selection' && selectedTeam) {
    return (
      <SquadSelection
        team={selectedTeam}
        draftedStars={draftedStars}
        onComplete={handleSquadComplete}
      />
    );
  }

  return null;
};

