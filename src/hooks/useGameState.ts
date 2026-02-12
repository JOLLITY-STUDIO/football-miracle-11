import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  createInitialState, 
  gameReducer, 
  type GameState, 
  type GameAction,
  getControlState,
  getMaxSynergyCardsForAttack,
  countIcons
} from '../game/gameLogic';
import type { PlayerCard, SynergyCard } from '../data/cards';
import { GameRecorder, saveGameRecord } from '../game/gameRecorder';

export const useGameState = (
  playerTeam: { starters: PlayerCard[]; substitutes: PlayerCard[]; initialField?: any[] } | null, 
  playSound: (sound: string) => void,
  onBack: () => void
) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (playerTeam) {
      return createInitialState(playerTeam.starters, playerTeam.substitutes, playerTeam.initialField);
    }
    return createInitialState();
  });

  const dispatch = useCallback((action: GameAction) => {
    setGameState(prev => gameReducer(prev, action));
  }, []);

  const gameRecorder = useRef(new GameRecorder());
  const gameStarted = useRef(false);

  if (!gameStarted.current) {
    gameStarted.current = true;
    gameRecorder.current = new GameRecorder();
  }

  // Action handlers
  const handleSlotClick = useCallback((zone: number, startCol: number) => {
    if (gameState.currentTurn !== 'player' || gameState.turnPhase !== 'playerAction' || gameState.currentAction) return;
    
    if (gameState.substitutionMode) {
      const z = gameState.playerField.find(f => f.zone === zone);
      const slotIdx = Math.floor(startCol / 2) + 1;
      const slot = z?.slots.find(s => s.position === slotIdx);
      if (slot?.playerCard) {
        dispatch({ type: 'SUBSTITUTE', outgoingCardId: slot.playerCard.id, incomingCardId: gameState.substitutionMode.incomingCard.id });
        playSound('whistle');
      }
      return;
    }

    if (!gameState.selectedCard) return;

    const card = gameState.selectedCard;
    dispatch({ type: 'PLACE_CARD', card, zone, slot: startCol });
    dispatch({ type: 'SELECT_PLAYER_CARD', card: null });
    playSound('flip');
  }, [gameState, dispatch, playSound]);

  const handleAttack = useCallback((zone: number, slot: number) => {
    if (gameState.currentTurn !== 'player') return;
    
    if (gameState.turnPhase === 'teamAction') {
      setGameState(prev => ({ ...prev, message: 'Must perform Team Action first! (Pass or Press)' }));
      playSound('error');
      return;
    }

    if (gameState.currentAction) {
      setGameState(prev => ({ ...prev, message: 'Already performed an action this turn!' }));
      playSound('error');
      return;
    }

    if (gameState.turnPhase !== 'playerAction') return;
    
    const attackerZone = gameState.playerField.find(z => z.zone === zone);
    const attackerSlot = attackerZone?.slots.find(s => s.position === slot);
    if (!attackerSlot || !attackerSlot.playerCard) return;
    
    const attacker = attackerSlot.playerCard;
    if (!attacker.icons.includes('attack')) return;

    const controlState = getControlState(gameState.controlPosition);
    const maxSynergyCards = getMaxSynergyCardsForAttack(controlState);
    
    let synergyCards: SynergyCard[] = [];
    
    if (gameState.synergyDeck.length > 0) {
      const firstCard = gameState.synergyDeck[0];
      if (firstCard) {
        synergyCards.push(firstCard);
      }
    }
    
    const additionalCards = gameState.selectedSynergyCards.slice(0, maxSynergyCards - 1);
    synergyCards = [...synergyCards, ...additionalCards];

    dispatch({ type: 'PERFORM_SHOT', zone, slot, synergyCards });
    playSound('kick');
  }, [gameState, dispatch, playSound]);

  const handleSynergySelect = useCallback((card: SynergyCard) => {
    if (gameState.currentTurn !== 'player') return;
    dispatch({ type: 'SELECT_SYNERGY_CARD', card });
    playSound('click');
  }, [gameState.currentTurn, dispatch, playSound]);

  const handleTeamAction = useCallback((action: 'pass' | 'press') => {
    dispatch({ type: 'TEAM_ACTION', action });
    playSound('click');
  }, [dispatch, playSound]);

  const handleEndTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
    playSound('whistle');
  }, [dispatch, playSound]);

  const handleSubstituteSelect = useCallback((card: PlayerCard) => {
    if (gameState.playerSubstitutionsLeft <= 0) return;
    if (gameState.currentTurn !== 'player') return;
    dispatch({ type: 'START_SUBSTITUTION', card });
    playSound('click');
  }, [gameState.playerSubstitutionsLeft, gameState.currentTurn, dispatch, playSound]);

  const handleBack = useCallback((isSurrender: boolean = false) => {
    if (gameRecorder.current.getActions().length > 0) {
      let winner: 'player' | 'ai' | 'draw' = gameState.playerScore > gameState.aiScore ? 'player' : 
                     gameState.playerScore < gameState.aiScore ? 'ai' : 'draw';
      
      if (isSurrender) {
        winner = 'ai';
      }

      const record = gameRecorder.current.endGame(winner, {
        player: gameState.playerScore,
        ai: gameState.aiScore,
      });
      saveGameRecord(record);
    }
    onBack();
  }, [gameState.playerScore, gameState.aiScore, onBack]);

  const handleInstantShot = useCallback((zone: number, slot: number) => {
    if (!gameState.instantShotMode) return;
    const synergyCards = [...gameState.selectedSynergyCards];
    dispatch({ type: 'PERFORM_SHOT', zone, slot, synergyCards });
    playSound('goal');
  }, [gameState.instantShotMode, gameState.selectedSynergyCards, dispatch, playSound]);

  const handlePenaltyComplete = useCallback((playerPoints: number, aiPoints: number) => {
    dispatch({ type: 'PENALTY_COMPLETE', playerPoints, aiPoints });
    playSound('whistle');
  }, [dispatch, playSound]);

  return {
    gameState,
    setGameState,
    dispatch,
    gameRecorder,
    handleSlotClick,
    handleAttack,
    handleSynergySelect,
    handleTeamAction,
    handleEndTurn,
    handleSubstituteSelect,
    handleBack,
    handleInstantShot,
    handlePenaltyComplete
  };
};
