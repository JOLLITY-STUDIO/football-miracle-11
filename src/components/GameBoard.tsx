import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { createInitialState } from '../game/gameLogic';
import type { GameState } from '../game/gameLogic';
import { canPlaceCardAtSlot, getImmediateEffectDescription, getIconDisplay } from '../data/cards';
import type { PlayerCard, SynergyCard } from '../data/cards';
import { GameField } from './GameField';
import { PlayerCardComponent } from './PlayerCard';
import { SynergyCardComponent } from './SynergyCard';
import { SynergyPanel } from './SynergyPanel';
import { PenaltyModal } from './PenaltyModal';
import { LeftPanel } from './LeftPanel';
import { CenterField } from './CenterField';
import { RightPanel } from './RightPanel';
import { BackgroundMusic } from './BackgroundMusic';
import StarCardDraft from './StarCardDraft';
import PhaseBanner from './PhaseBanner';
import { CoinToss } from './CoinToss';
import { TurnTransition } from './TurnTransition';
import SquadSelect from './SquadSelect';
import { CardDealer } from './CardDealer';
import { 
  placeCard, 
  performAITurn, 
  performTeamAction, 
  getControlState, 
  countIcons,
  getMaxSynergyCardsForAttack,
  performShot,
  resolveSynergyChoice,
  applyImmediateEffect,
  drawTwoSynergyCardsForChoice,
  substitutePlayer,
  resolvePenaltyKick,
  aiPickDraftCard,
  startDraftRound,
  pickDraftCard,
  stealSynergyCard,
  startSecondHalf,
  gameReducer,
  type GameAction,
} from '../game/gameLogic';
import { GameRecorder, saveGameRecord } from '../game/gameRecorder';
import { playSound } from '../utils/audio';

interface Props {
  onBack: () => void;
  playerTeam: { starters: PlayerCard[]; substitutes: PlayerCard[]; initialField?: any[] } | null;
}

export const GameBoard: React.FC<Props> = ({ onBack, playerTeam }) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    if (playerTeam) {
      return createInitialState(playerTeam.starters, playerTeam.substitutes, playerTeam.initialField);
    }
    return createInitialState();
  });
  
  const dispatch = useCallback((action: GameAction) => {
    setGameState(prev => gameReducer(prev, action));
  }, []);

  const [lastPlacedCard, setLastPlacedCard] = useState<PlayerCard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<PlayerCard | null>(null);
  const [hoverSoundPlayedForId, setHoverSoundPlayedForId] = useState<string | null>(null);
  const [showPhaseBanner, setShowPhaseBanner] = useState(false);
  const [phaseBannerText, setPhaseBannerText] = useState('');
  const [phaseBannerSubtitle, setPhaseBannerSubtitle] = useState(''); // 新增
  const gameRecorder = useRef(new GameRecorder());
  const gameStarted = useRef(false);

  if (!gameStarted.current) {
    gameStarted.current = true;
    gameRecorder.current = new GameRecorder();
  }

  const [aiTurnTriggered, setAiTurnTriggered] = useState(false);
  const [setupStep, setSetupStep] = useState(0); // 0: not started, 1: board, 2: control, 3: cards, 4: done
  const [tossResult, setTossResult] = useState<'home' | 'away' | null>(null);
  const [aiDraftSelectingIndex, setAiDraftSelectingIndex] = useState<number | null>(null);

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
  }, [gameState.phase, setupStep, dispatch]);

  const [lastTurn, setLastTurn] = useState<string>('player');
  const [lastPhase, setLastPhase] = useState<string>('');
  const [viewingPile, setViewingPile] = useState<'deck' | 'discard' | null>(null);
  const [shownStoppageTime, setShownStoppageTime] = useState(false);
  
  // Audio Feedback for card actions (hand changes)
  const prevPlayerHandCount = useRef(gameState.playerHand.length);
  const prevAiHandCount = useRef(gameState.aiHand.length);
  const prevPlayerSynergyCount = useRef(gameState.playerSynergyHand.length);
  const prevAiSynergyCount = useRef(gameState.aiSynergyHand.length);

  useEffect(() => {
    // Player hand changes
    if (gameState.playerHand.length < prevPlayerHandCount.current) {
      playSound('flip'); // Card played
    } else if (gameState.playerHand.length > prevPlayerHandCount.current) {
      playSound('draw'); // Card drawn
    }
    prevPlayerHandCount.current = gameState.playerHand.length;

    // AI hand changes
    if (gameState.aiHand.length < prevAiHandCount.current) {
      playSound('flip'); // Card played
    } else if (gameState.aiHand.length > prevAiHandCount.current) {
      playSound('draw'); // Card drawn
    }
    prevAiHandCount.current = gameState.aiHand.length;

    // Synergy hand changes
    if (gameState.playerSynergyHand.length !== prevPlayerSynergyCount.current) {
      playSound('draw');
    }
    prevPlayerSynergyCount.current = gameState.playerSynergyHand.length;

    if (gameState.aiSynergyHand.length !== prevAiSynergyCount.current) {
      playSound('draw');
    }
    prevAiSynergyCount.current = gameState.aiSynergyHand.length;
  }, [gameState.playerHand.length, gameState.aiHand.length, gameState.playerSynergyHand.length, gameState.aiSynergyHand.length]);
  
  // Audio Settings
  const [audioSettings, setAudioSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
  });

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
      // Step 3: Card dealing
      dispatch({ type: 'SET_DEALING', isDealing: true });
      playSound('draw');
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_DEALING', isDealing: false });
        setSetupStep(4);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [setupStep, dispatch]);

  // Sound effect for drawing cards
  const prevHandSize = useRef(gameState.playerHand.length);
  const prevSynergyHandSize = useRef(gameState.playerSynergyHand.length);
  
  useEffect(() => {
    if (gameState.playerHand.length > prevHandSize.current) {
      playSound('draw');
    }
    prevHandSize.current = gameState.playerHand.length;
  }, [gameState.playerHand.length]);

  useEffect(() => {
    if (gameState.playerSynergyHand.length > prevSynergyHandSize.current) {
      playSound('draw');
    }
    prevSynergyHandSize.current = gameState.playerSynergyHand.length;
  }, [gameState.playerSynergyHand.length]);

  const toggleAudioSetting = (key: 'bgm' | 'sfx') => {
    const newSettings = { ...audioSettings, [key]: !audioSettings[key] };
    setAudioSettings(newSettings);
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
    // Dispatch custom event for BackgroundMusic component in the same window
    window.dispatchEvent(new Event('audioSettingsChanged'));
    playSound('click');
  };

  // View Control State
  const [viewSettings, setViewSettings] = useState({
    pitch: 0,
    rotation: 0,
    zoom: 1.0,
    height: 0
  });
  const [showViewControls, setShowViewControls] = useState(false);

  // Auto-scaling logic to fit screen
  const [autoScale, setAutoScale] = useState(1);
  const BASE_WIDTH = 2000; // Total width: 420 + 1000 + 500 + some padding
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
        if (gameState.turnPhase === 'teamAction') {
          text = 'TACTICAL PHASE';
          subtitle = 'Choose Team Action: Pass or Press';
        }
        else if (gameState.turnPhase === 'playerAction') {
          text = 'ACTION PHASE';
          subtitle = gameState.currentTurn === 'player' 
            ? 'Place a Card or Attempt a Shot' 
            : 'AI is Thinking...';
        }
        else if (gameState.turnPhase === 'shooting') {
          text = 'BATTLE PHASE';
          subtitle = 'Shot Attempt in Progress!';
        }
        
        if (text) {
            setPhaseBannerText(text);
            setPhaseBannerSubtitle(subtitle);
            setShowPhaseBanner(true);
        }
        setLastPhase(gameState.turnPhase);
    }

    // Show banner when Game Phase changes (Halftime/Extra Time)
    if (gameState.phase === 'halfTime') {
        setPhaseBannerText('HALF TIME');
        setPhaseBannerSubtitle('Make Substitutions and Prepare for 2nd Half');
        setShowPhaseBanner(true);
    } else if (gameState.phase === 'extraTime') {
        setPhaseBannerText('EXTRA TIME');
        setPhaseBannerSubtitle('Sudden Death! Next Goal Wins!');
        setShowPhaseBanner(true);
    }
    
    // Show banner for Stoppage Time
    if (gameState.isStoppageTime && !shownStoppageTime) {
        setPhaseBannerText('STOPPAGE TIME');
        setPhaseBannerSubtitle('Synergy Deck Reshuffled!');
        setShowPhaseBanner(true);
        setShownStoppageTime(true);
    }
  }, [gameState.turnPhase, gameState.phase, lastPhase, gameState.isStoppageTime, shownStoppageTime, gameState.currentTurn]);

  // Turn Transition Logic
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  useEffect(() => {
    if (gameState.currentTurn !== lastTurn) {
        setShowTurnTransition(true);
        setLastTurn(gameState.currentTurn);
    }
  }, [gameState.currentTurn, lastTurn]);

  // Draft Phase Banner
  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftStep === 0 && gameState.draftRound > 0) {
      const timer = setTimeout(() => {
        setPhaseBannerText(`Sign Star Players - Round ${gameState.draftRound}`);
        setShowPhaseBanner(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.draftRound, gameState.draftStep]);

  // AI Draft Logic
  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.currentTurn === 'ai' && gameState.draftStep > 0) {
      // Simulate AI thinking and selecting
      const selectTimer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * gameState.availableDraftCards.length);
        setAiDraftSelectingIndex(randomIndex);
      }, 500);

      const pickTimer = setTimeout(() => {
        dispatch({ type: 'AI_DRAFT_PICK' });
        setAiDraftSelectingIndex(null);
        playSound('draw');
      }, 2000); // Increased from 1500 to 2000 for better visibility

      return () => {
        clearTimeout(selectTimer);
        clearTimeout(pickTimer);
      };
    }
  }, [gameState.phase, gameState.currentTurn, gameState.draftStep, gameState.availableDraftCards.length, dispatch]);

  // AI Turn Logic
  useEffect(() => {
    const isMatchPhase = gameState.phase === 'firstHalf' || gameState.phase === 'secondHalf';
    const isAITurn = gameState.currentTurn === 'ai' && (gameState.turnPhase === 'teamAction' || gameState.turnPhase === 'playerAction');
    
    if (isMatchPhase && isAITurn && !gameState.isDealing) {
      const timer = setTimeout(() => {
        gameRecorder.current.recordAction('ai_action', 'ai');
        dispatch({ type: 'AI_TURN' });
      }, 2000); // 2 second delay for AI to "think"
      return () => clearTimeout(timer);
    }
  }, [gameState.currentTurn, gameState.turnPhase, gameState.phase, gameState.isDealing, dispatch]);

  const saveCurrentSnapshot = () => {
    const snapshot = {
      playerScore: gameState.playerScore,
      aiScore: gameState.aiScore,
      playerField: gameState.playerField.map(z => ({ zone: z.zone, slots: z.slots.map(s => ({ position: s.position, playerCardId: s.playerCard?.id || null })) })),
      aiField: gameState.aiField.map(z => ({ zone: z.zone, slots: z.slots.map(s => ({ position: s.position, playerCardId: s.playerCard?.id || null })) })),
      playerHand: gameState.playerHand.map(c => c.id),
      aiHand: gameState.aiHand.map(c => c.id),
      controlPosition: gameState.controlPosition,
      phase: gameState.phase,
    };
    gameRecorder.current.recordSnapshot(snapshot);
  };

  const canDoAction = (gameState.turnPhase === 'playerAction' || gameState.isFirstTurn) && gameState.currentTurn === 'player';
  const canPlaceCards = canDoAction && !gameState.currentAction;

  const handleCardSelect = (card: PlayerCard) => {
    if (gameState.currentTurn !== 'player') return;
    if (!canPlaceCards) return;
    playSound('draw'); // Changed from 'click' to 'draw'
    dispatch({ type: 'SELECT_PLAYER_CARD', card: gameState.selectedCard?.id === card.id ? null : card });
  };

  const handleSlotClick = (zone: number, startCol: number) => {
    if (!gameState.selectedCard || gameState.currentTurn !== 'player') return;
    if (!canPlaceCards) {
      if (gameState.turnPhase === 'teamAction') {
        setGameState(prev => ({ ...prev, message: 'Must perform Team Action first!' }));
        playSound('error');
      }
      return;
    }
    
    const slotPosition = Math.floor(startCol / 2) + 1;
    if (!canPlaceCardAtSlot(gameState.selectedCard, gameState.playerField, zone, slotPosition, gameState.isFirstTurn)) {
      setGameState(prev => ({ ...prev, message: 'Cannot place card here!' }));
      playSound('error');
      return;
    }

    const card = gameState.selectedCard;
    dispatch({ type: 'PLACE_CARD', card, zone, slot: startCol });
    dispatch({ type: 'SELECT_PLAYER_CARD', card: null });
    setLastPlacedCard(card);
    playSound('flip');
  };

  const handleDragStart = (card: PlayerCard) => {
    if (gameState.currentTurn !== 'player' || !canDoAction) return;
    dispatch({ type: 'SELECT_PLAYER_CARD', card });
    playSound('click');
  };

  const handleDragEnd = () => {
    // No longer needed to manually clear if we use centralized state
  };
  
  const handleSynergyChoiceSelect = (keepIndex: number) => {
    dispatch({ type: 'SYNERGY_CHOICE_SELECT', index: keepIndex });
    playSound('draw');
  };

  const handleHoverEnterCard = (card: PlayerCard) => {
    setHoveredCard(card);
    if (hoverSoundPlayedForId !== card.id) {
      playSound('draw'); // Changed from 'click' to 'draw' for card hover/select
      setHoverSoundPlayedForId(card.id);
    }
  };

  const handleHoverLeaveCard = () => {
    setHoveredCard(null);
    setHoverSoundPlayedForId(null);
  };

  const handleSubstituteSelect = (card: PlayerCard) => {
    if (gameState.playerSubstitutionsLeft <= 0) return;
    if (gameState.currentTurn !== 'player') return;
    dispatch({ type: 'START_SUBSTITUTION', card });
    playSound('click');
  };

  const handleSubstituteTarget = (outgoingCardId: string) => {
    if (!gameState.substitutionMode) return;
    dispatch({ 
      type: 'SUBSTITUTE', 
      incomingCardId: gameState.substitutionMode.incomingCard.id, 
      outgoingCardId 
    });
    playSound('whistle');
  };

  const handleCancelSubstitution = () => {
    dispatch({ type: 'CANCEL_SUBSTITUTION' });
  };

  const handleCoinTossComplete = useCallback(() => {
    if (tossResult) {
      dispatch({ type: 'COIN_TOSS', isHomeTeam: tossResult === 'home' });
      // Don't clear tossResult immediately to avoid UI flash
      // The modal will close because gameState.phase changes to 'draft'
      playSound('whistle');
    }
  }, [tossResult, dispatch]);

  // Clear tossResult once we are no longer in coinToss phase
  useEffect(() => {
    if (gameState.phase !== 'coinToss' && tossResult !== null) {
      setTossResult(null);
    }
  }, [gameState.phase, tossResult]);

  const startToss = () => {
    const result = Math.random() < 0.5 ? 'home' : 'away';
    setTossResult(result);
  };

  useEffect(() => {
    // If we are in draft phase and just finished coin toss, play swap sound if away
    if (gameState.phase === 'draft' && !gameState.isHomeTeam) {
      playSound('swosh');
      const timer = setTimeout(() => {
        playSound('snap');
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.isHomeTeam]);

  const handlePenaltyComplete = (playerPoints: number, aiPoints: number) => {
    dispatch({ type: 'PENALTY_COMPLETE', playerPoints, aiPoints });
    playSound('whistle');
  };

  const handleSynergySelect = (card: SynergyCard) => {
    if (gameState.currentTurn !== 'player') return;
    const controlState = getControlState(gameState.controlPosition);
    
    // According to the rules, players can only select synergy cards during their turn phase
    // if they have the control or as part of a shot attempt.
    dispatch({ type: 'SELECT_SYNERGY_CARD', card });
    playSound('click');
  };

  const handleTeamAction = useCallback((action: 'pass' | 'press') => {
    dispatch({ type: 'TEAM_ACTION', action });
    playSound('click');
  }, [dispatch]);

  const handleAttack = useCallback((zone: number, slot: number) => {
    if (gameState.currentTurn !== 'player') return;
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
    
    // The sound will be played based on result in a useEffect or after dispatch
  }, [gameState, dispatch]);

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
  }, [gameState.pendingShot, gameState.turnPhase]);

  const handleEndTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
    playSound('whistle');

    // AI Turn handled by useEffect
  }, [dispatch]);

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

  const handleInstantShot = useCallback((zone: number, slot: number) => {
    if (!gameState.instantShotMode) return;
    
    // Instant shot uses selected synergy cards
    const synergyCards = [...gameState.selectedSynergyCards];
    dispatch({ type: 'PERFORM_SHOT', zone, slot, synergyCards });
    playSound('goal');
  }, [gameState, dispatch]);

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

  const handleBack = (isSurrender: boolean = false) => {
    if (gameRecorder.current.getActions().length > 0) {
      let winner: 'player' | 'ai' | 'draw' = gameState.playerScore > gameState.aiScore ? 'player' : 
                     gameState.playerScore < gameState.aiScore ? 'ai' : 'draw';
      
      if (isSurrender) {
        winner = 'ai'; // AI wins if player surrenders
      }

      const record = gameRecorder.current.endGame(winner, {
        player: gameState.playerScore,
        ai: gameState.aiScore,
      });
      saveGameRecord(record);
    }
    onBack();
  };

  const passCount = countIcons(gameState.playerField, 'pass');
  const pressCount = countIcons(gameState.playerField, 'press');
  const canDoTeamAction = !gameState.isFirstTurn || gameState.playerField.some(z => z.slots.some(s => s.playerCard));

  const handleVolumeChange = (newVolume: number) => {
    const newSettings = { ...audioSettings, volume: newVolume };
    setAudioSettings(newSettings);
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('audioSettingsChanged'));
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-['Roboto'] select-none text-white">
      
      {/* 0. 3D Environment Background (Void) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)]">
      </div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.35] mix-blend-multiply" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #3b2f2f 0px, #3b2f2f 6px, #4b3833 6px, #4b3833 12px)' }} />
        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.05), transparent 40%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.3), transparent 50%)' }} />
      </div>

      {/* 1. Main Game Field (Center) - Maximize Space with 3D Perspective */}
      <div className="absolute inset-0 flex items-center justify-center z-10 perspective-1000 overflow-hidden" style={{ perspectiveOrigin: '50% 50%' }}>
        <div 
          className="relative transition-transform duration-700 ease-out transform-style-3d transform-gpu flex items-center justify-center"
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${autoScale}) rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) translateY(${viewSettings.height - 50}px) scale(${viewSettings.zoom})`,
          }}
        >
             {/* Virtual Grid Floor - Moves with Camera */}
             <div 
                className="absolute inset-[-200%] opacity-10 pointer-events-none bg-stone-900 transform-style-3d"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                  backgroundSize: '100px 100px',
                  transform: 'translateZ(-300px) scale(2)',
                }}
             />

             {/* Board Container (Includes Side Panels) */}
             <div className="relative w-[1920px] h-[1080px] flex flex-row items-stretch justify-center shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-xl overflow-visible bg-stone-900 border-[12px] border-stone-800 transform-style-3d perspective-2000">
                <div className="absolute inset-[-20px] rounded-[28px] bg-[radial-gradient(circle_at_50%_40%,_rgba(16,99,39,0.8),_rgba(0,0,0,0.9))] blur-[8px]" style={{ transform: 'translateZ(-60px)' }} />
                
                {/* 3D Thickness/Volume Layer - Full Width Unified Board */}
                <div className="absolute inset-[-4px] bg-stone-950 rounded-xl transform-style-3d shadow-2xl border-4 border-stone-900" 
                     style={{ transform: 'translateZ(-30px)' }} 
                />
                
                {/* Edge Highlights for 3D depth */}
                <div className="absolute inset-0 border-t border-l border-white/10 rounded-xl pointer-events-none" />
                <div className="absolute inset-0 border-b border-r border-black/50 rounded-xl pointer-events-none" />

                {/* Card Dealing Animations */}
                <CardDealer isDealing={gameState.isDealing} type="player" />
                <CardDealer isDealing={gameState.isDealing} type="ai" />
                <CardDealer isDealing={gameState.isDealing} type="synergy" />

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
                  onHoverEnter={handleHoverEnterCard}
                  onHoverLeave={handleHoverLeaveCard}
                  onSubstituteSelect={handleSubstituteSelect}
                />

              <CenterField
                playerField={gameState.playerField}
                aiField={gameState.aiField}
                selectedCard={gameState.selectedCard}
                onSlotClick={handleSlotClick}
                onAttackClick={handleAttack}
                currentTurn={gameState.currentTurn}
                turnPhase={gameState.turnPhase}
                isFirstTurn={gameState.isFirstTurn}
                lastPlacedCard={lastPlacedCard}
                onCardMouseEnter={handleHoverEnterCard}
                onCardMouseLeave={handleHoverLeaveCard}
                          onInstantShotClick={handleInstantShot}
                          instantShotMode={gameState.instantShotMode}
                          currentAction={gameState.currentAction}
                          setupStep={setupStep}
                          rotation={viewSettings.rotation}
                        />

              <motion.div
                initial={{ x: 200, opacity: 0 }}
                animate={setupStep >= 1 ? { x: 0, opacity: 1 } : { x: 200, opacity: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              >
                <RightPanel
                  aiSynergyHand={gameState.aiSynergyHand}
                  playerSynergyHand={gameState.playerSynergyHand}
                  selectedSynergyCards={gameState.selectedSynergyCards}
                  onSynergySelect={handleSynergySelect}
                  synergyDeckCount={gameState.synergyDeck.length}
                  synergyDiscardCount={gameState.synergyDiscard.length}
                  onOpenPile={(p) => setViewingPile(p)}
                  turnPhase={gameState.turnPhase}
                  playerActiveSynergy={gameState.playerActiveSynergy}
                  aiActiveSynergy={gameState.aiActiveSynergy}
                />
              </motion.div>
             </div>
        </div>
      </div>

      {/* Left Side Controls - Vertically Centered */}
      <div className="fixed top-1/2 left-4 -translate-y-1/2 z-[60] flex flex-col gap-3 items-start pointer-events-none">
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
          className="bg-stone-800/90 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 hover:bg-red-900/40 hover:border-red-500/50 transition-all shadow-xl flex items-center gap-2 group pointer-events-auto"
        >
          <span className="text-lg group-hover:-translate-x-1 transition-transform">⬅️</span>
          <span className="text-[10px] font-black tracking-widest text-white/90 uppercase">
            {['firstHalf', 'secondHalf', 'extraTime', 'penalty'].includes(gameState.phase) ? 'Surrender' : 'Quit'}
          </span>
        </button>

        {/* 2. Audio & BGM Player */}
        <div className="flex flex-col gap-2 pointer-events-auto">
           {/* SFX Quick Toggle */}
           <button
              onClick={() => toggleAudioSetting('sfx')}
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all bg-stone-900/80 backdrop-blur-md border border-white/20 shadow-xl",
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
          className="bg-stone-800/90 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2 hover:bg-stone-700 transition-all shadow-xl flex items-center gap-2 group pointer-events-auto"
          title="Camera Settings"
        >
          <span className="text-lg group-hover:scale-110 transition-transform">📷</span>
          <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">View</span>
        </button>
      </div>

      {/* Camera Controls Panel */}
      <AnimatePresence>
        {showViewControls && (
          <motion.div 
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -20 }}
            className="absolute top-[145px] left-4 w-64 bg-stone-900/95 backdrop-blur-lg border border-white/20 rounded-2xl p-5 z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-white/30 cursor-move"
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
                ✕
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
      <div className="absolute top-0 left-0 right-0 h-24 z-20 pointer-events-none">


         {/* Top Center: Opponent Hand (Fanned - Horizontal) */}
         <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[80%] h-48 pointer-events-auto flex justify-center items-start pt-4 perspective-1000 z-50">
            <AnimatePresence>
                {gameState.aiHand.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: -200, rotate: 180, scale: 0 }}
                    animate={setupStep >= 3 ? { 
                      opacity: 1, 
                      y: 5 - Math.abs(i - (gameState.aiHand.length - 1) / 2) * 2, 
                      scale: 1,
                      rotate: 180 - (i - (gameState.aiHand.length - 1) / 2) * 5, 
                      x: (i - (gameState.aiHand.length - 1) / 2) * -85 
                    } : { opacity: 0, y: -200, rotate: 180, scale: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: -50 }}
                    whileHover={{ 
                      scale: 1.5, 
                      rotate: 0, 
                      zIndex: 100, 
                      y: 0,
                      x: 0 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="relative origin-center w-48 h-28 shadow-xl"
                    style={{ zIndex: i }}
                  >
                     <PlayerCardComponent 
                        card={card} 
                        size="medium" 
                        faceDown={false}
                        variant="away"
                        onMouseEnter={() => handleHoverEnterCard(card)}
                        onMouseLeave={handleHoverLeaveCard}
                     />
                  </motion.div>
                ))}
            </AnimatePresence>
             <div className="absolute top-20 text-center text-[10px] text-white/40 uppercase tracking-widest font-bold w-full">
                 OPP HAND: {gameState.aiHand.length}
             </div>
         </div>
      </div>

      {/* 3. HUD Layer - Bottom (Player) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-30 pointer-events-none" data-testid="game-board">


         {/* Bottom Center: Player Hand */}
         <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[80%] h-48 pointer-events-auto flex justify-center items-end pb-4 perspective-1000">
            <AnimatePresence>
              {gameState.playerHand.map((card, i) => (
                <motion.div
                  key={card.id}
                  data-testid="hand-card"
                  initial={{ opacity: 0, y: 200, rotate: 0, scale: 0 }}
                  animate={setupStep >= 3 ? { 
                    opacity: 1, 
                    y: (gameState.selectedCard?.id === card.id ? -120 : -5) + Math.abs(i - (gameState.playerHand.length - 1) / 2) * 2, 
                    scale: gameState.selectedCard?.id === card.id ? 1.1 : 1,
                    rotate: gameState.selectedCard?.id === card.id ? 0 : (i - (gameState.playerHand.length - 1) / 2) * 3, 
                    x: (i - (gameState.playerHand.length - 1) / 2) * -70 
                  } : { opacity: 0, y: 200, rotate: 0, scale: 0 }}
                  exit={{ opacity: 0, scale: 0.5, y: 50 }}
                  whileHover={{ 
                    scale: 1.5, 
                    rotate: 0, 
                    zIndex: 100,
                    y: 0,
                    x: 0
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative origin-bottom cursor-pointer shadow-2xl"
                  style={{ zIndex: gameState.selectedCard?.id === card.id ? 100 : i }}
                >
                  <PlayerCardComponent
                    card={card}
                    onClick={() => handleCardSelect(card)}
                    onMouseEnter={() => handleHoverEnterCard(card)}
                    onMouseLeave={handleHoverLeaveCard}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    selected={gameState.selectedCard?.id === card.id}
                    size="medium" 
                    draggable={gameState.turnPhase === 'playerAction' || gameState.isFirstTurn}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
         </div>
      </div>

      {/* Right Side: Turn Info & Action Buttons Container */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto flex flex-col items-end gap-6">
          {/* Turn Information */}
          <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">TURN {gameState.turnCount}</div>
              <div className="text-2xl font-['Russo_One'] text-white drop-shadow-md mb-2">
                  {gameState.currentTurn === 'player' ? <span className="text-blue-400">YOUR TURN</span> : <span className="text-red-400">OPP TURN</span>}
              </div>
              <div className="text-xs text-yellow-400 max-w-[150px] leading-tight ml-auto">{gameState.message}</div>
          </div>

          {/* Action Buttons Panel */}
          <div className="w-40 flex flex-col gap-3">
                {gameState.turnPhase === 'teamAction' && gameState.currentTurn === 'player' ? (
                  <div className="flex flex-col gap-3 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex justify-between items-center mb-1 px-1">
                      <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Tactical Action</div>
                      <div className="group relative">
                        <span className="text-white/20 text-[10px] cursor-help hover:text-white/50 transition-colors">ⓘ</span>
                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-stone-900 border border-white/10 rounded-lg text-[9px] text-white/70 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
                          <p className="mb-1"><strong className="text-green-400">PASS:</strong> Draw synergy cards based on icons on field.</p>
                          <p><strong className="text-amber-400">PRESS:</strong> Move control marker towards opponent.</p>
                        </div>
                      </div>
                    </div>
                    <button
                        data-testid="team-action-pass"
                        onClick={() => handleTeamAction('pass')}
                        disabled={!canDoTeamAction || passCount === 0}
                        className="w-full h-24 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 disabled:from-stone-800 disabled:to-stone-900 disabled:opacity-50 text-white font-['Russo_One'] rounded-xl shadow-lg border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                        <span className="text-sm tracking-widest group-hover:scale-110 transition-transform">PASS</span>
                        <span className="text-[10px] font-bold text-green-200/80 mt-1">DRAW SYNERGY</span>
                        <div className="mt-2 flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                          <span className="text-[9px] font-black">{Math.min(passCount, 5 - gameState.playerSynergyHand.length)}</span>
                          <span className="text-[8px] opacity-60">CARDS</span>
                        </div>
                      </button>
                      <button
                        data-testid="team-action-press"
                        onClick={() => handleTeamAction('press')}
                        disabled={!canDoTeamAction || pressCount === 0}
                        className="w-full h-24 bg-gradient-to-br from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 disabled:from-stone-800 disabled:to-stone-900 disabled:opacity-50 text-white font-['Russo_One'] rounded-xl shadow-lg border border-white/10 flex flex-col items-center justify-center transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
                        <span className="text-sm tracking-widest group-hover:scale-110 transition-transform">PRESS</span>
                        <span className="text-[10px] font-bold text-amber-200/80 mt-1">PUSH CONTROL</span>
                        <div className="mt-2 flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                          <span className="text-[9px] font-black">{pressCount}</span>
                          <span className="text-[8px] opacity-60">STEPS</span>
                        </div>
                      </button>
                    
                    {/* Auto-skip hint if both are 0 */}
                    {passCount === 0 && pressCount === 0 && (
                      <button
                        onClick={() => dispatch({ type: 'TEAM_ACTION', action: 'pass' })} // This will trigger performTeamAction which sets phase to playerAction
                        className="mt-2 py-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter transition-colors"
                      >
                        No actions available - Skip ➔
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={handleEndTurn}
                    disabled={gameState.currentTurn !== 'player' || gameState.turnPhase !== 'playerAction'}
                    className="w-full py-5 bg-gradient-to-br from-blue-600/90 to-blue-800/90 hover:from-blue-500 hover:to-blue-700 disabled:from-stone-800/50 disabled:to-stone-900/50 disabled:opacity-50 text-white font-['Russo_One'] text-lg rounded-xl shadow-[0_8px_20px_rgba(37,99,235,0.2)] border border-white/10 transition-all hover:scale-105 active:scale-95 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/20" />
                    <span className="relative z-10 tracking-widest group-hover:scale-110 transition-transform inline-block">END TURN</span>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                  </button>
                )}
              </div>
          </div>
        
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
        {/* Turn Transition Banner */}
        {showTurnTransition && (
            <TurnTransition 
                turn={gameState.currentTurn} 
                onComplete={() => setShowTurnTransition(false)} 
            />
        )}

        {/* Coin Toss Modal */}
        {gameState.phase === 'coinToss' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center z-[100]"
          >
            {!tossResult ? (
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#1a1a1a] p-10 rounded-3xl border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center"
              >
                <h2 className="text-4xl font-['Russo_One'] text-white mb-8 tracking-wider">COIN TOSS</h2>
                <p className="text-gray-400 mb-10 text-lg">Click to determine Home/Away team</p>
                <button 
                  onClick={startToss}
                  className="px-12 py-5 bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-black text-2xl rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                >
                  Toss Coin
                </button>
              </motion.div>
            ) : (
              <CoinToss result={tossResult} onComplete={handleCoinTossComplete} />
            )}
          </motion.div>
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
              <p className="text-yellow-400 font-bold mb-4">{gameState.pendingImmediateEffect.card.name}</p>
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
            <div className="bg-[#2a2a2a] p-6 rounded-2xl border border-gray-700 max-w-lg w-full">
               <h3 className="text-xl font-['Russo_One'] text-white mb-4 text-center">Select Player to Swap Out</h3>
               <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto mb-6">
                 {gameState.playerField.flatMap(zone => 
                   zone.slots.filter(slot => slot.playerCard).map(slot => (
                     <div
                       key={`${zone.zone}-${slot.position}`}
                       onClick={() => handleSubstituteTarget(slot.playerCard!.id)}
                       className="bg-[#333] hover:bg-[#444] p-3 rounded-lg cursor-pointer border border-[#444] transition-colors"
                     >
                       <div className="font-bold text-white">{slot.playerCard!.name}</div>
                       <div className="text-xs text-gray-400">Zone {zone.zone} • Slot {slot.position}</div>
                     </div>
                   ))
                 )}
               </div>
               <button onClick={handleCancelSubstitution} className="w-full py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg">CANCEL</button>
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
                <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-black text-xl">⚡</div>
                <h3 className="text-2xl font-['Russo_One'] text-white uppercase tracking-tighter">Instant Shot!</h3>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                <span className="text-yellow-400 font-bold">{gameState.instantShotMode.card.name}</span> can perform an immediate shot attempt. 
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
        onComplete={() => {
          setShowPhaseBanner(false);
          if (gameState.phase === 'draft' && gameState.draftStep === 0) {
            dispatch({ type: 'START_DRAFT_ROUND' });
          }
        }}
      />

      {gameState.phase === 'squadSelect' && (
        <SquadSelect
          allPlayers={[...gameState.playerHand, ...gameState.playerBench]}
          onConfirm={(starters, subs) => {
            dispatch({ type: 'FINISH_SQUAD_SELECT', starters, subs });
          }}
        />
      )}

      <PenaltyModal
        isOpen={gameState.pendingPenalty}
        onComplete={handlePenaltyComplete}
      />

        <StarCardDraft
          cards={gameState.availableDraftCards}
          round={gameState.draftRound}
          isPlayerTurn={gameState.currentTurn === 'player' && gameState.draftStep > 0}
          onSelect={(index) => {
            dispatch({ type: 'PICK_DRAFT_CARD', cardIndex: index });
            playSound('draw');
          }}
          aiSelectedIndex={aiDraftSelectingIndex}
        />
    </div>
  );
};
