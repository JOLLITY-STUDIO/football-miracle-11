import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialState } from '../game/gameLogic';
import { athleteCard } from '../types/game';

describe('Player State Tracking', () => {
  const createTestPlayer = (id: string, name: string, iconPositions: any[]): athleteCard => ({
    id,
    name,
    position: 'CF',
    power: 5,
    iconPositions,
    skills: ['shot'],
    image: 'test.png',
    rarity: 'common'
  });

  it('should track used shot icons when performing a shot', () => {
    const initialState = createInitialState();
    const athleteCard = createTestPlayer('player1', 'Test Player', [
      { type: 'attack', position: 'top-25%' },
      { type: 'defense', position: 'bottom-25%' }
    ]);

    const stateWithPlayer = {
      ...initialState,
      playerHand: [athleteCard],
      turnPhase: 'playerAction' as const,
      currentTurn: 'player' as const
    };

    const action = {
      type: 'PERFORM_SHOT' as const,
      card: athleteCard,
      slot: 0,
      zone: 0
    };

    const newState = gameReducer(stateWithPlayer, action);

    expect(newState.pendingShot).toBeDefined();
    expect(newState.pendingShot?.attacker.usedShotIcons).toHaveLength(1);
    expect(newState.playerUsedShotIcons['player1']).toHaveLength(1);
  });

  it('should prevent using the same shot icon twice', () => {
    const initialState = createInitialState();
    const athleteCard = createTestPlayer('player1', 'Test Player', [
      { type: 'attack', position: 'top-25%' },
      { type: 'attack', position: 'top-75%' },
      { type: 'defense', position: 'bottom-25%' }
    ]);

    const stateWithPlayer = {
      ...initialState,
      playerHand: [athleteCard],
      turnPhase: 'playerAction' as const,
      currentTurn: 'player' as const,
      playerField: [{ cards: [athleteCard], active: true, synergyCards: [] }]
    };

    // First shot
    const firstAction = {
      type: 'PERFORM_SHOT' as const,
      card: athleteCard,
      slot: 0,
      zone: 0
    };

    const firstState = gameReducer(stateWithPlayer, firstAction);
    expect(firstState.playerUsedShotIcons['player1']).toHaveLength(1);

    // Second shot should use different icon
    const secondState = gameReducer(firstState, firstAction);
    expect(secondState.playerUsedShotIcons['player1']).toHaveLength(2);
  });

  it('should reset used shot icons at half-time', () => {
    const initialState = createInitialState();
    const athleteCard = createTestPlayer('player1', 'Test Player', [
      { type: 'attack', position: 'top-25%' }
    ]);

    const stateWithIcons = {
      ...initialState,
      playerUsedShotIcons: { player1: [0] },
      aiUsedShotIcons: { ai1: [1] },
      turnCount: 9 // Next turn will be half-time
    };

    const endTurnAction = { type: 'END_TURN' as const };
    const newState = gameReducer(stateWithIcons, endTurnAction);

    expect(newState.playerUsedShotIcons).toEqual({});
    expect(newState.aiUsedShotIcons).toEqual({});
    expect(newState.turnCount).toBe(10);
  });

  it('should reset used shot icons when substituting', () => {
    const initialState = createInitialState();
    const outgoingCard = createTestPlayer('player1', 'Outgoing Player', [
      { type: 'attack', position: 'top-25%' }
    ]);
    const incomingCard = createTestPlayer('player2', 'Incoming Player', [
      { type: 'attack', position: 'bottom-25%' }
    ]);

    const stateWithUsedIcons = {
      ...initialState,
      playerUsedShotIcons: { player1: [0] },
      playerField: [{ cards: [outgoingCard], active: true, synergyCards: [] }],
      playerHand: [incomingCard],
      turnPhase: 'playerAction' as const,
      currentTurn: 'player' as const
    };

    const substituteAction = {
      type: 'PERFORM_SUBSTITUTION' as const,
      incomingCard,
      outgoingCard,
      zone: 0,
      slot: 0
    };

    const newState = gameReducer(stateWithUsedIcons, substituteAction);

    expect(newState.playerUsedShotIcons['player1']).toBeUndefined();
    expect(newState.message).toContain('used shot icons reset');
  });
});
