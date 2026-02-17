import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarCardDraft from './StarCardDraft';
import { AthleteCardComponent } from './AthleteCard';
import type { GameState, GameAction } from '../game/gameLogic';
import { useGameAudio } from '../hooks/useGameAudio';
import { starathleteCards, baseathleteCards } from '../data/cards';

interface DraftPhaseProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

type DraftStage = 'deckSelection' | 'preview' | 'shuffle' | 'draw' | 'selection';

export const DraftPhase: React.FC<DraftPhaseProps> = ({ gameState, dispatch }) => {
  const { playSound } = useGameAudio();
  const [aiSelectedIndex, setAiSelectedIndex] = useState<number | null>(null);
  const [playerSelectedIndex, setPlayerSelectedIndex] = useState<number | null>(null);
  const [draftStage, setDraftStage] = useState<DraftStage>('preview');
  const [shuffledDeck, setShuffledDeck] = useState(starathleteCards);
  const [drawnCards, setDrawnCards] = useState<typeof starathleteCards>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    let previewTimer: NodeJS.Timeout;
    let shuffleTimer: NodeJS.Timeout;
    let drawTimer: NodeJS.Timeout;
    let selectionTimer: NodeJS.Timeout;

    if (gameState.phase === 'draft') {
      if (gameState.draftStep === 0 && gameState.availableDraftCards.length === 0) {
        setDraftStage('preview');
        
        // 直接开始选秀流程
        previewTimer = setTimeout(() => {
          setDraftStage('shuffle');
          setIsShuffling(true);
          playSound('shuffle');
          
          shuffleTimer = setTimeout(() => {
            setIsShuffling(false);
            
            drawTimer = setTimeout(() => {
              setDraftStage('draw');
              playSound('deal');
              
              selectionTimer = setTimeout(() => {
                dispatch({ type: 'START_DRAFT_ROUND' });
              }, 1500);
            }, 500);
          }, 2000);
        }, 3000);
      } else if (gameState.draftStep > 0) {
        setDraftStage('selection');
      }
    }

    return () => {
      if (previewTimer) clearTimeout(previewTimer);
      if (shuffleTimer) clearTimeout(shuffleTimer);
      if (drawTimer) clearTimeout(drawTimer);
      if (selectionTimer) clearTimeout(selectionTimer);
    };
  }, [gameState.phase, gameState.draftStep, gameState.availableDraftCards.length, dispatch, playSound]);

  // 清理未使用的变量
  useEffect(() => {
    // 当availableDraftCards更新时，使用游戏状态中的卡片
    if (gameState.availableDraftCards.length > 0) {
      setDrawnCards(gameState.availableDraftCards);
    }
  }, [gameState.availableDraftCards]);

  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftStep === 2) {
      const selectTimer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * gameState.availableDraftCards.length);
        setAiSelectedIndex(randomIndex);
      }, 500);

      const pickTimer = setTimeout(() => {
        dispatch({ type: 'AI_DRAFT_PICK' });
        playSound('pick');
        const clearTimer = setTimeout(() => setAiSelectedIndex(null), 800);
        return () => clearTimeout(clearTimer);
      }, 1800);

      return () => {
        clearTimeout(selectTimer);
        clearTimeout(pickTimer);
      };
    }
  }, [gameState.phase, gameState.draftStep, gameState.availableDraftCards.length, dispatch]);

  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftStep === 3) {
      const discardTimer = setTimeout(() => {
        dispatch({ type: 'DISCARD_DRAFT_CARD' });
        playSound('discard');
      }, 1000);

      return () => clearTimeout(discardTimer);
    }
  }, [gameState.phase, gameState.draftStep, dispatch]);

  useEffect(() => {
    if (gameState.phase === 'draft') {
      setPlayerSelectedIndex(null);
      setAiSelectedIndex(null);
      // Only set to preview if it's the first round or starting a new draft process
      if (gameState.draftRound === 1 && gameState.draftStep === 0) {
        setDraftStage('preview');
      } else {
        setDraftStage('selection');
      }
    }
  }, [gameState.phase, gameState.draftRound, gameState.draftStep]);

  return (
    <div className="draft-phase">
      {draftStage === 'preview' && (
        <StarCardPreview cards={starathleteCards} />
      )}
      {draftStage === 'shuffle' && (
        <StarDeckShuffle isShuffling={isShuffling} deck={shuffledDeck} />
      )}
      {draftStage === 'draw' && (
        <StarCardDraw drawnCards={drawnCards} />
      )}
      {(draftStage === 'selection' || (gameState.phase === 'draft' && gameState.draftStep > 0)) && (
        <StarCardDraft
          cards={gameState.availableDraftCards}
          round={gameState.draftRound}
          isPlayerTurn={gameState.phase === 'draft' && gameState.draftStep === 1}
          onSelect={(index) => {
            setPlayerSelectedIndex(index);
            dispatch({ type: 'PICK_DRAFT_CARD', cardIndex: index });
            playSound('pick');
          }}
          aiSelectedIndex={aiSelectedIndex}
          playerSelectedIndex={playerSelectedIndex}
          draftStep={gameState.draftStep}
        />
      )}
    </div>
  );
};

const StarCardPreview: React.FC<{ cards: typeof starathleteCards }> = ({ cards }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/90 flex items-center justify-center z-[70] font-['Russo_One']"
      >
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full h-full flex flex-col items-center justify-center p-8"
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-yellow-400 mb-6 tracking-wider text-center"
          >
            ⭐ STAR PLAYERS ⭐
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-green-400 mb-8 text-center"
          >
            Available star players...
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl w-full max-h-[60vh] overflow-y-auto pb-8"
          >
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl p-3 border border-gray-600"
              >
                <div className="text-center">
                  <div className="text-yellow-400 text-lg font-bold mb-1">{card.nickname}</div>
                  <div className="text-white text-xs mb-1">{card.realName}</div>
                  <div className="text-gray-400 text-xs mb-2">{card.positionLabel}</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {card.icons.map((icon, idx) => (
                      <div key={idx} className="text-lg">{getIconEmoji(icon)}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center text-gray-500 text-sm tracking-wider uppercase mt-6"
          >
            Shuffling deck...
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const StarDeckShuffle: React.FC<{ isShuffling: boolean; deck: typeof starathleteCards }> = ({ isShuffling, deck }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/90 flex items-center justify-center z-[70] font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
            className="text-9xl mb-8"
          >
            🃏
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold text-yellow-400 mb-4 tracking-wider"
          >
            SHUFFLING
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-green-400"
          >
            {deck.length} cards
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const StarCardDraw: React.FC<{ drawnCards: typeof starathleteCards }> = ({ drawnCards }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="p-8 max-w-5xl w-full flex flex-col items-center"
        >
          <div className="text-center mb-10 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-4 tracking-wider">
              ⭐ STAR CARD DRAFT ⭐
            </div>
            <div className="text-2xl font-bold text-green-400">
              DRAWING CARDS...
            </div>
          </div>
          
          <div className="flex gap-8 justify-center items-center mb-8">
            {drawnCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="relative z-10">
                  <AthleteCardComponent
                    card={card}
                    size="large"
                  />
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center text-gray-500 text-sm tracking-wider uppercase">
            {drawnCards.length} cards drawn • Preparing for selection...
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};



function getIconEmoji(icon: string): string {
  const iconMap: { [key: string]: string } = {
    'attack': '⚔️',
    'defense': '🛡️',
    'pass': '📤',
    'press': '👊',
    'breakthrough': '💨'
  };
  return iconMap[icon] || '❓';
}

