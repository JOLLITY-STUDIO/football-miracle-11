export type PlayerActionType = 'place' | 'shot' | 'synergy' | 'substitute' | 'teamAction' | 'immediateEffect' | 'penalty';
export type GamePhase = 'pregame' | 'coinToss' | 'squadSelection' | 'setup' | 'draft' | 'firstHalf' | 'halfTime' | 'secondHalf' | 'fullTime' | 'penaltyShootout';
export type TurnPhase = 'start' | 'teamAction' | 'playerAction' | 'shooting' | 'end';
export type DuelPhase = 'none' | 'init' | 'select_shot_icon' | 'reveal_attacker' | 'reveal_defender' | 'defender_synergy_selection' | 'reveal_synergy' | 'reveal_skills' | 'summary' | 'result';

export interface ShotAttempt {
  attacker: {
    card: any;
    zone: number;
    slot: number;
    usedShotIcons: number[];
  };
  defender: {
    card: any;
    zone: number;
    slot: number;
  } | null;
  phase: DuelPhase;
  attackerPower: number;
  defenderPower: number;
  attackSynergy: any[];
  defenseSynergy: any[];
  activatedSkills: {
    attackerSkills: string[];
    defenderSkills: string[];
  };
  attackerUsedShotIcons: number[];
  result: 'goal' | 'magicNumber' | 'saved' | 'missed' | null;
}

export interface FieldZone {
  zone: number;
  cards: any[];
  synergyCards: any[];
  slots: {
    position: number;
    playerCard: any;
    usedShotIcons?: number[];
    shotMarkers?: number;
  }[];
}
