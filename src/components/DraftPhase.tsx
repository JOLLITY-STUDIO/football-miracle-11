import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarCardDraft from './StarCardDraft';
import type { GameState, GameAction } from '../game/gameLogic';
import { useGameAudio } from '../hooks/useGameAudio';
import { starathleteCards } from '../data/cards';

interface DraftPhaseProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

type DraftStage = 'preview' | 'shuffle' | 'draw' | 'selection';

export const DraftPhase: React.FC<DraftPhaseProps> = ({ gameState, dispatch }) => {
  const { playSound } = useGameAudio();
  const [aiSelectedIndex, setAiSelectedIndex] = useState<number | null>(null);
  const [playerSelectedIndex, setPlayerSelectedIndex] = useState<number | null>(null);
  const [draftStage, setDraftStage] = useState<DraftStage>('preview');
  const [shuffledDeck, setShuffledDeck] = useState(starathleteCards);
  const [drawnCards, setDrawnCards] = useState<typeof starathleteCards>([]);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftRound === 1 && gameState.draftStep === 0 && gameState.availableDraftCards.length === 0) {
      setDraftStage('preview');
      
      const previewTimer = setTimeout(() => {
        setDraftStage('shuffle');
        setIsShuffling(true);
        playSound('swosh');
        
        const shuffleTimer = setTimeout(() => {
          const shuffled = [...starathleteCards].sort(() => Math.random() - 0.5);
          setShuffledDeck(shuffled);
          setIsShuffling(false);
          
          const drawTimer = setTimeout(() => {
            setDraftStage('draw');
            playSound('draw');
            
            const drawn = shuffled.slice(0, 3);
            setDrawnCards(drawn);
            
            const selectionTimer = setTimeout(() => {
              setDraftStage('selection');
              dispatch({ type: 'START_DRAFT_ROUND', cards: drawn });
            }, 1500);
            
            return () => clearTimeout(selectionTimer);
          }, 500);
          
          return () => clearTimeout(drawTimer);
        }, 2000);
        
        return () => clearTimeout(shuffleTimer);
      }, 3000);
      
      return () => clearTimeout(previewTimer);
    } else if (gameState.phase === 'draft' && gameState.draftStep > 0) {
      setDraftStage('selection');
    }
  }, [gameState.phase, gameState.draftRound, gameState.draftStep, gameState.availableDraftCards.length, dispatch]);

  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftStep === 2) {
      const selectTimer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * gameState.availableDraftCards.length);
        setAiSelectedIndex(randomIndex);
      }, 500);

      const pickTimer = setTimeout(() => {
        dispatch({ type: 'AI_DRAFT_PICK' });
        playSound('draw');
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
      {draftStage === 'selection' && (
        <StarCardDraft
          cards={gameState.availableDraftCards}
          round={gameState.draftRound}
          isPlayerTurn={gameState.phase === 'draft' && gameState.draftStep === 1}
          onSelect={(index) => {
            setPlayerSelectedIndex(index);
            dispatch({ type: 'PICK_DRAFT_CARD', cardIndex: index });
            playSound('draw');
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
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-[#2a2a2a] rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-7xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-yellow-400 mb-4 tracking-wider"
            >
              ⭐ STAR PLAYERS PREVIEW ⭐
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-green-400"
            >
              Review all available star players...
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {cards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-xl p-4 border border-gray-600"
              >
                  <div className="text-center">
                  <div className="text-yellow-400 text-lg font-bold mb-2">{card.nickname}</div>
                  <div className="text-white text-sm mb-2">{card.realName}</div>
                  <div className="text-gray-400 text-xs mb-3">{card.positionLabel}</div>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {card.icons.map((icon, idx) => (
                      <div key={idx} className="text-xl">{getIconEmoji(icon)}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="text-center text-gray-500 text-sm tracking-wider uppercase mt-8"
          >
            Shuffling deck in {3}...
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
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9 }}
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
            SHUFFLING STAR DECK
          </motion.div>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-green-400"
          >
            {deck.length} cards in deck
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
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[70] font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-[#2a2a2a] rounded-2xl p-8 shadow-2xl border border-gray-700 max-w-5xl w-full"
        >
          <div className="text-center mb-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-4xl font-bold text-yellow-400 mb-4 tracking-wider"
            >
              ⭐ DRAFT ROUND 1 ⭐
            </motion.div>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-green-400"
            >
              Drawing 3 cards...
            </motion.div>
          </div>
          
          <div className="flex gap-8 justify-center items-center mb-8">
            {drawnCards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -100, rotate: -10 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: index * 0.3 }}
                className="relative"
              >
                <div className="bg-gray-800 rounded-xl p-6 border-2 border-yellow-500 shadow-2xl">
                  <div className="text-center">
                    <div className="text-yellow-400 text-xl font-bold mb-2">{card.nickname}</div>
                    <div className="text-white text-sm mb-2">{card.realName}</div>
                    <div className="text-gray-400 text-xs mb-3">{card.positionLabel}</div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {card.icons.map((icon, idx) => (
                        <div key={idx} className="text-2xl">{getIconEmoji(icon)}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-gray-500 text-sm tracking-wider uppercase"
          >
            Prepare to choose your star player...
          </motion.div>
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

