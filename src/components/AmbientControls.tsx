import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  playAmbient, 
  stopAmbient, 
  startMatchAmbience, 
  stopMatchAmbience,
  triggerCrowdReaction,
  type AmbientType 
} from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AmbientControls: React.FC<Props> = ({ isOpen, onClose }) => {
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [ambientVolume, setAmbientVolume] = useState(0.3);
  const [playingAmbients, setPlayingAmbients] = useState<Set<AmbientType>>(new Set());

  // �?localStorage 加载设置
  useEffect(() => {
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || 
      '{"ambient":true,"ambientVolume":0.3}');
    setAmbientEnabled(settings.ambient ?? true);
    setAmbientVolume(settings.ambientVolume ?? 0.3);
  }, []);

  // 保存设置�?localStorage
  const saveSettings = (enabled: boolean, volume: number) => {
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{}');
    settings.ambient = enabled;
    settings.ambientVolume = volume;
    localStorage.setItem('game_audio_settings', JSON.stringify(settings));
    
    // 触发设置变更事件
    window.dispatchEvent(new Event('audioSettingsChanged'));
  };

  const toggleAmbient = () => {
    const newEnabled = !ambientEnabled;
    setAmbientEnabled(newEnabled);
    saveSettings(newEnabled, ambientVolume);
    
    if (!newEnabled) {
      stopMatchAmbience();
      setPlayingAmbients(new Set());
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setAmbientVolume(newVolume);
    saveSettings(ambientEnabled, newVolume);
  };

  const toggleSpecificAmbient = (type: AmbientType) => {
    if (playingAmbients.has(type)) {
      stopAmbient(type);
      setPlayingAmbients(prev => {
        const newSet = new Set(prev);
        newSet.delete(type);
        return newSet;
      });
    } else {
      playAmbient(type);
      setPlayingAmbients(prev => new Set(prev).add(type));
    }
  };

  const testCrowdReaction = (reaction: 'ooh' | 'applause' | 'boo' | 'cheer') => {
    triggerCrowdReaction(reaction);
  };

  const ambientTypes: { type: AmbientType; label: string; icon: string }[] = [
    { type: 'stadium', label: '球场氛围', icon: '🏟️' },
    { type: 'crowd', label: '观众噪音', icon: '👥' },
    { type: 'crowd_chant', label: '球迷歌唱', icon: '🎵' },
    { type: 'match', label: '比赛环境', icon: '⚽' },
    { type: 'wind', label: '风声', icon: '🌬️' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* 控制面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[400px] bg-stone-900/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
          >
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔊</span>
                <h2 className="text-lg font-bold text-white">环境音控</h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 内容区域 */}
            <div className="p-4 space-y-6">
              {/* 主开关 */}
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${ambientEnabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {ambientEnabled ? '🔊' : '🔇'}
                  </div>
                  <div>
                    <div className="text-white font-medium">环境音</div>
                    <div className="text-xs text-white/50">{ambientEnabled ? '已开启' : '已关闭'}</div>
                  </div>
                </div>
                <button
                  onClick={toggleAmbient}
                  className={`w-14 h-7 rounded-full relative transition-colors ${ambientEnabled ? 'bg-green-500' : 'bg-stone-600'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${ambientEnabled ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* 音量控制 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">音量</span>
                  <span className="text-sm text-white/50">{Math.round(ambientVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={handleVolumeChange}
                  disabled={!ambientEnabled}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-green-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                />
              </div>

              {/* 单独环境音控�?*/}
              <div className="space-y-2">
                <div className="text-sm text-white/70 mb-2">独立控制</div>
                <div className="grid grid-cols-2 gap-2">
                  {ambientTypes.map(({ type, label, icon }) => (
                    <button
                      key={type}
                      onClick={() => toggleSpecificAmbient(type)}
                      disabled={!ambientEnabled}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        playingAmbients.has(type)
                          ? 'bg-green-500/20 border-green-500/50 text-green-400'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 快速操作 */}
              <div className="space-y-2">
                <div className="text-sm text-white/70 mb-2">快速操作</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startMatchAmbience()}
                    disabled={!ambientEnabled}
                    className="flex-1 py-2 px-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    启动比赛氛围
                  </button>
                  <button
                    onClick={() => stopMatchAmbience()}
                    disabled={!ambientEnabled}
                    className="flex-1 py-2 px-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    停止所有氛围
                  </button>
                </div>
              </div>

              {/* 观众反应测试 */}
              <div className="space-y-2">
                <div className="text-sm text-white/70 mb-2">观众反应测试</div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => testCrowdReaction('cheer')}
                    className="py-2 px-1 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-400 text-xs font-medium hover:bg-yellow-500/30 transition-colors"
                  >
                    🎉 欢呼
                  </button>
                  <button
                    onClick={() => testCrowdReaction('applause')}
                    className="py-2 px-1 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 text-xs font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    👏 掌声
                  </button>
                  <button
                    onClick={() => testCrowdReaction('ooh')}
                    className="py-2 px-1 bg-purple-500/20 border border-purple-500/30 rounded-xl text-purple-400 text-xs font-medium hover:bg-purple-500/30 transition-colors"
                  >
                    😮 惊讶
                  </button>
                  <button
                    onClick={() => testCrowdReaction('boo')}
                    className="py-2 px-1 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs font-medium hover:bg-red-500/30 transition-colors"
                  >
                    👎 嘘声
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AmbientControls;

