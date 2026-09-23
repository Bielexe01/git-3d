import type { SampleId } from "./samples";
import { audioManager } from "./AudioManager";
import { markHit } from "../utils/hits";

export function playHit(sample: SampleId, id: string) {
  audioManager.play(sample);
  markHit(id);
}
