/**
 * Web Audio API プログラマティック環境音シンセサイザー
 * リアルタイムノイズ・オシレーター合成による環境音生成モジュール
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
    description: 'Calming rain and distant showers',
    iconName: 'CloudRain',
  },
  {
    id: 'waves',
    label: 'Ocean Waves',
    description: 'Rhythmic ebb and flow of ocean tides',
    iconName: 'Waves',
  },
  {
    id: 'campfire',
    label: 'Campfire',
    description: 'Warm firewood and crackling embers',
    iconName: 'Flame',
  },
  {
    id: 'white_noise',
    label: 'Focus Noise',
    description: 'Gentle pink noise for deep concentration',
    iconName: 'Wind',
  },
];

interface SoundNode {
  stop: () => void;
}

interface AudioSession {
  type: AmbientSoundType;
  masterGain: GainNode;
  nodes: SoundNode[];
}

class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private activeSession: AudioSession | null = null;
  private fadeOutTimer: number | null = null;
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
    return this.activeSession?.type ?? null;
  }

  public setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.activeSession && this.ctx) {
      this.activeSession.masterGain.gain.setTargetAtTime(this.currentVolume, this.ctx.currentTime, 0.05);
    }
  }

  public stop(): void {
    if (this.fadeOutTimer !== null) {
      window.clearTimeout(this.fadeOutTimer);
      this.fadeOutTimer = null;
    }

    if (!this.activeSession || !this.ctx) {
      return;
    }

    const sessionToStop = this.activeSession;
    this.activeSession = null;

    // ポップノイズ防止のためのフェードアウト
    sessionToStop.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);

    this.fadeOutTimer = window.setTimeout(() => {
      this.cleanupSession(sessionToStop);
      this.fadeOutTimer = null;
    }, 120);
  }

  private cleanupSession(session: AudioSession): void {
    for (const node of session.nodes) {
      try {
        node.stop();
      } catch {
        // ignore
      }
    }
    try {
      session.masterGain.disconnect();
    } catch {
      // ignore
    }
  }

  public play(type: AmbientSoundType, volume = this.currentVolume): void {
    const ctx = this.initContext();

    if (this.fadeOutTimer !== null) {
      window.clearTimeout(this.fadeOutTimer);
      this.fadeOutTimer = null;
    }

    // 既存セッションを安全にフェードアウト・破棄
    if (this.activeSession) {
      const prevSession = this.activeSession;
      this.activeSession = null;
      prevSession.masterGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
      setTimeout(() => {
        this.cleanupSession(prevSession);
      }, 80);
    }

    this.currentVolume = volume;

    // マスターゲインの構築
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, ctx.currentTime);
    master.gain.setTargetAtTime(volume, ctx.currentTime, 0.15); // スムーズなフェードイン
    master.connect(ctx.destination);

    const newSession: AudioSession = {
      type,
      masterGain: master,
      nodes: [],
    };
    this.activeSession = newSession;

    switch (type) {
      case 'rain':
        this.startRain(ctx, master, newSession);
        break;
      case 'waves':
        this.startWaves(ctx, master, newSession);
        break;
      case 'campfire':
        this.startCampfire(ctx, master, newSession);
        break;
      case 'white_noise':
        this.startFocusNoise(ctx, master, newSession);
        break;
    }
  }

  /**
   * ループ再生用 AudioBufferSourceNode の生成とセッション登録
   */
  private createLoopSource(ctx: AudioContext, buffer: AudioBuffer, session: AudioSession): AudioBufferSourceNode {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    session.nodes.push({
      stop: () => {
        try {
          source.stop();
        } catch {
          // ignore
        }
        try {
          source.disconnect();
        } catch {
          // ignore
        }
      },
    });
    return source;
  }

  /**
   * LFOオシレーターの生成とセッション登録
   */
  private createLFO(ctx: AudioContext, frequency: number, session: AudioSession): OscillatorNode {
    const lfo = ctx.createOscillator();
    lfo.frequency.setValueAtTime(frequency, ctx.currentTime);
    session.nodes.push({
      stop: () => {
        try {
          lfo.stop();
        } catch {
          // ignore
        }
        try {
          lfo.disconnect();
        } catch {
          // ignore
        }
      },
    });
    return lfo;
  }

  /**
   * 柔らかな集中用ピンクノイズ (左右完全独立ステレオ + ウォームな低域ブレンド)
   */
  private startFocusNoise(ctx: AudioContext, destination: AudioNode, session: AudioSession): void {
    const bufferSize = ctx.sampleRate * 4; // 4秒ループバッファ
    const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    // 左右完全独立のピンクノイズ生成 (Paul Kellet アルゴリズム)
    fillPinkNoise(left);
    fillPinkNoise(right);

    // 低域の温かみを加えるためのブラウンノイズブレンド (25%)
    const brownL = new Float32Array(bufferSize);
    const brownR = new Float32Array(bufferSize);
    fillBrownNoise(brownL);
    fillBrownNoise(brownR);

    for (let i = 0; i < bufferSize; i++) {
      left[i] = left[i] * 0.75 + brownL[i] * 0.25;
      right[i] = right[i] * 0.75 + brownR[i] * 0.25;
    }

    const source = this.createLoopSource(ctx, buffer, session);

    // 耳に優しいロールオフフィルター (聴覚疲労を抑える自然なカーブ)
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(2800, ctx.currentTime);

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(45, ctx.currentTime);

    source.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(destination);
    source.start();

    session.nodes.push({
      stop: () => {
        try {
          lowpass.disconnect();
          highpass.disconnect();
        } catch {
          // ignore
        }
      },
    });
  }

  /**
   * 穏やかな雨音 (マルチレイヤー: 遠景の雨脚ゆらぎ + 低域の反響 + 前景の立体水滴)
   */
  private startRain(ctx: AudioContext, destination: AudioNode, session: AudioSession): void {
    // --- Layer 1: 遠景の雨シート (Rain Sheet) ---
    const sheetBufferSize = Math.floor(ctx.sampleRate * 4.1);
    const sheetBuffer = ctx.createBuffer(2, sheetBufferSize, ctx.sampleRate);
    const sheetL = sheetBuffer.getChannelData(0);
    const sheetR = sheetBuffer.getChannelData(1);

    fillPinkNoise(sheetL);
    fillPinkNoise(sheetR);

    const sheetSource = this.createLoopSource(ctx, sheetBuffer, session);
    const sheetFilter = ctx.createBiquadFilter();
    sheetFilter.type = 'lowpass';
    sheetFilter.frequency.setValueAtTime(1500, ctx.currentTime);

    const sheetGain = ctx.createGain();
    sheetGain.gain.setValueAtTime(0.5, ctx.currentTime);

    // 雨脚の強弱を再現する超低周波LFO (0.04Hz = 約25秒周期)
    const rainLfo = this.createLFO(ctx, 0.04, session);
    const rainLfoGain = ctx.createGain();
    rainLfoGain.gain.setValueAtTime(0.15, ctx.currentTime);
    rainLfo.connect(rainLfoGain);
    rainLfoGain.connect(sheetGain.gain);

    sheetSource.connect(sheetFilter);
    sheetFilter.connect(sheetGain);
    sheetGain.connect(destination);
    sheetSource.start();
    rainLfo.start();

    // --- Layer 2: 地面を打つ低中域の反響 (Ground Impact) ---
    const groundBufferSize = Math.floor(ctx.sampleRate * 3.7);
    const groundBuffer = ctx.createBuffer(1, groundBufferSize, ctx.sampleRate);
    fillBrownNoise(groundBuffer.getChannelData(0));

    const groundSource = this.createLoopSource(ctx, groundBuffer, session);
    const groundFilter = ctx.createBiquadFilter();
    groundFilter.type = 'lowpass';
    groundFilter.frequency.setValueAtTime(450, ctx.currentTime);

    const groundGain = ctx.createGain();
    groundGain.gain.setValueAtTime(0.25, ctx.currentTime);

    groundSource.connect(groundFilter);
    groundFilter.connect(groundGain);
    groundGain.connect(destination);
    groundSource.start();

    // --- Layer 3: 前景の水滴・雨粒 (Near Droplets) ---
    // 左右で異なる素数秒長（2.9秒と3.7秒）にすることで、ポリリズムによる永遠に非周期の水滴パターンを生成
    const dropsBufferL = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 2.9), ctx.sampleRate);
    const dropsBufferR = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 3.7), ctx.sampleRate);
    fillRainDroplets(dropsBufferL.getChannelData(0), ctx.sampleRate, 4.5);
    fillRainDroplets(dropsBufferR.getChannelData(0), ctx.sampleRate, 4.0);

    const dropsSourceL = this.createLoopSource(ctx, dropsBufferL, session);
    const dropsSourceR = this.createLoopSource(ctx, dropsBufferR, session);

    const dropsFilter = ctx.createBiquadFilter();
    dropsFilter.type = 'bandpass';
    dropsFilter.frequency.setValueAtTime(2100, ctx.currentTime);
    dropsFilter.Q.setValueAtTime(1.5, ctx.currentTime);

    const dropsGain = ctx.createGain();
    dropsGain.gain.setValueAtTime(0.35, ctx.currentTime);

    // ステレオパンナーで左右に分離
    const merger = ctx.createChannelMerger(2);
    dropsSourceL.connect(merger, 0, 0);
    dropsSourceR.connect(merger, 0, 1);

    merger.connect(dropsFilter);
    dropsFilter.connect(dropsGain);
    dropsGain.connect(destination);

    dropsSourceL.start();
    dropsSourceR.start();

    session.nodes.push({
      stop: () => {
        try {
          sheetFilter.disconnect();
          sheetGain.disconnect();
          groundFilter.disconnect();
          groundGain.disconnect();
          dropsFilter.disconnect();
          dropsGain.disconnect();
          merger.disconnect();
        } catch {
          // ignore
        }
      },
    });
  }

  /**
   * 寄せては返す波の音 (マルチレイヤー: 複合うねり + 砕ける白波 + 引き波のシズル)
   */
  private startWaves(ctx: AudioContext, destination: AudioNode, session: AudioSession): void {
    // --- Layer 1: 複合周期の低域うねり (Deep Swell) ---
    const swellBufferSize = Math.floor(ctx.sampleRate * 5.3);
    const swellBuffer = ctx.createBuffer(2, swellBufferSize, ctx.sampleRate);
    fillBrownNoise(swellBuffer.getChannelData(0));
    fillBrownNoise(swellBuffer.getChannelData(1));

    const swellSource = this.createLoopSource(ctx, swellBuffer, session);
    const swellFilter = ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.setValueAtTime(220, ctx.currentTime);

    const swellGain = ctx.createGain();
    swellGain.gain.setValueAtTime(0.2, ctx.currentTime);

    // 2つの異なる周波数のLFOを干渉させ、不規則な大波・小波のうねりを再現 (0.08Hz = 12.5s, 0.053Hz = 18.8s)
    const swellLfo1 = this.createLFO(ctx, 0.08, session);
    const swellLfo2 = this.createLFO(ctx, 0.053, session);

    const swellLfo1Gain = ctx.createGain();
    swellLfo1Gain.gain.setValueAtTime(0.25, ctx.currentTime);
    const swellLfo2Gain = ctx.createGain();
    swellLfo2Gain.gain.setValueAtTime(0.15, ctx.currentTime);

    swellLfo1.connect(swellLfo1Gain);
    swellLfo2.connect(swellLfo2Gain);
    swellLfo1Gain.connect(swellGain.gain);
    swellLfo2Gain.connect(swellGain.gain);

    // LFOでフィルターのカットオフも動的変調 (波が高まる時に重低音から広がる)
    const swellFilterMod = ctx.createGain();
    swellFilterMod.gain.setValueAtTime(200, ctx.currentTime);
    swellLfo1.connect(swellFilterMod);
    swellFilterMod.connect(swellFilter.frequency);

    swellSource.connect(swellFilter);
    swellFilter.connect(swellGain);
    swellGain.connect(destination);

    // --- Layer 2: 砕ける白波 (Crashing Crest) ---
    const crashBufferSize = Math.floor(ctx.sampleRate * 4.1);
    const crashBuffer = ctx.createBuffer(2, crashBufferSize, ctx.sampleRate);
    fillPinkNoise(crashBuffer.getChannelData(0));
    fillPinkNoise(crashBuffer.getChannelData(1));

    const crashSource = this.createLoopSource(ctx, crashBuffer, session);
    const crashFilter = ctx.createBiquadFilter();
    crashFilter.type = 'bandpass';
    crashFilter.frequency.setValueAtTime(950, ctx.currentTime);
    crashFilter.Q.setValueAtTime(1.2, ctx.currentTime);

    const crashGain = ctx.createGain();
    crashGain.gain.setValueAtTime(0.12, ctx.currentTime);

    // 波の頂点で砕ける音量変化
    const crashLfoMod = ctx.createGain();
    crashLfoMod.gain.setValueAtTime(0.18, ctx.currentTime);
    swellLfo1.connect(crashLfoMod);
    crashLfoMod.connect(crashGain.gain);

    crashSource.connect(crashFilter);
    crashFilter.connect(crashGain);
    crashGain.connect(destination);

    // --- Layer 3: 引き波の泡立ちシズル (Receding Foam) ---
    const foamBufferSize = Math.floor(ctx.sampleRate * 4.7);
    const foamBuffer = ctx.createBuffer(2, foamBufferSize, ctx.sampleRate);
    fillPinkNoise(foamBuffer.getChannelData(0));
    fillPinkNoise(foamBuffer.getChannelData(1));

    const foamSource = this.createLoopSource(ctx, foamBuffer, session);
    const foamFilter = ctx.createBiquadFilter();
    foamFilter.type = 'highpass';
    foamFilter.frequency.setValueAtTime(2800, ctx.currentTime);

    const foamGain = ctx.createGain();
    foamGain.gain.setValueAtTime(0.08, ctx.currentTime);

    // 引き波の位相変調 (うねりLFO2と干渉)
    const foamLfoMod = ctx.createGain();
    foamLfoMod.gain.setValueAtTime(0.06, ctx.currentTime);
    swellLfo2.connect(foamLfoMod);
    foamLfoMod.connect(foamGain.gain);

    foamSource.connect(foamFilter);
    foamFilter.connect(foamGain);
    foamGain.connect(destination);

    swellSource.start();
    swellLfo1.start();
    swellLfo2.start();
    crashSource.start();
    foamSource.start();

    session.nodes.push({
      stop: () => {
        try {
          swellFilter.disconnect();
          swellGain.disconnect();
          crashFilter.disconnect();
          crashGain.disconnect();
          foamFilter.disconnect();
          foamGain.disconnect();
        } catch {
          // ignore
        }
      },
    });
  }

  /**
   * 暖炉・焚き火 (マルチレイヤー: 炎の低域対流 + 炭火シズル + 薪のはぜるアコースティック破裂音)
   */
  private startCampfire(ctx: AudioContext, destination: AudioNode, session: AudioSession): void {
    // --- Layer 1: 炎の唸り・空気対流 (Flame Roar) ---
    const roarBufferSize = Math.floor(ctx.sampleRate * 3.7);
    const roarBuffer = ctx.createBuffer(2, roarBufferSize, ctx.sampleRate);
    fillBrownNoise(roarBuffer.getChannelData(0));
    fillBrownNoise(roarBuffer.getChannelData(1));

    const roarSource = this.createLoopSource(ctx, roarBuffer, session);
    const roarFilter = ctx.createBiquadFilter();
    roarFilter.type = 'lowpass';
    roarFilter.frequency.setValueAtTime(260, ctx.currentTime);

    const roarGain = ctx.createGain();
    roarGain.gain.setValueAtTime(0.32, ctx.currentTime);

    // 炎の対流ゆらぎ (0.22Hz, 0.37Hz)
    const roarLfo1 = this.createLFO(ctx, 0.22, session);
    const roarLfo2 = this.createLFO(ctx, 0.37, session);
    const roarLfo1Gain = ctx.createGain();
    roarLfo1Gain.gain.setValueAtTime(0.1, ctx.currentTime);
    const roarLfo2Gain = ctx.createGain();
    roarLfo2Gain.gain.setValueAtTime(0.08, ctx.currentTime);

    roarLfo1.connect(roarLfo1Gain);
    roarLfo2.connect(roarLfo2Gain);
    roarLfo1Gain.connect(roarGain.gain);
    roarLfo2Gain.connect(roarGain.gain);

    roarSource.connect(roarFilter);
    roarFilter.connect(roarGain);
    roarGain.connect(destination);

    // --- Layer 2: 炭火の燃焼シズル (Ember Sizzle) ---
    const sizzleBufferSize = Math.floor(ctx.sampleRate * 4.3);
    const sizzleBuffer = ctx.createBuffer(2, sizzleBufferSize, ctx.sampleRate);
    fillPinkNoise(sizzleBuffer.getChannelData(0));
    fillPinkNoise(sizzleBuffer.getChannelData(1));

    const sizzleSource = this.createLoopSource(ctx, sizzleBuffer, session);
    const sizzleFilter = ctx.createBiquadFilter();
    sizzleFilter.type = 'highpass';
    sizzleFilter.frequency.setValueAtTime(3600, ctx.currentTime);

    const sizzleGain = ctx.createGain();
    sizzleGain.gain.setValueAtTime(0.07, ctx.currentTime);

    sizzleSource.connect(sizzleFilter);
    sizzleFilter.connect(sizzleGain);
    sizzleGain.connect(destination);

    // --- Layer 3: 薪のはぜるアコースティック破裂音 (Wood Snaps & Pops) ---
    // 左右別々の素数長バッファ (3.1秒と4.3秒) でアコースティックな破裂音を合成
    const popsBufferL = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 3.1), ctx.sampleRate);
    const popsBufferR = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 4.3), ctx.sampleRate);
    fillWoodPops(popsBufferL.getChannelData(0), ctx.sampleRate, 1.8);
    fillWoodPops(popsBufferR.getChannelData(0), ctx.sampleRate, 1.5);

    const popsSourceL = this.createLoopSource(ctx, popsBufferL, session);
    const popsSourceR = this.createLoopSource(ctx, popsBufferR, session);

    const popsFilter = ctx.createBiquadFilter();
    popsFilter.type = 'bandpass';
    popsFilter.frequency.setValueAtTime(1300, ctx.currentTime);
    popsFilter.Q.setValueAtTime(1.8, ctx.currentTime);

    const popsGain = ctx.createGain();
    popsGain.gain.setValueAtTime(0.45, ctx.currentTime);

    const merger = ctx.createChannelMerger(2);
    popsSourceL.connect(merger, 0, 0);
    popsSourceR.connect(merger, 0, 1);

    merger.connect(popsFilter);
    popsFilter.connect(popsGain);
    popsGain.connect(destination);

    roarSource.start();
    roarLfo1.start();
    roarLfo2.start();
    sizzleSource.start();
    popsSourceL.start();
    popsSourceR.start();

    session.nodes.push({
      stop: () => {
        try {
          roarFilter.disconnect();
          roarGain.disconnect();
          sizzleFilter.disconnect();
          sizzleGain.disconnect();
          popsFilter.disconnect();
          popsGain.disconnect();
          merger.disconnect();
        } catch {
          // ignore
        }
      },
    });
  }
}

/**
 * Paul Kellet アルゴリズムによるピンクノイズ生成 (Float32Array)
 */
function fillPinkNoise(channelData: Float32Array): void {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < channelData.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    channelData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
    b6 = white * 0.115926;
  }
}

/**
 * ランダムウォークによるブラウンノイズ生成 (Float32Array)
 */
function fillBrownNoise(channelData: Float32Array): void {
  let last = 0;
  for (let i = 0; i < channelData.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.025 * white) / 1.025;
    channelData[i] = last * 3.2;
  }
}

/**
 * 水滴・雨粒のインパルス波形をバッファに散在合成
 * @param ratePerSec 1秒あたりの平均水滴数
 */
function fillRainDroplets(channelData: Float32Array, sampleRate: number, ratePerSec: number): void {
  const totalSeconds = channelData.length / sampleRate;
  const numDrops = Math.floor(totalSeconds * ratePerSec);

  for (let d = 0; d < numDrops; d++) {
    const startSample = Math.floor(Math.random() * (channelData.length - sampleRate * 0.05));
    const dropFreq = 1400 + Math.random() * 1200; // 1400Hz 〜 2600Hz
    const dropDecay = 90 + Math.random() * 60; // 急速減衰
    const dropAmp = 0.2 + Math.random() * 0.4;
    const dropLength = Math.floor(sampleRate * 0.035); // 35ms

    for (let i = 0; i < dropLength && startSample + i < channelData.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-dropDecay * t);
      const tone = Math.sin(2 * Math.PI * dropFreq * t);
      const noise = (Math.random() * 2 - 1) * Math.exp(-150 * t);
      channelData[startSample + i] += (tone * 0.7 + noise * 0.3) * decay * dropAmp;
    }
  }
}

/**
 * 薪のはぜるアコースティックな破裂音（Wood Pops）をバッファに合成
 * @param ratePerSec 1秒あたりの平均破裂数
 */
function fillWoodPops(channelData: Float32Array, sampleRate: number, ratePerSec: number): void {
  const totalSeconds = channelData.length / sampleRate;
  const numPops = Math.floor(totalSeconds * ratePerSec);

  for (let p = 0; p < numPops; p++) {
    const startSample = Math.floor(Math.random() * (channelData.length - sampleRate * 0.08));
    // 薪の共鳴周波数 (750Hz 〜 1600Hz)
    const popFreq = 750 + Math.random() * 850;
    const popDecay = 65 + Math.random() * 45;
    const isLoud = Math.random() > 0.8;
    const popAmp = isLoud ? 0.7 + Math.random() * 0.5 : 0.2 + Math.random() * 0.3;
    const popLength = Math.floor(sampleRate * 0.06); // 60ms

    for (let i = 0; i < popLength && startSample + i < channelData.length; i++) {
      const t = i / sampleRate;
      const decay = Math.exp(-popDecay * t);
      const resonance = Math.sin(2 * Math.PI * popFreq * t);
      const clickImpulse = (Math.random() * 2 - 1) * Math.exp(-250 * t);
      channelData[startSample + i] += (resonance * 0.6 + clickImpulse * 0.4) * decay * popAmp;
    }
  }
}

export const ambientSynthesizer = new AmbientSynthesizer();
