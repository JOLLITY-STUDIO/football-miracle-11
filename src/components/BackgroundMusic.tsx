import React, { useState, useEffect, useRef, useCallback } from 'react';

// Use Vite's import.meta.glob to auto-load music files from public/bgm/
// This runs at build time. Adding files requires a dev server restart.
const bgmModules = import.meta.glob('/public/bgm/*.{mp3,wav,ogg,m4a}', { eager: true });

const AUTO_PLAYLIST = Object.keys(bgmModules).map(path => {
  // path is like "/public/bgm/filename.mp3"
  const filename = path.split('/').pop();
  return filename || '';
}).filter(name => name !== '');

const PLAYLIST = AUTO_PLAYLIST.length > 0 ? AUTO_PLAYLIST : [
  'Give_Me_Hope_-_Modern_Pitch.mp3',
];

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
  useEffect(() => {
    const syncSettings = () => {
      const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
      setIsBgmEnabled(settings.bgm);
      if (typeof settings.volume === 'number') {
        // Map 0-1 global volume to 0-0.4 BGM relative volume (so it's not too loud)
        setVolume(settings.volume * 0.4);
      }
    };
    syncSettings();
    window.addEventListener('storage', syncSettings);
    window.addEventListener('audioSettingsChanged', syncSettings);
    return () => {
      window.removeEventListener('storage', syncSettings);
      window.removeEventListener('audioSettingsChanged', syncSettings);
    };
  }, []);

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
  const pickRandomTrack = useCallback((exclude?: string) => {
    if (PLAYLIST.length === 0) return '';
    if (PLAYLIST.length === 1) return PLAYLIST[0];
    
    let availableTracks = PLAYLIST;
    if (exclude) {
      availableTracks = PLAYLIST.filter(track => track !== exclude);
    }
    
    const randomIndex = Math.floor(Math.random() * availableTracks.length);
    return availableTracks[randomIndex];
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

  // Handle first user interaction to resume audio if blocked
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (isBgmEnabled && !isPlaying && audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
          })
          .catch(() => {
            // Still blocked or other error
          });
      }
    };

    if (isBgmEnabled && !isPlaying) {
      window.addEventListener('click', handleFirstInteraction);
      window.addEventListener('keydown', handleFirstInteraction);
      window.addEventListener('touchstart', handleFirstInteraction);
    }

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [isBgmEnabled, isPlaying]);

  useEffect(() => {
    // Play when track changes
    const startPlayback = async () => {
      if (currentTrack && audioRef.current && isBgmEnabled) {
        const base = import.meta.env.BASE_URL;
        const trackPath = `${base}bgm/${encodeURIComponent(currentTrack)}`;
        audioRef.current.src = trackPath;
        audioRef.current.volume = volume;
        
        try {
          playPromiseRef.current = audioRef.current.play();
          await playPromiseRef.current;
          setIsPlaying(true);
        } catch (err: any) {
          if (err.name === 'NotAllowedError') {
            console.log("Autoplay blocked. User interaction required.");
          } else if (err.name === 'AbortError') {
            console.debug("Playback aborted (interrupted by source change or pause)");
          } else {
            console.warn("Playback failed:", err);
          }
          setIsPlaying(false);
        } finally {
          playPromiseRef.current = null;
        }
      }
    };

    startPlayback();
  }, [currentTrack, isBgmEnabled, volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      const newBgmEnabled = !isPlaying;
      
      // Update global settings
      const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
      const newSettings = { ...settings, bgm: newBgmEnabled };
      localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
      window.dispatchEvent(new Event('audioSettingsChanged'));

      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const base = import.meta.env.BASE_URL;
        if (!audioRef.current.src || audioRef.current.src === window.location.href) {
            // If no source is set yet, set it
            if (currentTrack) {
                audioRef.current.src = `${base}bgm/${encodeURIComponent(currentTrack)}`;
            } else if (PLAYLIST.length > 0) {
                const track = pickRandomTrack();
                setCurrentTrack(track);
                audioRef.current.src = `${base}bgm/${encodeURIComponent(track)}`;
            }
        }
        audioRef.current.play().catch(e => console.error("Play failed", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    // Update global settings - map relative BGM volume back to 0-1 global volume
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
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
                ⏭
            </button>
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
            ⏭
        </button>
      </div>
    </div>
  );
};
