import { bassStrings, type SampleId } from "../../audio/samples";
import { hasWebGL, useFinePointer } from "../../hooks/useMedia";
import { BandGuitar } from "../stage3d/gear";
import { HitKeys } from "../stage3d/HitKeys";
import { StageBoundary, StageView } from "../stage3d/StageView";
import { Studio } from "../stage3d/Studio";
import { SpotButton, type Spot } from "../stage/Spot";

const body: Spot = {
  id: "bass-hiagolas",
  sample: "bass-strum" as SampleId,
  name: "HIAGOLAS",
  role: "Corpo",
  x: 30,
  y: 48,
  w: 40,
  h: 32,
  round: true,
};

const strings: Spot[] = bassStrings.map((string, index) => ({
  id: `bass-${string.id}`,
  sample: string.id,
  name: "HIAGOLAS",
  role: string.label,
  x: 46.5 + index * 1.5,
  y: 8,
  w: 1.7,
  h: 46,
}));

function BassPhoto() {
  return (
    <>
      <img
        src="/images/band/bass.jpg"
        alt="Baixo de Hiagolas. Toque o corpo ou as cordas."
        width={832}
        height={1248}
        className="h-full w-full object-fill"
      />
      <SpotButton spot={body} />
      {strings.map((spot) => (
        <SpotButton key={spot.id} spot={spot} />
      ))}
    </>
  );
}

export function InteractiveBass() {
  const fine = useFinePointer();
  const webgl = hasWebGL();
  const hits = [
    { id: "bass-hiagolas", sample: "bass-strum" as SampleId, label: "Hiagolas, corpo" },
    ...bassStrings.map((string) => ({ id: `bass-${string.id}`, sample: string.id, label: `Hiagolas, ${string.label}` })),
  ];

  return (
    <div className="relative mx-auto aspect-[2/3] w-full max-w-[720px]">
      {webgl ? (
        <StageBoundary fallback={<BassPhoto />}>
          <StageView className="absolute inset-0" camera={{ position: [0, 0.55, 1.9], fov: 30, look: [0, 0.5, 0] }} orbit={fine} target={[0, 0.5, 0]}>
            <Studio />
            <BandGuitar kind="bass" drift={!fine} />
          </StageView>
        </StageBoundary>
      ) : (
        <BassPhoto />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black/80 to-transparent" />
      <p className="pointer-events-none absolute bottom-8 left-5 z-20 font-display text-4xl text-bone">Hiagolas</p>
      <p className="pointer-events-none absolute bottom-5 left-5 z-20 text-sm text-brass">Baixo</p>
      <HitKeys hits={hits} />
    </div>
  );
}
