import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { athleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';
import type { GamePhase } from '../types/game';
import { playSound } from '../utils/audio';

interface AthleteCardGroupProps {
  cards: athleteCard[];
  selectedCard: athleteCard | null;
  setupStep: number;
  phase: GamePhase;
  onCardSelect: (card: athleteCard) => void;
  position?: 'top' | 'bottom';
}

export const AthleteCardGroup: React.FC<AthleteCardGroupProps> = ({
  cards,
  selectedCard,
  setupStep,
  phase,
  onCardSelect,
  position = 'bottom',
}) => {
  const [flippedCard, setFlippedCard] = React.useState<string | null>(null);

  const handleCardClick = (card: athleteCard) => {
    // 播放点击音效，确保双方卡片点击时都有声音
    playSound('snap');
    
    if (position === 'top') {
      // 点击对手卡片时的行为与玩家卡片一致
      setFlippedCard(flippedCard === card.id ? null : card.id);
    } else {
      // 点击玩家卡片时也设置 flippedCard 状态以触发动画
      setFlippedCard(flippedCard === card.id ? null : card.id);
      // 延迟执行选择操作，确保动画效果能看到
      setTimeout(() => {
        onCardSelect(card);
      }, 300);
    }
  };
  // 水平布局设置
  const settings = {
    rows: 1,
    cols: cards.length,
    cardWidth: 90, // 减小卡片宽度，确保所有卡片都能显示
    cardHeight: 60, // 相应减小卡片高度
    spacing: 6, // 减小间距，让布局更紧凑
  };
  
  // 使用 flex 布局和滚动，无需手动计算容器宽度
  
  return (
    <div 
      id={`athlete-card-group-${position}`} 
      className={`fixed left-0 right-0 ${position === 'top' ? 'top-0' : 'bottom-0'}`} 
      style={{ 
        height: '150px', // 增大容器高度，确保卡片不会被切割
        pointerEvents: 'none', // 容器本身不拦截点击
        zIndex: phase === 'draft' ? 10 : 50 // 在选秀阶段降低 z-index，其他阶段保持适中
      }}
    >
      <div 
        className={`relative h-full flex items-center perspective-1000 overflow-x-auto`} 
        style={{ 
          width: '100%',
          padding: position === 'top' ? '20px 15px 10px' : '10px 15px 20px',
          scrollbarWidth: 'none', // 隐藏滚动条
          msOverflowStyle: 'none', // 隐藏滚动条
          WebkitOverflowScrolling: 'touch' // 平滑滚动
        }}
      >
        <div className="flex gap-1 min-w-max">
          <AnimatePresence>
            {cards.map((card: athleteCard, i: number) => {
              const isSelected = selectedCard?.id === card.id;
              
              return (
                <motion.div
                  key={`${position}-hand-${card.id}-${i}`}
                  layoutId={`card-${card.id}`}
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    x: 1600, // 抽卡区X位置
                    y: position === 'top' ? -200 : 540,  // 根据位置调整初始Y位置
                    rotate: position === 'top' ? 180 : 0
                  }}
                  animate={{
                    opacity: 1,
                    scale: flippedCard === card.id ? 1.3 : (isSelected ? 1.2 : 1),
                    x: 0,
                    y: flippedCard === card.id ? (position === 'top' ? 20 : -20) : 0,
                    rotate: flippedCard === card.id ? 0 : (position === 'top' ? 180 : 0)
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    duration: 0.8,
                    ease: "easeInOut",
                    // 控制动画顺序：先旋转，后移动
                    times: [0, 0.6, 1], // 0-60% 旋转，60-100% 移动
                    y: {
                      delay: 0.4 // 延迟移动，先完成旋转
                    }
                  }}
                  style={{
                    position: 'relative',
                    width: `${settings.cardWidth}px`,
                    height: `${settings.cardHeight}px`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    zIndex: flippedCard === card.id ? 9999 : (isSelected ? 100 : i),
                    pointerEvents: 'auto',
                    // 确保旋转基于卡片中心
                    transformOrigin: 'center center'
                  }}
                  // 添加 whileHover 效果，确保卡片在悬停时也能显示在前面
                  whileHover={{
                    scale: isSelected ? 1.2 : 1.05,
                    transition: { duration: 0.2 },
                    zIndex: 9999
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    x: 0,
                    y: 0
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 20,
                    duration: 0.8
                  }}
                  onClick={() => handleCardClick(card)}
                  whileHover={{ scale: isSelected ? 1.2 : 1.05, transition: { duration: 0.2 } }}
                  whileTap={{ scale: isSelected ? 1.15 : 0.95, transition: { duration: 0.1 } }}
                  style={{
                    position: 'relative',
                    width: `${settings.cardWidth}px`,
                    height: `${settings.cardHeight}px`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    zIndex: isSelected ? 100 : i,
                    pointerEvents: 'auto'
                  }}
              >
                <div>
                  <AthleteCardComponent
                    card={card}
                    onClick={() => handleCardClick(card)}
                    selected={isSelected}
                    size="small"
                  />
                </div>
              </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      <div className={`absolute ${position === 'top' ? 'top-[-40px]' : 'bottom-[-40px]'} left-1/2 -translate-x-1/2 text-center text-[10px] text-white/40 uppercase tracking-widest font-bold whitespace-nowrap`}>
        {position === 'top' ? 'OPP HAND' : 'YOUR HAND'}: {cards.length} {cards.length > 0 && position === 'bottom' && '| SELECT A CARD TO PLACE'}
      </div>
    </div>
  );
};