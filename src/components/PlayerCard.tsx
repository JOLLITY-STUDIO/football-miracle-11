import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { PlayerCard as PlayerCardType, TacticalIcon } from '../data/cards';
import PlayerAvatar from './PlayerAvatar';

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
  const sizeClasses = {
    tiny: 'w-48 h-28 text-sm',
    small: 'w-48 h-28 text-sm',
    medium: 'w-48 h-28 text-sm',
    large: 'w-48 h-28 text-sm',
  };

  const roleName = getRoleName(card.type);
  const koreanRoleName = getKoreanRoleName(card.positionLabel);
  const roleBg = getRoleColor(card.type);

  return (
    <div 
      className={clsx("relative perspective-1000", sizeClasses[size])}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        layout
        initial={false}
        animate={{ 
          rotateY: faceDown ? 180 : 0,
          y: selected ? -30 : 0,
          scale: selected ? 1.15 : 1,
          zIndex: selected ? 100 : 0
        }}
        transition={{ duration: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={!disabled && !faceDown && !selected ? { scale: 1.05, y: -5, zIndex: 10 } : {}}
        whileTap={!disabled && !faceDown ? { scale: 0.95 } : {}}
        onClick={!disabled ? onClick : undefined}
        drag={draggable}
        dragSnapToOrigin
        onDragStart={() => onDragStart?.(card)}
        onDragEnd={() => onDragEnd?.()}
        className={clsx(
          'w-full h-full relative preserve-3d cursor-pointer shadow-xl rounded-[2rem] overflow-hidden border-[6px] border-[#1a1a1a]',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          selected ? 'ring-4 ring-yellow-400 ring-offset-2' : ''
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front Face */}
        <div 
          className="absolute inset-0 backface-hidden bg-white rounded-[1.5rem] overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Background Pattern - Blue Vertical Bars */}
          <div className="absolute inset-0 flex justify-around opacity-80">
            <div className="w-[15%] h-full bg-[#3498db]/20"></div>
            <div className="w-[40%] h-full bg-[#3498db]/40"></div>
            <div className="w-[15%] h-full bg-[#3498db]/20"></div>
          </div>

          <div className="absolute inset-0 flex">
            {/* Character Illustration Area (Left) */}
            <div className="w-[50%] h-full relative z-10">
              <div className="w-full h-full transform scale-150 translate-y-6 -translate-x-2">
                <PlayerAvatar seed={card.id} className="w-full h-full" />
              </div>
            </div>

            {/* Info Area (Right) */}
            <div className="w-[50%] h-full flex flex-col items-center justify-center pr-4 z-20">
              {/* Position Code Box */}
              <div className="bg-[#3498db] text-white px-2 py-0.5 rounded text-[0.6rem] font-black italic mb-1">
                {card.positionLabel}
              </div>
              
              {/* Position Name (Large Bold) */}
              <div className="text-[#3498db] font-black text-lg leading-none tracking-tighter text-center uppercase drop-shadow-[0_2px_0_rgba(255,255,255,1)]">
                {roleName}
              </div>
              
              {/* Korean Position Name */}
              <div className="text-[#3498db] font-bold text-[0.7rem] text-center mt-0.5">
                {koreanRoleName}
              </div>

              {/* Stats Compact */}
              <div className="flex gap-2 mt-2">
                 <div className="flex flex-col items-center">
                   <div className="w-6 h-6 rounded-full bg-[#E74C3C] flex items-center justify-center text-white text-[0.6rem] shadow-md border-2 border-white">
                     ⚔️
                   </div>
                   <span className="text-[0.6rem] font-black text-gray-800">{card.attack}</span>
                 </div>
                 <div className="flex flex-col items-center">
                   <div className="w-6 h-6 rounded-full bg-[#3498db] flex items-center justify-center text-white text-[0.6rem] shadow-md border-2 border-white">
                     🛡️
                   </div>
                   <span className="text-[0.6rem] font-black text-gray-800">{card.defense}</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Top Left Icon (Medical/Special) */}
          <div className="absolute top-2 left-2 z-30">
            <div className="w-8 h-8 rounded-full bg-[#27AE60] border-2 border-white flex items-center justify-center shadow-lg">
               <span className="text-white text-xs font-black">+</span>
            </div>
          </div>

          {/* Bottom Icons (Shields/Tactical) */}
          <div className="absolute bottom-2 left-4 right-4 flex justify-between px-2 z-30">
            {card.icons.slice(0, 2).map((icon, idx) => (
              <div key={idx} className="w-7 h-7 rounded-full bg-[#3498db] border-2 border-white flex items-center justify-center shadow-md text-[0.6rem]">
                {getIconSymbol(icon)}
              </div>
            ))}
          </div>
        </div>

        {/* Back Face */}
        <div 
          className="absolute inset-0 backface-hidden rounded-[1.5rem] bg-[#1a1a1a] flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden', 
            transform: 'rotateY(180deg)' 
          }}
        >
          <div className="text-[#3498db] font-black italic text-xl">MAGIC 11</div>
        </div>
      </motion.div>
    </div>
  );
};
