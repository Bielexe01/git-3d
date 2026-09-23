import { useEffect, useRef } from "react";
import { audioManager } from "../../audio/AudioManager";
import { playHit } from "../../audio/playHit";
import { useAudioSnapshot } from "../../hooks/useAudioSnapshot";
import { hasWebGL, useFinePointer } from "../../hooks/useMedia";
import { BandAmp } from "../stage3d/gear";
import { HitKeys } from "../stage3d/HitKeys";
import { StageBoundary, StageView } from "../stage3d/StageView";
import { Studio } from "../stage3d/Studio";
import { SpotButton, type Spot } from "../stage/Spot";

const cabinet: Spot = {
  id: "amp-hiagolas",
  sample: "amp",
  name: "HIAGOLAS",
  role: "Amplificador",
  x: 18,
  y: 28,
  w: 64,
  h: 62,
};

const knobs = [
  ["gain", "Gain", 38],
  ["volume", "Volume", 49],
  ["tone", "Tone", 60],
] as const;

export function InteractiveAmp() {
  const audio = useAudioSnapshot();
  const drag = useRef<(typeof knobs)[number][0] | null>(null);
  const values = useRef(audio.amp);

  useEffect(() => {
    values.current = audio.amp;
  }, [audio.amp]);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const key = drag.current;
      if (!key) return;
      const next = {
        ...values.current,
        [key]: Math.min(10, Math.max(0, values.current[key] - event.movementY * 0.045)),
      };
      values.current = next;
      audioManager.setAmp(next);
    };
    const up = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  const fine = useFinePointer();
  const webgl = hasWebGL();

  return (
    <div className="relative aspect-[4/3] w-full">
      {webgl ? (
        <StageBoundary
          fallback={
            <>
              <img src="/images/band/amp.jpg" alt="Amplificador. O alto-falante toca. Os knobs respondem ao arraste." className="h-full w-full object-cover" />
              <SpotButton spot={cabinet} />
            </>
          }
        >
          <StageView className="absolute inset-0" camera={{ position: [0, 0.28, 1.15], fov: 32, look: [0, 0.24, 0] }} orbit={fine} target={[0, 0.24, 0]}>
            <Studio />
            <BandAmp drift={!fine} />
          </StageView>
        </StageBoundary>
      ) : (
        <>
          <img src="/images/band/amp.jpg" alt="Amplificador. O alto-falante toca. Os knobs respondem ao arraste." className="h-full w-full object-cover" />
          <SpotButton spot={cabinet} />
        </>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      {knobs.map(([key, label, x]) => (
        <button
          key={key}
          type="button"
          role="slider"
          data-cursor="TOCAR"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={10}
          aria-valuenow={Number(audio.amp[key].toFixed(1))}
          className="absolute z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-bone/40 bg-black/35"
          style={{ left: `${x}%`, top: "34%" }}
          onPointerDown={(event) => {
            drag.current = key;
            event.currentTarget.setPointerCapture(event.pointerId);
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            const delta = event.key === "ArrowUp" || event.key === "ArrowRight" ? 0.4 : event.key === "ArrowDown" || event.key === "ArrowLeft" ? -0.4 : 0;
            if (!delta) return;
            const next = { ...audio.amp, [key]: Math.min(10, Math.max(0, audio.amp[key] + delta)) };
            audioManager.setAmp(next);
          }}
          onClick={(event) => {
            event.stopPropagation();
            playHit("amp", "amp-hiagolas");
          }}
        >
          <span
            className="block h-4 w-px bg-brass"
            style={{ transform: `rotate(${-135 + (audio.amp[key] / 10) * 270}deg)` }}
          />
        </button>
      ))}
      <p className="pointer-events-none absolute bottom-4 left-4 z-20 font-display text-3xl text-bone">Amplificador</p>
      <HitKeys hits={[{ id: "amp-hiagolas", sample: "amp", label: "Hiagolas, amplificador" }]} />
    </div>
  );
}
