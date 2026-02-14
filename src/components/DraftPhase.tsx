import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import StarCardDraft from './StarCardDraft';
import type { GameState, GameAction } from '../game/gameLogic';
import { useGameAudio } from '../hooks/useGameAudio';

interface DraftPhaseProps {
  gameState: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const DraftPhase: React.FC<DraftPhaseProps> = ({ gameState, dispatch }) => {
  const { playSound } = useGameAudio();
  const [aiSelectedIndex, setAiSelectedIndex] = useState<number | null>(null);
  const [playerSelectedIndex, setPlayerSelectedIndex] = useState<number | null>(null);

  // AI Draft Logic
  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftStep === 2) { // AI选择阶段
      // Simulate AI thinking and selecting
      const selectTimer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * gameState.availableDraftCards.length);
        setAiSelectedIndex(randomIndex);
      }, 500);

      const pickTimer = setTimeout(() => {
        dispatch({ type: 'AI_DRAFT_PICK' });
        playSound('draw');
        // 保留AI选中标识一段时间，避免立即清除导致玩家看不到标记
        const clearTimer = setTimeout(() => setAiSelectedIndex(null), 800);
        return () => clearTimeout(clearTimer);
      }, 1800);

      return () => {
        clearTimeout(selectTimer);
        clearTimeout(pickTimer);
      };
    }
  }, [gameState.phase, gameState.draftStep, gameState.availableDraftCards.length, dispatch]);

  // 弃卡逻辑
  useEffect(() => {
    if (gameState.phase === 'draft' && gameState.draftStep === 3) { // 弃卡阶段
      const discardTimer = setTimeout(() => {
        dispatch({ type: 'DISCARD_DRAFT_CARD' });
        playSound('discard');
      }, 1000);

      return () => clearTimeout(discardTimer);
    }
  }, [gameState.phase, gameState.draftStep, dispatch]);

  // 重置选秀选择状态
  useEffect(() => {
    if (gameState.phase === 'draft') {
      setPlayerSelectedIndex(null);
      setAiSelectedIndex(null);
    }
  }, [gameState.phase, gameState.draftRound, gameState.draftStep]);

  return (
    <div className="draft-phase">
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
    </div>
  );
};
