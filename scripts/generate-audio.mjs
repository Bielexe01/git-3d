import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "audio");
const SR = 44100;

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalize(buf, peak = 0.9) {
  let max = 0;
  for (let i = 0; i < buf.length; i++) max = Math.max(max, Math.abs(buf[i]));
  if (max < 1e-6) return buf;
  const gain = peak / max;
  for (let i = 0; i < buf.length; i++) buf[i] *= gain;
  return buf;
}

function edge(buf, ms) {
  const n = Math.min(buf.length, Math.floor((SR * ms) / 1000));
  for (let i = 0; i < n; i++) buf[i] *= i / n;
  for (let i = 0; i < n; i++) buf[buf.length - 1 - i] *= i / n;
  return buf;
}

function lowpass(buf, coeff) {
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    y += coeff * (buf[i] - y);
    buf[i] = y;
  }
  return buf;
}

function encodeWav(samples) {
  const buffer = Buffer.alloc(44 + samples.length * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + samples.length * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SR, 24);
  buffer.writeUInt32LE(SR * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  return buffer;
}

function write(rel, samples) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodeWav(samples));
}

function biquad(type, freq, q, input) {
  const w0 = (2 * Math.PI * freq) / SR;
  const alpha = Math.sin(w0) / (2 * q);
  const cos = Math.cos(w0);
  let b0;
  let b1;
  let b2;
  const a0 = 1 + alpha;
  const a1 = -2 * cos;
  const a2 = 1 - alpha;
  if (type === "hp") {
    b0 = (1 + cos) / 2;
    b1 = -(1 + cos);
    b2 = (1 + cos) / 2;
  } else if (type === "lp") {
    b0 = (1 - cos) / 2;
    b1 = 1 - cos;
    b2 = (1 - cos) / 2;
  } else {
    b0 = alpha;
    b1 = 0;
    b2 = -alpha;
  }
  const out = new Float32Array(input.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < input.length; i++) {
    const x = input[i];
    const y = (b0 / a0) * x + (b1 / a0) * x1 + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    out[i] = y;
  }
  return out;
}

function noiseBuf(length, rand) {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = rand() * 2 - 1;
  return out;
}

function earlyReflections(buf) {
  const out = Float32Array.from(buf);
  const taps = [
    [0.008, 0.2],
    [0.013, 0.14],
    [0.021, 0.08],
    [0.034, 0.05],
  ];
  for (const [time, gain] of taps) {
    const shift = Math.floor(SR * time);
    for (let i = shift; i < out.length; i++) out[i] += buf[i - shift] * gain;
  }
  return out;
}

function kick(rand) {
  const n = Math.floor(SR * 0.5);
  const out = new Float32Array(n);
  let phase = 0;
  let clickPhase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = 46 + 150 * Math.exp(-t * 48);
    phase += (2 * Math.PI * freq) / SR;
    clickPhase += (2 * Math.PI * 2450) / SR;
    const body = Math.sin(phase);
    const punch = Math.exp(-t * 9);
    const weight = Math.exp(-t * 3.6);
    const beater = Math.sin(clickPhase) * Math.exp(-t * 260);
    const dust = (rand() * 2 - 1) * Math.exp(-t * 380);
    const sample = body * (0.45 * punch + 0.95 * weight) + beater * 0.42 + dust * 0.12;
    out[i] = sample / (1 + Math.abs(sample) * 0.22);
  }
  return edge(normalize(earlyReflections(out), 0.98), 0.35);
}

function snare(rand) {
  const n = Math.floor(SR * 0.46);
  const raw = noiseBuf(n, rand);
  const wires = biquad("bp", 2400, 0.7, raw);
  const sizzle = biquad("hp", 6200, 0.7, raw);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = 168 + 110 * Math.exp(-t * 36);
    phase += (2 * Math.PI * freq) / SR;
    const shell = Math.sin(phase) * Math.exp(-t * 16) + Math.sin(phase * 1.97) * Math.exp(-t * 24) * 0.22;
    const stick = (rand() * 2 - 1) * Math.exp(-t * 420);
    out[i] = shell * 0.85 + wires[i] * Math.exp(-t * 11) * 0.7 + sizzle[i] * Math.exp(-t * 8) * 0.38 + stick * 0.32;
  }
  return edge(normalize(earlyReflections(out), 0.95), 0.3);
}

function tom(start, end, dur, rand) {
  const n = Math.floor(SR * dur);
  const knock = biquad("bp", Math.min(start * 2.4, 900), 1.1, noiseBuf(n, rand));
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const freq = end + (start - end) * Math.exp(-t * 18);
    phase += (2 * Math.PI * freq) / SR;
    const shell = Math.sin(phase) + Math.sin(phase * 2.01) * 0.16;
    const amp = Math.exp(-t * (end < 80 ? 3.8 : 5.6));
    out[i] = shell * amp + knock[i] * Math.exp(-t * 42) * 0.28;
  }
  return edge(normalize(earlyReflections(out), 0.94), 0.35);
}

function hihat(rand) {
  const n = Math.floor(SR * 0.11);
  const freqs = [317, 406, 474, 562, 691, 842, 1260, 1588];
  const phases = freqs.map(() => rand() * Math.PI * 2);
  const metal = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let sum = 0;
    for (let k = 0; k < freqs.length; k++) {
      phases[k] += (2 * Math.PI * freqs[k]) / SR;
      sum += Math.sin(phases[k]) > 0 ? 1 : -1;
    }
    metal[i] = sum / freqs.length;
  }
  const bright = biquad("hp", 6800, 0.75, metal);
  const grit = biquad("bp", 8500, 1.1, noiseBuf(n, rand));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    bright[i] = (bright[i] * 0.62 + grit[i] * 0.7) * Math.exp(-t * 42);
  }
  return edge(normalize(bright, 0.58), 0.25);
}

function modalMetal(rand, options) {
  const { f0, modes, stiffness, dur, lowDecay, highDecay, stick, sizzle, peak } = options;
  const n = Math.floor(SR * dur);
  const out = new Float32Array(n);
  const freqs = [];
  const amps = [];
  const decays = [];
  const phases = [];
  for (let k = 1; k <= modes; k++) {
    const freq = f0 * k * Math.sqrt(1 + stiffness * k * k);
    if (freq > SR * 0.46) break;
    freqs.push(freq);
    const tilt = k / modes;
    amps.push((0.45 + rand() * 0.55) * (1 - tilt * 0.25));
    decays.push(lowDecay + (highDecay - lowDecay) * tilt * tilt);
    phases.push(rand() * Math.PI * 2);
  }
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let sum = 0;
    for (let k = 0; k < freqs.length; k++) {
      phases[k] += (2 * Math.PI * freqs[k]) / SR;
      sum += Math.sin(phases[k]) * amps[k] * Math.exp(-t * decays[k]);
    }
    out[i] = sum;
  }
  const raw = noiseBuf(n, rand);
  const attack = biquad("hp", 4500, 0.7, raw);
  const wash = sizzle > 0 ? biquad("bp", 7400, 0.6, raw) : null;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] += attack[i] * Math.exp(-t * 70) * stick;
    if (wash) out[i] += wash[i] * Math.exp(-t * 3.4) * sizzle;
    const x = out[i];
    out[i] = x / (1 + Math.abs(x) * 0.15);
  }
  return edge(normalize(out, peak), 0.3);
}

function crash(rand) {
  return modalMetal(rand, {
    f0: 78,
    modes: 46,
    stiffness: 0.022,
    dur: 2.15,
    lowDecay: 0.72,
    highDecay: 5.8,
    stick: 0.7,
    sizzle: 0.22,
    peak: 0.9,
  });
}

function ride(rand) {
  const tone = modalMetal(rand, {
    f0: 248,
    modes: 14,
    stiffness: 0.004,
    dur: 1.7,
    lowDecay: 1.15,
    highDecay: 8.5,
    stick: 1.05,
    sizzle: 0.04,
    peak: 0.88,
  });
  let phase = 0;
  for (let i = 0; i < tone.length; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * 472) / SR;
    tone[i] += Math.sin(phase) * Math.exp(-t * 2.8) * 0.22;
  }
  return edge(normalize(tone, 0.88), 0.3);
}

function karplus(freq, seconds, rand, decay) {
  const n = Math.floor(SR * seconds);
  const period = Math.max(8, Math.round(SR / freq));
  const delay = new Float32Array(period);
  for (let i = 0; i < period; i++) {
    delay[i] = (rand() * 2 - 1) * (1 - i / period);
  }
  const out = new Float32Array(n);
  let idx = 0;
  let body = 0;
  for (let i = 0; i < n; i++) {
    const a = delay[idx];
    const b = delay[(idx + 1) % period];
    const filtered = (a + b) * 0.5 * decay;
    delay[idx] = filtered;
    body += 0.035 * (filtered - body);
    out[i] = filtered * 0.8 + body * 1.15;
    idx = (idx + 1) % period;
  }
  return edge(normalize(out, 0.86), 3);
}

function strum(freqs, rand, decay) {
  const out = new Float32Array(Math.floor(SR * 1.45));
  freqs.forEach((freq, index) => {
    const note = karplus(freq, 1.45, rand, decay);
    const delay = Math.floor(SR * 0.018 * index);
    for (let i = 0; i < note.length && i + delay < out.length; i++) out[i + delay] += note[i] * 0.55;
  });
  return edge(normalize(out, 0.9), 2);
}

function bass(freq) {
  const n = Math.floor(SR * 1.15);
  const out = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = freq * (1 + 0.012 * Math.exp(-t * 28));
    phase += (2 * Math.PI * f) / SR;
    const s = Math.sin(phase) + Math.sin(phase * 2) * 0.34 + Math.sin(phase * 3) * 0.1;
    const env = Math.min(1, t / 0.006) * Math.pow(Math.exp(-t * 1.35), 1);
    out[i] = Math.tanh(s * env * 1.35);
  }
  return edge(normalize(out, 0.95), 4);
}

function bandpass(input, freq, q) {
  const w0 = (2 * Math.PI * freq) / SR;
  const alpha = Math.sin(w0) / (2 * q);
  const b0 = alpha;
  const b2 = -alpha;
  const a0 = 1 + alpha;
  const a1 = -2 * Math.cos(w0);
  const a2 = 1 - alpha;
  const out = new Float32Array(input.length);
  let x1 = 0;
  let x2 = 0;
  let y1 = 0;
  let y2 = 0;
  for (let i = 0; i < input.length; i++) {
    const x = input[i];
    const y = (b0 / a0) * x + (b2 / a0) * x2 - (a1 / a0) * y1 - (a2 / a0) * y2;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
    out[i] = y;
  }
  return out;
}

function voice(f0, f1, f2) {
  const n = Math.floor(SR * 0.62);
  const raw = new Float32Array(n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    phase += (2 * Math.PI * f0) / SR;
    const s = Math.sin(phase);
    const pulse = s > 0 ? s * s : s * 0.15;
    raw[i] = pulse * Math.min(1, t / 0.03) * Math.exp(-t * 2.4);
  }
  const a = bandpass(raw, f1, 9);
  const b = bandpass(raw, f2, 8);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = a[i] * 0.8 + b[i] * 0.45;
  return edge(normalize(out, 0.7), 8);
}

function amp() {
  const freqs = [82.41, 123.47, 164.81, 246.94];
  const phases = [0, 0, 0, 0];
  const n = Math.floor(SR * 1.05);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let s = 0;
    for (let k = 0; k < freqs.length; k++) {
      phases[k] += (2 * Math.PI * freqs[k]) / SR;
      const frac = ((phases[k] / (2 * Math.PI)) % 1 + 1) % 1;
      s += (frac * 2 - 1) / freqs.length;
    }
    const env = Math.min(1, t / 0.004) * Math.exp(-t * 2.15);
    out[i] = Math.tanh(s * 3.2) * env;
  }
  return edge(normalize(lowpass(out, 0.18), 0.88), 3);
}

function room(rand) {
  const n = Math.floor(SR * 3);
  const out = new Float32Array(n);
  let y = 0;
  for (let i = 0; i < n; i++) {
    y += 0.02 * (rand() * 2 - 1 - y);
    const t = i / n;
    const fade = Math.min(1, t / 0.06, (1 - t) / 0.06);
    out[i] = y * fade;
  }
  return normalize(out, 0.16);
}

function tick(rand) {
  const n = Math.floor(SR * 0.035);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    out[i] = (rand() * 2 - 1) * Math.exp(-t * 180);
  }
  return edge(normalize(out, 0.4), 0.4);
}

const rand = mulberry32(0xb217);
// Bateria: public/audio/drums/avl (AVL Black Pearl). Não regenerar por síntese.

const guitar = [
  ["e2", 82.41],
  ["a2", 110],
  ["d3", 146.83],
  ["g3", 196],
  ["b3", 246.94],
  ["e4", 329.63],
];

for (const [name, freq] of guitar) {
  write(`guitar/vitin-${name}.wav`, karplus(freq, 1.25, rand, 0.9962));
  write(`guitar/will-${name}.wav`, lowpass(karplus(freq * 0.992, 1.35, rand, 0.9972), 0.2));
}

write("guitar/vitin-strum.wav", strum([82.41, 123.47, 164.81, 246.94, 329.63], rand, 0.9955));
write("guitar/will-strum.wav", lowpass(strum([73.42, 110, 146.83, 220, 293.66], rand, 0.9965), 0.16));
write("bass/e1.wav", bass(41.2));
write("bass/a1.wav", bass(55));
write("bass/d2.wav", bass(73.42));
write("bass/g2.wav", bass(98));
write("bass/strum.wav", (() => {
  const out = new Float32Array(Math.floor(SR * 1.3));
  [41.2, 61.74, 82.41].forEach((freq, index) => {
    const note = bass(freq);
    const delay = Math.floor(SR * 0.02 * index);
    for (let i = 0; i < note.length && i + delay < out.length; i++) out[i + delay] += note[i] * 0.55;
  });
  return edge(normalize(out, 0.95), 4);
})());
write("vocals/vitin.wav", voice(174, 730, 1180));
write("vocals/will.wav", voice(128, 540, 960));
write("fx/amp.wav", amp());
write("fx/tick.wav", tick(rand));
write("ambience/room.wav", room(rand));
console.log("audio rewritten");
