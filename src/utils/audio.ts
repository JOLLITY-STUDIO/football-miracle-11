import { Howl, Howler } from 'howler';

// Add shuffle sound types
const shuffleSounds = [
  '339060-Playing_cards_-poker_-shuffle_-shuffling_cards_1.mp3',
  '339061-Playing_cards_-poker_-shuffle_-shuffling_cards_2.mp3',
  '339062-Playing_cards_-poker_-shuffle_-shuffling_cards_3.mp3',
  '339063-Playing_cards_-poker_-shuffle_-shuffling_cards_4.mp3'
];

// Add card placement sound types
const placementSounds = [
  '157272-MB-Card-Down-06.mp3',
  '157273-MB-Card-Down-05.mp3',
  '157274-MB-Card-Down-04.mp3'
];

// Add card pick sound types
const pickSounds = [
  '157240-MB-Card-Pick-12.mp3',
  '157241-MB-Card-Pick-11.mp3',
  '157242-MB-Card-Pick-10.mp3',
  '157243-MB-Card-Pick-09.mp3',
  '157244-MB-Card-Pick-08.mp3',
  '157245-MB-Card-Pick-07.mp3',
  '157246-MB-Card-Pick-06.mp3',
  '157247-MB-Card-Pick-05.mp3',
  '157248-MB-Card-Pick-04.mp3',
  '157249-MB-Card-Pick-03.mp3',
  '157250-MB-Card-Pick-02.mp3',
  '157251-MB-Card-Pick-01.mp3'
];

// Define sound types
export type SoundType = 
  | 'click' | 'draw' | 'flip' | 'whistle' | 'whistle_long' | 'cheer' | 'goal' | 'error' 
  | 'swosh' | 'slide' | 'star_pulse' | 'toss' | 'ding' | 'snap' | 'shuffle' | 'out' | 'deal' | 'pick' 
  | 'cash' | 'cut' | 'pop' | 'swipe';

class AudioManager {
  private sounds: Record<SoundType, Howl>;
  private enabled: boolean = true;

  constructor() {
    const base = import.meta.env.BASE_URL;
    
    // Initialize master volume from localStorage
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true,"volume":0.5}');
    Howler.volume(settings.volume ?? 0.5);

    // Get random shuffle sound
    const randomShuffleSound = shuffleSounds[Math.floor(Math.random() * shuffleSounds.length)];
    
    // Get random placement sound
    const randomPlacementSound = placementSounds[Math.floor(Math.random() * placementSounds.length)];
    
    // Get random pick sound
    const randomPickSound = pickSounds[Math.floor(Math.random() * pickSounds.length)];
    
    this.sounds = {
      click: new Howl({ src: [`${base}audio/click.wav`], volume: 0.7, rate: 1.1, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      draw: new Howl({ src: [`${base}audio/zapsplat_leisure_trading_card_or_playing_card_single_turn_over_on_table_002_68329.mp3`], volume: 0.8, rate: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }), 
      flip: new Howl({ src: [`${base}audio/zapsplat_leisure_trading_card_or_playing_card_single_turn_over_on_table_002_68329.mp3`], volume: 0.8, rate: 1.2, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      whistle: new Howl({ src: [`${base}audio/266786-referee_whistle_01.mp3`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      whistle_long: new Howl({ src: [`${base}audio/266787-referee_whistle_02.mp3`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      cheer: new Howl({ src: [`${base}audio/crowd-cheering.mp3`], volume: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      goal: new Howl({ src: [`${base}audio/storegraphic-crowd-cheers.mp3`], volume: 1.2, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      error: new Howl({ src: [`${base}audio/266788-referee_whistle_03.mp3`], volume: 0.6, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      swosh: new Howl({ src: [`${base}audio/click.wav`], volume: 0.5, rate: 1.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      slide: new Howl({ src: [`${base}audio/zapsplat_leisure_trading_card_or_playing_card_single_turn_over_on_table_002_68329.mp3`], volume: 0.5, rate: 0.9, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      star_pulse: new Howl({ src: [`${base}audio/click.wav`], volume: 0.4, rate: 2.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      toss: new Howl({ src: [`${base}audio/click.wav`], volume: 0.8, rate: 0.6, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      ding: new Howl({ src: [`${base}audio/click.wav`], volume: 0.9, rate: 3.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      snap: new Howl({ src: [`${base}audio/${randomPlacementSound}`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      out: new Howl({ src: [`${base}audio/出界的声音-可惜了.mp3`], volume: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      shuffle: new Howl({ src: [`${base}audio/${randomShuffleSound}`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      deal: new Howl({ src: [`${base}audio/339053-Playing_cards_-poker_-dealing_cards_-dealer_taking_cards_from_hand_and_putting_on_the_table_1.mp3`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      pick: new Howl({ src: [`${base}audio/${randomPickSound}`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      cash: new Howl({ src: [`${base}audio/1146281.audio-Designed-Misc-Cash_Register-Kaching-Mobile_Games_UI-01-VADI.mp3`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      cut: new Howl({ src: [`${base}audio/1146301.audio-Designed-Misc-Fruit_Cut-Mobile_Games_UI_04-VADI.mp3`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      pop: new Howl({ src: [`${base}audio/1146365.audio-Designed-Misc-Pop-Mobile_Games_UI_05-VADI.mp3`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      swipe: new Howl({ src: [`${base}audio/1146385.audio-Designed-Misc-Swipe-Metallic-Mobile_Games_UI-VADI.mp3`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
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
export type AmbientType = 'crowd' | 'stadium' | 'rain' | 'wind' | 'crowd_chant' | 'match';

// Ambient sound manager
class AmbientManager {
  private ambients: Record<AmbientType, Howl | null> = {
    crowd: null,
    stadium: null,
    rain: null,
    wind: null,
    crowd_chant: null,
    match: null
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
        loop: false,
        onloaderror: (id, err) => console.debug('Ambient load error:', err) 
      }),
      stadium: new Howl({ 
        src: [`${base}audio/whistle.wav`], 
        volume: this.volume * 0.5, 
        loop: false,
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

export const stopMatchAmbience = (fadeOutMs: number = 0) => {
  ambientManager.stopAll();
};

export const triggerCrowdReaction = (reaction: 'ooh' | 'applause' | 'boo' | 'cheer') => {
  // Play a short crowd cheer
  playSound('cheer');
};

export const setAmbientVolume = (volume: number) => {
  ambientManager.setVolume(volume);
};

export const toggleAmbient = (enabled: boolean) => {
  ambientManager.toggle(enabled);
};
