import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AthleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';
import { playSound } from '../utils/audio';

interface Props {
  cards: AthleteCard[];
  round: number;
  isPlayerTurn: boolean;
  onSelect: (index: number) => void;
  aiSelectedIndex?: number | null;
  playerSelectedIndex?: number | null;
  onRoundStart?: () => void;
  draftStep?: number;
}

const StarCardDraft: React.FC<Props> = ({ 
  cards, 
  round, 
  isPlayerTurn, 
  onSelect, 
  aiSelectedIndex = null,
  playerSelectedIndex = null,
  onRoundStart,
  draftStep = 1
}) => {
  const [isShuffling, setIsShuffling] = useState(true);
  const [shuffledCards, setShuffledCards] = useState<AthleteCard[]>([]);
  const [showDiscard, setShowDiscard] = useState(false);
  const [lastAiSelectedIndex, setLastAiSelectedIndex] = useState<number | null>(null);

  // 当轮次变化时重置所有状态
  useEffect(() => {
    setIsShuffling(true);
    setShowDiscard(false);
    setLastAiSelectedIndex(null);
  }, [round]);

  useEffect(() => {
    if (cards.length > 0 && isShuffling) {
      playSound('swosh');
      const shuffled = [...cards]; // 取消洗牌随机旋转，保持稳定顺序
      setShuffledCards(shuffled);
      const timer = setTimeout(() => setIsShuffling(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cards, isShuffling, round]);

  // 当卡组变化（例如AI或玩家已选）时，同步显示数组，避免显示未移除的卡
  useEffect(() => {
    if (!isShuffling) {
      setShuffledCards(cards);
      // 当卡片数量变化时，清除AI选中标识，避免索引错乱
      if (cards.length < 3) {
        setLastAiSelectedIndex(null);
      }
    }
  }, [cards, isShuffling]);

  useEffect(() => {
    if (aiSelectedIndex !== null) {
      setLastAiSelectedIndex(aiSelectedIndex);
      // 3秒后自动清除AI标识
      const clearTimer = setTimeout(() => {
        setLastAiSelectedIndex(null);
      }, 3000);
      return () => clearTimeout(clearTimer);
    }
    if (playerSelectedIndex !== null && lastAiSelectedIndex !== null && !showDiscard) {
      const t = setTimeout(() => {
        setShowDiscard(true);
        playSound('swosh');
        // 清理AI标识
        setTimeout(() => setLastAiSelectedIndex(null), 400);
      }, 400);
      return () => clearTimeout(t);
    }
  }, [playerSelectedIndex, aiSelectedIndex, showDiscard, lastAiSelectedIndex]);

  // 当进入弃卡阶段时，立即显示弃卡状态
  useEffect(() => {
    if (draftStep === 3 && !showDiscard) {
      const t = setTimeout(() => {
        setShowDiscard(true);
        playSound('swosh');
        // 清理AI标识
        setTimeout(() => setLastAiSelectedIndex(null), 400);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [draftStep, showDiscard]);

  if (cards.length === 0) return null;

  const displayCards = isShuffling ? cards : shuffledCards;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] font-['Russo_One']"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="p-8 max-w-5xl w-full flex flex-col items-center"
        >
          <div className="text-center mb-10 text-center">
            <div className="text-4xl font-bold text-yellow-400 mb-4 tracking-wider">
              ⭐ STAR CARD DRAFT - ROUND {round} ⭐
            </div>
            {isShuffling ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-green-400"
              >
                SHUFFLING CARDS...
              </motion.div>
            ) : draftStep === 3 ? (
              <div className="text-2xl font-bold text-gray-400">
                DISCARDING REMAINING CARD...
              </div>
            ) : (
              <div className={`text-2xl font-bold ${isPlayerTurn ? 'text-green-400' : 'text-red-400'}`}>
                {isPlayerTurn ? 'YOUR TURN TO CHOOSE!' : 'AI IS CHOOSING...'}
              </div>
            )}
          </div>
          
          <div className="flex gap-8 justify-center items-center mb-8">
            {displayCards.map((card, index) => {
              const isPlayerSelected = playerSelectedIndex === index;
              const isAiSelected = aiSelectedIndex === index;
              const isDiscarded = showDiscard && !isPlayerSelected && !isAiSelected;
              
              return (
                <motion.div 
                  key={card.id}
                  data-testid="star-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: isShuffling ? 0.6 : (isDiscarded ? 0.3 : 1),
                    y: isShuffling ? 0 : ((isAiSelected || lastAiSelectedIndex === index) ? -10 : (isPlayerSelected ? -10 : 0)),
                    scale: isShuffling ? 1 : ((isAiSelected || lastAiSelectedIndex === index || isPlayerSelected) ? 1.03 : 1),
                    rotate: 0
                  }}
                  transition={{ 
                    delay: isShuffling ? index * 0.03 : index * 0.08,
                    duration: isShuffling ? 0.2 : 0.2
                  }}
                  className={`relative transition-all duration-300 ${
                    isPlayerTurn && !isDiscarded
                      ? 'cursor-pointer' 
                      : (isAiSelected && !isDiscarded) || (isPlayerSelected && !isDiscarded) ? 'opacity-100' : 'opacity-80'
                  }`}
                  whileHover={isPlayerTurn && !isDiscarded ? { scale: 1.06, y: -6 } : {}}
                  onClick={() => isPlayerTurn && !isDiscarded && onSelect(index)}
                >
                  {(isPlayerSelected || isAiSelected || lastAiSelectedIndex === index) && !isDiscarded && (
                     <motion.div 
                       className={`absolute -inset-6 ${(isAiSelected || lastAiSelectedIndex === index) ? 'bg-red-500/20' : 'bg-green-500/20'} rounded-xl blur-xl`}
                       initial={{ opacity: 0 }}
                       animate={{ opacity: (isAiSelected || isPlayerSelected || lastAiSelectedIndex === index) ? 1 : 0 }}
                     />
                  )}
                  
                  <div className={`relative z-10 transition-all duration-300 ${isDiscarded ? 'grayscale brightness-50' : ''}`}>
                    <AthleteCardComponent
                      card={card}
                      size="large"
                    />
                  </div>
                  
                  {isPlayerTurn && !isDiscarded && (
                    <motion.div 
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-yellow-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                      initial={{ opacity: 0, y: -10 }}
                      whileHover={{ opacity: 1, y: 0 }}
                    >
                      SELECT
                    </motion.div>
                  )}
                  
                  {(isAiSelected || lastAiSelectedIndex === index) && !isDiscarded && (
                    <motion.div 
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      AI PICKING...
                    </motion.div>
                  )}
                  
                  {isPlayerSelected && !isDiscarded && (
                    <motion.div 
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      YOU PICKED
                    </motion.div>
                  )}
                  
                  {isDiscarded && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 flex items-center justify-center z-20"
                    >
                      <div className="bg-black/70 backdrop-blur-sm text-white text-2xl font-bold px-6 py-3 rounded-xl border-4 border-red-500">
                        DISCARDED
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
          
          <div className="text-center text-gray-500 text-sm tracking-wider uppercase">
            {isShuffling ? 'Shuffling...' : `${displayCards.length} cards available • Pick 1 • Remaining card will be removed`}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StarCardDraft;

