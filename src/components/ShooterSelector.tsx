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

export const ShooterSelector: React.FC<ShooterSelectorProps> = ({
  playerField,
  isOpen,
  onClose,
  onSelectPlayer,
}) => {
  // 收集所有有进攻图标的球员
  const [shootablePlayers, setShootablePlayers] = useState<Array<{
    zone: number;
    position: number;
    card: any;
    attackCount: number;
    shotMarkers: number;
  }>>([]);

  useEffect(() => {
    if (!playerField || playerField.length === 0) {
      setShootablePlayers([]);
      return;
    }

    // 检查是否有完整的进攻图标
    const matcher = new TacticalIconMatcher(playerField);
    const completeIcons = matcher.getCompleteIcons();
    const hasCompleteAttackIcons = completeIcons.some(icon => icon.type === 'attack');

    // 如果没有完整的进攻图标，不显示任何可射门的球员
    if (!hasCompleteAttackIcons) {
      setShootablePlayers([]);
      return;
    }

    const players: Array<{
      zone: number;
      position: number;
      card: any;
      attackCount: number;
      shotMarkers: number;
    }> = [];

    playerField.forEach((zone) => {
      zone.slots.forEach((slot) => {
        if (slot.athleteCard) {
          const attackCount = slot.athleteCard.icons.filter((icon: string) => icon === 'attack').length;
          const shotMarkers = slot.shotMarkers || 0;
          
          if (attackCount > shotMarkers) {
            players.push({
              zone: zone.zone,
              position: slot.position,
              card: slot.athleteCard,
              attackCount,
              shotMarkers,
            });
          }
        }
      });
    });

    setShootablePlayers(players);
  }, [playerField]);

  const handlePlayerSelect = (zone: number, position: number) => {
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
            <h3 className="text-3xl font-['Russo_One'] text-white uppercase tracking-tighter">选择射门球员</h3>
            <button 
              onClick={onClose}
              className="ml-auto w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <span className="text-xl text-white">✕</span>
            </button>
          </div>
          
          <p className="text-gray-300 mb-8 leading-relaxed">
            选择拥有进攻图标的球员进行射门。球员的进攻次数减去已使用的射门标记数等于可用射门次数。
          </p>

          {shootablePlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {shootablePlayers.map((player, index) => (
                <motion.div
                  key={`${player.zone}-${player.position}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  className="bg-black/30 border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-red-900/20 hover:border-red-500/30 transition-all"
                  onClick={() => handlePlayerSelect(player.zone, player.position)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-white/60 text-sm font-medium">
                      区域 {player.zone} | 位置 {player.position}
                    </div>
                    <div className="bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1 flex items-center gap-2">
                      <span className="text-red-400 text-sm font-bold">进攻: {player.attackCount - player.shotMarkers}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <AthleteCardComponent
                      card={player.card}
                      size="medium"
                      faceDown={false}
                      variant="home"
                      disabled={false}
                      usedShotIcons={Array.from({ length: player.shotMarkers }, (_, i) => i)}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-white/80 text-xs">
                      进攻图标: {player.attackCount}
                    </div>
                    <div className="text-white/60 text-xs">
                      已用标记: {player.shotMarkers}
                    </div>
                  </div>

                  {/* 进攻指示器 */}
                  <div className="mt-4 flex justify-center">
                    {Array.from({ length: player.attackCount - player.shotMarkers }).map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-red-500 mx-1" />
                    ))}
                    {Array.from({ length: player.shotMarkers }).map((_, i) => (
                      <div key={`used-${i}`} className="w-3 h-3 rounded-full bg-gray-600 mx-1" />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-xl mb-4">没有可射门的球员</div>
              <p className="text-gray-500">场上所有球员的进攻图标已经用完，请等待下一回合。</p>
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