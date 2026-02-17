import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { canPlaceCardAtSlot, getImmediateEffectDescription, getIconDisplay } from '../data/cards';
import type { athleteCard, SynergyCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';
import { SynergyCardComponent } from './SynergyCard';
import { PenaltyModal } from './PenaltyModal';
import { CardPreviewModal } from './CardPreviewModal';
import { LeftPanel } from './LeftPanel';
import { CenterField } from './CenterField';
import { RightPanel } from './RightPanel';
import { BackgroundMusic } from './BackgroundMusic';
import PhaseBanner from './PhaseBanner';
import { RockPaperScissors } from './RockPaperScissors';
import SquadSelect from './SquadSelect';
import { CardDealer } from './CardDealer';
import { DuelOverlay } from './DuelOverlay';
import { MatchLog } from './MatchLog';
import { DraftPhase } from './DraftPhase';
import { TutorialGuide } from './TutorialGuide';
import { ActionButtons } from './ActionButtons';
import { AthleteCardGroup } from './AthleteCardGroup';
import { AmbientControls } from './AmbientControls';
import { ShooterSelector } from './ShooterSelector';
import {
  gameReducer,
  createInitialState,
  type GameState,
  type GameAction
} from '../game/gameLogic';
import {
  countIcons
} from '../utils/gameUtils';
import { TacticalIconMatcher } from '../game/tacticalIconMatcher';
import { useGameAudio } from '../hooks/useGameAudio';
import { useCameraView } from '../hooks/useCameraView';
import { useGameState } from '../hooks/useGameState';
import { startMatchAmbience, stopMatchAmbience, triggerCrowdReaction, playSound } from '../utils/audio';

interface Props {
  onBack: () => void;
  playerTeam: { starters: athleteCard[]; substitutes: athleteCard[]; initialField?: any[] } | null;
  renderMode?: '2d' | '3d';
}

export const GameBoard: React.FC<Props> = ({ onBack, playerTeam, renderMode = '2d' }) => {
  const { playSound, toggleAudioSetting, audioSettings, setAudioSettings } = useGameAudio();
const { 
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
} = useGameState(playerTeam, playSound, onBack);

  // Tutorial actions
  const handleNextTutorialStep = useCallback(() => {
    dispatch({ type: 'NEXT_TUTORIAL_STEP' });
  }, [dispatch]);

  const handleSkipTutorial = useCallback(() => {
    dispatch({ type: 'SKIP_TUTORIAL' });
  }, [dispatch]);

  const handleCompleteTutorial = useCallback(() => {
    dispatch({ type: 'COMPLETE_TUTORIAL' });
    setTutorialOpen(false);
  }, [dispatch]);

  const handleStepComplete = useCallback((stepId: string) => {
    setCurrentTutorialStep(prev => prev + 1);
  }, []);

  const { 
    viewSettings, 
    setViewSettings, 
    autoScale,
    setAutoScale, 
    showViewControls, 
    setShowViewControls, 
    toggleCameraView 
  } = useCameraView(gameState.isHomeTeam);

  const [lastPlacedCard, setLastPlacedCard] = useState<athleteCard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<athleteCard | null>(null);
  const [hoveredCardPosition, setHoveredCardPosition] = useState({ x: 0, y: 0 });
  const [hoverSoundPlayedForId, setHoverSoundPlayedForId] = useState<string | null>(null);
  const [aiJustPlacedCard, setAiJustPlacedCard] = useState<athleteCard | null>(null);
  const [showPhaseBanner, setShowPhaseBanner] = useState(false);
  const [phaseBannerText, setPhaseBannerText] = useState('');
  const [phaseBannerSubtitle, setPhaseBannerSubtitle] = useState('');
  
  const [aiTurnTriggered, setAiTurnTriggered] = useState(false);
  const [setupStep, setSetupStep] = useState(0); // 0: not started, 1: board, 2: control, 3: cards, 4: done
  const [tossResult, setTossResult] = useState<'home' | 'away' | null>(null);
  const [rpsInProgress, setRpsInProgress] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [currentTutorialStep, setCurrentTutorialStep] = useState(0);

  useEffect(() => {
    // If we skip setup phase (e.g. from pre-game), force setupStep to 4
    if (gameState.phase !== 'setup' && setupStep === 0) {
      setSetupStep(4);
      return;
    }

    if (gameState.phase === 'setup' && setupStep === 0) {
      // Start setup sequence after a short delay
      const timer = setTimeout(() => setSetupStep(1), 1000);
      return () => clearTimeout(timer);
    }
    if (gameState.phase === 'setup' && setupStep === 4) {
      const timer = setTimeout(() => {
        dispatch({ type: 'FINISH_SETUP' });
      }, 500);
      return () => clearTimeout(timer);
    }
    
    // Force setup completion if phase is not setup but setup hasn't started
    if (gameState.phase !== 'setup' && setupStep < 4) {
      setSetupStep(4);
    }
  }, [gameState.phase, setupStep, dispatch]);

  const [lastTurn, setLastTurn] = useState<string>('player');
  const [lastPhase, setLastPhase] = useState<string>('');
  const [viewingPile, setViewingPile] = useState<'deck' | 'discard' | null>(null);
  const [shownStoppageTime, setShownStoppageTime] = useState(false);
  const [showMatchLog, setShowMatchLog] = useState(false);
  const [showLeftControls, setShowLeftControls] = useState(true);
  const [showAmbientControls, setShowAmbientControls] = useState(false);
  const [shootMode, setShootMode] = useState<boolean>(false);
  const [selectedShootPlayer, setSelectedShootPlayer] = useState<{zone: number, position: number} | null>(null);
  const [showShooterSelector, setShowShooterSelector] = useState(false);
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [previewCard, setPreviewCard] = useState<athleteCard | null>(null);
  const [homeAwaySelected, setHomeAwaySelected] = useState(false);
  
  // Audio Feedback for card actions (hand changes)
  const prevPlayerHandCount = useRef(gameState.playerAthleteHand.length);
  const prevAiHandCount = useRef(gameState.aiAthleteHand.length);
  const prevPlayerSynergyCount = useRef(gameState.playerSynergyHand.length);
  const prevAiSynergyCount = useRef(gameState.aiSynergyHand.length);

  // Calculate if there are any shootable players (players with attack icons, remaining shot markers, and complete attack icons on field)
  const hasShootablePlayers = () => {
    // First check if there are players with attack icons and remaining shot markers
    const hasPlayersWithAttackIcons = gameState.playerField.some(zone => {
      return zone.slots.some(slot => {
        if (!slot.athleteCard) return false;
        const attackIconCount = slot.athleteCard.icons.filter((icon: string) => icon === 'attack').length;
        const usedShotMarkers = slot.shotMarkers || 0;
        return attackIconCount > usedShotMarkers;
      });
    });
    
    // Then check if there are complete attack icons on the field
    return hasPlayersWithAttackIcons && hasAttackIconsOnField();
  };

  useEffect(() => {
    // Player hand changes
    if (gameState.playerAthleteHand.length < prevPlayerHandCount.current) {
      playSound('flip'); // Card played
    } else if (gameState.playerAthleteHand.length > prevPlayerHandCount.current) {
      playSound('draw'); // Card drawn
    }
    prevPlayerHandCount.current = gameState.playerAthleteHand.length;

    // AI hand changes
    if (gameState.aiAthleteHand.length < prevAiHandCount.current) {
      playSound('flip'); // Card played
    } else if (gameState.aiAthleteHand.length > prevAiHandCount.current) {
      playSound('draw'); // Card drawn
    }
    prevAiHandCount.current = gameState.aiAthleteHand.length;

    // Synergy hand changes
    if (gameState.playerSynergyHand.length !== prevPlayerSynergyCount.current) {
      playSound('draw');
    }
    prevPlayerSynergyCount.current = gameState.playerSynergyHand.length;

    if (gameState.aiSynergyHand.length !== prevAiSynergyCount.current) {
      playSound('draw');
    }
    prevAiSynergyCount.current = gameState.aiSynergyHand.length;
  }, [gameState.playerAthleteHand.length, gameState.aiAthleteHand.length, gameState.playerSynergyHand.length, gameState.aiSynergyHand.length]);
  
  // Setup Animation Sequence Effects
  useEffect(() => {
    if (setupStep === 1) {
      // Step 1: Board appearance/zoom
      setViewSettings(prev => ({ ...prev, zoom: 0.8, pitch: 20 }));
      playSound('swosh');
      const timer = setTimeout(() => setSetupStep(2), 1500);
      return () => clearTimeout(timer);
    } else if (setupStep === 2) {
      // Step 2: Control marker initialization
      playSound('slide');
      const timer = setTimeout(() => setSetupStep(3), 1500);
      return () => clearTimeout(timer);
    } else if (setupStep === 3) {
      // Step 3: Card dealing preparation
      playSound('draw');
      const timer = setTimeout(() => {
        setSetupStep(4);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [setupStep, dispatch]);

  // Sound effect for drawing cards
  const prevHandSize = useRef(gameState.playerAthleteHand.length);
  const prevSynergyHandSize = useRef(gameState.playerSynergyHand.length);
  
  useEffect(() => {
    if (gameState.playerAthleteHand.length > prevHandSize.current) {
      playSound('draw');
    }
    prevHandSize.current = gameState.playerAthleteHand.length;
  }, [gameState.playerAthleteHand.length]);

  useEffect(() => {
    if (gameState.playerSynergyHand.length > prevSynergyHandSize.current) {
      playSound('draw');
    }
    prevSynergyHandSize.current = gameState.playerSynergyHand.length;
  }, [gameState.playerSynergyHand.length]);

  // Card dealing animation effect
  useEffect(() => {
    let dealingInterval: NodeJS.Timeout;
    let completionTimer: NodeJS.Timeout;
    
    if (gameState.isDealing) {
      // Start dealing cards with animation
      dealingInterval = setInterval(() => {
        dispatch({ type: 'DRAW_CARD' });
      }, 300); // Draw a card every 300ms
      
      // 移除强制超时，由DRAW_CARD逻辑自动停止
      // 当所有卡片都被抽取后，isDealing会自动设为false
    }
    
    return () => {
      if (dealingInterval) {
        clearInterval(dealingInterval);
      }
      if (completionTimer) {
        clearTimeout(completionTimer);
      }
    };
  }, [gameState.isDealing, dispatch]);

  // Draft round start is now handled by DraftPhase component
  // Removed duplicate logic to prevent double drafting

  // Start card dealing after home/away selection
  useEffect(() => {
    if (gameState.phase === 'draft' && !homeAwaySelected) {
      // Check if home/away has been selected (rock paper scissors completed)
      if (gameState.message.includes('won the Rock Paper Scissors')) {
        // Home/away selection completed
        setHomeAwaySelected(true);
        // Card dealing is already handled by the ROCK_PAPER_SCISSORS action
      }
    }
  }, [gameState.phase, gameState.message, homeAwaySelected, dispatch]);

  // Auto-scaling logic to fit screen
  const BASE_WIDTH = 2000;
  const BASE_HEIGHT = 1200;

  useEffect(() => {
    const handleResize = () => {
      const sW = window.innerWidth / BASE_WIDTH;
      const sH = window.innerHeight / BASE_HEIGHT;
      setAutoScale(Math.min(sW, sH, 1)); // Don't scale up beyond 1:1
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Phase Banner Logic
  useEffect(() => {
    // Show banner when Turn Phase changes
    if (gameState.turnPhase !== lastPhase) {
        let text = '';
        let subtitle = '';
        let duration = 2000;
        if (gameState.turnPhase === 'teamAction') {
          text = 'TACTICAL PHASE';
          subtitle = 'Choose Team Action: Pass or Press';
        }
        else if (gameState.turnPhase === 'athleteAction') {
          text = 'ATHLETE ACTION';
          // Check if this is the first turn and we're skipping team action
          if (gameState.isFirstTurn && gameState.currentTurn === 'player') {
            subtitle = 'First turn: Team Action skipped. Place a Card or Attempt a Shot';
          } else {
            subtitle = gameState.currentTurn === 'player' 
              ? 'Place a Card or Attempt a Shot' 
              : 'AI is Thinking...';
          }
        }
        else if (gameState.turnPhase === 'shooting') {
          text = 'BATTLE PHASE';
          subtitle = 'Shot Attempt in Progress!';
        }
        else if (gameState.turnPhase === 'end') {
          text = 'END TURN';
          subtitle = 'Turn ending...';
          duration = 1000; // Show for 1 second
        }
        
        if (text) {
            // Only show tactical phase banner for player's turn
            if (text === 'TACTICAL PHASE' && gameState.currentTurn !== 'player') {
                return; // Skip showing tactical phase banner for AI
            }
            
            // First hide any existing banner
            setShowPhaseBanner(false);
            // Then show the new banner after a short delay
            setTimeout(() => {
                setPhaseBannerText(text);
                setPhaseBannerSubtitle(subtitle);
                setShowPhaseBanner(true);
            }, 300);
        }
        setLastPhase(gameState.turnPhase);
    }

    // Show banner when Game Phase changes (Halftime)
    if (gameState.phase === 'halfTime') {
        setShowPhaseBanner(false);
        setTimeout(() => {
            setPhaseBannerText('HALF TIME');
            setPhaseBannerSubtitle('Make Substitutions and Prepare for 2nd Half');
            setShowPhaseBanner(true);
        }, 300);
        // 半场时播放掌�?        triggerCrowdReaction('applause');
    }
    
    // Show banner for Stoppage Time
    if (gameState.isStoppageTime && !shownStoppageTime) {
        setShowPhaseBanner(false);
        setTimeout(() => {
            setPhaseBannerText('STOPPAGE TIME');
            setPhaseBannerSubtitle('Synergy Deck Reshuffled!');
            setShowPhaseBanner(true);
        }, 300);
        setShownStoppageTime(true);
        // 补时阶段增加环境音强�?        triggerCrowdReaction('cheer');
    }
  }, [gameState.turnPhase, gameState.phase, lastPhase, gameState.isStoppageTime, shownStoppageTime, gameState.currentTurn]);

  // Turn Transition Logic
  useEffect(() => {
    if (gameState.currentTurn !== lastTurn) {
      // Hide phase banner before showing turn transition
      setShowPhaseBanner(false);
      setTimeout(() => {
        setPhaseBannerText(gameState.currentTurn === 'player' ? 'Your Turn' : 'Opponent Turn');
        setPhaseBannerSubtitle(gameState.currentTurn === 'player' ? 'Make your move' : 'Wait for opponent');
        setShowPhaseBanner(true);
      }, 300);
      setLastTurn(gameState.currentTurn);
    }
  }, [gameState.currentTurn, lastTurn]);

  // Draft Phase Banner
  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftStep === 0 && gameState.draftRound > 0) {
      const timer = setTimeout(() => {
        setShowPhaseBanner(false);
        setTimeout(() => {
            setPhaseBannerText(`Sign Star Players - Round ${gameState.draftRound}`);
            setShowPhaseBanner(true);
        }, 300);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.draftRound, gameState.draftStep]);



  // AI Turn Logic
  useEffect(() => {
    const isMatchPhase = gameState.phase === 'firstHalf' || gameState.phase === 'secondHalf';
    const isAITurn = gameState.currentTurn === 'ai' && gameState.aiActionStep !== 'none';
    
    if (isMatchPhase && isAITurn && !gameState.isDealing && gameState.duelPhase === 'none') {
      const delay = gameState.aiActionStep === 'teamAction' ? 2000 : 1500;
      const timer = setTimeout(() => {
        gameRecorder.current.recordAction('ai_action', 'ai');
        dispatch({ type: 'AI_TURN' });
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.aiActionStep, gameState.phase, gameState.isDealing, gameState.duelPhase, dispatch]);

  // Track AI newly placed cards for animation
  const prevAIHandRef = useRef<string[]>([]);
  useEffect(() => {
    const currentAIHandIds = gameState.aiAthleteHand.map(c => c.id);
    const prevAIHandIds = prevAIHandRef.current;
    
    if (prevAIHandIds.length > currentAIHandIds.length) {
      const placedCardId = prevAIHandIds.find(id => !currentAIHandIds.includes(id));
      if (placedCardId) {
        const aiFieldCards = gameState.aiField.flatMap(z => z.slots.map(s => s.athleteCard).filter(Boolean));
        const placedCard = aiFieldCards.find(c => c?.id === placedCardId);
        if (placedCard) {
          setAiJustPlacedCard(placedCard);
          playSound('flip');
          setTimeout(() => setAiJustPlacedCard(null), 1500);
        }
      }
    }
    
    prevAIHandRef.current = currentAIHandIds;
  }, [gameState.aiAthleteHand, gameState.aiField]);

  const saveCurrentSnapshot = () => {
    const snapshot = {
      playerScore: gameState.playerScore,
      aiScore: gameState.aiScore,
      playerField: gameState.playerField.map(z => ({ zone: z.zone, slots: z.slots.map(s => ({ position: s.position, athleteCardId: s.athleteCard?.id || null })) })),
      aiField: gameState.aiField.map(z => ({ zone: z.zone, slots: z.slots.map(s => ({ position: s.position, athleteCardId: s.athleteCard?.id || null })) })),
      playerHand: gameState.playerAthleteHand.map(c => c.id),
      aiHand: gameState.aiAthleteHand.map(c => c.id),
      controlPosition: gameState.controlPosition,
      phase: gameState.phase,
    };
    gameRecorder.current.recordSnapshot(snapshot);
  };

  const canDoAction = () => {
    const result = (gameState.turnPhase === 'athleteAction' || gameState.skipTeamAction || gameState.turnPhase === 'teamAction' || (gameState.isFirstTurn && gameState.turnPhase === 'start')) && gameState.currentTurn === 'player';
    return result;
  };
  const canPlaceCards = () => {
    // 在 teamAction 阶段不能放置卡片，玩家只能执行 pass、press 或跳过
    if (gameState.turnPhase === 'teamAction') {
      return false;
    }
    const result = canDoAction() && (gameState.currentAction === 'none' || gameState.currentAction === 'organizeAttack');
    return result;
  };

  // Check if there are complete attack icons on the field
  const hasAttackIconsOnField = () => {
    const field = gameState.isHomeTeam ? gameState.playerField : gameState.aiField;
    const matcher = new TacticalIconMatcher(field);
    const completeIcons = matcher.getCompleteIcons();
    return completeIcons.some(icon => icon.type === 'attack');
  };

  // Handle global shoot button click
  const handleShoot = () => {
    if (!hasShootablePlayers()) {
      setGameState(prev => ({ ...prev, message: 'No shootable players available!' }));
      playSound('error');
      return;
    }
    // Find first player with attack icon and trigger shoot duel
    const playerWithAttackIcon = gameState.playerField.find(zone => {
      return zone.slots.find(slot => {
        return slot.athleteCard && slot.athleteCard.icons.includes('attack');
      });
    });
    
    if (playerWithAttackIcon) {
      const slotWithAttackIcon = playerWithAttackIcon.slots.find(slot => {
        return slot.athleteCard && slot.athleteCard.icons.includes('attack');
      });
      
      if (slotWithAttackIcon) {
        // Trigger shoot duel
        handleAttack(playerWithAttackIcon.zone, slotWithAttackIcon.position);
        playSound('whistle');
      }
    }
  };

  // Handle shooter selection
  const handleSelectShooter = (zone: number, position: number) => {
    setSelectedShootPlayer({ zone, position });
    // Enter shoot mode with selected player
    setShootMode(true);
    playSound('click');
  };

  // Handle close shoot mode
  const handleCloseShootMode = () => {
    setShootMode(false);
    setSelectedShootPlayer(null);
    playSound('click');
  };

  // Reset shoot mode when duel ends
  useEffect(() => {
    if (gameState.duelPhase === 'none' && shootMode) {
      setShootMode(false);
      setSelectedShootPlayer(null);
    }
  }, [gameState.duelPhase]);

  const handleCardSelect = (card: athleteCard) => {
    
    if (gameState.currentTurn !== 'player') {
      return;
    }
    // 玩家在任何阶段都可以选择卡片，只是在某些阶段不能放置
    playSound('draw');
    dispatch({ type: 'SELECT_PLAYER_CARD', card: gameState.selectedCard?.id === card.id ? null : card });
  };

  const handleSynergyChoiceSelect = (keepIndex: number) => {
    dispatch({ type: 'SYNERGY_CHOICE_SELECT', index: keepIndex });
    playSound('draw');
  };

  const handleSynergyMoveToDeck = (card: SynergyCard) => {
    dispatch({ type: 'MOVE_SYNERGY_TO_DECK', cardId: card.id });
    playSound('draw');
  };

  const handleHoverEnterCard = (card: athleteCard, event?: React.MouseEvent) => {
    setHoveredCard(card);
    if (event) {
      setHoveredCardPosition({ x: event.clientX, y: event.clientY });
    }
    if (hoverSoundPlayedForId !== card.id) {
      playSound('draw');
      setHoverSoundPlayedForId(card.id);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (hoveredCard) {
        setHoveredCardPosition({ x: e.clientX, y: e.clientY });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredCard]);

  const handleHoverLeaveCard = () => {
    setHoveredCard(null);
    setHoverSoundPlayedForId(null);
  };

  // Handle card click for preview
  const handleCardClick = (card: athleteCard) => {
    setPreviewCard(card);
    setShowCardPreview(true);
    playSound('click');
  };

  const handleCancelSubstitution = () => {
    dispatch({ type: 'CANCEL_SUBSTITUTION' });
  };

  const handleCoinTossComplete = useCallback(() => {
    if (tossResult) {
      dispatch({ type: 'ROCK_PAPER_SCISSORS', isHomeTeam: tossResult === 'home' });
      playSound('whistle');
    }
  }, [tossResult, dispatch, playSound]);

  const handleRockPaperScissorsComplete = useCallback((winner: 'player' | 'ai', choice: 'rock' | 'paper' | 'scissors' | 'home' | 'away' | null) => {
    setRpsInProgress(false);
    let isHomeTeam: boolean;
    
    if (winner === 'player') {
      // Player chose their side
      isHomeTeam = choice === 'home';
    } else {
      // AI chose their side, player gets the opposite
      isHomeTeam = choice !== 'home';
    }
    
    dispatch({ type: 'ROCK_PAPER_SCISSORS', isHomeTeam });
    playSound('whistle');
  }, [dispatch, playSound]);

  useEffect(() => {
    if (gameState.phase !== 'coinToss' && tossResult !== null) {
      setTossResult(null);
    }
  }, [gameState.phase, tossResult]);

  const startToss = () => {
    setRpsInProgress(true);
  };

  useEffect(() => {
    if (gameState.phase === 'draft' && !gameState.isHomeTeam) {
      playSound('swosh');
      const timer = setTimeout(() => {
        playSound('snap');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.isHomeTeam, playSound]);

  // ============================================
  // 环境音控制逻辑
  // ============================================
  useEffect(() => {
    // 比赛开始时启动环境音
    if (gameState.phase === 'firstHalf' || gameState.phase === 'secondHalf') {
      startMatchAmbience();
    }
    
    // 比赛结束时停止环境音
    if (gameState.phase === 'fullTime' || gameState.phase === 'penaltyShootout') {
      stopMatchAmbience();
    }
    
    return () => {
      // 清理函数：组件卸载时停止所有环境音
      if (gameState.phase === 'fullTime' || gameState.phase === 'penaltyShootout') {
        stopMatchAmbience();
      }
    };
  }, [gameState.phase]);

  // 进球时触发观众欢呼
  useEffect(() => {
    if (gameState.pendingShot && gameState.turnPhase === 'end') {
      const result = gameState.pendingShot.result;
      if (result === 'goal' || result === 'magicNumber') {
        triggerCrowdReaction();
      } else if (result === 'saved') {
        triggerCrowdReaction();
      } else if (result === 'missed') {
        triggerCrowdReaction();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.pendingShot?.result, gameState.turnPhase]);

  // ============================================
  // 原有的射门结果音�?  // ============================================
  useEffect(() => {
    if (gameState.pendingShot && gameState.turnPhase === 'end') {
      const result = gameState.pendingShot.result;
      if (result === 'goal' || result === 'magicNumber') {
        playSound('goal');
      } else if (result === 'saved') {
        playSound('slide');
      } else {
        playSound('swosh');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.pendingShot?.result, gameState.turnPhase]);

  useEffect(() => {
    if (gameState.turnPhase === 'end' && !gameState.pendingPenalty) {
      const timer = setTimeout(() => {
        handleEndTurn();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState.turnPhase, gameState.pendingPenalty, handleEndTurn]);

  const handleStartSecondHalf = () => {
    dispatch({ type: 'START_SECOND_HALF' });
    playSound('whistle');
  };

  const handleCancelInstantShot = () => {
    dispatch({ type: 'CANCEL_INSTANT_SHOT' });
  };

  const handleTriggerImmediateEffect = () => {
    dispatch({ type: 'TRIGGER_EFFECT' });
    playSound('click');
  };

  const handleSkipImmediateEffect = () => {
    dispatch({ type: 'SKIP_EFFECT' });
    playSound('click');
  };

  const handleSubstituteTarget = (targetCardId: string) => {
    if (!gameState.substitutionMode?.incomingCard) return;
    dispatch({ type: 'SUBSTITUTE', outgoingCardId: targetCardId, incomingCardId: gameState.substitutionMode.incomingCard.id });
    playSound('whistle');
  };

  const [completePassCount, setCompletePassCount] = React.useState(0);
  const [completePressCount, setCompletePressCount] = React.useState(0);
  
  const handleCompleteIconsCalculated = (counts: Record<string, number>) => {
    setCompletePassCount(counts.pass || 0);
    setCompletePressCount(counts.press || 0);
  };
  
  // Use complete icon counts for team actions
  const passCount = completePassCount;
  const pressCount = completePressCount;
  const canDoTeamAction = !gameState.skipTeamAction || gameState.playerField.some(z => z.slots.some(s => s.athleteCard));

  const handleVolumeChange = (newVolume: number) => {
    const newSettings = { ...audioSettings, volume: newVolume };
    setAudioSettings(newSettings);
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('audioSettingsChanged'));
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-['Roboto'] select-none text-white">
      
      {/* 0. 3D Environment Background (Void) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#1a1a2e_0%,_#16213e_40%,_#0f3460_70%,_#000000_100%)]">
      </div>
      
      {/* 1. Starfield Layer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.6 + 0.2,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
      
      {/* 2. Nebula Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]">
        <div className="absolute inset-0 mix-blend-screen" style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(120,119,198,0.3), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,119,198,0.2), transparent 40%), radial-gradient(circle at 40% 80%, rgba(119,255,214,0.2), transparent 40%)' 
        }} />
      </div>
      
      {/* 3. Grid Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>
      
      {/* 4. Depth Fog Layer */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.3]">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.8) 100%)' 
        }} />
      </div>

      {/* Tutorial Guide */}
      <TutorialGuide 
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        onSkip={handleSkipTutorial}
        currentStep={currentTutorialStep}
        onNextStep={handleNextTutorialStep}
        onComplete={handleCompleteTutorial}
        onStepComplete={handleStepComplete}
        gameState={gameState}
        playerHand={gameState.playerAthleteHand}
      />
      
      {/* 1. Main Game Field (Center) - Maximize Space with 3D Perspective */}
      <div className="absolute inset-0 flex items-center justify-center z-10 perspective-1000 overflow-hidden" style={{ perspectiveOrigin: '50% 50%' }}>
        <div 
          className={clsx("relative transition-transform duration-700 ease-out transform-style-3d transform-gpu flex items-center justify-center pointer-events-auto")}
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${autoScale}) rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) translateY(${viewSettings.height}px) scale(${viewSettings.zoom})`,
          }}
        >

             {/* Board Container (Includes Side Panels) */}
             <div className="relative w-[2100px] h-[1200px] flex flex-row items-stretch justify-center shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-xl overflow-visible bg-stone-900 border-[12px] border-stone-800 transform-style-3d perspective-2000">
                <div className="absolute inset-[-20px] rounded-[28px] bg-[radial-gradient(circle_at_50%_40%,_rgba(16,99,39,0.8),_rgba(0,0,0,0.9))] blur-[8px]" style={{ transform: 'translateZ(-60px)' }} />
                
                {/* 3D Thickness/Volume Layer - Full Width Unified Board */}
                <div className="absolute inset-[-4px] bg-stone-950 rounded-xl transform-style-3d shadow-2xl border-4 border-stone-900" 
                     style={{ transform: 'translateZ(-30px)' }} 
                />
                
                {/* Edge Highlights for 3D depth */}
                <div className="absolute inset-0 border-t border-l border-white/10 rounded-xl pointer-events-none" />
                <div className="absolute inset-0 border-b border-r border-black/50 rounded-xl pointer-events-none" />

                {/* Card Dealing Animations */}
                {/* Only show one dealer at a time to avoid duplicate animations */}
                {gameState.isDealing && (
                  <CardDealer 
                    isDealing={gameState.isDealing} 
                    type={gameState.dealingDirection === 'player' ? 'player' : 'ai'} 
                    count={1} // Show single card animation
                  />
                )}

                <div className="absolute w-5 h-5 rounded-full bg-gradient-to-b from-stone-300 to-stone-600 border border-black/50 shadow-inner" style={{ left: '14px', top: '14px' }} />
                <div className="absolute w-5 h-5 rounded-full bg-gradient-to-b from-stone-300 to-stone-600 border border-black/50 shadow-inner" style={{ right: '14px', top: '14px' }} />
                <div className="absolute w-5 h-5 rounded-full bg-gradient-to-b from-stone-300 to-stone-600 border border-black/50 shadow-inner" style={{ left: '14px', bottom: '14px' }} />
                <div className="absolute w-5 h-5 rounded-full bg-gradient-to-b from-stone-300 to-stone-600 border border-black/50 shadow-inner" style={{ right: '14px', bottom: '14px' }} />

                <LeftPanel
                  aiBench={gameState.aiBench}
                  playerBench={gameState.playerBench}
                  playerScore={gameState.playerScore}
                  aiScore={gameState.aiScore}
                  controlPosition={gameState.controlPosition}
                  setupStep={setupStep}
                  isHomeTeam={gameState.isHomeTeam}
                  playerSubstitutionsLeft={gameState.playerSubstitutionsLeft}
                  substitutionSelectedId={gameState.substitutionMode?.incomingCard.id}
                  phase={gameState.phase}  // 添加phase参数
                  onHoverEnter={handleHoverEnterCard}
                  onHoverLeave={handleHoverLeaveCard}
                  onSubstituteSelect={handleSubstituteSelect}
                  onToggleMatchLog={() => setShowMatchLog(!showMatchLog)}
                  onToggleLeftControls={() => setShowLeftControls(!showLeftControls)}
                  onOpenAmbientControls={() => setShowAmbientControls(true)}
                />

                {/* Always show 2D CenterField for card display */}
                <CenterField
                  playerField={gameState.playerField}
                  aiField={gameState.aiField}
                  selectedCard={gameState.selectedCard}
                  onSlotClick={handleSlotClick}
                  onAttackClick={(zone, position) => {
                    // 如果在射门模式下，先退出射门模式
                    if (shootMode) {
                      setShootMode(false);
                      setSelectedShootPlayer({ zone, position });
                    }
                    // 调用从useGameState获取的handleAttack函数
                    handleAttack(zone, position);
                  }}
                  currentTurn={gameState.currentTurn}
                  turnPhase={gameState.turnPhase}
                  isFirstTurn={gameState.isFirstTurn}
                  lastPlacedCard={lastPlacedCard}
                  onCardMouseEnter={handleHoverEnterCard}
                  onCardMouseLeave={handleHoverLeaveCard}
                  onCardClick={handleCardClick}
                  onInstantShotClick={handleInstantShot}
                  instantShotMode={gameState.instantShotMode}
                  currentAction={gameState.currentAction}
                  setupStep={setupStep}
                  rotation={viewSettings.rotation}
                  shootMode={shootMode}
                  selectedShootPlayer={selectedShootPlayer}
                  onCloseShootMode={handleCloseShootMode}
                  onCompleteIconsCalculated={handleCompleteIconsCalculated}
                  onIconClick={(icon) => {
                    // 找到第一个有进攻图标的球员位置
                    const playerWithAttackIcon = gameState.playerField.find(zone => {
                      return zone.slots.find(slot => {
                        return slot.athleteCard && slot.athleteCard.icons.includes('attack');
                      });
                    });
                    
                    if (playerWithAttackIcon) {
                      const slotWithAttackIcon = playerWithAttackIcon.slots.find(slot => {
                        return slot.athleteCard && slot.athleteCard.icons.includes('attack');
                      });
                      
                      if (slotWithAttackIcon) {
                        // 触发射门对决
                        handleAttack(playerWithAttackIcon.zone, slotWithAttackIcon.position);
                      }
                    }
                  }}
                  viewSettings={viewSettings}
                />

                {/* Action Buttons */}
                <ActionButtons
                  turnPhase={gameState.turnPhase}
                  currentTurn={gameState.currentTurn}
                  passCount={passCount}
                  pressCount={pressCount}
                  synergyDeckCount={gameState.synergyDeck.length}
                  onTeamAction={(type) => {
                    // 使用完整图标的数量作为iconCount参数
                    const iconCount = type === 'pass' ? completePassCount : completePressCount;
                    dispatch({ type: 'TEAM_ACTION', action: type, iconCount });
                    playSound('click');
                  }}

                  onShoot={handleShoot}
                  canShoot={hasAttackIconsOnField()}
                />
                

                
                {/* SVG 3D rendering is always used for card placement */}

              <motion.div
                initial={{ x: 200, opacity: 0 }}
                animate={setupStep >= 1 ? { x: 0, opacity: 1 } : { x: 200, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="h-full"
              >
                <RightPanel 
                  aiSynergyHand={gameState.aiSynergyHand}
                  playerSynergyHand={gameState.playerSynergyHand}
                  selectedSynergyCards={gameState.selectedSynergyCards}
                  onSynergySelect={handleSynergySelect}
                  onSynergyMoveToDeck={handleSynergyMoveToDeck}
                  synergyDeckCount={gameState.synergyDeck.length}
                  synergyDiscardCount={gameState.synergyDiscard.length}
                  onOpenPile={setViewingPile}
                  turnPhase={gameState.turnPhase}
                  playerActiveSynergy={gameState.playerActiveSynergy}
                  aiActiveSynergy={gameState.aiActiveSynergy}
                />
              </motion.div>
             </div>
        </div>
        </div>

      {/* SVG 3D Click Handling - No need for 2D overlay */}
      {/* Click handling is now handled directly in the SVG 3D implementation */}

      {/* Left Side Controls - Vertically Centered */}
      {showLeftControls && (
        <div className="fixed top-1/2 left-4 -translate-y-1/2 z-[60] flex flex-col gap-2 items-center pointer-events-none">
        {/* 1. Exit/Surrender Button */}
        <button 
          data-testid="back-button"
          onClick={() => {
            const isMatchPhase = ['firstHalf', 'secondHalf', 'extraTime', 'penalty'].includes(gameState.phase);
            if (isMatchPhase) {
              if (window.confirm('Are you sure you want to surrender? According to the rules, exiting now will count as a loss.')) {
                handleBack(true); // Pass true to indicate surrender
              }
            } else {
              handleBack();
            }
          }} 
          className="w-36 bg-stone-800/90 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 hover:bg-red-900/40 hover:border-red-500/50 transition-all shadow-xl flex items-center gap-2 group pointer-events-auto"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">⬅️</span>
          <span className="text-[10px] font-black tracking-widest text-white/90 uppercase">
            {['firstHalf', 'secondHalf', 'extraTime', 'penalty'].includes(gameState.phase) ? 'Surrender' : 'Quit'}
          </span>
        </button>

        {/* 2. Match Log Button */}
        <button
          onClick={() => setShowMatchLog(!showMatchLog)}
          className={clsx(
            "w-full h-10 rounded-xl flex items-center justify-center transition-all bg-stone-900/80 backdrop-blur-md border border-white/20 shadow-xl pointer-events-auto",
            showMatchLog ? "text-blue-400 bg-white/10" : "text-white/20 hover:bg-white/5"
          )}
          title="Toggle Match Log"
        >
          <span className="text-xl">📋</span>
        </button>

        {/* 3. Audio & BGM Player */}
        <div className="w-36 flex flex-col gap-2 pointer-events-auto">
           {/* SFX Quick Toggle */}
           <button
              onClick={() => toggleAudioSetting('sfx')}
              className={clsx(
                "w-full h-10 rounded-xl flex items-center justify-center transition-all bg-stone-900/80 backdrop-blur-md border border-white/20 shadow-xl",
                audioSettings.sfx ? "text-blue-400 bg-white/10" : "text-white/20 hover:bg-white/5"
              )}
              title="Toggle Sound Effects"
            >
              <span className="text-xl">{audioSettings.sfx ? '🔊' : '🔇'}</span>
            </button>
            
            {/* BGM Player Component */}
            <BackgroundMusic variant="game" />
        </div>

        {/* 3. View Control Button */}
        <button 
          onClick={() => setShowViewControls(!showViewControls)}
          className="w-36 bg-stone-800/90 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 hover:bg-stone-700 transition-all shadow-xl flex items-center gap-2 group pointer-events-auto"
          title="Camera Settings"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">📷</span>
          <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">View</span>
        </button>

        {/* 4. Back Button */}
        <button
          onClick={() => setShowLeftControls(false)}
          className="w-36 bg-stone-800/90 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 hover:bg-red-900/40 hover:border-red-500/50 transition-all shadow-xl flex items-center gap-2 group pointer-events-auto"
          title="Hide Controls"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">⬅️</span>
          <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Back</span>
        </button>
      </div>
      )}


      {/* Camera Controls Panel */}
      <AnimatePresence>
        {showViewControls && gameState.phase !== 'coinToss' && (
          <motion.div 
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="fixed top-[145px] left-4 w-64 bg-stone-900/95 border border-white/20 rounded-2xl p-5 z-[100] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-white/30 cursor-move"
            style={{ backgroundColor: 'rgba(15, 23, 42, 0.95)' }}
          >
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/90">Camera Engine</h3>
              </div>
              <button 
                onClick={() => setShowViewControls(false)} 
                className="text-white/40 hover:text-white text-xs pointer-events-auto p-1"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4 cursor-default" onPointerDown={(e) => e.stopPropagation()}>
            {/* Pitch (Tilt) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Tilt (X)</span>
                <span>{viewSettings.pitch}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="80" 
                value={viewSettings.pitch} 
                onChange={(e) => setViewSettings(prev => ({ ...prev, pitch: Number(e.target.value) }))}
                className="w-full accent-green-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Rotation (Z - Yaw) */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Rotate (Z)</span>
                <span>{viewSettings.rotation}°</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={viewSettings.rotation} 
                onChange={(e) => setViewSettings(prev => ({ ...prev, rotation: Number(e.target.value) }))}
                className="w-full accent-blue-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Zoom */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Zoom</span>
                <span>{viewSettings.zoom}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="1.5" 
                step="0.1"
                value={viewSettings.zoom} 
                onChange={(e) => setViewSettings(prev => ({ ...prev, zoom: Number(e.target.value) }))}
                className="w-full accent-yellow-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Height */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-white/60">
                <span>Height (Y)</span>
                <span>{viewSettings.height}px</span>
              </div>
              <input 
                type="range" 
                min="-200" 
                max="200" 
                value={viewSettings.height} 
                onChange={(e) => setViewSettings(prev => ({ ...prev, height: Number(e.target.value) }))}
                className="w-full accent-purple-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
              <button 
                onClick={() => setViewSettings({ pitch: 55, rotation: 0, zoom: 1, height: 0 })}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                3D Default
              </button>
              <button 
                onClick={() => setViewSettings({ pitch: 0, rotation: 0, zoom: 0.9, height: 0 })}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                2D Top-Down
              </button>
              <button 
                onClick={() => setViewSettings({ pitch: 55, rotation: 180, zoom: 1, height: 0 })}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                Opponent View
              </button>
              <button 
                onClick={() => setViewSettings({ pitch: 60, rotation: 45, zoom: 0.9, height: -50 })}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-xs"
              >
                Corner View
              </button>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. HUD Layer - Top (Opponent) */}
      {gameState.phase !== 'coinToss' && (
        <div className="absolute top-0 left-0 right-0 h-200 z-20 pointer-events-none">


         {/* Top Center: Opponent Hand (Arc Layout - Same as Player) */}
         <div 
           className="fixed left-1/2 -translate-x-1/2 z-[50]" 
           style={{ 
             top: '-100px', // 进一步向上调整，确保不挡住球场
             height: '200px', 
             width: `${Math.max(gameState.aiAthleteHand.length * (132 + 20), 400)}px`,
             maxWidth: '90vw', // 确保不超出屏幕
             pointerEvents: 'none' // 容器本身不拦截点击
           }}
         >
            <div 
              className="relative h-full flex justify-center items-center pb-4 perspective-1000" 
              style={{ width: '100%' }}
            >
              <AnimatePresence>
                  {gameState.aiAthleteHand.map((card, i) => {
                    // Calculate arc position for AI hand (same as player hand)
                    const arcAngle = 30;
                    const arcHeight = 264; // Match player hand arc height
                    const startAngle = -15;
                    
                    const anglePerCard = gameState.aiAthleteHand.length > 1 ? arcAngle / (gameState.aiAthleteHand.length - 1) : 0;
                    const currentAngle = startAngle + (i * anglePerCard);
                    const radius = arcHeight;
                    const radian = (currentAngle * Math.PI) / 180;
                    
                    // Calculate position (same as player hand but adjusted for top placement)
                    const x = Math.sin(radian) * radius;
                    const baseY = -Math.cos(radian) * radius + radius;
                    const heightAdjustment = Math.cos(radian) * 80;
                    const y = -(baseY - heightAdjustment + 150); // Further increased to move higher, ensure no overlap with field
                    const rotation = currentAngle; // Same rotation as player hand
                    
                    return (
                      <motion.div
                        key={`ai-hand-${card.id}`}
                        initial={{
                          opacity: 0,
                          scale: 0.8,
                          x: 1600, // 抽卡区X位置
                          y: 540,  // 抽卡区Y位置
                          rotate: 0
                        }}
                        animate={setupStep >= 3 ? { 
                          opacity: 1, 
                          scale: 1,
                          x: x,
                          y: y,
                          rotate: rotation
                        } : {
                          opacity: 0,
                          scale: 0.8,
                          x: 1600,
                          y: 540
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.8,
                          x: 0,
                          y: 0
                        }}
                        whileHover={{ 
                          scale: 1.5, 
                          rotate: 0, 
                          zIndex: 100
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        style={{ 
                          position: 'absolute',
                          width: '132px',
                          height: '86px',
                          left: '50%',
                          top: '50%',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          zIndex: i,
                          pointerEvents: 'auto'
                        }}
                      >
                         <AthleteCardComponent 
                            card={card} 
                            size="small" 
                            faceDown={false}
                            variant="away"
                         />
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
              <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 text-center text-[10px] text-white/40 uppercase tracking-widest font-bold whitespace-nowrap">
                   OPP HAND: {gameState.aiAthleteHand.length}
              </div>
            </div>
         </div>
        </div>
      )}

      {/* 3. HUD Layer - Bottom (Player) */}
      {gameState.phase !== 'coinToss' && (
        <div className="absolute bottom-0 left-0 right-0 z-30" data-testid="game-board">


         {/* Bottom Center: Player Hand */}
         <AthleteCardGroup
           cards={gameState.playerAthleteHand}
           selectedCard={gameState.selectedCard}
           setupStep={setupStep}
           phase={gameState.phase}
           onCardSelect={handleCardSelect}
         />
        </div>
      )}

      {/* Right Side: Turn Info & Action Buttons Container */}
      {gameState.phase !== 'coinToss' && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto flex flex-col items-end gap-6">
          {/* Turn Information */}
          <div className="text-right min-w-[200px]">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Turn {gameState.turnCount}</div>
              <div className="text-2xl font-['Russo_One'] text-white drop-shadow-md mb-2 flex items-center justify-end gap-3">
                  {gameState.currentTurn === 'player' ? (
                    <span className="text-blue-400">Your Turn</span>
                  ) : (
                    <>
                      <span className="text-[#F82D45]">Opponent Turn</span>
                      {gameState.aiActionStep !== 'none' && (
                        <motion.div 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex gap-1"
                        >
                          <span className="w-1.5 h-1.5 bg-[#F82D45] rounded-full" />
                          <span className="w-1.5 h-1.5 bg-[#F82D45] rounded-full" />
                          <span className="w-1.5 h-1.5 bg-[#F82D45] rounded-full" />
                        </motion.div>
                      )}
                    </>
                  )}
              </div>
              <div className="text-sm font-bold text-yellow-400 mb-1">
                {gameState.turnPhase === 'teamAction' ? 'Team Action' : 
                 gameState.turnPhase === 'athleteAction' ? 'Athlete Action' : ''}
              </div>
              <div className="text-xs text-gray-300 max-w-[200px] leading-tight ml-auto h-8 flex items-center justify-end">
                {gameState.message}
              </div>
          </div>

          {/* Team Action Modal - Centered */}
          {gameState.turnPhase === 'teamAction' && gameState.currentTurn === 'player' && (passCount > 0 || pressCount > 0) && (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black/80 backdrop-blur-md">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="bg-[#1a1a1a] p-8 rounded-2xl border-2 border-gray-600 max-w-md w-full shadow-2xl"
              >
                <h2 className="text-3xl font-['Russo_One'] text-white mb-6 text-center">Team Action</h2>
                <div className="mb-8 text-center">
                  <p className="text-yellow-400 font-bold mb-4">Choose Team Action</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-300">
                    <p><strong className="text-green-400">PASS:</strong> Draw synergy cards based on icons on field.</p>
                    <p><strong className="text-amber-400">PRESS:</strong> Move control marker towards opponent.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                      data-testid="team-action-pass"
                      onClick={() => handleTeamAction('pass', passCount)}
                      disabled={passCount === 0}
                      className="w-full h-24 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 disabled:from-stone-800 disabled:to-stone-900 disabled:opacity-50 text-white font-['Russo_One'] rounded-xl shadow-lg border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                      <span className="text-sm tracking-widest group-hover:scale-110 transition-transform">PASS</span>
                      <span className="text-[10px] font-bold text-green-200/80 mt-1">DRAW SYNERGY</span>
                      <div className="mt-2 flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                        <span className="text-[9px] font-black">{Math.max(0, Math.min(passCount, 5 - gameState.playerSynergyHand.length))}</span>
                        <span className="text-[8px] opacity-60">CARDS</span>
                      </div>
                    </button>
                    <button
                        data-testid="team-action-press"
                        onClick={() => handleTeamAction('press', pressCount)}
                        disabled={pressCount === 0}
                        className="w-full h-24 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 disabled:from-stone-800 disabled:to-stone-900 disabled:opacity-50 text-white font-['Russo_One'] rounded-xl shadow-lg border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                        <span className="text-sm tracking-widest group-hover:scale-110 transition-transform">PRESS</span>
                        <span className="text-[10px] font-bold text-red-200/80 mt-1">PUSH CONTROL</span>
                        <div className="mt-2 flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                          <span className="text-[9px] font-black">{pressCount}</span>
                          <span className="text-[8px] opacity-60">STEPS</span>
                        </div>
                      </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Action Buttons Panel */}
          <div className="flex gap-3">
                {gameState.turnPhase === 'teamAction' && gameState.currentTurn === 'player' ? (
                  passCount === 0 && pressCount === 0 ? (
                    <div className="flex flex-col gap-3 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                      {/* Auto-skip hint if both are 0 */}
                      <button
                        onClick={() => {
                          // Directly set turnPhase to athleteAction instead of executing pass
                          setGameState(prev => ({
                            ...prev,
                            turnPhase: 'athleteAction',
                            message: 'Turn phase set to athlete action'
                          }));
                          playSound('click');
                        }}
                        className="mt-2 py-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter transition-colors"
                      >
                        No actions available - Skip Team Action                    </button>
                    </div>
                  ) : null
                ) : (
                  gameState.turnPhase === 'athleteAction' && gameState.currentTurn === 'player' ? (
                    <div className="flex flex-col gap-3">
                      {/* Shoot Button */}
                      <button
                        onClick={() => {
                          handleShoot();
                        }}
                        disabled={!hasShootablePlayers()}
                        className="py-3 px-4 bg-[#F82D45] hover:bg-[#E72940] disabled:from-stone-800/50 disabled:to-stone-900/50 disabled:opacity-50 text-white font-['Russo_One'] text-lg rounded-xl shadow-[0_8px_20px_rgba(248,45,69,0.2)] border border-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                        <span className="relative z-10 tracking-widest group-hover:scale-110 transition-transform inline-block">SHOOT</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </button>
                      
                      {/* End Turn Button */}
                      <button
                        onClick={handleEndTurn}
                        className="py-3 px-4 bg-gradient-to-br from-blue-600/90 to-blue-800/90 hover:from-blue-500 hover:to-blue-700 disabled:from-stone-800/50 disabled:to-stone-900/50 disabled:opacity-50 text-white font-['Russo_One'] text-lg rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] border border-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                        <span className="relative z-10 tracking-widest group-hover:scale-110 transition-transform inline-block">END TURN</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                      </button>
                    </div>
                  ) : null
                )}
              </div>
          </div>
        )}
        
        {/* Setup Overlay */}
      <AnimatePresence>
        {gameState.phase === 'setup' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-black/60 backdrop-blur-xl border border-white/20 p-8 rounded-3xl flex flex-col items-center gap-6 shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="flex flex-col items-center">
                <h2 className="text-4xl font-['Russo_One'] text-white tracking-widest mb-2 uppercase">Preparing Field</h2>
                <div className="flex gap-2">
                  <div className={clsx("w-3 h-3 rounded-full transition-colors duration-500", setupStep >= 1 ? "bg-green-500" : "bg-white/10")} />
                  <div className={clsx("w-3 h-3 rounded-full transition-colors duration-500", setupStep >= 2 ? "bg-green-500" : "bg-white/10")} />
                  <div className={clsx("w-3 h-3 rounded-full transition-colors duration-500", setupStep >= 3 ? "bg-green-500" : "bg-white/10")} />
                </div>
              </div>
              
              <div className="text-white/60 text-sm font-bold tracking-widest uppercase text-center h-6">
                {setupStep === 1 && "Aligning Pitch..."}
                {setupStep === 2 && "Calibrating Momentum..."}
                {setupStep === 3 && "Dealing Player Cards..."}
                {setupStep === 4 && "Ready to Play!"}
              </div>

              <button 
                onClick={() => setSetupStep(4)}
                className="pointer-events-auto mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-[10px] font-black tracking-[0.3em] uppercase transition-all"
              >
                Skip Intro
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Overlays */}
      <AnimatePresence>

        {/* Coin Toss HUD */}
        {gameState.phase === 'coinToss' && (
          <AnimatePresence>
            {!rpsInProgress ? (
              <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[100]"
              >
                <motion.div 
                  initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                  className="bg-[#1a1a1a] p-8 rounded-3xl border-2 border-green-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center min-w-[400px]"
                >
                  <h2 className="text-3xl font-['Russo_One'] text-white mb-6 tracking-wider">ROCK PAPER SCISSORS</h2>
                  <p className="text-gray-400 mb-8 text-base">Play to determine Home/Away team</p>
                  <button 
                    onClick={startToss}
                    className="px-10 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-black text-xl rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                  >
                    Play Game
                  </button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[200] flex items-center justify-center"
              >
                <RockPaperScissors onComplete={handleRockPaperScissorsComplete} />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Immediate Effect Modal */}
        {gameState.pendingImmediateEffect && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#2a2a2a] p-8 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-['Russo_One'] text-white mb-2">Immediate Effect</h3>
              <p className="text-yellow-400 font-bold mb-4">{gameState.pendingImmediateEffect.card.nickname}</p>
              <p className="text-gray-300 mb-8">{getImmediateEffectDescription(gameState.pendingImmediateEffect.card.immediateEffect)}</p>
              <div className="flex gap-4">
                <button onClick={handleTriggerImmediateEffect} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg">TRIGGER</button>
                <button onClick={handleSkipImmediateEffect} className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg">SKIP</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Synergy Choice Modal */}
        {gameState.synergyChoice && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-[#2a2a2a] p-8 rounded-2xl border border-gray-700 max-w-2xl w-full">
              <h3 className="text-2xl font-['Russo_One'] text-center text-white mb-6">Choose One to Keep</h3>
              <div className="flex justify-center gap-8 mb-8">
                {gameState.synergyChoice.cards.map((card, index) => (
                  <div key={card.id} className="flex flex-col gap-4">
                    <SynergyCardComponent 
                      card={card} 
                      onClick={() => {}} 
                      selected={false} 
                      disabled={false} 
                    />
                    <button 
                      onClick={() => handleSynergyChoiceSelect(index)}
                      className="py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg"
                    >
                      KEEP
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Substitution Modal */}
        {gameState.substitutionMode && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 max-w-4xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)]">
               <h3 className="text-2xl font-['Russo_One'] text-white mb-8 text-center uppercase tracking-widest">Select Player to Swap Out</h3>
               
               <div className="mb-10">
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4 px-2 font-black border-l-2 border-blue-500/50 ml-2">Players On Field</div>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 max-h-80 overflow-y-auto p-4 bg-black/20 rounded-2xl border border-white/5 custom-scrollbar">
                    {gameState.playerField.flatMap(zone => 
                      zone.slots.filter(slot => slot.athleteCard).map(slot => (
                        <div key={`${zone.zone}-${slot.position}`} className="relative group flex flex-col items-center">
                          <motion.div 
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubstituteTarget(slot.athleteCard!.id)}
                            className="cursor-pointer relative z-10"
                          >
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <AthleteCardComponent card={slot.athleteCard!} size="small" />
                          </motion.div>
                          <div className="mt-3 text-[9px] font-black text-white/40 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-full border border-white/5 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                            Zone {zone.zone} �?Slot {slot.position}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>

               {gameState.playerAthleteHand.length > 0 && gameState.substitutionMode && (
                 <div className="mb-10">
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4 px-2 font-black border-l-2 border-green-500/50 ml-2">Players In Hand</div>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 p-4 bg-black/20 rounded-2xl border border-white/5">
                      {gameState.playerAthleteHand.map((card: athleteCard) => (
                        <div key={`sub-${card.id}`} className="relative group flex flex-col items-center">
                          <motion.div 
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubstituteTarget(card.id)}
                            className="cursor-pointer relative z-10"
                          >
                            <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <AthleteCardComponent card={card} size="small" />
                          </motion.div>
                          <div className="mt-3 text-[9px] font-black text-white/40 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-full border border-white/5 group-hover:text-green-400 group-hover:border-green-500/30 transition-all">
                            In Hand
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               <button 
                onClick={handleCancelSubstitution} 
                className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white/50 hover:text-white font-['Russo_One'] rounded-xl border border-white/5 hover:border-white/20 transition-all uppercase tracking-[0.2em] text-xs"
              >
                Cancel Substitution
              </button>
            </div>
          </motion.div>
        )}

        {/* Instant Shot Modal */}
        {gameState.instantShotMode && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1a1a] p-8 rounded-2xl border border-yellow-500/50 max-w-md w-full shadow-[0_0_50px_rgba(234,179,8,0.2)]"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black text-xl">⚽</div>
                <h3 className="text-2xl font-['Russo_One'] text-white uppercase tracking-tighter">Instant Shot!</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                <span className="text-yellow-400 font-bold">{gameState.instantShotMode.card.nickname}</span> can perform an immediate shot attempt. 
                Select synergy cards from your hand to boost the attack power!
              </p>
              <div className="bg-black/40 p-4 rounded-xl mb-8 border border-white/5">
                <div className="flex justify-between text-xs text-white/40 uppercase mb-2">
                  <span>Target Zone</span>
                  <span>Attack Boost</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-white">Zone {gameState.instantShotMode.zone}</span>
                  <span className="text-xl font-bold text-yellow-500">+{gameState.selectedSynergyCards.length} Cards</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => handleInstantShot(gameState.instantShotMode!.zone, gameState.instantShotMode!.slot)} 
                  className="flex-1 py-4 bg-yellow-600 hover:bg-yellow-500 text-white font-black rounded-xl shadow-lg transition-all"
                >
                  FIRE!
                </button>
                <button onClick={handleCancelInstantShot} className="flex-1 py-4 bg-stone-800 hover:bg-stone-700 text-white/70 font-bold rounded-xl transition-all">
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Deck/Discard Viewer Modal */}
        {viewingPile && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[100]"
            onClick={() => setViewingPile(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="text-3xl font-['Russo_One'] text-white">
                  {viewingPile === 'deck' ? 'Deck Contents' : 'Discard Pile'}
                </h3>
                <button 
                  onClick={() => setViewingPile(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <span className="text-xl text-white">✕</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0 pr-2">
                <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
                  {(viewingPile === 'deck' ? gameState.synergyDeck : gameState.synergyDiscard).map((card, i) => (
                    <div key={`${card.id}-${i}`} className="relative group">
                       <SynergyCardComponent 
                         card={card} 
                         size="small" 
                         disabled={true}
                         onMouseEnter={() => handleHoverEnterCard(card as any)}
                         onMouseLeave={handleHoverLeaveCard}
                       />
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg pointer-events-none" />
                    </div>
                  ))}
                  {(viewingPile === 'deck' ? gameState.synergyDeck : gameState.synergyDiscard).length === 0 && (
                     <div className="col-span-full py-20 text-center text-white/30 text-xl font-bold uppercase tracking-widest">
                       Pile is Empty
                     </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                <button 
                  onClick={() => setViewingPile(null)}
                  className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors font-['Russo_One']"
                >
                  CLOSE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <PhaseBanner
        text={phaseBannerText}
        subtitle={phaseBannerSubtitle}
        show={showPhaseBanner}
        durationMs={phaseBannerText === 'END TURN' ? 1000 : 2000}
        soundType={
          phaseBannerText === 'HALF TIME' ? 'whistle_long' :
          phaseBannerText === 'FULL TIME' ? 'whistle_long' :
          phaseBannerText === 'STOPPAGE TIME' ? 'whistle' :
          phaseBannerText === 'Your Turn' ? 'ding' :
          phaseBannerText === 'Opponent Turn' ? 'snap' :
          phaseBannerText?.includes('Round') ? 'cheer' :
          'snap'
        }
        onComplete={React.useCallback(() => {
          setShowPhaseBanner(false);
          if (gameState.phase === 'draft' && gameState.draftStep === 0) {
            dispatch({ type: 'START_DRAFT_ROUND' });
          }
        }, [gameState.phase, gameState.draftStep, dispatch])}
      />

      {/* Duel Overlay */}
      {gameState.pendingShot && (
        <DuelOverlay
          duelPhase={gameState.duelPhase}
          attacker={gameState.pendingShot.attacker.card}
          defender={gameState.pendingShot.defender?.card || null}
          attackSynergy={gameState.pendingShot.attackSynergy}
          defenseSynergy={gameState.pendingShot.defenseSynergy}
          attackPower={gameState.pendingShot.attackerPower}
          defensePower={gameState.pendingShot.defenderPower}
          result={gameState.pendingShot.result}
          activatedSkills={gameState.pendingShot.activatedSkills}
          onAdvance={() => dispatch({ type: 'ADVANCE_DUEL' })}
          isPlayerAttacking={gameState.currentTurn === 'player' || (gameState.currentTurn === 'ai' && gameState.turnPhase === 'end')}
          attackerUsedShotIcons={gameState.pendingShot.attackerUsedShotIcons || []}
          onShotIconSelect={(iconIndex) => {
            dispatch({ type: 'SELECT_SHOT_ICON', iconIndex });
          }}
          defenderSynergySelection={gameState.defenderSynergySelection}
          defenderAvailableSynergyCards={gameState.defenderAvailableSynergyCards}
          defenderSelectedSynergyCards={gameState.defenderSelectedSynergyCards}
          onSelectDefenderSynergyCard={(cardIndex) => {
            dispatch({ type: 'SELECT_DEFENDER_SYNERGY_CARD', cardIndex });
          }}
          onConfirmDefenderSynergy={() => {
            dispatch({ type: 'CONFIRM_DEFENDER_SYNERGY' });
          }}
          isPlayerDefending={gameState.currentTurn === 'ai'}
        />
      )}

      {/* AI Card Play Notification */}
      <AnimatePresence>
        {aiJustPlacedCard && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed top-1/3 left-1/2 -translate-x-1/2 z-[150] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-red-900/90 to-red-800/90 backdrop-blur-md border-2 border-red-500/50 rounded-xl px-6 py-4 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="text-3xl">🎴</div>
                <div>
                  <div className="text-red-300 text-xs font-bold tracking-wider">OPPONENT PLAYED</div>
                  <div className="text-white text-lg font-black">{aiJustPlacedCard.nickname}</div>
                  <div className="text-red-200 text-sm">{aiJustPlacedCard.positionLabel} - {aiJustPlacedCard.type}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>



      {/* Match Log HUD */}
      <AnimatePresence>
        {showMatchLog && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 right-6 z-[90] w-[300px] h-[400px]"
          >
            <MatchLog logs={gameState.matchLogs} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Controls Panel */}
      <AmbientControls 
        isOpen={showAmbientControls} 
        onClose={() => setShowAmbientControls(false)} 
      />

      {gameState.phase === 'squadSelection' && (
        <SquadSelect
          allPlayers={[...gameState.playerAthleteHand, ...gameState.playerBench]}
          onConfirm={(starters, subs) => {
            dispatch({ type: 'FINISH_SQUAD_SELECT', starters, subs });
          }}
          isHomeTeam={gameState.isHomeTeam}
        />
      )}

      <PenaltyModal
        isOpen={gameState.pendingPenalty}
        onComplete={handlePenaltyComplete}
      />

      {/* Card Preview Modal */}
      <CardPreviewModal
        isOpen={showCardPreview}
        card={previewCard}
        onClose={() => setShowCardPreview(false)}
      />

        {gameState.phase === 'draft' && (
          <DraftPhase gameState={gameState} dispatch={dispatch} />
        )}

      {/* Shooter Selector Modal */}
      <ShooterSelector
        playerField={gameState.playerField}
        isOpen={showShooterSelector}
        onClose={() => setShowShooterSelector(false)}
        onSelectPlayer={handleSelectShooter}
      />

      {/* Global Card Hover Preview */}
      <AnimatePresence>
        {hoveredCard && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.8 }}
            className="fixed z-[100] pointer-events-none"
            style={{
              left: hoveredCardPosition.x + 20,
              top: hoveredCardPosition.y - 100,
              maxWidth: '280px'
            }}
          >
            <div className="relative">
              {/* Glow effect */}
               <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
               <AthleteCardComponent card={hoveredCard} size="large" faceDown={false} />
               
               {/* Status label */}
              {gameState.aiBench.some(c => c.id === hoveredCard.id) && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg whitespace-nowrap">
                  Opponent Substitute
                </div>
              )}
              {gameState.playerBench.some(c => c.id === hoveredCard.id) && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 px-4 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg whitespace-nowrap">
                  Your Substitute
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

