/**
 * Web Audio API プログラマティック環境音シンセサイザー
 * 外部音声ファイル0MB・通信ゼロで、リアルタイムノイズ合成による環境音を生成
 */

export type AmbientSoundType = 'rain' | 'waves' | 'campfire' | 'white_noise';

export interface SoundPreset {
  id: AmbientSoundType;
  label: string;
  description: string;
  iconName: string;
}

export const SOUND_PRESETS: SoundPreset[] = [
  {
    id: 'rain',
    label: 'Gentle Rain',
    description: '穏やかな雨音と遠くの雨足',
    iconName: 'CloudRain',
  },
  {
    id: 'waves',
    label: 'Ocean Waves',
    description: '寄せては返す静かな波の満ち引き',
    iconName: 'Waves',
  },
  {
    id: 'campfire',
    label: 'Campfire',
    description: '心地よく爆ぜる暖炉・焚き火の音',
    iconName: 'Flame',
  },
  {
    id: 'white_noise',
    label: 'Focus Noise',
    description: '集中力を高める柔らかなピンクノイズ',
    iconName: 'Wind',
  },
];

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentNodes: { stop: () => void }[] = [];
  private currentType: AmbientSoundType | null = null;
  private currentVolume: number = 0.5;

  private initContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getCurrentType(): AmbientSoundType | null {
    return this.currentType;
  }

  public setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  public stop(): void {
    if (this.masterGain && this.ctx) {
      // ポップノイズ防止のためのフェードアウト
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      setTimeout(() => {
        this.cleanupNodes();
        this.currentType = null;
      }, 150);
    } else {
      this.cleanupNodes();
      this.currentType = null;
    }
  }

  private cleanupNodes(): void {
    for (const node of this.currentNodes) {
      try {
        node.stop();
      } catch {
        // ignore
      }
    }
    this.currentNodes = [];
  }

  public play(type: AmbientSoundType, volume = this.currentVolume): void {
    const ctx = this.initContext();
    this.stop();

    this.currentType = type;
    this.currentVolume = volume;

    // マスターゲインの構築
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.2); // スムーズなフェードイン
    master.connect(ctx.destination);
    this.masterGain = master;

    switch (type) {
      case 'rain':
        this.startRain(ctx, master);
        break;
      case 'waves':
        this.startWaves(ctx, master);
        break;
      case 'campfire':
        this.startCampfire(ctx, master);
        break;
      case 'white_noise':
        this.startFocusNoise(ctx, master);
        break;
    }
  }

  /**
   * 柔らかな集中用ピンクノイズ
   */
  private startFocusNoise(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 2; // 2秒ループバッファ
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Paul Kellet の Pink Noise フィルタリング
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // まろやかにするためのローパスフィルター
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();

    this.currentNodes.push({
      stop: () => {
        source.stop();
        source.disconnect();
        filter.disconnect();
      },
    });
  }

  /**
   * 穏やかな雨音 (Rain)
   */
  private startRain(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 3;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // Brownian ノイズ + 高域のシマー
    let lastL = 0;
    let lastR = 0;
    for (let i = 0; i < bufferSize; i++) {
      const whiteL = Math.random() * 2 - 1;
      const whiteR = Math.random() * 2 - 1;
      lastL = (lastL + 0.02 * whiteL) / 1.02;
      lastR = (lastR + 0.02 * whiteR) / 1.02;
      left[i] = lastL * 3.5 + whiteL * 0.08;
      right[i] = lastR * 3.5 + whiteR * 0.08;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // 雨の雨滴感を演出するバンドパスフィルター
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();

    this.currentNodes.push({
      stop: () => {
        source.stop();
        source.disconnect();
        filter.disconnect();
      },
    });
  }

  /**
   * 寄せては返す波の音 (Ocean Waves)
   */
  private startWaves(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = Math.random() * 2 - 1;
      right[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    const waveGain = ctx.createGain();
    waveGain.gain.setValueAtTime(0.2, ctx.currentTime);

    // 波の満ち引きを再現する超低周波オシレーター (0.12Hz = 約8秒周期)
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, ctx.currentTime);

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

    // LFOで音量を周期変調
    lfo.connect(lfoGain);
    lfoGain.connect(waveGain.gain);

    // LFOでフィルターのカットオフ周波数も変調（波が砕ける時の高域変化）
    const filterMod = ctx.createGain();
    filterMod.gain.setValueAtTime(450, ctx.currentTime);
    lfo.connect(filterMod);
    filterMod.connect(filter.frequency);

    source.connect(filter);
    filter.connect(waveGain);
    waveGain.connect(destination);

    source.start();
    lfo.start();

    this.currentNodes.push({
      stop: () => {
        source.stop();
        lfo.stop();
        source.disconnect();
        lfo.disconnect();
        filter.disconnect();
        waveGain.disconnect();
      },
    });
  }

  /**
   * 暖炉・焚き火 (Campfire)
   */
  private startCampfire(ctx: AudioContext, destination: AudioNode): void {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // 炎のゴウという低周波ノイズ + ランダムなパチパチ音（クラックル）
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.05 * white) / 1.05;
      
      // ランダムに発生するパチッという火花ノイズ
      const crackle = Math.random() > 0.9994 ? (Math.random() * 2 - 1) * 3.5 : 0;
      data[i] = last * 1.5 + crackle;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    source.connect(filter);
    filter.connect(destination);
    source.start();

    this.currentNodes.push({
      stop: () => {
        source.stop();
        source.disconnect();
        filter.disconnect();
      },
    });
  }
}

export const ambientSynthesizer = new AmbientSynthesizer();
