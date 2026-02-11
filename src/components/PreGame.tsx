import React, { useState } from 'react';
import type { PlayerCard } from '../data/cards';
import type { Team } from '../data/teams';
import { homeTeam, awayTeam } from '../data/teams';
import { StarDraft } from './StarDraft';
import { SquadSelection } from './SquadSelection';

interface PreGameProps {
  onComplete: (playerStarters: PlayerCard[], playerSubs: PlayerCard[], initialField: any[]) => void;
  onBack: () => void;
}

type PreGamePhase = 'team-select' | 'star-draft' | 'squad-selection';

export const PreGame: React.FC<PreGameProps> = ({ onComplete, onBack }) => {
  const [phase, setPhase] = useState<PreGamePhase>('team-select');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [draftedStars, setDraftedStars] = useState<PlayerCard[]>([]);

  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setPhase('star-draft');
  };

  const handleDraftComplete = (stars: PlayerCard[]) => {
    setDraftedStars(stars);
    setPhase('squad-selection');
  };

  const handleSquadComplete = (starters: PlayerCard[], substitutes: PlayerCard[], field: any[]) => {
    onComplete(starters, substitutes, field);
  };

  if (phase === 'team-select') {
    return (
      <div className="pre-game team-select">
        <div className="team-select-container">
          <h2>Select Your Team</h2>
          <p>Choose which team to manage</p>
          <div className="team-options">
            <div className="team-option home" onClick={() => handleTeamSelect(homeTeam)}>
              <div className="team-badge">HOME</div>
              <h3>{homeTeam.name}</h3>
              <p>{homeTeam.basePlayers.length} base players</p>
              <div className="team-preview">
                {homeTeam.basePlayers.slice(0, 5).map(p => (
                  <span key={p.id} className="mini-player">{p.realName}</span>
                ))}
              </div>
            </div>
            <div className="team-option away" onClick={() => handleTeamSelect(awayTeam)}>
              <div className="team-badge">AWAY</div>
              <h3>{awayTeam.name}</h3>
              <p>{awayTeam.basePlayers.length} base players</p>
              <div className="team-preview">
                {awayTeam.basePlayers.slice(0, 5).map(p => (
                  <span key={p.id} className="mini-player">{p.realName}</span>
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
