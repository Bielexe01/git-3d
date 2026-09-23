import type { SampleId } from "../../audio/samples";
import { playHit } from "../../audio/playHit";

export function HitKeys({ hits }: { hits: { id: string; sample: SampleId; label: string }[] }) {
  return (
    <div className="sr-only">
      {hits.map((hit) => (
        <button key={hit.id} type="button" onClick={() => playHit(hit.sample, hit.id)}>
          {hit.label}
        </button>
      ))}
    </div>
  );
}
