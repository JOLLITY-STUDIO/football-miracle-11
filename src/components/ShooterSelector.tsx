import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AthleteCardComponent } from './AthleteCard';
import type { FieldZone } from '../types/game';
import { TacticalIconMatcher } from '../game/tacticalIconMatcher';

interface ShooterSelectorProps {
  playerField: FieldZone[];
  isOpen: boolean;
  onClose: () => void;
  onSelectPlayer: (zone: number, position: number) => void;
}

interface CompleteAttackIcon {
  id: string;
  centerX: number;
  centerY: number;
  zone: number;
  position: number;
  card: any;
  shotMarkers: number;
}

export const ShooterSelector: React.FC<ShooterSelectorProps> = ({
  playerField,
  isOpen,
  onClose,
  onSelectPlayer,
}) => {
  // 收集所有激活的进攻图标
  const [activeAttackIcons, setActiveAttackIcons] = useState<CompleteAttackIcon[]>([]);

  useEffect(() => {
    if (!playerField || playerField.length === 0) {
      setActiveAttackIcons([]);
      return;
    }

    // 检查是否有完整的进攻图标
    const matcher = new TacticalIconMatcher(playerField);
    const completeIcons = matcher.getCompleteIcons();
    const attackIcons = completeIcons.filter(icon => icon.type === 'attack');

    // 从激活的进攻图标找到对应的球员
    const iconsWithPlayers: CompleteAttackIcon[] = [];
    
    attackIcons.forEach((icon, index) => {
      // 检查图标的两个半场图标，找到对应的球员
      icon.halfIcons.forEach(halfIcon => {
        const { zone, card } = halfIcon;
        
        // 找到球员所在的具体位置
        const playerZone = playerField.find(z => z.zone === zone);
        if (playerZone) {
          const slot = playerZone.slots.find(s => s.athleteCard && s.athleteCard.id === card.id);
          if (slot) {
            const shotMarkers = slot.shotMarkers || 0;
            
            // 检查这个球员是否还有未使用的进攻机会
            // 这里简化处理，假设每个激活的进攻图标对应一次射门机会
            iconsWithPlayers.push({
              id: `icon-${index}-${halfIcon.zone}-${halfIcon.slot}`,
              centerX: icon.centerX,
              centerY: icon.centerY,
              zone: halfIcon.zone,
              position: slot.position,
              card: halfIcon.card,
              shotMarkers,
            });
          }
        }
      });
    });

    // 去重，确保每个球员只显示一次
    const uniqueIcons = iconsWithPlayers.filter((icon, index, self) => 
      index === self.findIndex((t) => t.zone === icon.zone && t.position === icon.position)
    );

    setActiveAttackIcons(uniqueIcons);
  }, [playerField]);

  const handleIconSelect = (zone: number, position: number) => {
    onSelectPlayer(zone, position);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-[#1a1a1a] p-8 rounded-3xl border border-red-500/50 max-w-6xl w-full shadow-[0_0_100px_rgba(239,68,68,0.3)] max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-black text-2xl">⚽</div>
            <h3 className="text-3xl font-['Russo_One'] text-white uppercase tracking-tighter">选择射门图标</h3>
            <button 
              onClick={onClose}
              className="ml-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="text-xl text-white">✕</span>
            </button>
          </div>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            选择场上激活的进攻图标进行射门。每个激活的图标代表一次射门机会。
          </p>

          {activeAttackIcons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {activeAttackIcons.map((icon, index) => (
                <motion.div
                  key={icon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-black/30 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-red-900/20 hover:border-red-500/30 transition-all"
                  onClick={() => handleIconSelect(icon.zone, icon.position)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white/60 text-sm font-medium">
                      区域 {icon.zone} | 位置 {icon.position}
                    </div>
                    <div className="bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1 flex items-center gap-2">
                      <span className="text-red-400 text-sm font-bold">⚽ 激活</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <AthleteCardComponent
                      card={icon.card}
                      size="medium"
                      faceDown={false}
                      variant="home"
                      disabled={false}
                      usedShotIcons={Array.from({ length: icon.shotMarkers }, (_, i) => i)}
                    />
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <div className="text-white/80 text-xs">
                      射门位置: X={Math.round(icon.centerX)}, Y={Math.round(icon.centerY)}
                    </div>
                  </div>

                  {/* 进攻指示器 */}
                  <div className="mt-4 flex justify-center">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">⚽</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">没有激活的进攻图标</div>
              <p className="text-gray-500">场上没有激活的进攻图标，请先激活进攻图标再射门。</p>
            </div>
          )}

          <button 
            onClick={onClose} 
            className="w-full py-4 bg-stone-900 hover:bg-stone-800 text-white/70 hover:text-white font-['Russo_One'] rounded-xl border border-white/5 hover:border-white/20 transition-all uppercase tracking-[0.2em] text-sm"
          >
            取消
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ShooterSelector;