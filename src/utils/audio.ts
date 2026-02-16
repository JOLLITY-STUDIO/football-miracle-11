import { Howl, Howler } from 'howler';

// Define sound types
export type SoundType = 
  | 'click' | 'draw' | 'flip' | 'whistle' | 'whistle_long' | 'cheer' | 'goal' | 'error' 
  | 'swosh' | 'slide' | 'star_pulse' | 'toss' | 'ding' | 'snap';

class AudioManager {
  private sounds: Record<SoundType, Howl>;
  private enabled: boolean = true;

  constructor() {
    const base = import.meta.env.BASE_URL;
    
    // Initialize master volume from localStorage
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
    Howler.volume(settings.volume ?? 0.5);

    this.sounds = {
      click: new Howl({ src: [`${base}audio/click.wav`], volume: 0.7, rate: 1.1, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      draw: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.8, rate: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }), 
      flip: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.8, rate: 1.2, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      whistle: new Howl({ src: [`${base}audio/whistle.wav`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      whistle_long: new Howl({ src: [`${base}audio/whistle.wav`], volume: 1.0, rate: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      cheer: new Howl({ src: [`${base}audio/cheer.wav`], volume: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      goal: new Howl({ src: [`${base}audio/goal.wav`], volume: 1.2, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      error: new Howl({ src: [`${base}audio/whistle.wav`], volume: 0.6, rate: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      swosh: new Howl({ src: [`${base}audio/click.wav`], volume: 0.5, rate: 1.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      slide: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.5, rate: 0.9, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      star_pulse: new Howl({ src: [`${base}audio/click.wav`], volume: 0.4, rate: 2.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      toss: new Howl({ src: [`${base}audio/click.wav`], volume: 0.8, rate: 0.6, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      ding: new Howl({ src: [`${base}audio/click.wav`], volume: 0.9, rate: 3.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      snap: new Howl({ src: [`${base}audio/click.wav`], volume: 1.0, rate: 1.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
    };

    // Listen for volume changes
    window.addEventListener('audioSettingsChanged', () => {
      const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
      Howler.volume(settings.volume ?? 0.5);
    });
  }

  play(type: SoundType) {
    if (!this.enabled) return;
    
    // Check global preference
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
    if (!settings.sfx) return;
    
    const sound = this.sounds[type];
    if (sound) {
      try {
        sound.play();
      } catch (error) {
        console.debug('Audio play failed:', error);
        // 尝试在用户交互后重新播放
        document.addEventListener('click', () => {
          try {
            sound.play();
          } catch (retryError) {
            console.debug('Audio retry failed:', retryError);
          }
        }, { once: true });
      }
    }
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
    // Persist to localStorage if needed, though usually GameBoard handles this
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
    const newSettings = { ...settings, sfx: enabled };
    localStorage.setItem('game_audio_settings', JSON.stringify(newSettings));
  }
}

export const audioManager = new AudioManager();

export const playSound = (type: SoundType) => {
  audioManager.play(type);
};

// Ambient sound types
export type AmbientType = 'crowd' | 'stadium' | 'rain' | 'wind';

// Ambient sound manager
class AmbientManager {
  private ambients: Record<AmbientType, Howl | null> = {
    crowd: null,
    stadium: null,
    rain: null,
    wind: null
  };
  private playing: Set<AmbientType> = new Set();
  private enabled: boolean = true;
  private volume: number = 0.3;

  constructor() {
    const base = import.meta.env.BASE_URL;
    
    // Initialize ambient sounds (using existing sounds as placeholders)
    this.ambients = {
      crowd: new Howl({ 
        src: [`${base}audio/cheer.wav`], 
        volume: this.volume, 
        loop: true,
        onloaderror: (id, err) => console.debug('Ambient load error:', err) 
      }),
      stadium: new Howl({ 
        src: [`${base}audio/whistle.wav`], 
        volume: this.volume * 0.5, 
        loop: true,
        onloaderror: (id, err) => console.debug('Ambient load error:', err) 
      }),
      rain: null, // Placeholder - no rain sound available
      wind: null  // Placeholder - no wind sound available
    };
  }

  play(type: AmbientType) {
    if (!this.enabled) return;
    const ambient = this.ambients[type];
    if (ambient && !this.playing.has(type)) {
      ambient.play();
      this.playing.add(type);
    }
  }

  stop(type: AmbientType) {
    const ambient = this.ambients[type];
    if (ambient) {
      ambient.stop();
      this.playing.delete(type);
    }
  }

  stopAll() {
    Object.keys(this.ambients).forEach(type => {
      this.stop(type as AmbientType);
    });
  }

  setVolume(volume: number) {
    this.volume = volume;
    Object.values(this.ambients).forEach(ambient => {
      if (ambient) {
        ambient.volume(volume);
      }
    });
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  isPlaying(type: AmbientType): boolean {
    return this.playing.has(type);
  }
}

const ambientManager = new AmbientManager();

// Export ambient functions
export const playAmbient = (type: AmbientType) => {
  ambientManager.play(type);
};

export const stopAmbient = (type: AmbientType) => {
  ambientManager.stop(type);
};

export const startMatchAmbience = () => {
  ambientManager.play('crowd');
  ambientManager.play('stadium');
};

export const stopMatchAmbience = () => {
  ambientManager.stopAll();
};

export const triggerCrowdReaction = () => {
  // Play a short crowd cheer
  playSound('cheer');
};

export const setAmbientVolume = (volume: number) => {
  ambientManager.setVolume(volume);
};

export const toggleAmbient = (enabled: boolean) => {
  ambientManager.toggle(enabled);
};
