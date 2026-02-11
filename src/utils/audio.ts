import { Howl, Howler } from 'howler';

// Define sound types
export type SoundType = 
  | 'click' | 'draw' | 'flip' | 'whistle' | 'cheer' | 'goal' | 'error' 
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
      click: new Howl({ src: [`${base}audio/click.wav`], volume: 0.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      draw: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.6, onloaderror: (id, err) => console.debug('Audio load error:', err) }), 
      flip: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.6, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      whistle: new Howl({ src: [`${base}audio/whistle.wav`], volume: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      cheer: new Howl({ src: [`${base}audio/cheer.wav`], volume: 0.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      goal: new Howl({ src: [`${base}audio/goal.wav`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      error: new Howl({ src: [`${base}audio/whistle.wav`], volume: 0.4, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      swosh: new Howl({ src: [`${base}audio/click.wav`], volume: 0.3, rate: 1.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      slide: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.3, rate: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      star_pulse: new Howl({ src: [`${base}audio/click.wav`], volume: 0.2, rate: 2.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      toss: new Howl({ src: [`${base}audio/click.wav`], volume: 0.6, rate: 0.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      ding: new Howl({ src: [`${base}audio/click.wav`], volume: 0.7, rate: 2.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      snap: new Howl({ src: [`${base}audio/click.wav`], volume: 0.8, rate: 1.2, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
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
      sound.play();
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
