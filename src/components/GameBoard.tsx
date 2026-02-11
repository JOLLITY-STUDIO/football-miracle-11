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
import { PenaltyModal } from './PenaltyModal';
import StarCardDraft from './StarCardDraft';
import PhaseBanner from './PhaseBanner';
import { TurnTransition } from './TurnTransition';
import SquadSelect from './SquadSelect';
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
  startSecondHalf
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
  const [pendingImmediateEffect, setPendingImmediateEffect] = useState<{ card: PlayerCard; zone: number; slot: number } | null>(null);
  const [synergyChoice, setSynergyChoice] = useState<{ cards: SynergyCard[]; sourceCard: PlayerCard } | null>(null);
  const [instantShotMode, setInstantShotMode] = useState<{ card: PlayerCard; zone: number; slot: number } | null>(null);
  const [substitutionMode, setSubstitutionMode] = useState<{ incomingCard: PlayerCard } | null>(null);
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

  const [lastTurn, setLastTurn] = useState<string>('player');
  const [lastPhase, setLastPhase] = useState<string>('');
  const [viewingPile, setViewingPile] = useState<'deck' | 'discard' | null>(null);
  const [shownStoppageTime, setShownStoppageTime] = useState(false);
  
  // Camera/View Control State
  const [viewSettings, setViewSettings] = useState({
    pitch: 55, // Increased default pitch for more obvious 3D effect
    rotation: 0,
    zoom: 1,
    height: 0
  });
  const [showViewControls, setShowViewControls] = useState(false);

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
      const timer = setTimeout(() => {
        const newState = aiPickDraftCard(gameState);
        setGameState(newState);
        playSound('draw');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.currentTurn, gameState.draftStep]);

  // AI Turn Logic
  useEffect(() => {
    if (!aiTurnTriggered && gameState.currentTurn === 'ai' && gameState.turnCount === 0 && gameState.phase !== 'draft') {
      setAiTurnTriggered(true);
      const timer = setTimeout(() => {
        gameRecorder.current.recordAction('ai_action', 'ai');
        setGameState(prev => performAITurn(prev));
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [aiTurnTriggered, gameState.currentTurn, gameState.turnCount, gameState.phase]);

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

  const canPlaceCards = (gameState.turnPhase === 'playerAction' || gameState.isFirstTurn) && gameState.currentTurn === 'player';

  const handleCardSelect = (card: PlayerCard) => {
    if (gameState.currentTurn !== 'player') return;
    if (!canPlaceCards) return;
    playSound('click');
    setGameState(prev => ({
      ...prev,
      selectedCard: prev.selectedCard?.id === card.id ? null : card,
    }));
  };

  const handleSlotClick = (zone: number, startCol: number) => {
    // Phase check feedback
    if (!canPlaceCards && gameState.selectedCard) {
        if (gameState.turnPhase === 'teamAction') {
             setGameState(prev => ({ ...prev, message: 'Must perform Team Action (Pass/Press) first!' }));
             playSound('error');
             return;
        }
    }

    if (!gameState.selectedCard || gameState.currentTurn !== 'player') return;
    if (!canPlaceCards) return;
    
    // Convert field coordinates to zone slot index
    // 8x4 field means each zone has 4 slots (1-4)
    const slotPosition = Math.floor(startCol / 2) + 1;
    
    const targetZone = gameState.playerField.find(z => z.zone === zone);
    const targetSlot = targetZone?.slots.find(s => s.position === slotPosition);
    
    if (!targetSlot) {
      console.error(`Slot not found: zone ${zone}, pos ${slotPosition}`);
      return;
    }

    if (targetSlot.playerCard) {
      setGameState(prev => ({ ...prev, message: 'Slot already occupied!' }));
      playSound('error');
      return;
    }

    if (!canPlaceCardAtSlot(gameState.selectedCard, gameState.playerField, zone, slotPosition, gameState.isFirstTurn)) {
      setGameState(prev => ({ ...prev, message: 'Cannot place card here! Check zone restrictions.' }));
      playSound('error');
      return;
    }

    gameRecorder.current.recordAction('place_card', 'player', {
      cardId: gameState.selectedCard.id,
      zone,
      slot: slotPosition,
    });

    const placedCard = gameState.selectedCard;
    const newState = placeCard(gameState, placedCard, zone, startCol, true);
    newState.selectedCard = null;
    saveCurrentSnapshot();
    setGameState(newState);
    setLastPlacedCard(placedCard);
    playSound('flip');

    if (placedCard.immediateEffect !== 'none') {
      setPendingImmediateEffect({ card: placedCard, zone, slot: slotPosition });
    }
  };

  const handleDragStart = (card: PlayerCard) => {
    if (gameState.currentTurn !== 'player' || !canPlaceCards) return;
    setGameState(prev => ({ ...prev, selectedCard: card }));
    playSound('click');
  };

  const handleDragEnd = () => {
    // We don't necessarily want to clear selectedCard here because the click handler 
    // might be needed for the drop. But usually dragEnd clears it.
    // However, in our current hybrid system, it's safer to leave it if a drop didn't happen.
  };
  
  const handleHoverEnterCard = (card: PlayerCard) => {
    setHoveredCard(card);
    if (hoverSoundPlayedForId !== card.id) {
      playSound('click');
      setHoverSoundPlayedForId(card.id);
    }
  };
  
  const handleHoverLeaveCard = () => {
    setHoveredCard(null);
    setHoverSoundPlayedForId(null);
  };

  const handleTriggerImmediateEffect = () => {
    if (!pendingImmediateEffect) return;
    
    const effect = pendingImmediateEffect.card.immediateEffect;
    
    if (effect === 'draw_synergy_2_choose_1') {
      const { state: newState, drawnCards } = drawTwoSynergyCardsForChoice(gameState, true);
      if (drawnCards.length >= 2) {
        setGameState(newState);
        setSynergyChoice({ cards: drawnCards, sourceCard: pendingImmediateEffect.card });
        setPendingImmediateEffect(null);
        playSound('draw');
      } else {
        const fallbackState = applyImmediateEffect(gameState, effect, true);
        fallbackState.message = `Deck insufficient, drew ${drawnCards.length} synergy card(s)`;
        setGameState(fallbackState);
        setPendingImmediateEffect(null);
      }
    } else if (effect === 'instant_shot') {
      setInstantShotMode({ 
        card: pendingImmediateEffect.card, 
        zone: pendingImmediateEffect.zone, 
        slot: pendingImmediateEffect.slot 
      });
      setPendingImmediateEffect(null);
      const newState = { ...gameState };
      newState.message = `Select synergy cards to boost instant shot (ignores base defense)`;
      setGameState(newState);
    } else if (effect === 'steal_synergy') {
      const { state: newState, stolenCard } = stealSynergyCard(gameState, true);
      if (stolenCard) {
        newState.message = `Stole synergy card: ${stolenCard.name}`;
      }
      setGameState(newState);
      setPendingImmediateEffect(null);
      playSound('draw');
    } else {
      const newState = applyImmediateEffect(gameState, effect, true);
      newState.message = `Triggered ${pendingImmediateEffect.card.name}'s immediate effect: ${getImmediateEffectDescription(effect)}`;
      setGameState(newState);
      setPendingImmediateEffect(null);
    }
  };

  const handleSkipImmediateEffect = () => {
    if (!pendingImmediateEffect) return;
    
    const newState = { ...gameState };
    newState.message = `Skipped ${pendingImmediateEffect.card.name}'s Immediate Effect`;
    setGameState(newState);
    setPendingImmediateEffect(null);
  };

  const handleSynergyChoiceSelect = (keepIndex: number) => {
    if (!synergyChoice) return;
    
    const newState = resolveSynergyChoice(gameState, synergyChoice.cards, keepIndex, true);
    newState.message = `Kept ${synergyChoice.cards[keepIndex]?.name || 'synergy card'}, discarded ${synergyChoice.cards[1 - keepIndex]?.name || 'synergy card'}`;
    setGameState(newState);
    setSynergyChoice(null);
    playSound('draw');
  };

  const handleSubstituteSelect = (card: PlayerCard) => {
    if (gameState.playerSubstitutionsLeft <= 0) return;
    if (gameState.currentTurn !== 'player') return;
    setSubstitutionMode({ incomingCard: card });
    playSound('click');
  };

  const handleSubstituteTarget = (outgoingCardId: string) => {
    if (!substitutionMode) return;
    
    const newState = substitutePlayer(
      gameState,
      outgoingCardId,
      substitutionMode.incomingCard.id,
      true
    );
    setGameState(newState);
    setSubstitutionMode(null);
    playSound('whistle');
  };

  const handleCancelSubstitution = () => {
    setSubstitutionMode(null);
  };

  const handlePenaltyComplete = (playerPoints: number, aiPoints: number) => {
    const isPlayerKicker = gameState.currentTurn === 'player';
    const newState = resolvePenaltyKick(gameState, playerPoints, aiPoints, isPlayerKicker);
    setGameState(newState);
    playSound('whistle');
  };

  const handleSynergySelect = (card: SynergyCard) => {
    if (gameState.currentTurn !== 'player') return;
    const controlState = getControlState(gameState.controlPosition);
    if (controlState === 'defense') return;
    
    const maxHandCards = controlState === 'attack' ? 2 : 1;
    const isSelected = gameState.selectedSynergyCards.some(c => c.id === card.id);
    
    if (isSelected) {
      setGameState(prev => ({
        ...prev,
        selectedSynergyCards: prev.selectedSynergyCards.filter(c => c.id !== card.id),
      }));
    } else if (gameState.selectedSynergyCards.length < maxHandCards) {
      setGameState(prev => ({
        ...prev,
        selectedSynergyCards: [...prev.selectedSynergyCards, card],
      }));
    }
    playSound('click');
  };

  const handleTeamAction = useCallback((action: 'pass' | 'press') => {
    if (gameState.currentTurn !== 'player') return;
    if (gameState.turnPhase !== 'teamAction') return;

    gameRecorder.current.recordAction('team_action', 'player', { action });
    const newState = performTeamAction(gameState, action);
    saveCurrentSnapshot();
    setGameState(newState);
    playSound('click');
  }, [gameState]);

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
    let newState = { ...gameState };
    
    if (newState.synergyDeck.length > 0) {
      const firstCard = newState.synergyDeck[0];
      if (firstCard) {
        synergyCards.push(firstCard);
        newState.synergyDeck = newState.synergyDeck.slice(1);
      }
    }
    
    const additionalCards = gameState.selectedSynergyCards.slice(0, maxSynergyCards - 1);
    synergyCards = [...synergyCards, ...additionalCards];

    gameRecorder.current.recordAction('attack', 'player', {
      attackerId: attacker.id,
      zone,
      slot,
      synergyCards: synergyCards.map(c => c.id),
    });

    const finalState = performShot(newState, attacker, zone, slot, synergyCards, true);
    finalState.selectedSynergyCards = [];
    saveCurrentSnapshot();
    setGameState(finalState);
    playSound('goal');
  }, [gameState]);

  const handleEndTurn = useCallback(() => {
    if (gameState.currentTurn !== 'player') return;
    if (gameState.phase === 'halfTime') return;
    if (gameState.phase === 'finished') return;
    
    gameRecorder.current.recordAction('end_turn', 'player');
    gameRecorder.current.incrementTurn();
    saveCurrentSnapshot();
    setLastPlacedCard(null);

    setGameState(prev => ({
      ...prev,
      currentTurn: 'ai',
      message: 'AI Turn...',
    }));

    setTimeout(() => {
      gameRecorder.current.recordAction('ai_action', 'ai');
      setGameState(prev => performAITurn(prev));
    }, 1500);
  }, [gameState]);

  const handleStartSecondHalf = () => {
    if (gameState.phase !== 'halfTime') return;
    const newState = startSecondHalf(gameState);
    setGameState(newState);
    playSound('whistle');
  };

  const handleBack = () => {
    if (gameRecorder.current.getActions().length > 0) {
      const winner = gameState.playerScore > gameState.aiScore ? 'player' : 
                     gameState.playerScore < gameState.aiScore ? 'ai' : 'draw';
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

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative font-['Roboto'] select-none text-white">
      
      {/* 0. 3D Environment Background (Void) */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#000000_100%)]">
      </div>

      {/* 1. Main Game Field (Center) - Maximize Space with 3D Perspective */}
      <div className="absolute inset-0 flex items-center justify-center z-10 perspective-1000 overflow-hidden" style={{ perspectiveOrigin: '50% 50%' }}>
        <div 
          className="relative w-full max-w-[90vw] aspect-[16/9] transition-transform duration-700 ease-out transform-style-3d transform-gpu"
          style={{
            transform: `rotateX(${viewSettings.pitch}deg) rotateZ(${viewSettings.rotation}deg) translateY(${viewSettings.height - 50}px) scale(${viewSettings.zoom})`,
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
             <div className="absolute inset-0 flex flex-row items-stretch justify-center shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-xl overflow-visible bg-stone-900 border-[12px] border-stone-800 transform-style-3d perspective-2000">
                
                {/* 3D Thickness/Volume Layer - Full Width Unified Board */}
                <div className="absolute inset-[-4px] bg-stone-950 rounded-xl transform-style-3d shadow-2xl border-4 border-stone-900" 
                     style={{ transform: 'translateZ(-30px)' }} 
                />
                
                {/* Edge Highlights for 3D depth */}
                <div className="absolute inset-0 border-t border-l border-white/10 rounded-xl pointer-events-none" />
                <div className="absolute inset-0 border-b border-r border-black/50 rounded-xl pointer-events-none" />

                {/* Left Panel (Benches: Opponent Top / Player Bottom) */}
                <div 
                  className="w-48 relative flex flex-col justify-between py-4 z-20 transform-style-3d border-r border-white/5 bg-stone-900/40"
                  style={{ 
                    transform: 'translateZ(0px)', 
                  }}
                >
                  {/* Panel Background with Fade */}
                  <div className="absolute inset-y-0 left-[-100px] right-0 bg-gradient-to-r from-stone-900 via-stone-900/90 to-transparent pointer-events-none" />
                  
                  {/* AI Bench (Top Left - Mirror of Player Bench) */}
                  <div className="relative flex flex-col items-start w-full pl-0 mt-6">
                      <div className="relative z-10 text-[10px] text-red-400 font-bold uppercase tracking-widest mb-2 w-full text-left pl-4 border-b border-red-500/20 pb-1 flex items-center gap-2">
                        <span>OPP BENCH</span>
                        <span className="text-[8px] opacity-50">({gameState.aiBench.length})</span>
                      </div>
                      <div className="flex flex-col gap-3 w-full items-start perspective-[1000px] mt-2">
                        {gameState.aiBench.slice(0, 3).map((card, i) => (
                          <div 
                            key={i} 
                            className="relative w-48 aspect-[3/2] transition-all duration-300 ease-out z-10 hover:z-50 shadow-xl group cursor-help -ml-16 hover:ml-0"
                            style={{
                              transform: 'rotateY(-20deg) rotateX(-10deg)', // Mirrored for top position
                              transformStyle: 'preserve-3d'
                            }}
                          >
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-transparent transition-colors duration-300 rounded-lg z-20 pointer-events-none" />
                            <PlayerCardComponent 
                              card={card} 
                              size="tiny" 
                              variant="away"
                              disabled={true}
                              onMouseEnter={() => handleHoverEnterCard(card)}
                              onMouseLeave={handleHoverLeaveCard}
                            />
                            {/* Visibility Tab */}
                            <div className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-stone-800/95 border-l border-red-500/30 rounded-r-md group-hover:opacity-0 transition-opacity pointer-events-none">
                              <span className="text-[8px] text-red-400 -rotate-90 whitespace-nowrap font-mono">BENCH</span>
                            </div>
                          </div>
                        ))}
                      </div>
                  </div>
                  
                  {/* Player Bench (Bottom Left) */}
                  <div className="relative flex flex-col items-start w-full pl-0 mt-auto">
                    <div className="relative z-10 text-[10px] text-green-400 font-bold uppercase tracking-widest mb-2 w-full text-left pl-4 border-t border-green-500/20 pt-1 flex items-center gap-2">
                      <span>YOUR BENCH</span>
                      <span className="text-[8px] opacity-50">({gameState.playerSubstitutionsLeft} Subs)</span>
                    </div>
                    <div className="flex flex-col gap-3 w-full items-start perspective-[1000px]">
                      {gameState.playerBench.slice(0, 3).map((card) => (
                        <div 
                          key={card.id} 
                          className="relative w-48 aspect-[3/2] transition-all duration-300 ease-out z-10 hover:z-50 shadow-xl group cursor-pointer -ml-16 hover:ml-0"
                          style={{
                            transform: 'rotateY(-20deg) rotateX(10deg)',
                            transformStyle: 'preserve-3d'
                          }}
                          onClick={() => handleSubstituteSelect(card)}
                        >
                          <PlayerCardComponent 
                            card={card} 
                            size="tiny" 
                            variant="home"
                            disabled={gameState.playerSubstitutionsLeft <= 0}
                            selected={substitutionMode?.incomingCard.id === card.id}
                            onMouseEnter={() => handleHoverEnterCard(card)}
                            onMouseLeave={handleHoverLeaveCard}
                          />
                          
                          {/* Selection Indicator */}
                          {substitutionMode?.incomingCard.id === card.id && (
                            <div className="absolute inset-0 ring-2 ring-green-400 rounded-lg animate-pulse z-30 pointer-events-none" />
                          )}

                          {/* Visibility Tab */}
                          <div className={clsx(
                            "absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center bg-stone-800/95 border-l rounded-r-md group-hover:opacity-0 transition-opacity",
                            substitutionMode?.incomingCard.id === card.id ? "border-green-400 bg-green-900/50" : "border-green-500/30"
                          )}>
                            <span className="text-[8px] text-green-400 -rotate-90 whitespace-nowrap font-mono">SUB</span>
                          </div>
                        </div>
                      ))}
                      {gameState.playerBench.length === 0 && (
                        <div className="pl-4 text-[10px] text-white/20 uppercase py-4">Empty</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Center Field (Green Checkered) */}
                <div className="flex-1 relative bg-green-600 shadow-inner overflow-visible">
                    {/* ... Field content ... */}
                    {/* Checkered Pattern CSS - 8x8 Grid (8x4 per half) */}
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-30"
                      style={{
                        backgroundImage: `
                          conic-gradient(
                            #14532d 90deg, 
                            transparent 90deg 180deg, 
                            #14532d 180deg 270deg, 
                            transparent 270deg
                          )
                        `,
                        backgroundSize: '25% 25%'
                      }}
                    />
                    
                    {/* Field Lines */}
                    <div className="absolute inset-0 border-[6px] border-white/40 m-4 rounded-sm pointer-events-none" />
                    <div className="absolute top-1/2 left-4 right-4 h-1 bg-white/40 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[4px] border-white/40 rounded-full pointer-events-none" />
                    
                    {/* Goal Areas */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 border-b-[4px] border-x-[4px] border-white/40 bg-white/5 pointer-events-none" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-24 border-t-[4px] border-x-[4px] border-white/40 bg-white/5 pointer-events-none" />

                    {/* Corner Arcs */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-r-[4px] border-b-[4px] border-white/40 rounded-br-full pointer-events-none" />
                    <div className="absolute top-4 right-4 w-12 h-12 border-l-[4px] border-b-[4px] border-white/40 rounded-bl-full pointer-events-none" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-r-[4px] border-t-[4px] border-white/40 rounded-tr-full pointer-events-none" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-l-[4px] border-t-[4px] border-white/40 rounded-tl-full pointer-events-none" />

                    {/* GameField Content */}
                    <div className="absolute inset-0 z-10">
                       <GameField
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
                       />
                    </div>
                </div>

                {/* Right Panel (Decks: Opponent Top / Player Bottom) */}
                <div 
                  className="w-48 relative flex flex-col justify-between py-4 z-20 transform-style-3d border-l border-white/5 bg-stone-900/40"
                  style={{
                    transform: 'translateZ(0px)',
                  }}
                >
                  {/* Panel Background with Fade */}
                  <div className="absolute inset-y-0 left-0 right-[-100px] bg-gradient-to-l from-stone-900 via-stone-900/90 to-transparent pointer-events-none" />

                    {/* Opponent Deck Area (Top Right) */}
                    <div className="relative flex flex-row gap-4 justify-center items-start mt-6 px-4">
                        {/* AI Synergy Deck */}
                        <div 
                            className="group relative w-32 h-20 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1"
                            style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute top-[2px] left-[2px] w-full h-full bg-stone-900 rounded border border-white/10 shadow-xl" style={{ transform: 'translateZ(-2px)' }} />
                            <div className="absolute top-[4px] left-[4px] w-full h-full bg-stone-900 rounded border border-white/10 shadow-xl" style={{ transform: 'translateZ(-4px)' }} />
                            <div className="absolute top-[6px] left-[6px] w-full h-full bg-stone-950 rounded border border-white/5 shadow-xl" style={{ transform: 'translateZ(-6px)' }} />
                            
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900 via-slate-800 to-stone-950 rounded border border-white/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-40 bg-[url('/images/pattern_dot.png')] mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="relative w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center mb-2 bg-white/5 backdrop-blur-sm">
                                    <span className="text-2xl filter drop-shadow-md">✨</span>
                                </div>
                                <span className="relative text-[10px] text-white/90 font-black uppercase tracking-[0.2em]">OPPONENT</span>
                                <span className="relative text-[8px] text-white/50 font-bold uppercase tracking-widest mt-0.5">DECK</span>
                            </div>

                            <div className="absolute -top-3 -right-3 w-7 h-7 bg-white text-stone-900 font-black text-xs rounded-full flex items-center justify-center border-2 border-stone-900 shadow-xl z-10 group-hover:scale-110 transition-transform">
                                {gameState.aiSynergyHand.length}
                            </div>
                        </div>

                        {/* AI Synergy Discard */}
                        <div 
                            className="group relative w-32 h-20 transition-all duration-300 ease-out hover:scale-105 hover:-translate-y-1"
                            style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}
                        >
                            <div className="absolute top-[1px] left-[1px] w-full h-full bg-stone-900/80 rounded border border-white/5 shadow-lg rotate-[-2deg]" style={{ transform: 'translateZ(-1px)' }} />
                            <div className="absolute top-[2px] left-[-1px] w-full h-full bg-stone-950/80 rounded border border-white/5 shadow-lg rotate-[1deg]" style={{ transform: 'translateZ(-2px)' }} />

                            <div className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(1px)' }}>
                                <div className="w-full h-full bg-stone-800 rounded border border-white/10 flex flex-col items-center justify-center overflow-hidden -rotate-3 shadow-2xl">
                                    <div className="absolute inset-0 bg-red-900/10" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <span className="relative text-2xl opacity-20 mb-2 filter grayscale">♻️</span>
                                    <span className="relative text-[8px] text-white/20 font-bold uppercase tracking-widest">DISCARD</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Player Deck Area (Bottom Right) */}
                    <div className="relative flex flex-row gap-4 justify-center items-end mb-6 px-4 mt-auto">
                        {/* Player Synergy Deck */}
                        <div 
                            className="group relative w-32 h-20 cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:translate-y-1"
                            style={{ transform: 'translateZ(20px)', transformStyle: 'preserve-3d' }}
                            onClick={() => setViewingPile('deck')}
                        >
                            <div className="absolute top-[2px] left-[2px] w-full h-full bg-stone-900 rounded border border-white/10 shadow-xl" style={{ transform: 'translateZ(-2px)' }} />
                            <div className="absolute top-[4px] left-[4px] w-full h-full bg-stone-900 rounded border border-white/10 shadow-xl" style={{ transform: 'translateZ(-4px)' }} />
                            <div className="absolute top-[6px] left-[6px] w-full h-full bg-stone-950 rounded border border-white/5 shadow-xl" style={{ transform: 'translateZ(-6px)' }} />
                            
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900 via-emerald-800 to-teal-950 rounded border border-white/40 shadow-2xl flex flex-col items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 opacity-40 bg-[url('/images/pattern_dot.png')] mix-blend-overlay" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                <div className="relative w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center mb-2 bg-white/5 backdrop-blur-sm">
                                    <span className="text-2xl filter drop-shadow-md">⚽</span>
                                </div>
                                <span className="relative text-[10px] text-white/90 font-black uppercase tracking-[0.2em]">SYNERGY</span>
                                <span className="relative text-[8px] text-white/50 font-bold uppercase tracking-widest mt-0.5">DECK</span>
                            </div>

                            <div className="absolute -top-3 -right-3 w-7 h-7 bg-white text-stone-900 font-black text-xs rounded-full flex items-center justify-center border-2 border-stone-900 shadow-xl z-10 group-hover:scale-110 transition-transform">
                                {gameState.synergyDeck.length}
                            </div>
                        </div>

                        {/* Player Synergy Discard */}
                        <div 
                            className="group relative w-32 h-20 cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:translate-y-1"
                            style={{ transform: 'translateZ(10px)', transformStyle: 'preserve-3d' }}
                            onClick={() => setViewingPile('discard')}
                        >
                            <div className="absolute top-[1px] left-[1px] w-full h-full bg-stone-900/80 rounded border border-white/5 shadow-lg rotate-[-2deg]" style={{ transform: 'translateZ(-1px)' }} />
                            <div className="absolute top-[2px] left-[-1px] w-full h-full bg-stone-950/80 rounded border border-white/5 shadow-lg rotate-[1deg]" style={{ transform: 'translateZ(-2px)' }} />
                            
                            {gameState.synergyDiscard.length > 0 ? (
                                <div className="absolute inset-0 w-full h-full" style={{ transform: 'translateZ(1px)' }}>
                                    <div className="w-full h-full bg-stone-800 rounded border border-white/20 flex flex-col items-center justify-center overflow-hidden rotate-3 shadow-2xl">
                                        <div className="absolute inset-0 bg-green-900/20" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <span className="relative text-2xl opacity-40 mb-2 filter grayscale">♻️</span>
                                        <span className="relative text-[8px] text-white/40 font-bold uppercase tracking-widest">DISCARD</span>
                                    </div>
                                    <div className="absolute inset-0 hover:bg-white/5 transition-colors rounded rotate-3" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center rounded border-2 border-dashed border-white/10 bg-white/5">
                                   <span className="text-2xl mb-2 opacity-10">♻️</span>
                                   <span className="text-[8px] font-bold uppercase tracking-widest opacity-10">EMPTY</span>
                                </div>
                            )}

                            <div className="absolute -top-3 -right-3 w-7 h-7 bg-stone-800 text-white/60 font-bold text-xs rounded-full flex items-center justify-center border-2 border-stone-700 shadow-lg z-10 group-hover:scale-110 transition-transform">
                                {gameState.synergyDiscard.length}
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </div>
      </div>

      {/* View Control Toggle */}
      <div className="absolute top-4 right-32 z-50 pointer-events-auto">
        <button 
          onClick={() => setShowViewControls(!showViewControls)}
          className="bg-stone-800/80 backdrop-blur border border-white/20 rounded-full p-2 hover:bg-stone-700 transition-colors"
          title="Camera Settings"
        >
          📷
        </button>
      </div>

      {/* Camera Controls Panel */}
      {showViewControls && (
        <div className="absolute top-16 right-32 w-64 bg-stone-900/90 backdrop-blur border border-white/20 rounded-xl p-4 z-50 shadow-2xl">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Camera Settings</h3>
          
          <div className="space-y-4">
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
        </div>
      )}

      {/* Card Preview (Center) */}
      <AnimatePresence>
        {hoveredCard && (
          <div className="absolute inset-0 z-[100] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
             <motion.div
               initial={{ opacity: 0, scale: 0.85, y: 10 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.85, y: 10 }}
               className="relative p-4 rounded-3xl bg-stone-900/80 border border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
             >
                <div className="relative filter drop-shadow-[0_0_30px_rgba(0,0,0,0.5)] scale-[2] origin-center">
                  <PlayerCardComponent
                    card={hoveredCard as PlayerCard}
                    size="large"
                    disabled={true}
                    faceDown={false}
                  />
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. HUD Layer - Top (Opponent) */}
      <div className="absolute top-0 left-0 right-0 h-24 z-20 pointer-events-none">
         {/* Top Left: Opponent Info */}
         <div className="absolute top-4 left-4 pointer-events-auto flex items-start gap-4">
             {/* Avatar/Score Block */}
             <div className="flex flex-col items-center bg-black/60 backdrop-blur-md rounded-xl p-3 border border-red-500/30 shadow-xl">
                 <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest mb-1">OPPONENT</div>
                 <div 
                    data-testid="ai-score"
                    className="text-4xl font-['Russo_One'] text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                  >
                    {gameState.aiScore.toString().padStart(2, '0')}
                 </div>
             </div>
         </div>

         {/* Top Center: Opponent Hand (Fanned - Horizontal) */}
         <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[800px] h-48 pointer-events-auto flex justify-center items-start pt-4 perspective-1000 z-50">
            <AnimatePresence>
                {gameState.aiHand.map((card, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -100, rotate: 180 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      rotate: 180 + (i - (gameState.aiHand.length - 1) / 2) * 4, 
                      x: (i - (gameState.aiHand.length - 1) / 2) * -60 
                    }}
                    exit={{ opacity: 0, scale: 0.5, y: -50 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
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

         {/* Top Right: Opponent Synergy (Horizontal) */}
         <div className="absolute top-4 right-4 pointer-events-auto flex flex-col items-end gap-1">
             <div className="flex justify-between items-center gap-2 px-1">
                 <span className="text-[10px] text-white/60 font-bold">{gameState.aiSynergyHand.length}</span>
                 <span className="text-[10px] text-white/40 uppercase tracking-widest">SYNERGY</span>
             </div>
             <div className="flex gap-2">
                {gameState.aiSynergyHand.map((card, i) => (
                  <div key={i} className="w-16 h-10 bg-purple-900/50 rounded border border-purple-500/30 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 bottom-0 w-3 bg-purple-500/20" />
                     <div className="absolute inset-0 flex items-center justify-center opacity-20">
                        <span className="text-lg">✨</span>
                     </div>
                  </div>
                ))}
             </div>
         </div>
      </div>

      {/* 3. HUD Layer - Bottom (Player) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 z-30 pointer-events-none" data-testid="game-board">
         {/* Bottom Left: Player Info */}
         <div className="absolute bottom-4 left-4 pointer-events-auto flex items-end gap-4">
             {/* Avatar/Score Block */}
             <div className="flex flex-col items-center bg-black/60 backdrop-blur-md rounded-xl p-3 border border-green-500/30 shadow-xl">
                 <div className="text-[10px] text-green-400 font-bold uppercase tracking-widest mb-1">YOU</div>
                 <div 
                    data-testid="player-score"
                    className="text-4xl font-['Russo_One'] text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.6)]"
                  >
                    {gameState.playerScore.toString().padStart(2, '0')}
                 </div>
             </div>
         </div>

         {/* Bottom Center: Player Hand */}
         <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-[800px] h-48 pointer-events-auto flex justify-center items-end pb-4 perspective-1000">
            <AnimatePresence>
              {gameState.playerHand.map((card, i) => (
                <motion.div
                  key={card.id}
                  data-testid="hand-card"
                  initial={{ opacity: 0, y: 100, rotate: 0 }}
                  animate={{ 
                    opacity: 1, 
                    y: Math.abs(i - (gameState.playerHand.length - 1) / 2) * 2, 
                    rotate: (i - (gameState.playerHand.length - 1) / 2) * 3, 
                    x: (i - (gameState.playerHand.length - 1) / 2) * -70 
                  }}
                  exit={{ opacity: 0, scale: 0.5, y: 50 }}
                  whileHover={{ y: -80, scale: 1.1, rotate: 0, zIndex: 100, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative origin-bottom cursor-pointer shadow-2xl"
                  style={{ zIndex: i }}
                >
                  <PlayerCardComponent
                    card={card}
                    onClick={() => handleCardSelect(card)}
                    onMouseEnter={() => setHoveredCard(card)}
                    onMouseLeave={() => setHoveredCard(null)}
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

         {/* Bottom Right: Actions & Synergy */}
         <div className="absolute bottom-4 right-4 pointer-events-auto flex flex-col items-end gap-4">
             {/* Synergy Hand */}
             <div className="flex flex-col items-end gap-1">
                 <div className="flex justify-between items-center gap-2 px-1">
                     <span className="text-[10px] text-white/40 uppercase tracking-widest">SYNERGY</span>
                 </div>
                 <div className="flex gap-2">
                    {gameState.playerSynergyHand.map((card) => (
                      <div key={card.id} className="relative transform hover:-translate-y-4 transition-transform cursor-pointer">
                         <SynergyCardComponent 
                           card={card} 
                           size="normal" 
                           onClick={() => handleSynergySelect(card)}
                           selected={gameState.selectedSynergyCards.some(c => c.id === card.id)}
                         />
                      </div>
                    ))}
                 </div>
             </div>

             {/* Action Buttons */}
             <div className="w-48">
                {gameState.turnPhase === 'teamAction' && gameState.currentTurn === 'player' ? (
                  <div className="flex gap-2">
                    <button
                      data-testid="team-action-pass"
                      onClick={() => handleTeamAction('pass')}
                      disabled={!canDoTeamAction || passCount === 0}
                      className="flex-1 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-['Russo_One'] text-xs rounded-lg shadow-lg border border-white/10 flex flex-col items-center justify-center transition-all"
                    >
                      <span>PASS</span>
                      <span className="text-[10px] opacity-80">{passCount} available</span>
                    </button>
                    <button
                      data-testid="team-action-press"
                      onClick={() => handleTeamAction('press')}
                      disabled={!canDoTeamAction || pressCount === 0}
                      className="flex-1 py-3 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 text-white font-['Russo_One'] text-xs rounded-lg shadow-lg border border-white/10 flex flex-col items-center justify-center transition-all"
                    >
                      <span>PRESS</span>
                      <span className="text-[10px] opacity-80">{pressCount} available</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleEndTurn}
                    disabled={gameState.currentTurn !== 'player' || gameState.turnPhase !== 'playerAction'}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-700 text-white font-['Russo_One'] text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-white/20 transition-all hover:scale-105 active:scale-95"
                  >
                    END TURN
                  </button>
                )}
             </div>
         </div>
      </div>

      {/* 4. Side Info (Phase / Momentum) */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
          {/* Momentum Gauge (Vertical) */}
          <div className="h-64 w-4 bg-stone-900/80 backdrop-blur rounded-full border border-white/10 relative shadow-xl">
             <div className="absolute bottom-0 left-0 right-0 bg-yellow-500/20 rounded-full" style={{ height: `${gameState.controlPosition * 10}%` }} />
             
             {/* Indicator */}
             <motion.div 
                 className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] border-2 border-white z-10"
                 animate={{ bottom: `${(gameState.controlPosition / 10) * 100}%` }}
             />
             
             {/* Markers */}
             {[0, 2, 5, 8, 10].map(pos => (
                 <div key={pos} className="absolute left-1/2 -translate-x-1/2 w-2 h-0.5 bg-white/40" style={{ bottom: `${(pos / 10) * 100}%` }} />
             ))}
             
             {/* Label */}
             <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] text-yellow-500 font-bold tracking-widest whitespace-nowrap">MOMENTUM</div>
          </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-auto text-right">
          <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">TURN {gameState.turnCount}</div>
          <div className="text-2xl font-['Russo_One'] text-white drop-shadow-md mb-2">
              {gameState.currentTurn === 'player' ? <span className="text-blue-400">YOUR TURN</span> : <span className="text-red-400">OPP TURN</span>}
          </div>
          <div className="text-xs text-yellow-400 max-w-[150px] leading-tight">{gameState.message}</div>
          
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to surrender? This will end the current game.')) {
                handleBack();
              }
            }} 
            className="text-[10px] text-gray-600 hover:text-white mt-8 uppercase tracking-widest transition-colors"
          >
              Surrender
          </button>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {/* Turn Transition Banner */}
        {showTurnTransition && (
            <TurnTransition 
                turn={gameState.currentTurn} 
                onComplete={() => setShowTurnTransition(false)} 
            />
        )}

        {/* Phase Banner */}
        <PhaseBanner 
            text={phaseBannerText} 
            subtitle={phaseBannerSubtitle}
            show={showPhaseBanner} 
            onComplete={() => setShowPhaseBanner(false)} 
        />

        {/* Immediate Effect Modal */}
        {pendingImmediateEffect && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-[#2a2a2a] p-8 rounded-2xl border border-gray-700 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-['Russo_One'] text-white mb-2">Immediate Effect</h3>
              <p className="text-yellow-400 font-bold mb-4">{pendingImmediateEffect.card.name}</p>
              <p className="text-gray-300 mb-8">{getImmediateEffectDescription(pendingImmediateEffect.card.immediateEffect)}</p>
              <div className="flex gap-4">
                <button onClick={handleTriggerImmediateEffect} className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg">TRIGGER</button>
                <button onClick={handleSkipImmediateEffect} className="flex-1 py-3 bg-gray-600 hover:bg-gray-500 text-white font-bold rounded-lg">SKIP</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Synergy Choice Modal */}
        {synergyChoice && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-[#2a2a2a] p-8 rounded-2xl border border-gray-700 max-w-2xl w-full">
              <h3 className="text-2xl font-['Russo_One'] text-center text-white mb-6">Choose One to Keep</h3>
              <div className="flex justify-center gap-8 mb-8">
                {synergyChoice.cards.map((card, index) => (
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
        {substitutionMode && (
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
                         onMouseEnter={() => setHoveredCard(card as any)}
                         onMouseLeave={() => setHoveredCard(null)}
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
            const newState = startDraftRound(gameState);
            setGameState(newState);
          }
        }}
      />

      {gameState.phase === 'squadSelect' && (
        <SquadSelect
          allPlayers={[...gameState.playerHand, ...gameState.playerBench]}
          onConfirm={(starters, subs) => {
            setGameState(prev => ({
              ...prev,
              phase: 'firstHalf',
              playerHand: starters,
              playerBench: subs,
              message: 'Squad confirmed! Game starts - Team Action first',
            }));
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
          const newState = pickDraftCard(gameState, index, true);
          setGameState(newState);
        }}
        onMouseEnter={setHoveredCard}
        onMouseLeave={() => setHoveredCard(null)}
      />
    </div>
  );
};
