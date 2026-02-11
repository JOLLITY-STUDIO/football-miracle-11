import type { PlayerCard, SynergyCard } from '../data/cards';
import type { GamePhase } from './gameLogic';

export type ActionType = 
  | 'place_card'
  | 'attack'
  | 'select_synergy'
  | 'end_turn'
  | 'switch_control'
  | 'penalty_result'
  | 'ai_action'
  | 'team_action'
  | 'organize_attack'
  | 'direct_attack';

export interface GameAction {
  type: ActionType;
  timestamp: number;
  turn: number;
  actor: 'player' | 'ai';
  details: Record<string, unknown>;
}

export interface GameSnapshot {
  playerScore: number;
  aiScore: number;
  playerField: { zone: number; slots: { position: number; playerCardId: string | null }[] }[];
  aiField: { zone: number; slots: { position: number; playerCardId: string | null }[] }[];
  playerHand: string[];
  aiHand: string[];
  controlPosition: number;
  phase: GamePhase;
}

export interface GameRecord {
  id: string;
  startTime: number;
  endTime?: number;
  winner?: 'player' | 'ai' | 'draw';
  actions: GameAction[];
  snapshots: GameSnapshot[];
  finalScore?: { player: number; ai: number };
}

export class GameRecorder {
  private record: GameRecord;
  private turnCount: number = 0;

  constructor() {
    this.record = {
      id: `game_${Date.now()}`,
      startTime: Date.now(),
      actions: [],
      snapshots: [],
    };
  }

  recordAction(type: ActionType, actor: 'player' | 'ai', details: Record<string, unknown> = {}) {
    const action: GameAction = {
      type,
      timestamp: Date.now(),
      turn: this.turnCount,
      actor,
      details,
    };
    this.record.actions.push(action);
  }

  recordSnapshot(snapshot: GameSnapshot) {
    this.record.snapshots.push(snapshot);
  }

  incrementTurn() {
    this.turnCount++;
  }

  getTurnCount() {
    return this.turnCount;
  }

  endGame(winner: 'player' | 'ai' | 'draw', finalScore: { player: number; ai: number }) {
    this.record.endTime = Date.now();
    this.record.winner = winner;
    this.record.finalScore = finalScore;
    return this.record;
  }

  getRecord(): GameRecord {
    return this.record;
  }

  getActions(): GameAction[] {
    return this.record.actions;
  }

  getLastAction(): GameAction | undefined {
    return this.record.actions[this.record.actions.length - 1];
  }
}

const STORAGE_KEY = 'magic_eleven_game_records';

export function saveGameRecord(record: GameRecord): void {
  try {
    const records = loadAllGameRecords();
    records.unshift(record);
    const limitedRecords = records.slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedRecords));
  } catch (e) {
    console.error('Failed to save game record:', e);
  }
}

export function loadAllGameRecords(): GameRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load game records:', e);
    return [];
  }
}

export function loadGameRecord(id: string): GameRecord | undefined {
  const records = loadAllGameRecords();
  return records.find(r => r.id === id);
}

export function deleteGameRecord(id: string): void {
  const records = loadAllGameRecords();
  const filtered = records.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearAllGameRecords(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function formatAction(action: GameAction, playerCards: PlayerCard[], synergyCards: SynergyCard[]): string {
  const actor = action.actor === 'player' ? 'You' : 'AI';
  const cardById = (id: string) => playerCards.find(c => c.id === id)?.name || id;
  const synergyById = (id: string) => synergyCards.find(c => c.id === id)?.name || id;

  switch (action.type) {
    case 'place_card':
      return `${actor} ${cardById(action.details.cardId as string)} placed at ${action.details.zone}line`;
    case 'attack':
      const result = action.details.success ? 'Success' : 'Failed';
      return `${actor}Attacked，${result}！(Attack:${action.details.attackPower} vs Defense:${action.details.defensePower})`;
    case 'select_synergy':
      return `${actor} selected synergy card: ${synergyById(action.details.cardId as string)}`;
    case 'end_turn':
      return `${actor}Ended turn`;
    case 'switch_control':
      return `${actor}Changed control to: ${action.details.state}`;
    case 'penalty_result':
      const penaltyResult = action.details.result === 'win' ? 'Scored' : action.details.result === 'lose' ? 'Missed' : 'Retake';
      return `${actor}Penalty${penaltyResult}`;
    case 'ai_action':
      return `AI took action`;
    default:
      return `${actor}Executed ${action.type}`;
  }
}



