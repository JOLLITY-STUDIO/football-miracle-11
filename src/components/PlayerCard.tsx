import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { PlayerCard as PlayerCardType, TacticalIcon } from '../data/cards';
import PlayerAvatar from './PlayerAvatar';
import { BaseCard } from './BaseCard';

interface Props {
  card: PlayerCardType;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  selected?: boolean;
  size?: 'tiny' | 'small' | 'medium' | 'large';
  faceDown?: boolean;
  draggable?: boolean;
  onDragStart?: (card: PlayerCardType) => void;
  onDragEnd?: () => void;
  disabled?: boolean;
  variant?: 'home' | 'away';
}

const getRoleName = (type: string) => {
  switch (type) {
    case 'forward': return 'FORWARD';
    case 'midfielder': return 'MIDFIELDER';
    case 'defender': return 'DEFENDER';
    default: return 'PLAYER';
  }
};

const getKoreanRoleName = (position: string) => {
  if (position.includes('CB')) return '중앙수비수';
  if (position.includes('LB') || position.includes('RB')) return '측면수비수';
  if (position.includes('DF')) return '수비수';
  if (position.includes('CM')) return '중앙미드필더';
  if (position.includes('LM') || position.includes('RM')) return '측면미드필더';
  if (position.includes('MF')) return '미드필더';
  if (position.includes('ST') || position.includes('CF')) return '공격수';
  if (position.includes('LW') || position.includes('RW')) return '윙어';
  if (position.includes('FW')) return '공격수';
  if (position.includes('GK')) return '골키퍼';
  return '선수';
};

const getRoleColor = (type: string) => {
  switch (type) {
    case 'forward': return 'bg-[#E74C3C]';
    case 'midfielder': return 'bg-[#27AE60]';
    case 'defender': return 'bg-[#2980B9]';
    default: return 'bg-gray-600';
  }
};

const getIconSymbol = (icon: TacticalIcon): string => {
  switch (icon) {
    case 'attack': return '⚔️';
    case 'defense': return '🛡️';
    case 'pass': return '👟';
    case 'press': return '⚡';
    case 'breakthrough': return '💨';
    case 'breakthroughAll': return '💥';
  }
};

export const PlayerCardComponent: React.FC<Props> = ({ 
  card, 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  selected, 
  size = 'medium', 
  faceDown = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  disabled = false,
  variant = 'home'
}) => {
  const roleName = getRoleName(card.type);
  const koreanRoleName = getKoreanRoleName(card.positionLabel);
  const roleBg = getRoleColor(card.type);

  return (
    <div 
      className="relative perspective-1000"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        layout
        initial={false}
        animate={{ 
          rotateY: faceDown ? 180 : 0,
          scale: selected ? 1.05 : 1,
          y: selected ? -10 : 0
        }}
        whileHover={!disabled && !faceDown ? { y: -5, scale: 1.02 } : {}}
        className={clsx(
          "relative preserve-3d cursor-pointer transition-shadow",
          selected ? "z-20 shadow-[0_20px_40px_rgba(0,0,0,0.4)]" : "z-10 shadow-xl",
          disabled && "opacity-50 grayscale cursor-not-allowed"
        )}
        onClick={disabled ? undefined : onClick}
        draggable={draggable}
        onDragStart={() => onDragStart?.(card)}
        onDragEnd={onDragEnd}
      >
        <BaseCard 
          size={size} 
          className={clsx(
            "border-[3px] border-stone-800",
            selected ? "ring-4 ring-yellow-400" : ""
          )}
        >
          {/* Front Face */}
          <div className={clsx(
            "absolute inset-0 backface-hidden flex flex-col overflow-hidden",
            variant === 'home' ? "bg-[#f8f9fa]" : "bg-[#2c3e50]"
          )}
          style={{ backfaceVisibility: 'hidden' }}>
            {/* Header: Role Strip */}
            <div className={clsx("h-1.5 w-full", roleBg)} />
            
            <div className="flex-1 flex flex-col p-1.5">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className={clsx("text-[9px] font-black leading-none", variant === 'home' ? "text-stone-800" : "text-white")}>{card.name}</span>
                  <span className="text-[7px] text-stone-500 font-bold leading-tight">{roleName}</span>
                </div>
                <div className={clsx("w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shadow-sm border", 
                  variant === 'home' ? "bg-white text-stone-900 border-stone-200" : "bg-stone-800 text-white border-stone-700")}>
                  {card.value}
                </div>
              </div>

              <div className="flex-1 flex gap-1.5 mt-1 overflow-hidden">
                <div className="w-14 h-14 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-stone-200 shadow-inner">
                  <PlayerAvatar seed={card.id || card.name} imageUrl={card.imageUrl} />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-0.5 overflow-hidden">
                  <div className="flex flex-wrap gap-0.5">
                    {card.icons.map((icon, idx) => (
                      <div key={idx} className="w-4 h-4 rounded-md bg-stone-100 flex items-center justify-center text-[8px] border border-stone-200 shadow-sm" title={icon}>
                        {getIconSymbol(icon)}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] text-stone-400 font-bold truncate pr-1">{koreanRoleName}</span>
                    <span className="text-[8px] font-black text-stone-800 bg-stone-100 px-1 rounded-sm border border-stone-200">{card.positionLabel}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div 
            className="absolute inset-0 backface-hidden bg-stone-800 flex items-center justify-center overflow-hidden"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
            <div className="w-16 h-16 rounded-full border-4 border-white/10 flex items-center justify-center">
              <span className="text-3xl grayscale opacity-20">⚽</span>
            </div>
          </div>
        </BaseCard>
      </motion.div>
    </div>
  );
};
