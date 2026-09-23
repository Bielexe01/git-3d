import { DRUM_IDS, samples, type Bus, type SampleId } from "./samples";

export type AmpControls = { gain: number; volume: number; tone: number };

export type AudioSnapshot = {
  ready: boolean;
  muted: boolean;
  master: number;
  drums: number;
  guitar: number;
  bass: number;
  vocals: number;
  ambience: number;
  fx: number;
  amp: AmpControls;
};

const initialSnapshot: AudioSnapshot = {
  ready: false,
  muted: false,
  master: 0.86,
  drums: 0.95,
  guitar: 0.84,
  bass: 0.94,
  vocals: 0.78,
  ambience: 0.22,
  fx: 0.8,
  amp: { gain: 5.5, volume: 6.5, tone: 5 },
};

function shaperCurve(amount: number) {
  const n = 256;
  const curve = new Float32Array(n);
  const k = 1 + amount * 0.22;
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(k * x);
  }
  return curve;
}

function impulse(ctx: AudioContext, seconds = 0.7) {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.6);
    }
  }
  return buffer;
}

class AudioManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private buses: Partial<Record<Bus, GainNode>> = {};
  private analyser: AnalyserNode | null = null;
  private ampGain: GainNode | null = null;
  private ampFilter: BiquadFilterNode | null = null;
  private ampShaper: WaveShaperNode | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading = new Map<string, Promise<AudioBuffer | null>>();
  private ambience: AudioBufferSourceNode | null = null;
  private listeners = new Set<() => void>();
  private snapshot: AudioSnapshot = initialSnapshot;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.snapshot;

  private commit(patch: Partial<AudioSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((listener) => listener());
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      this.commit({ ready: true });
      return;
    }

    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = this.snapshot.master;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -16;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.004;
    compressor.release.value = 0.22;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.78;

    const reverb = ctx.createConvolver();
    reverb.buffer = impulse(ctx);
    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.16;
    reverb.connect(reverbGain);
    reverbGain.connect(master);

    const names: Bus[] = ["drums", "guitar", "bass", "vocals", "ambience", "fx"];
    for (const name of names) {
      const gain = ctx.createGain();
      gain.gain.value = this.snapshot[name];
      gain.connect(master);
      if (name === "vocals" || name === "guitar" || name === "fx") {
        const send = ctx.createGain();
        send.gain.value = name === "vocals" ? 0.35 : 0.12;
        gain.connect(send);
        send.connect(reverb);
      }
      this.buses[name] = gain;
    }

    const ampGain = ctx.createGain();
    const ampShaper = ctx.createWaveShaper();
    const ampFilter = ctx.createBiquadFilter();
    ampFilter.type = "lowpass";
    ampGain.connect(ampShaper);
    ampShaper.connect(ampFilter);
    ampFilter.connect(this.buses.fx!);
    this.ampGain = ampGain;
    this.ampShaper = ampShaper;
    this.ampFilter = ampFilter;
    this.applyAmp(this.snapshot.amp);

    master.connect(analyser);
    analyser.connect(compressor);
    compressor.connect(ctx.destination);

    this.ctx = ctx;
    this.master = master;
    this.analyser = analyser;
    if (ctx.state === "suspended") await ctx.resume();
    this.commit({ ready: true });
  }

  getAnalyser() {
    return this.analyser;
  }

  private applyAmp(amp: AmpControls) {
    if (!this.ampGain || !this.ampFilter || !this.ampShaper || !this.ctx) return;
    const now = this.ctx.currentTime;
    this.ampGain.gain.setTargetAtTime(0.25 + amp.volume / 12, now, 0.02);
    this.ampFilter.frequency.setTargetAtTime(320 + amp.tone * 820, now, 0.03);
    this.ampShaper.curve = shaperCurve(amp.gain);
  }

  setMuted(muted: boolean) {
    this.commit({ muted });
    if (!this.master || !this.ctx) return;
    this.master.gain.setTargetAtTime(muted ? 0 : this.snapshot.master, this.ctx.currentTime, 0.03);
  }

  setBus(bus: keyof Omit<AudioSnapshot, "ready" | "muted" | "amp">, value: number) {
    this.commit({ [bus]: value });
    if (!this.ctx) return;
    if (bus === "master" && this.master && !this.snapshot.muted) {
      this.master.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
      return;
    }
    const node = this.buses[bus as Bus];
    node?.gain.setTargetAtTime(value, this.ctx.currentTime, 0.02);
  }

  setAmp(amp: AmpControls) {
    this.commit({ amp });
    this.applyAmp(amp);
  }

  private urlsOf(id: SampleId) {
    const spec = samples[id];
    return spec.rounds?.length ? spec.rounds : [spec.url];
  }

  async preload(ids: SampleId[]) {
    if (!this.ctx) return;
    const queue = ids.flatMap((id) => this.urlsOf(id));
    const run = async () => {
      while (queue.length) {
        const url = queue.shift();
        if (url) await this.ensureUrl(url);
      }
    };
    await Promise.all([run(), run(), run()]);
  }

  async startAmbience() {
    if (!this.ctx || this.ambience) return;
    const buffer = await this.ensureUrl(samples.room.url);
    if (!buffer || !this.ctx || !this.buses.ambience) return;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.buses.ambience);
    source.start();
    this.ambience = source;
  }

  private async ensureUrl(url: string) {
    const cached = this.buffers.get(url);
    if (cached) return cached;
    const pending = this.loading.get(url);
    if (pending) return pending;

    const task = this.fetchUrl(url);
    this.loading.set(url, task);
    const buffer = await task;
    this.loading.delete(url);
    if (buffer) this.buffers.set(url, buffer);
    return buffer;
  }

  private async fetchUrl(url: string) {
    if (!this.ctx) return null;
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("missing");
      const raw = await response.arrayBuffer();
      return await this.ctx.decodeAudioData(raw.slice(0));
    } catch {
      return null;
    }
  }

  private synthesize(id: SampleId) {
    if (!this.ctx) return null;
    const seconds = id === "room" ? 1.2 : 0.28;
    const buffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * seconds), this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / this.ctx.sampleRate;
      data[i] = Math.sin(2 * Math.PI * 180 * t) * Math.exp(-t * 8) * 0.3;
    }
    return buffer;
  }

  play(id: SampleId) {
    if (!this.ctx || !this.snapshot.ready || this.snapshot.muted) return;
    const spec = samples[id];
    const urls = this.urlsOf(id);
    const first = Math.floor(Math.random() * urls.length);
    const ordered = urls.map((_, index) => urls[(first + index) % urls.length]);
    void (async () => {
      for (const url of ordered) {
        const buffer = await this.ensureUrl(url);
        if (buffer) return buffer;
      }
      return this.synthesize(id);
    })().then((buffer) => {
      if (!buffer || !this.ctx) return;
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      if (spec.jitter > 0) {
        source.playbackRate.value = 1 + (Math.random() * 2 - 1) * spec.jitter;
      }
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      const dur = buffer.duration;
      const level = spec.bus === "vocals" ? 0.72 : spec.bus === "guitar" ? 0.88 : 1;
      const attack = spec.bus === "drums" ? 0.0004 : spec.bus === "fx" ? 0.0015 : 0.004;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(level, now + attack);
      if (dur > attack + 0.05) {
        gain.gain.setValueAtTime(level, now + dur - 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(attack + 0.01, dur - 0.001));
      }
      source.connect(gain);
      if (spec.chain === "amp" && this.ampGain) gain.connect(this.ampGain);
      else gain.connect(this.buses[spec.bus]!);
      source.start();
      source.onended = () => {
        source.disconnect();
        gain.disconnect();
      };
    });
  }
}

export const audioManager = new AudioManager();

export function armExperience() {
  return audioManager.init().then(() => {
    void audioManager.preload(DRUM_IDS);
    void audioManager.startAmbience();
  });
}
