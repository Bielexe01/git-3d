import type { SampleId } from "../../audio/samples";
import { vitinStrings, willStrings } from "../../audio/samples";
import { hasWebGL, useFinePointer } from "../../hooks/useMedia";
import { BandGuitar } from "../stage3d/gear";
import { HitKeys } from "../stage3d/HitKeys";
import { StageBoundary, StageView } from "../stage3d/StageView";
import { Studio } from "../stage3d/Studio";
import { SpotButton, type Spot } from "../stage/Spot";

const players = {
  vitin: {
    name: "Vitin",
    image: "/images/band/guitar-vitin.jpg",
    alt: "Guitarra clara de Vitin. Toque o corpo ou as cordas.",
    strum: "vitin-strum" as SampleId,
    strings: vitinStrings,
    kind: "offset" as const,
  },
  will: {
    name: "Will",
    image: "/images/band/guitar-will.jpg",
    alt: "Guitarra escura de Will. Toque o corpo ou as cordas.",
    strum: "will-strum" as SampleId,
    strings: willStrings,
    kind: "sg" as const,
  },
};

function GuitarPhoto({ player }: { player: "vitin" | "will" }) {
  const data = players[player];
  const neck = player === "vitin" ? { x: 36.5, y: 10 } : { x: 45.5, y: 8 };
  const body: Spot = {
    id: `guitar-${player}`,
    sample: data.strum,
    name: data.name.toUpperCase(),
    role: "Corpo",
    x: player === "vitin" ? 28 : 30,
    y: 52,
    w: player === "vitin" ? 40 : 38,
    h: 28,
    round: true,
  };
  const strings: Spot[] = data.strings.map((string, index) => ({
    id: `guitar-${player}-${string.id}`,
    sample: string.id,
    name: data.name.toUpperCase(),
    role: string.label,
    x: neck.x + index * 1.15,
    y: neck.y,
    w: 1.35,
    h: 44,
  }));

  return (
    <>
      <img src={data.image} alt={data.alt} width={832} height={1248} className="h-full w-full object-fill" />
      <SpotButton spot={body} />
      {strings.map((spot) => (
        <SpotButton key={spot.id} spot={spot} />
      ))}
    </>
  );
}

export function InteractiveGuitar({ player }: { player: "vitin" | "will" }) {
  const data = players[player];
  const fine = useFinePointer();
  const webgl = hasWebGL();
  const hits = [
    { id: `guitar-${player}`, sample: data.strum, label: `${data.name}, corpo` },
    ...data.strings.map((string) => ({ id: `guitar-${player}-${string.id}`, sample: string.id, label: `${data.name}, ${string.label}` })),
  ];

  return (
    <div className="relative mx-auto aspect-[2/3] w-full max-w-[720px]">
      {webgl ? (
        <StageBoundary fallback={<GuitarPhoto player={player} />}>
          <StageView className="absolute inset-0" camera={{ position: [0, 0.62, 2.15], fov: 30, look: [0, 0.58, 0] }} orbit={fine} target={[0, 0.58, 0]}>
            <Studio />
            <BandGuitar kind={data.kind} drift={!fine} />
          </StageView>
        </StageBoundary>
      ) : (
        <GuitarPhoto player={player} />
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black/80 to-transparent" />
      <p className="pointer-events-none absolute bottom-8 left-5 z-20 font-display text-4xl text-bone">{data.name}</p>
      <p className="pointer-events-none absolute bottom-5 left-5 z-20 text-sm text-brass">Guitarra + Voz</p>
      <HitKeys hits={hits} />
    </div>
  );
}
