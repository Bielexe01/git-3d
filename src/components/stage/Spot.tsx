import { useState } from "react";
import { useReducedMotion } from "motion/react";
import type { SampleId } from "../../audio/samples";
import { playHit } from "../../audio/playHit";

export type Spot = {
  id: string;
  sample: SampleId;
  name: string;
  role: string;
  x: number;
  y: number;
  w: number;
  h: number;
  round?: boolean;
  rot?: number;
};

export function SpotButton({ spot }: { spot: Spot }) {
  const reduced = useReducedMotion();
  const [pulse, setPulse] = useState(0);

  return (
    <button
      type="button"
      data-cursor="TOCAR"
      aria-label={`${spot.name}, ${spot.role}`}
      className="group absolute z-10 hover:shadow-[inset_0_0_0_1px_rgba(198,163,106,0.85)] focus-visible:shadow-[inset_0_0_0_1px_rgba(198,163,106,0.85)]"
      style={{
        left: `${spot.x}%`,
        top: `${spot.y}%`,
        width: `${spot.w}%`,
        height: `${spot.h}%`,
        borderRadius: spot.round ? "50%" : undefined,
        transform: spot.rot ? `rotate(${spot.rot}deg)` : undefined,
      }}
      onClick={() => {
        playHit(spot.sample, spot.id);
        setPulse((value) => value + 1);
      }}
    >
      <span
        className="pointer-events-none absolute bottom-[calc(100%+6px)] left-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={spot.rot ? { transform: `rotate(${-spot.rot}deg)` } : undefined}
      >
        <span className="block font-display text-sm tracking-[0.14em] text-bone" style={{ textShadow: "0 2px 16px #000" }}>
          {spot.name}
        </span>
        <span className="block text-[11px] text-brass" style={{ textShadow: "0 2px 12px #000" }}>
          {spot.role}
        </span>
      </span>
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(198,163,106,0.0),transparent_70%)] transition-all duration-300 group-hover:bg-[radial-gradient(circle,rgba(198,163,106,0.34),transparent_68%)] group-focus-visible:bg-[radial-gradient(circle,rgba(198,163,106,0.34),transparent_68%)]" />
      {pulse > 0 && !reduced ? (
        <span key={pulse} className="ripple pointer-events-none absolute inset-[12%] rounded-full border border-brass" />
      ) : null}
    </button>
  );
}
