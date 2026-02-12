import { useState, useEffect, useCallback } from 'react';
import { playSound as playSoundUtil } from '../utils/audio';

export const useGameAudio = () => {
  const [audioSettings, setAudioSettings] = useState(() => {
    const saved = localStorage.getItem('game_audio_settings');
    return saved ? JSON.parse(saved) : { music: true, sfx: true, volume: 0.5 };
  });

  const playSound = useCallback((soundName: string) => {
    if (audioSettings.sfx) {
      playSoundUtil(soundName);
    }
  }, [audioSettings.sfx]);

  const handleVolumeChange = (newVolume: number) => {
    const newSettings = { ...audioSettings, volume: newVolume };
    setAudioSettings(newSettings);
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('audioSettingsChanged'));
  };

  const toggleAudioSetting = (key: 'music' | 'sfx') => {
    const newSettings = { ...audioSettings, [key]: !audioSettings[key] };
    setAudioSettings(newSettings);
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('audioSettingsChanged'));
  };

  return {
    audioSettings,
    setAudioSettings,
    playSound,
    handleVolumeChange,
    toggleAudioSetting
  };
};
