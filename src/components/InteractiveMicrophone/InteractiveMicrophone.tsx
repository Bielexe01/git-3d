import type { SampleId } from "../../audio/samples";
import { hasWebGL, useFinePointer } from "../../hooks/useMedia";
import { BandMic } from "../stage3d/gear";
import { HitKeys } from "../stage3d/HitKeys";
import { StageBoundary, StageView } from "../stage3d/StageView";
import { Studio } from "../stage3d/Studio";
import { SpotButton, type Spot } from "../stage/Spot";

const mics = {
  vitin: {
    name: "Vitin",
    image: "/images/band/mic-vitin.jpg",
    sample: "voice-vitin" as SampleId,
    id: "mic-vitin",
  },
  will: {
    name: "Will",
    image: "/images/band/mic-will.jpg",
    sample: "voice-will" as SampleId,
    id: "mic-will",
  },
};

function MicPhoto({ who }: { who: "vitin" | "will" }) {
  const mic = mics[who];
  const spot: Spot = {
    id: mic.id,
    sample: mic.sample,
    name: mic.name.toUpperCase(),
    role: "Voz",
    x: who === "vitin" ? 34 : 28,
    y: who === "vitin" ? 18 : 22,
    w: 28,
    h: 18,
    round: true,
  };
  return (
    <>
      <img src={mic.image} alt={`Microfone de ${mic.name}.`} width={832} height={1248} className="h-full w-full object-fill" />
      <SpotButton spot={spot} />
    </>
  );
}

export function InteractiveMicrophone({ who }: { who: "vitin" | "will" }) {
  const mic = mics[who];
  const fine = useFinePointer();
  const webgl = hasWebGL();

  return (
    <div className="relative mx-auto aspect-[2/3] w-full max-w-[520px]">
      {webgl ? (
        <StageBoundary fallback={<MicPhoto who={who} />}>
          <StageView className="absolute inset-0" camera={{ position: [0.2, 0.7, 2.15], fov: 32, look: [0, 0.7, 0] }} orbit={fine} target={[0, 0.7, 0]}>
            <Studio />
            <BandMic who={who} drift={!fine} />
          </StageView>
        </StageBoundary>
      ) : (
        <MicPhoto who={who} />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-black/75 to-transparent" />
      <p className="pointer-events-none absolute bottom-4 left-4 z-20 font-display text-3xl text-bone">{mic.name}</p>
      <p className="pointer-events-none absolute right-4 bottom-4 z-20 text-sm text-brass">Voz</p>
      <HitKeys hits={[{ id: mic.id, sample: mic.sample, label: `${mic.name}, voz` }]} />
    </div>
  );
}
