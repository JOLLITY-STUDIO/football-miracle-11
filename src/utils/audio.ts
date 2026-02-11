import { Howl } from 'howler';

// Define sound types
export type SoundType = 'click' | 'draw' | 'flip' | 'whistle' | 'cheer' | 'goal' | 'error';

class AudioManager {
  private sounds: Record<SoundType, Howl>;
  private enabled: boolean = true;

  constructor() {
    const base = import.meta.env.BASE_URL;
    this.sounds = {
      click: new Howl({ src: [`${base}audio/click.wav`], volume: 0.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      draw: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.6, onloaderror: (id, err) => console.debug('Audio load error:', err) }), 
      flip: new Howl({ src: [`${base}audio/card_flip.wav`], volume: 0.6, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      whistle: new Howl({ src: [`${base}audio/whistle.wav`], volume: 0.8, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      cheer: new Howl({ src: [`${base}audio/cheer.wav`], volume: 0.5, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      goal: new Howl({ src: [`${base}audio/goal.wav`], volume: 1.0, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
      error: new Howl({ src: [`${base}audio/whistle.wav`], volume: 0.4, onloaderror: (id, err) => console.debug('Audio load error:', err) }),
    };
  }

  play(type: SoundType) {
    if (!this.enabled) return;
    
    // Check global preference
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || '{"bgm":true,"sfx":true}');
    if (!settings.sfx) return;
    
    this.sounds[type].play();
  }

  toggle(enabled: boolean) {
    this.enabled = enabled;
  }
}

export const audioManager = new AudioManager();

export const playSound = (type: SoundType) => {
  audioManager.play(type);
};
