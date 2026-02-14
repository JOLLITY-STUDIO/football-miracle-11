import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { canPlaceCardAtSlot, getImmediateEffectDescription, getIconDisplay } from '../data/cards';
import type { PlayerCard, SynergyCard } from '../data/cards';
import { PlayerCardComponent } from './PlayerCard';
import { SynergyCardComponent } from './SynergyCard';
import { PenaltyModal } from './PenaltyModal';
import { LeftPanel } from './LeftPanel';
import { CenterField } from './CenterField';
import { RightPanel } from './RightPanel';
import { BackgroundMusic } from './BackgroundMusic';
import PhaseBanner from './PhaseBanner';
import { RockPaperScissors } from './RockPaperScissors';
import { TurnTransition } from './TurnTransition';
import SquadSelect from './SquadSelect';
import { CardDealer } from './CardDealer';
import { DuelOverlay } from './DuelOverlay';
import { MatchLog } from './MatchLog';
import { DraftPhase } from './DraftPhase';
import {
  gameReducer,
  type GameState,
  type GameAction
} from '../game/gameLogic';
import {
  countIcons
} from '../utils/gameUtils';
import { useGameAudio } from '../hooks/useGameAudio';
import { useCameraView } from '../hooks/useCameraView';
import { useGameState } from '../hooks/useGameState';

interface Props {
  onBack: () => void;
  playerTeam: { starters: PlayerCard[]; substitutes: PlayerCard[]; initialField?: any[] } | null;
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

  const { 
    viewSettings, 
    setViewSettings, 
    autoScale,
    setAutoScale, 
    showViewControls, 
    setShowViewControls, 
    toggleCameraView 
  } = useCameraView(gameState.isHomeTeam);

  const [lastPlacedCard, setLastPlacedCard] = useState<PlayerCard | null>(null);
  const [hoveredCard, setHoveredCard] = useState<PlayerCard | null>(null);
  const [hoveredCardPosition, setHoveredCardPosition] = useState({ x: 0, y: 0 });
  const [hoverSoundPlayedForId, setHoverSoundPlayedForId] = useState<string | null>(null);
  const [aiJustPlacedCard, setAiJustPlacedCard] = useState<PlayerCard | null>(null);
  const [showPhaseBanner, setShowPhaseBanner] = useState(false);
  const [phaseBannerText, setPhaseBannerText] = useState('');
  const [phaseBannerSubtitle, setPhaseBannerSubtitle] = useState('');
  
  const [aiTurnTriggered, setAiTurnTriggered] = useState(false);
  const [setupStep, setSetupStep] = useState(0); // 0: not started, 1: board, 2: control, 3: cards, 4: done
  const [tossResult, setTossResult] = useState<'home' | 'away' | null>(null);
  const [rpsInProgress, setRpsInProgress] = useState(false);

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
  const [showMatchLog, setShowMatchLog] = useState(false);
  const [showLeftControls, setShowLeftControls] = useState(true);
  
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
        else if (gameState.turnPhase === 'end') {
          text = 'ACTION COMPLETE';
          subtitle = 'Turn ending...';
          duration = 1000; // Show for 1 second
        }
        
        if (text) {
            setPhaseBannerText(text);
            setPhaseBannerSubtitle(subtitle);
            setShowPhaseBanner(true);
        }
        setLastPhase(gameState.turnPhase);
    }

    // Show banner when Game Phase changes (Halftime)
    if (gameState.phase === 'halfTime') {
        setPhaseBannerText('HALF TIME');
        setPhaseBannerSubtitle('Make Substitutions and Prepare for 2nd Half');
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
    const currentAIHandIds = gameState.aiHand.map(c => c.id);
    const prevAIHandIds = prevAIHandRef.current;
    
    if (prevAIHandIds.length > currentAIHandIds.length) {
      const placedCardId = prevAIHandIds.find(id => !currentAIHandIds.includes(id));
      if (placedCardId) {
        const aiFieldCards = gameState.aiField.flatMap(z => z.slots.map(s => s.playerCard).filter(Boolean));
        const placedCard = aiFieldCards.find(c => c?.id === placedCardId);
        if (placedCard) {
          setAiJustPlacedCard(placedCard);
          playSound('flip');
          setTimeout(() => setAiJustPlacedCard(null), 1500);
        }
      }
    }
    
    prevAIHandRef.current = currentAIHandIds;
  }, [gameState.aiHand, gameState.aiField]);

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

  const canDoAction = () => (gameState.turnPhase === 'playerAction' || gameState.skipTeamAction) && gameState.currentTurn === 'player';
  const canPlaceCards = () => canDoAction() && !gameState.currentAction;

  const handleCardSelect = (card: PlayerCard) => {
    if (gameState.currentTurn !== 'player') return;
    if (!canPlaceCards()) return;
    playSound('draw');
    dispatch({ type: 'SELECT_PLAYER_CARD', card: gameState.selectedCard?.id === card.id ? null : card });
  };

  const handleSynergyChoiceSelect = (keepIndex: number) => {
    dispatch({ type: 'SYNERGY_CHOICE_SELECT', index: keepIndex });
    playSound('draw');
  };

  const handleHoverEnterCard = (card: PlayerCard, event?: React.MouseEvent) => {
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

  const passCount = countIcons(gameState.playerField, 'pass');
  const pressCount = countIcons(gameState.playerField, 'press');
  const canDoTeamAction = !gameState.skipTeamAction || gameState.playerField.some(z => z.slots.some(s => s.playerCard));

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
      {gameState.phase !== 'coinToss' && (
        <div className="absolute inset-0 flex items-center justify-center z-10 perspective-1000 overflow-hidden" style={{ perspectiveOrigin: '50% 50%' }}>
        <div 
          className={clsx("relative transition-transform duration-700 ease-out transform-style-3d transform-gpu flex items-center justify-center pointer-events-auto")}
          style={{
            width: `${BASE_WIDTH}px`,
            height: `${BASE_HEIGHT}px`,
            transform: `scale(${autoScale}) rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) translateY(${viewSettings.height - 50}px) scale(${viewSettings.zoom})`,
          }}
        >

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
                  onToggleMatchLog={() => setShowMatchLog(!showMatchLog)}
                  onToggleLeftControls={() => setShowLeftControls(!showLeftControls)}
                />

                {/* Always show 2D CenterField for card display */}
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
                

                
                {/* Ensure 2D field is clickable when 3D is disabled */}
                {renderMode !== '3d' && (
                  <div className="relative z-0" />
                )}

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
                  onOpenPile={setViewingPile}
                  turnPhase={gameState.turnPhase}
                  playerActiveSynergy={gameState.playerActiveSynergy}
                  aiActiveSynergy={gameState.aiActiveSynergy}
                />
              </motion.div>
             </div>
        </div>
        </div>
      )}

      {/* 2D Click Overlay for 3D perspective issues (only in 2D mode) */}
      {renderMode === '2d' && viewSettings.pitch !== 0 && (
        <div 
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div 
            className="relative pointer-events-auto"
            style={{
              width: `${880 * autoScale}px`,
              height: `${1040 * autoScale}px`,
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              const col = Math.floor((x / rect.width) * 8);
              const row = Math.floor((y / rect.height) * 4);
              if (col >= 0 && col < 8 && row >= 0 && row < 4) {
                const zone = row;
                handleSlotClick(zone, col);
              }
            }}
          >
            {[0, 1, 2, 3].map(row => (
              <div key={row} className="flex">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(col => {
                  const zone = row;
                  const slotIdx = Math.floor(col / 2);
                  const slot = gameState.playerField[zone]?.slots.find(s => s.position === slotIdx);
                  const hasCard = slot?.playerCard;
                  const isValidPlacement = gameState.selectedCard && 
                    !hasCard && 
                    canPlaceCardAtSlot(gameState.selectedCard, gameState.playerField, zone, slotIdx, gameState.isFirstTurn);
                  
                  const showFixedIcon = !hasCard && (
                    (zone === 0 && col > 0 && col < 7) || 
                    (zone === 3 && col > 0 && col < 7)
                  );
                  const fixedIconType = zone === 0 ? 'attack' : 'defense';
                  
                  return (
                    <div 
                      key={col}
                      className={clsx(
                        "border border-white/10 relative",
                        isValidPlacement ? "bg-green-500/30 cursor-pointer" : "cursor-pointer"
                      )}
                      style={{
                        width: `${110 * autoScale}px`,
                        height: `${260 * autoScale}px`,
                      }}
                    >
                      {showFixedIcon && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center opacity-20"
                          style={{ zIndex: 0 }}
                        >
                          <img 
                            src={getIconDisplay(fixedIconType).image} 
                            alt={fixedIconType}
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              objectFit: 'contain',
                              filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Left Side Controls - Vertically Centered */}
      {showLeftControls && gameState.phase !== 'coinToss' && (
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
      {gameState.phase !== 'coinToss' && (
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
                      zIndex: 100
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
                     />
                  </motion.div>
                ))}
            </AnimatePresence>
             <div className="absolute top-20 text-center text-[10px] text-white/40 uppercase tracking-widest font-bold w-full">
                 OPP HAND: {gameState.aiHand.length}
             </div>
         </div>
        </div>
      )}

      {/* 3. HUD Layer - Bottom (Player) */}
      {gameState.phase !== 'coinToss' && (
        <div className="absolute bottom-0 left-0 right-0 h-32 z-30 pointer-events-none" data-testid="game-board">


         {/* Bottom Center: Player Hand */}
         <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[80%] h-48 pointer-events-auto flex justify-center items-end pb-4 perspective-1000">
            <AnimatePresence>
              {gameState.playerHand.map((card, i) => (
                <motion.div
                  key={card.id}
                  data-testid="hand-card"
                  initial={{ opacity: 0, y: 200, rotate: 0, scale: 0 }}
                  animate={setupStep >= 3 || gameState.phase === 'firstHalf' || gameState.phase === 'secondHalf' ? { 
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
                    zIndex: 100
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative origin-bottom cursor-pointer shadow-2xl"
                  style={{ zIndex: gameState.selectedCard?.id === card.id ? 100 : i }}
                >
                  <PlayerCardComponent
                    card={card}
                    onClick={() => handleCardSelect(card)}
                    selected={gameState.selectedCard?.id === card.id}
                    size="medium" 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
         </div>
        </div>
      )}

      {/* Right Side: Turn Info & Action Buttons Container */}
      {gameState.phase !== 'coinToss' && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-40 pointer-events-auto flex flex-col items-end gap-6">
          {/* Turn Information */}
          <div className="text-right min-w-[200px]">
              <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">TURN {gameState.turnCount}</div>
              <div className="text-2xl font-['Russo_One'] text-white drop-shadow-md mb-2 flex items-center justify-end gap-3">
                  {gameState.currentTurn === 'player' ? (
                    <span className="text-blue-400">YOUR TURN</span>
                  ) : (
                    <>
                      <span className="text-red-400">OPPONENT TURN</span>
                      {gameState.aiActionStep !== 'none' && (
                        <motion.div 
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="flex gap-1"
                        >
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        </motion.div>
                      )}
                    </>
                  )}
              </div>
              <div className="text-xs text-yellow-400 max-w-[200px] leading-tight ml-auto h-8 flex items-center justify-end">
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
                <h2 className="text-3xl font-['Russo_One'] text-white mb-6 text-center">TACTICAL ACTION</h2>
                <div className="mb-8 text-center">
                  <p className="text-yellow-400 font-bold mb-4">CHOOSE YOUR TACTICAL APPROACH</p>
                  <div className="flex flex-col gap-2 text-sm text-gray-300">
                    <p><strong className="text-green-400">PASS:</strong> Draw synergy cards based on icons on field.</p>
                    <p><strong className="text-amber-400">PRESS:</strong> Move control marker towards opponent.</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <button
                      data-testid="team-action-pass"
                      onClick={() => handleTeamAction('pass')}
                      disabled={passCount === 0}
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
                        disabled={pressCount === 0}
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
                </div>
              </motion.div>
            </div>
          )}

          {/* Action Buttons Panel */}
          <div className="w-40 flex flex-col gap-3">
                {gameState.turnPhase === 'teamAction' && gameState.currentTurn === 'player' && !gameState.skipTeamAction && passCount === 0 && pressCount === 0 ? (
                  <div className="flex flex-col gap-3 p-3 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl">
                    {/* Auto-skip hint if both are 0 */}
                    <button
                      onClick={() => {
                        // Directly set turnPhase to playerAction instead of executing pass
                        setGameState(prev => ({
                          ...prev,
                          turnPhase: 'playerAction',
                          message: 'Turn phase set to player action'
                        }));
                        playSound('click');
                      }}
                      className="mt-2 py-2 text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter transition-colors"
                    >
                      No actions available - Skip ➔
                    </button>
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
            {!rpsInProgress ? (
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                className="bg-[#1a1a1a] p-10 rounded-3xl border-2 border-green-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center"
              >
                <h2 className="text-4xl font-['Russo_One'] text-white mb-8 tracking-wider">ROCK PAPER SCISSORS</h2>
                <p className="text-gray-400 mb-10 text-lg">Play to determine Home/Away team</p>
                <button 
                  onClick={startToss}
                  className="px-12 py-5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-black font-black text-2xl rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
                >
                  Play Game
                </button>
              </motion.div>
            ) : (
              <RockPaperScissors onComplete={handleRockPaperScissorsComplete} />
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
            <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/10 max-w-4xl w-full shadow-[0_0_100px_rgba(0,0,0,0.8)]">
               <h3 className="text-2xl font-['Russo_One'] text-white mb-8 text-center uppercase tracking-widest">Select Player to Swap Out</h3>
               
               <div className="mb-10">
                  <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4 px-2 font-black border-l-2 border-blue-500/50 ml-2">Players On Field</div>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 max-h-80 overflow-y-auto p-4 bg-black/20 rounded-2xl border border-white/5 custom-scrollbar">
                    {gameState.playerField.flatMap(zone => 
                      zone.slots.filter(slot => slot.playerCard).map(slot => (
                        <div key={`${zone.zone}-${slot.position}`} className="relative group flex flex-col items-center">
                          <motion.div 
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubstituteTarget(slot.playerCard!.id)}
                            className="cursor-pointer relative z-10"
                          >
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <PlayerCardComponent card={slot.playerCard!} size="small" />
                          </motion.div>
                          <div className="mt-3 text-[9px] font-black text-white/40 uppercase tracking-tighter bg-white/5 px-2 py-0.5 rounded-full border border-white/5 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                            Zone {zone.zone} • Slot {slot.position}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>

               {gameState.playerHand.length > 0 && (
                 <div className="mb-10">
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.3em] mb-4 px-2 font-black border-l-2 border-green-500/50 ml-2">Players In Hand</div>
                    <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 p-4 bg-black/20 rounded-2xl border border-white/5">
                      {gameState.playerHand.map(card => (
                        <div key={card.id} className="relative group flex flex-col items-center">
                          <motion.div 
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSubstituteTarget(card.id)}
                            className="cursor-pointer relative z-10"
                          >
                            <div className="absolute inset-0 bg-green-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                            <PlayerCardComponent card={card} size="small" />
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
        durationMs={phaseBannerText === 'ACTION COMPLETE' ? 1000 : 2000}
        onComplete={() => {
          setShowPhaseBanner(false);
          if (gameState.phase === 'draft' && gameState.draftStep === 0) {
            dispatch({ type: 'START_DRAFT_ROUND' });
          }
        }}
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
                  <div className="text-white text-lg font-black">{aiJustPlacedCard.name}</div>
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

      {gameState.phase === 'squadSelection' && (
        <SquadSelect
          allPlayers={[...gameState.playerHand, ...gameState.playerBench]}
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

        {gameState.phase === 'draft' && (
          <DraftPhase gameState={gameState} dispatch={dispatch} />
        )}

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
               <PlayerCardComponent card={hoveredCard} size="large" faceDown={false} />
               
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
