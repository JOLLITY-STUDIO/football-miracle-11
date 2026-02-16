import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { athleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';
import type { GamePhase } from '../types/game';

interface AthleteCardGroupProps {
  cards: athleteCard[];
  selectedCard: athleteCard | null;
  setupStep: number;
  phase: GamePhase;
  onCardSelect: (card: athleteCard) => void;
}

export const AthleteCardGroup: React.FC<AthleteCardGroupProps> = ({
  cards,
  selectedCard,
  setupStep,
  phase,
  onCardSelect,
}) => {
  // BUG-2026-02-16-016: 优化手牌对齐 - 使用响应式容器宽度
  const settings = {
    rows: 1,
    cols: cards.length,
    arcAngle: 30,
    arcHeight: 264,
    cardWidth: 132,
    cardHeight: 86,
    spacing: 20,
    startAngle: -15
  };
  
  // 计算容器宽度：确保在不同卡牌数量下都能居中
  // 最小宽度为400px，最大宽度为屏幕宽度的80%
  const calculateContainerWidth = () => {
    const baseWidth = cards.length * (settings.cardWidth + settings.spacing);
    const minWidth = 400;
    const maxWidth = typeof window !== 'undefined' ? window.innerWidth * 0.8 : 1200;
    return Math.max(minWidth, Math.min(baseWidth, maxWidth));
  };
  
  const containerWidth = calculateContainerWidth();
  
  const calculateCardPosition = (col: number) => {
    const { cols, arcAngle, arcHeight, startAngle } = settings;
    
    // 计算该卡片在弧形上的角度
    const anglePerCard = cols > 1 ? arcAngle / (cols - 1) : 0;
    const currentAngle = startAngle + (col * anglePerCard);
    
    // 计算半径
    const radius = arcHeight;
    
    // 使用三角函数计算位置
    const radian = (currentAngle * Math.PI) / 180;
    
    // 计算x值，保持原有的弧形布局
    const x = Math.sin(radian) * radius;
    
    // 计算y值，保持弧形布局的同时，让左右两边更高，中间更低
    // 基础y值（弧形）减去一个基于余弦函数的调整值
    // cos(0) = 1（中间调整最大，最低），cos(±90) = 0（两边调整最小，最高）
    const baseY = -Math.cos(radian) * radius + radius;
    const heightAdjustment = Math.cos(radian) * 80;
    // 调整y值，使卡片整体下移一半卡牌高度（43px）
    const y = baseY - heightAdjustment + 43;
    
    // 计算旋转角度，保持弧形的倾斜效果
    const rotation = currentAngle;
    
    return { x, y, rotation };
  };
  
  return (
    <div 
      id="athlete-card-group" 
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[50]" 
      style={{ 
        height: '200px', 
        width: `${containerWidth}px`,
        maxWidth: '90vw', // 确保不超出屏幕
        pointerEvents: 'none' // 容器本身不拦截点击
      }}
    >
      <div 
        className="relative h-full flex justify-center items-center pt-4 perspective-1000" 
        style={{ width: '100%' }}
      >
        <AnimatePresence>
          {cards.map((card: athleteCard, i: number) => {
            const { x, y, rotation } = calculateCardPosition(i);
            const isSelected = selectedCard?.id === card.id;
            
            return (
              <motion.div
                key={card.id}
                layoutId={`card-${card.id}`}
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  x: 0,
                  y: 0
                }}
                animate={{
                  opacity: 1,
                  scale: isSelected ? 1.2 : 1,
                  x: isSelected ? 0 : x,
                  y: isSelected ? -20 : y,
                  rotate: isSelected ? 0 : rotation
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  x: 0,
                  y: 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                onClick={() => onCardSelect(card)}
                whileHover={{ scale: isSelected ? 1.2 : 1.05 }}
                whileTap={{ scale: isSelected ? 1.15 : 0.95 }}
                style={{
                  position: 'absolute',
                  width: `${settings.cardWidth}px`,
                  height: `${settings.cardHeight}px`,
                  left: '50%',
                  top: '50%',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  zIndex: isSelected ? 100 : i,
                  pointerEvents: 'auto'
                }}
              >
                <AthleteCardComponent
                  card={card}
                  onClick={() => onCardSelect(card)}
                  selected={isSelected}
                  size="small"
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 text-center text-[10px] text-white/40 uppercase tracking-widest font-bold whitespace-nowrap">
        YOUR HAND: {cards.length} {cards.length > 0 && '| SELECT A CARD TO PLACE'}
      </div>
    </div>
  );
};