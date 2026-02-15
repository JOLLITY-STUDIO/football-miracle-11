import React, { useState, useEffect, useRef, useCallback } from 'react';

// Default BGM playlist
const PLAYLIST: string[] = [
  'Give_Me_Hope_-_Modern_Pitch.mp3',
  'Answer_-_Square_a_Saw.mp3',
  'Around_The_Corner_-_Infraction.mp3',
  'Boys,_Girls,_Toys_&_Words_-_Modern_Pitch.mp3',
  'These_Nights_-_Modern_Pitch.mp3',
];

// Function to get a safe track name
const getSafeTrack = (track: string): string => {
  // List of known working tracks
  const safeTracks = PLAYLIST;
  if (safeTracks.includes(track)) {
    return track;
  }
  return safeTracks[0] || 'Give_Me_Hope_-_Modern_Pitch.mp3';
};

// Track failed attempts to prevent infinite loops
const failedTracks = new Set<string>();

interface Props {
  variant?: 'default' | 'game';
}

export const BackgroundMusic: React.FC<Props> = ({ variant = 'default' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.2);
  const [currentTrack, setCurrentTrack] = useState<string>('');
  const [isBgmEnabled, setIsBgmEnabled] = useState(() => {
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
    return settings.bgm;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Sync volume with global settings
  const syncAudioSettings = useCallback(() => {
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
    setIsBgmEnabled(settings.bgm);
    if (typeof settings.volume === 'number') {
      setVolume(settings.volume * 0.4);
    }
    return settings;
  }, []);

  useEffect(() => {
    syncAudioSettings();
    window.addEventListener('storage', syncAudioSettings);
    window.addEventListener('audioSettingsChanged', syncAudioSettings);
    return () => {
      window.removeEventListener('storage', syncAudioSettings);
      window.removeEventListener('audioSettingsChanged', syncAudioSettings);
    };
  }, [syncAudioSettings]);

  // Handle BGM enable/disable
  useEffect(() => {
    const handlePlay = async () => {
      if (!audioRef.current) return;

      if (!isBgmEnabled && isPlaying) {
        // Wait for any pending play to finish before pausing
        if (playPromiseRef.current) {
          try {
            await playPromiseRef.current;
          } catch (e) {
            // Ignore play errors when we're about to pause
          }
        }
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (isBgmEnabled && !isPlaying && currentTrack) {
        try {
          playPromiseRef.current = audioRef.current.play();
          await playPromiseRef.current;
          setIsPlaying(true);
        } catch (e) {
          console.debug("BGM auto-resume failed", e);
          setIsPlaying(false);
        } finally {
          playPromiseRef.current = null;
        }
      }
    };

    handlePlay();
  }, [isBgmEnabled, currentTrack, isPlaying]);

  // Pick a random track that is different from the current one (unless there's only 1)
  const pickRandomTrack = useCallback((exclude?: string): string => {
    if (PLAYLIST.length === 0) return '';
    
    let availableTracks = PLAYLIST.filter(track => !failedTracks.has(track));
    if (exclude) {
      availableTracks = availableTracks.filter(track => track !== exclude);
    }
    
    if (availableTracks.length === 0) {
      // All tracks failed, reset and try first track
      failedTracks.clear();
      return PLAYLIST[0] || '';
    }
    
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    return availableTracks[randomIndex] ?? '';
  }, []);

  const playNextTrack = useCallback(() => {
    const nextTrack = pickRandomTrack(currentTrack);
    setCurrentTrack(nextTrack);
    // The useEffect listening to currentTrack will trigger the play
  }, [currentTrack, pickRandomTrack]);

  useEffect(() => {
    // Initial track selection
    if (!currentTrack && PLAYLIST.length > 0) {
      setCurrentTrack(pickRandomTrack());
    }
  }, [pickRandomTrack, currentTrack]);

  // Unified user interaction handler for autoplay
  useEffect(() => {
    const handleUserInteraction = () => {
      if (isBgmEnabled && !isPlaying && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((e: any) => {
            console.log("Autoplay blocked, user interaction required:", e.name);
            // Don't log for NotAllowedError as it's expected behavior
            if (e.name !== 'NotAllowedError') {
              console.warn("Playback failed:", e);
            }
          });
      }
    };

    if (isBgmEnabled && !isPlaying) {
      window.addEventListener('click', handleUserInteraction);
      window.addEventListener('keydown', handleUserInteraction);
      window.addEventListener('touchstart', handleUserInteraction);
    }

    return () => {
      window.removeEventListener('click', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isBgmEnabled, isPlaying]);

  // Play when track changes
  useEffect(() => {
    const startPlayback = async () => {
      if (currentTrack && audioRef.current && isBgmEnabled) {
        const base = import.meta.env.BASE_URL;
        const safeTrack = getSafeTrack(currentTrack);
        const trackPath = `${base}bgm/${encodeURIComponent(safeTrack)}`;
        audioRef.current.src = trackPath;
        audioRef.current.volume = volume;
        
        try {
          playPromiseRef.current = audioRef.current.play();
          await playPromiseRef.current;
          setIsPlaying(true);
          // Clear failed track on successful playback
          if (currentTrack) {
            failedTracks.delete(currentTrack);
          }
        } catch (err: any) {
          console.error("Playback failed:", err);
          
          // Provide more detailed error information
          switch (err.name) {
            case 'NotAllowedError':
              console.log("Autoplay blocked. User interaction required.");
              break;
            case 'AbortError':
              console.debug("Playback aborted (interrupted by source change or pause)");
              break;
            case 'NotSupportedError':
              console.warn("Audio format not supported:", err.message);
              // Mark current track as failed
              if (currentTrack) {
                failedTracks.add(currentTrack);
              }
              // Try next track on format error
              setTimeout(() => {
                const nextTrack = pickRandomTrack(currentTrack);
                if (nextTrack && !failedTracks.has(nextTrack)) {
                  setCurrentTrack(nextTrack);
                }
              }, 1000);
              break;
            default:
              console.warn("Unexpected playback error:", err);
          }
          setIsPlaying(false);
        } finally {
          playPromiseRef.current = null;
        }
      }
    };

    startPlayback();
  }, [currentTrack, isBgmEnabled, volume, playNextTrack]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    const newBgmEnabled = !isPlaying;
    
    // Update global settings
    const settings = syncAudioSettings();
    const newSettings = { ...settings, bgm: newBgmEnabled };
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('audioSettingsChanged'));

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      const base = import.meta.env.BASE_URL;
      const sourceUrl = audioRef.current.src;
      
      // Only set source if not already set or if it's the default
      if (!sourceUrl || sourceUrl === window.location.href) {
        if (currentTrack) {
          const safeTrack = getSafeTrack(currentTrack);
          audioRef.current.src = `${base}bgm/${encodeURIComponent(safeTrack)}`;
        } else if (PLAYLIST.length > 0) {
          const track = pickRandomTrack();
          const safeTrack = getSafeTrack(track);
          setCurrentTrack(safeTrack);
          audioRef.current.src = `${base}bgm/${encodeURIComponent(safeTrack)}`;
        }
      }
      
      audioRef.current.play().catch(e => {
        console.error("Play failed", e);
        // Try next track on error
        if (PLAYLIST.length > 1) {
          setTimeout(playNextTrack, 1000);
        }
        // Don't update playing state on error
        return;
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Update global settings - map relative BGM volume back to 0-1 global volume
    const settings = syncAudioSettings();
    const globalVolume = newVolume / 0.4;
    const newSettings = { ...settings, volume: globalVolume };
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
    window.dispatchEvent(new Event('audioSettingsChanged'));
  };

  if (variant === 'game') {
    return (
      <div className="flex items-center gap-2 bg-stone-900/80 backdrop-blur-md p-2 rounded-2xl border border-stone-700 shadow-lg text-white pointer-events-auto">
        <audio ref={audioRef} onEnded={playNextTrack} loop={true} />
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 px-2">
            <button 
              onClick={togglePlay}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-lg"
            >
              {isPlaying ? '📻' : '🔇'}
            </button>
            {isPlaying && currentTrack && (
               <div className="max-w-[80px] overflow-hidden text-[10px] text-stone-400 whitespace-nowrap">
                 <div className="animate-marquee inline-block">
                   {currentTrack.replace(/_/g, ' ').replace('.mp3', '')}
                 </div>
               </div>
            )}
            <button 
                onClick={playNextTrack}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[10px]"
            >
                �?            </button>
          </div>
          <div className="px-2">
            <input 
              type="range" 
              min="0" 
              max="0.4" 
              step="0.01" 
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-24 h-1 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-stone-900/80 backdrop-blur-md p-2 rounded-full border border-stone-700 shadow-lg text-white transition-opacity hover:opacity-100 opacity-60">
      <audio 
        ref={audioRef} 
        onEnded={playNextTrack}
        loop={true}
        onError={(e) => {
          console.warn(`Audio playback error for track ${currentTrack}`, e);
          // Try next track on error
          if (isPlaying) {
              setTimeout(playNextTrack, 1000); 
          }
        }}
      />
      
      <div className="flex items-center gap-2 px-2 flex-row-reverse">
        <button 
          onClick={togglePlay}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-lg"
          title={isPlaying ? "Pause Music" : "Play Music"}
        >
          {isPlaying ? '🔊' : '🔇'}
        </button>
        
        {/* Track Info (Scrollable if long) */}
        {isPlaying && currentTrack && (
           <div className="max-w-[100px] overflow-hidden text-xs text-stone-300 whitespace-nowrap">
             <div className="animate-marquee inline-block">
               {currentTrack.replace(/_/g, ' ').replace('.mp3', '')}
             </div>
           </div>
        )}

        <input 
          type="range" 
          min="0" 
          max="0.4" 
          step="0.01" 
          value={volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="w-20 h-1 bg-stone-600 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-400"
          title={`Volume: ${Math.round((volume / 0.4) * 100)}%`}
        />
        
        <button 
            onClick={playNextTrack}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[10px] text-stone-400 hover:text-white transition-colors"
            title="Next Track (Random)"
        >
            ⏭️
        </button>
      </div>
    </div>
  );
};

