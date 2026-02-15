import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { athleteCard } from '../data/cards';
import { AthleteCardComponent } from './AthleteCard';

interface AthleteCardGroupProps {
  cards: athleteCard[];
  selectedCard: athleteCard | null;
  setupStep: number;
  phase: string;
  onCardSelect: (card: athleteCard) => void;
}

export const AthleteCardGroup: React.FC<AthleteCardGroupProps> = ({
  cards,
  selectedCard,
  setupStep,
  phase,
  onCardSelect,
}) => {
  const settings = {
    rows: 1,
    cols: cards.length,
    arcAngle: 30,
    arcHeight: 500,
    cardWidth: 132,
    cardHeight: 86,
    spacing: 20,
    startAngle: -15
  };
  
  const calculateCardPosition = (col: number) => {
    const { cols, arcAngle, arcHeight, startAngle } = settings;
    
    // 计算该卡片在弧形上的角度
    const anglePerCard = arcAngle / (cols - 1);
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
    <div id="athlete-card-group" className="absolute bottom-[0%] left-0 right-0 pointer-events-auto z-100" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <AnimatePresence>
        {cards.map((card, i) => {
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
              whileHover={{}}
              whileTap={{}}
              style={{
                position: 'absolute',
                width: `${settings.cardWidth}px`,
                height: `${settings.cardHeight}px`,
                left: '50%',
                top: '50%',
                transform: `translateX(-50%) translateY(-50%) translateX(${isSelected ? 0 : x}px) translateY(${isSelected ? -20 : y}px) rotate(${isSelected ? 0 : rotation}deg)`,
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
                onMouseEnter={undefined}
                onMouseLeave={undefined}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className="absolute bottom-[-40px] text-center text-[10px] text-white/40 uppercase tracking-widest font-bold w-full">
        YOUR HAND: {cards.length}
      </div>
    </div>
  );
};