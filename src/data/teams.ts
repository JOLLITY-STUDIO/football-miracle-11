import type { athleteCard } from './cards';
import { baseathleteCards, starathleteCards } from './cards';

export interface Team {
  id: string;
  name: string;
  basePlayers: athleteCard[];
  isHome: boolean;
}

export interface DraftState {
  round: number;
  availableStars: athleteCard[];
  playerDrafted: athleteCard | null;
  aiDrafted: athleteCard | null;
}

export interface TeamSelectionState {
  phase: 'star-draft' | 'squad-selection' | 'match';
  allathleteCards: athleteCard[];
  selectedStarters: athleteCard[];
  selectedSubstitutes: athleteCard[];
  draftState: DraftState | null;
}

const homeTeamBasePlayers = baseathleteCards.filter(card => card.id.startsWith('H'));
const awayTeamBasePlayers = baseathleteCards.filter(card => card.id.startsWith('A'));

export const homeTeam: Team = {
  id: 'home',
  name: 'Home Team',
  basePlayers: homeTeamBasePlayers,
  isHome: true,
};

export const awayTeam: Team = {
  id: 'away',
  name: 'Away Team',
  basePlayers: awayTeamBasePlayers,
  isHome: false,
};

export function getStarCardsForDraft(): athleteCard[] {
  return [...starathleteCards];
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled: T[] = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i] as T;
    shuffled[i] = shuffled[j] as T;
    shuffled[j] = temp;
  }
  return shuffled;
}

export function drawStarsForDraftRound(availableStars: athleteCard[], count: number): athleteCard[] {
  const shuffled = shuffleArray(availableStars);
  return shuffled.slice(0, count);
}

export function removeDraftedStars(availableStars: athleteCard[], drafted: athleteCard[]): athleteCard[] {
  const draftedIds = new Set(drafted.map(card => card.id));
  return availableStars.filter(card => !draftedIds.has(card.id));
}

