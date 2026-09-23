/**
 * A bateria usa o AVL Black Pearl, kit acústico gravado de Glen MacArthur
 * (bandshed.net/avldrumkits), nas camadas de velocity 3–5. CC BY-SA 3.0.
 * O restante continua provisório até haver takes da banda.
 */

const avl = (note: number) => [3, 4, 5].map((layer) => `/audio/drums/avl/${note}_v${layer}.wav`);
export type Bus = "drums" | "guitar" | "bass" | "vocals" | "ambience" | "fx";

export type SampleId =
  | "kick"
  | "snare"
  | "tom"
  | "floor"
  | "hihat"
  | "crash"
  | "ride"
  | "vitin-e2"
  | "vitin-a2"
  | "vitin-d3"
  | "vitin-g3"
  | "vitin-b3"
  | "vitin-e4"
  | "vitin-strum"
  | "will-e2"
  | "will-a2"
  | "will-d3"
  | "will-g3"
  | "will-b3"
  | "will-e4"
  | "will-strum"
  | "bass-e1"
  | "bass-a1"
  | "bass-d2"
  | "bass-g2"
  | "bass-strum"
  | "voice-vitin"
  | "voice-will"
  | "amp"
  | "tick"
  | "room";

export type SampleSpec = {
  url: string;
  rounds?: string[];
  bus: Bus;
  chain?: "amp";
  jitter: number;
};

export const samples: Record<SampleId, SampleSpec> = {
  kick: { url: "/audio/drums/avl/36_v4.wav", rounds: avl(36), bus: "drums", jitter: 0.002 },
  snare: { url: "/audio/drums/avl/38_v4.wav", rounds: avl(38), bus: "drums", jitter: 0.002 },
  tom: { url: "/audio/drums/avl/48_v4.wav", rounds: avl(48), bus: "drums", jitter: 0.002 },
  floor: { url: "/audio/drums/avl/41_v4.wav", rounds: avl(41), bus: "drums", jitter: 0.002 },
  hihat: { url: "/audio/drums/avl/42_v4.wav", rounds: avl(42), bus: "drums", jitter: 0.002 },
  crash: { url: "/audio/drums/avl/49_v4.wav", rounds: [...avl(49), ...avl(57)], bus: "drums", jitter: 0.002 },
  ride: { url: "/audio/drums/avl/51_v4.wav", rounds: avl(51), bus: "drums", jitter: 0.002 },
  "vitin-e2": { url: "/audio/guitar/vitin-e2.wav", bus: "guitar", jitter: 0.01 },
  "vitin-a2": { url: "/audio/guitar/vitin-a2.wav", bus: "guitar", jitter: 0.01 },
  "vitin-d3": { url: "/audio/guitar/vitin-d3.wav", bus: "guitar", jitter: 0.01 },
  "vitin-g3": { url: "/audio/guitar/vitin-g3.wav", bus: "guitar", jitter: 0.01 },
  "vitin-b3": { url: "/audio/guitar/vitin-b3.wav", bus: "guitar", jitter: 0.01 },
  "vitin-e4": { url: "/audio/guitar/vitin-e4.wav", bus: "guitar", jitter: 0.01 },
  "vitin-strum": { url: "/audio/guitar/vitin-strum.wav", bus: "guitar", jitter: 0.008 },
  "will-e2": { url: "/audio/guitar/will-e2.wav", bus: "guitar", jitter: 0.01 },
  "will-a2": { url: "/audio/guitar/will-a2.wav", bus: "guitar", jitter: 0.01 },
  "will-d3": { url: "/audio/guitar/will-d3.wav", bus: "guitar", jitter: 0.01 },
  "will-g3": { url: "/audio/guitar/will-g3.wav", bus: "guitar", jitter: 0.01 },
  "will-b3": { url: "/audio/guitar/will-b3.wav", bus: "guitar", jitter: 0.01 },
  "will-e4": { url: "/audio/guitar/will-e4.wav", bus: "guitar", jitter: 0.01 },
  "will-strum": { url: "/audio/guitar/will-strum.wav", bus: "guitar", jitter: 0.008 },
  "bass-e1": { url: "/audio/bass/e1.wav", bus: "bass", jitter: 0.004 },
  "bass-a1": { url: "/audio/bass/a1.wav", bus: "bass", jitter: 0.004 },
  "bass-d2": { url: "/audio/bass/d2.wav", bus: "bass", jitter: 0.004 },
  "bass-g2": { url: "/audio/bass/g2.wav", bus: "bass", jitter: 0.004 },
  "bass-strum": { url: "/audio/bass/strum.wav", bus: "bass", jitter: 0.004 },
  "voice-vitin": { url: "/audio/vocals/vitin.wav", bus: "vocals", jitter: 0 },
  "voice-will": { url: "/audio/vocals/will.wav", bus: "vocals", jitter: 0 },
  amp: { url: "/audio/fx/amp.wav", bus: "fx", chain: "amp", jitter: 0.006 },
  tick: { url: "/audio/fx/tick.wav", bus: "fx", jitter: 0.02 },
  room: { url: "/audio/ambience/room.wav", bus: "ambience", jitter: 0 },
};

export const DRUM_IDS: SampleId[] = ["kick", "snare", "tom", "floor", "hihat", "crash", "ride"];

export const BENCH_IDS: SampleId[] = [
  "vitin-e2",
  "vitin-a2",
  "vitin-d3",
  "vitin-g3",
  "vitin-b3",
  "vitin-e4",
  "vitin-strum",
  "will-e2",
  "will-a2",
  "will-d3",
  "will-g3",
  "will-b3",
  "will-e4",
  "will-strum",
  "bass-e1",
  "bass-a1",
  "bass-d2",
  "bass-g2",
  "bass-strum",
  "voice-vitin",
  "voice-will",
  "amp",
  "tick",
];

export const vitinStrings: { id: SampleId; label: string }[] = [
  { id: "vitin-e2", label: "Corda Mi grave" },
  { id: "vitin-a2", label: "Corda Lá" },
  { id: "vitin-d3", label: "Corda Ré" },
  { id: "vitin-g3", label: "Corda Sol" },
  { id: "vitin-b3", label: "Corda Si" },
  { id: "vitin-e4", label: "Corda Mi" },
];

export const willStrings: { id: SampleId; label: string }[] = [
  { id: "will-e2", label: "Corda Mi grave" },
  { id: "will-a2", label: "Corda Lá" },
  { id: "will-d3", label: "Corda Ré" },
  { id: "will-g3", label: "Corda Sol" },
  { id: "will-b3", label: "Corda Si" },
  { id: "will-e4", label: "Corda Mi" },
];

export const bassStrings: { id: SampleId; label: string }[] = [
  { id: "bass-e1", label: "Corda Mi" },
  { id: "bass-a1", label: "Corda Lá" },
  { id: "bass-d2", label: "Corda Ré" },
  { id: "bass-g2", label: "Corda Sol" },
];
