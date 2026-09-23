import type { SampleId } from "../../audio/samples";
import { hasWebGL, useFinePointer } from "../../hooks/useMedia";
import { drumHits, DrumKit } from "../stage3d/DrumKit";
import { HitKeys } from "../stage3d/HitKeys";
import { StageBoundary, StageView } from "../stage3d/StageView";
import { Studio } from "../stage3d/Studio";
import { SpotButton, type Spot } from "../stage/Spot";

const spots: Spot[] = [
  { id: "drums-kick", sample: "kick" as SampleId, name: "BIEL", role: "Bumbo", x: 40, y: 74, w: 34, h: 22, round: true },
  { id: "drums-floor", sample: "floor" as SampleId, name: "BIEL", role: "Surdo", x: 74, y: 62, w: 22, h: 20, round: true },
  { id: "drums-snare", sample: "snare" as SampleId, name: "BIEL", role: "Caixa", x: 24, y: 64, w: 24, h: 16, round: true },
  { id: "drums-tom", sample: "tom" as SampleId, name: "BIEL", role: "Tom", x: 50, y: 46, w: 16, h: 13, round: true },
  { id: "drums-hihat", sample: "hihat" as SampleId, name: "BIEL", role: "Chimbal", x: 26, y: 47, w: 16, h: 9, round: true, rot: -8 },
  { id: "drums-ride", sample: "ride" as SampleId, name: "BIEL", role: "Ride", x: 39, y: 33, w: 23, h: 9, round: true, rot: -4 },
  { id: "drums-crash-low", sample: "crash" as SampleId, name: "BIEL", role: "Crash", x: 60, y: 47, w: 34, h: 13, round: true, rot: -8 },
  { id: "drums-crash", sample: "crash" as SampleId, name: "BIEL", role: "Crash", x: 64, y: 23, w: 32, h: 14, round: true, rot: 10 },
];

function DrumsPhoto() {
  return (
    <img
      src="/images/band/drums.jpg"
      alt="Bateria em estúdio. Cada peça pode ser tocada."
      width={1152}
      height={864}
      className="h-full w-full object-fill"
    />
  );
}

export function InteractiveDrums() {
  const fine = useFinePointer();
  const webgl = hasWebGL();

  return (
    <div>
      <div className="relative mx-auto aspect-[4/3] w-full max-w-[1152px]" role="group" aria-label="Bateria de Biel">
        {webgl ? (
          <StageBoundary
            fallback={
              <>
                <DrumsPhoto />
                {spots.map((spot) => (
                  <SpotButton key={spot.id} spot={spot} />
                ))}
              </>
            }
          >
            <StageView
              className="absolute inset-0"
              camera={{ position: [0, 0.58, 2.55], fov: 36, look: [0, 0.45, 0] }}
              orbit={fine}
              target={[0, 0.45, 0]}
            >
              <Studio />
              <DrumKit drift={!fine} />
            </StageView>
          </StageBoundary>
        ) : (
          <>
            <DrumsPhoto />
            {spots.map((spot) => (
              <SpotButton key={spot.id} spot={spot} />
            ))}
          </>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-black/75 to-transparent" />
        <p className="pointer-events-none absolute bottom-8 left-5 z-20 font-display text-4xl text-bone md:text-6xl">Biel</p>
        <p className="pointer-events-none absolute bottom-5 left-5 z-20 text-sm text-brass">Bateria</p>
        <HitKeys hits={drumHits} />
      </div>
      <p className="mx-auto max-w-[1152px] px-5 pt-3 text-[11px] tracking-wide text-bone-dim">
        Modelos: Quaternius (CC0), burunduk, Zsky, Batoski, Poly by Google e iPoly3D (CC BY). Sons: AVL Black Pearl, Glen MacArthur (CC BY-SA 3.0).
      </p>
    </div>
  );
}
