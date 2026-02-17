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
import type { athleteCard, SynergyCard } from '../data/cards';
import { GameRecorder, saveGameRecord } from '../game/gameRecorder';

// 类型定义，用于修�?TypeScript 错误
interface PerformShotAction {
  type: 'PERFORM_SHOT';
  card: athleteCard;
  slot: number;
  zone: number;
  synergyCards?: SynergyCard[];
}

interface PenaltyCompleteAction {
  type: 'PENALTY_COMPLETE';
  playerPoints: number;
  aiPoints: number;
}

interface SelectathleteCardAction {
  type: 'SELECT_PLAYER_CARD';
  card: athleteCard | null;
}

interface TeamActionAction {
  type: 'TEAM_ACTION';
  action: 'pass' | 'press';
}

interface StartSubstitutionAction {
  type: 'START_SUBSTITUTION';
  card: athleteCard;
}

export const useGameState = (
  playerTeam: { starters: athleteCard[]; substitutes: athleteCard[]; initialField?: any[] } | null, 
  playSound: (sound: string) => void,
  onBack: () => void
) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (playerTeam) {
      return createInitialState(playerTeam.starters, playerTeam.substitutes, playerTeam.initialField);
    }
    const initialState = createInitialState();
    // Quick Start mode: start with coin toss phase for rock paper scissors
    return {
      ...initialState,
      phase: 'coinToss',
      message: 'Choose your weapon!'
    };
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
    
    // 检查是否是玩家回合
    if (gameState.currentTurn !== 'player') {
      console.warn('Not player turn');
      return;
    }
    
    // 检查是否在替换模式
    if (gameState.substitutionMode) {
      const targetZone = gameState.playerField.find(f => f.zone === zone);
      if (!targetZone) return;
      
      const slotIdx = Math.floor(startCol / 2) + 1;
      const targetSlot = targetZone.slots.find(s => s.position === slotIdx);
      
      if (targetSlot?.athleteCard) {
        // 执行替换
        dispatch({
          type: 'SUBSTITUTE', 
          outgoingCardId: targetSlot.athleteCard.id, 
          incomingCardId: gameState.substitutionMode.incomingCard.id 
        });
        playSound('whistle');
      }
      return;
    }

    // 检查是否已选择卡牌
    if (!gameState.selectedCard) {
      setGameState(prev => ({ ...prev, message: 'Please select a card first' }));
      playSound('error');
      return;
    }

    // 检查是否可以放置卡牌
    const canDoAction = (gameState.turnPhase === 'athleteAction' || 
                          gameState.skipTeamAction || 
                          (gameState.isFirstTurn && gameState.turnPhase === 'start')) && 
                          gameState.currentTurn === 'player';
    
    const canPlace = canDoAction && (gameState.currentAction === 'none' || gameState.currentAction === 'organizeAttack');
    
    console.log('🔍 handleSlotClick validation:', {
      canDoAction,
      canPlace,
      turnPhase: gameState.turnPhase,
      skipTeamAction: gameState.skipTeamAction,
      currentTurn: gameState.currentTurn,
      currentAction: gameState.currentAction,
      selectedCard: gameState.selectedCard?.nickname
    });
    
    if (!canPlace) {
      const errorMessage = gameState.turnPhase === 'teamAction' 
        ? 'Must complete Team Action first!' 
        : 'Cannot place card at this time';
      
      console.log('❌ Placement rejected:', errorMessage, {
        currentAction: gameState.currentAction,
        canDoAction,
        canPlace
      });
      
      setGameState(prev => ({ 
        ...prev, 
        message: errorMessage 
      }));
      playSound('error');
      return;
    }

    // 检查是否已经执行过动作
    if (gameState.currentAction && gameState.currentAction !== 'none' && gameState.currentAction !== 'organizeAttack') {
      setGameState(prev => ({ ...prev, message: 'Already performed an action this turn!' }));
      playSound('error');
      return;
    }

    // 执行放置卡牌
    const card = gameState.selectedCard;
    dispatch({ type: 'PLACE_CARD', card, zone, slot: startCol });
    dispatch({ type: 'SELECT_PLAYER_CARD', card: null });
    playSound('snap');
  }, [gameState, dispatch, playSound]);

  const handleAttack = useCallback((zone: number, slot: number) => {
    
    if (gameState.currentTurn !== 'player') return;
    
    // 检查是否可以执行攻击操作
    const canPerformAction = gameState.turnPhase === 'athleteAction' || 
                          (gameState.isFirstTurn && gameState.turnPhase === 'start');
    
    if (!canPerformAction) {
      setGameState(prev => ({ ...prev, message: 'Cannot perform attack at this time' }));
      playSound('error');
      return;
    }

    if (gameState.currentAction && gameState.currentAction !== 'none' && gameState.currentAction !== 'organizeAttack') {
      setGameState(prev => ({ ...prev, message: 'Already performed an action this turn!' }));
      playSound('error');
      return;
    }

    const attackerZone = gameState.playerField.find(z => z.zone === zone);
    const attackerSlot = attackerZone?.slots.find(s => s.position === slot);
    if (!attackerSlot || !attackerSlot.athleteCard) return;
    
    const attacker = attackerSlot.athleteCard;
    if (!attacker.icons.includes('attack')) {
      setGameState(prev => ({ ...prev, message: 'This card cannot attack' }));
      playSound('error');
      return;
    }

    // 检查协同卡牌库是否耗尽
    if (gameState.synergyDeck.length === 0) {
      // 协同卡牌库耗尽，触发伤停补时
      setGameState(prev => ({
        ...prev,
        isStoppageTime: true,
        message: 'Synergy deck exhausted! Stoppage time activated!'
      }));
      playSound('error');
      return;
    }

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

    // 修正类型错误
    const action: PerformShotAction = {
      type: 'PERFORM_SHOT',
      card: attacker,
      slot: slot,
      zone: zone,
      synergyCards
    };
    dispatch(action);
    playSound('kick');
  }, [gameState, dispatch, playSound]);

  const handleSynergySelect = useCallback((card: SynergyCard) => {
    if (gameState.currentTurn !== 'player') return;
    dispatch({ type: 'SELECT_SYNERGY_CARD', card });
    playSound('click');
  }, [gameState.currentTurn, dispatch, playSound]);

  const handleTeamAction = useCallback((action: 'pass' | 'press', iconCount: number) => {
    dispatch({ type: 'TEAM_ACTION', action, iconCount });
    playSound('click');
  }, [dispatch, playSound]);

  const handleEndTurn = useCallback(() => {
    // 验证玩家是否执行了至少一个动作（放置球员或射门）
    if (gameState.currentTurn === 'player' && gameState.turnPhase === 'athleteAction') {
      const hasPlacedCard = gameState.currentAction === 'organizeAttack';
      const hasAttemptedShot = gameState.pendingShot !== null;
      
      if (!hasPlacedCard && !hasAttemptedShot) {
        setGameState(prev => ({ 
          ...prev, 
          message: 'You must either place a card or attempt a shot before ending your turn!' 
        }));
        playSound('error');
        return;
      }
    }
    
    dispatch({ type: 'END_TURN' });
    playSound('whistle');
  }, [gameState.currentTurn, gameState.turnPhase, gameState.currentAction, gameState.pendingShot, dispatch, playSound, setGameState]);

  const handleSubstituteSelect = useCallback((card: athleteCard) => {
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
    
    // 修正类型错误
    const action: PerformShotAction = {
      type: 'PERFORM_SHOT',
      card: gameState.instantShotMode.card,
      zone,
      slot,
      synergyCards
    };
    dispatch(action);
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

