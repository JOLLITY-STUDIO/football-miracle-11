/**
 * Web Audio API 音效合成�?
 * 用于生成基础音效，无需外部音频文件
 */

class AudioSynth {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.5;

  constructor() {
    // �?localStorage 读取设置
    const settings = JSON.parse(localStorage.getItem('game_audio_settings') || 
      '{"bgm":true,"sfx":true,"ambient":true,"volume":0.5}');
    this.volume = settings.volume ?? 0.5;
    this.enabled = settings.sfx !== false;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        console.warn('Web Audio API not supported');
        return null;
      }
    }
    // 如果音频上下文被暂停，尝试恢�?
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * 播放点击音效
   */
  playClick() {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.05);
  }

  /**
   * 播放清脆的提示音 (ding)
   */
  playDing() {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

    gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }

  /**
   * 播放快照音效 (snap)
   */
  playSnap() {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

    gainNode.gain.setValueAtTime(this.volume * 0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.08);
  }

  /**
   * 播放卡牌翻转音效
   */
  playFlip() {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  }

  /**
   * 播放哨声
   */
  playWhistle(duration: 'short' | 'long' = 'short') {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    const durationTime = duration === 'long' ? 0.8 : 0.3;
    
    // 哨声的频率变�?
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(1000, ctx.currentTime + durationTime * 0.3);
    oscillator.frequency.linearRampToValueAtTime(800, ctx.currentTime + durationTime);

    gainNode.gain.setValueAtTime(this.volume * 0.6, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, ctx.currentTime + durationTime * 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + durationTime);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + durationTime);
  }

  /**
   * 播放欢呼�?(使用噪声合成)
   */
  playCheer() {
    const ctx = this.getContext();
    if (!ctx) return;

    // 创建白噪�?
    const bufferSize = ctx.sampleRate * 0.5; // 0.5�?
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // 使用滤波器塑造声�?
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(ctx.currentTime);
  }

  /**
   * 播放进球音效 (欢呼 + 低频冲击)
   */
  playGoal() {
    const ctx = this.getContext();
    if (!ctx) return;

    // 欢呼�?
    this.playCheer();

    // 低频冲击
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(this.volume * 0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }

  /**
   * 播放错误/失败音效
   */
  playError() {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(this.volume * 0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  }

  /**
   * 播放观众"�?的惊讶声
   */
  playCrowdOoh() {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.4);
    oscillator.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.6);

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, ctx.currentTime + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.6);
  }

  /**
   * 播放掌声
   */
  playApplause() {
    const ctx = this.getContext();
    if (!ctx) return;

    // 创建多个短促的点击声模拟掌声
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);

        gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
      }, i * 50 + Math.random() * 30);
    }
  }

  /**
   * 播放嘘声
   */
  playBoo() {
    const ctx = this.getContext();
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(120, ctx.currentTime + 0.5);

    gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, ctx.currentTime + 0.4);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  }

  /**
   * 根据类型播放音效
   */
  play(type: string) {
    switch (type) {
      case 'click':
      case 'draw':
      case 'toss':
      case 'draft_pick':
        this.playClick();
        break;
      case 'ding':
        this.playDing();
        break;
      case 'snap':
        this.playSnap();
        break;
      case 'flip':
      case 'place_card':
      case 'discard':
      case 'synergy_draw':
        this.playFlip();
        break;
      case 'whistle':
      case 'whistle_short':
        this.playWhistle('short');
        break;
      case 'whistle_long':
      case 'whistle_double':
        this.playWhistle('long');
        break;
      case 'cheer':
        this.playCheer();
        break;
      case 'goal':
        this.playGoal();
        break;
      case 'error':
      case 'lose':
        this.playError();
        break;
      case 'crowd_ooh':
        this.playCrowdOoh();
        break;
      case 'crowd_applause':
      case 'win':
      case 'save':
        this.playApplause();
        break;
      case 'crowd_boo':
        this.playBoo();
        break;
      default:
        console.warn(`Unknown sound type: ${type}`);
        this.playClick();
    }
  }

  /**
   * 更新音量设置
   */
  setVolume(volume: number) {
    this.volume = volume;
  }

  /**
   * 启用/禁用音效
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}

// 导出单例
export const audioSynth = new AudioSynth();

