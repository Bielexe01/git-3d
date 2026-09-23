import { useSyncExternalStore } from "react";
import { audioManager } from "../audio/AudioManager";

export function useAudioSnapshot() {
  return useSyncExternalStore(audioManager.subscribe, audioManager.getSnapshot, audioManager.getSnapshot);
}
