import { Howl } from 'howler';

// Define sound types
export type SoundType = 'click' | 'draw' | 'flip' | 'whistle' | 'cheer' | 'goal' | 'error';

class AudioManager {
  private sounds: Record<SoundType, Howl>;
  private enabled: boolean = true;

  constructor() {
    this.sounds = {
      click: new Howl({ src: ['/audio/click.mp3'], volume: 0.5 }),
      draw: new Howl({ src: ['/audio/card_flip.mp3'], volume: 0.6 }), // reusing flip for draw
      flip: new Howl({ src: ['/audio/card_flip.mp3'], volume: 0.6 }),
      whistle: new Howl({ src: ['/audio/whistle.mp3'], volume: 0.8 }),
      cheer: new Howl({ src: ['/audio/cheer.mp3'], volume: 0.5 }),
      goal: new Howl({ src: ['/audio/goal.mp3'], volume: 1.0 }),
      error: new Howl({ src: ['/audio/whistle.mp3'], volume: 0.4 }), // Use a softer whistle for errors
    };
  }

  play(type: SoundType) {
    if (!this.enabled) return;
    
    // Simple fallback if file missing? Howler handles loading errors gracefully usually.
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
