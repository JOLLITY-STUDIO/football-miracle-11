import type { PlayerCard } from './cards';
import { basePlayerCards, starPlayerCards } from './cards';

export interface Team {
  id: string;
  name: string;
  basePlayers: PlayerCard[];
  isHome: boolean;
}

export interface DraftState {
  round: number;
  availableStars: PlayerCard[];
  playerDrafted: PlayerCard | null;
  aiDrafted: PlayerCard | null;
}

export interface TeamSelectionState {
  phase: 'star-draft' | 'squad-selection' | 'match';
  allPlayerCards: PlayerCard[];
  selectedStarters: PlayerCard[];
  selectedSubstitutes: PlayerCard[];
  draftState: DraftState | null;
}

const homeTeamBasePlayers = basePlayerCards.slice(0, 10);
const awayTeamBasePlayers = basePlayerCards.slice(10, 20);

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

export function getStarCardsForDraft(): PlayerCard[] {
  return [...starPlayerCards];
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

export function drawStarsForDraftRound(availableStars: PlayerCard[], count: number): PlayerCard[] {
  const shuffled = shuffleArray(availableStars);
  return shuffled.slice(0, count);
}

export function removeDraftedStars(availableStars: PlayerCard[], drafted: PlayerCard[]): PlayerCard[] {
  const draftedIds = new Set(drafted.map(card => card.id));
  return availableStars.filter(card => !draftedIds.has(card.id));
}
