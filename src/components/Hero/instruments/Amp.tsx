import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import type * as THREE from "three";
import { audioManager } from "../../../audio/AudioManager";
import { playHit } from "../../../audio/playHit";
import { hitAt, hoverStore } from "../../../utils/hits";
import { setAnchor } from "../anchors";

const keys = ["gain", "volume", "tone"] as const;

export function Amp({
  position,
  owner,
}: {
  position: [number, number, number];
  owner: "hiagolas" | "backline";
}) {
  const id = owner === "hiagolas" ? "amp-hiagolas" : "amp-backline";
  const name = owner === "hiagolas" ? "HIAGOLAS" : "AMPLIFICADOR";
  const role = owner === "hiagolas" ? "Amplificador" : "Caixa";
  const ref = useRef<THREE.Group>(null);
  const speaker = useRef<THREE.Mesh>(null);
  const knobs = useRef<(THREE.Mesh | null)[]>([]);
  const drag = useRef<(typeof keys)[number] | null>(null);
  const reduced = useReducedMotion();

  useFrame(() => {
    if (!ref.current) return;
    setAnchor(id, ref.current);
    const amp = audioManager.getSnapshot().amp;
    knobs.current.forEach((knob, index) => {
      if (!knob) return;
      const key = keys[index];
      knob.rotation.z = -2.2 + (amp[key] / 10) * 4.2;
    });
    const at = hitAt.get(id);
    if (speaker.current && at && !reduced) {
      const t = (performance.now() - at) / 1000;
      const s = 1 + Math.sin(t * 30) * 0.04 * Math.exp(-t * 6);
      speaker.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh
        onClick={(event) => {
          event.stopPropagation();
          playHit("amp", id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoverStore.set({ id, name, role });
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          if (hoverStore.get()?.id === id) hoverStore.set(null);
        }}
      >
        <boxGeometry args={[0.62, 0.48, 0.38]} />
        <meshStandardMaterial color="#141414" roughness={0.78} />
      </mesh>
      <mesh ref={speaker} position={[0, -0.02, 0.2]}>
        <circleGeometry args={[0.16, 24]} />
        <meshStandardMaterial color="#2a2622" roughness={0.7} />
      </mesh>
      <mesh position={[0.24, 0.18, 0.2]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#c6a36a" emissive="#c6a36a" emissiveIntensity={0.8} />
      </mesh>
      {keys.map((key, index) => (
        <mesh
          key={key}
          ref={(node) => {
            knobs.current[index] = node;
          }}
          position={[-0.16 + index * 0.12, 0.16, 0.2]}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => {
            event.stopPropagation();
            drag.current = key;
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerMove={(event) => {
            if (drag.current !== key) return;
            event.stopPropagation();
            const amp = audioManager.getSnapshot().amp;
            const next = Math.min(10, Math.max(0, amp[key] - event.movementY * 0.05));
            audioManager.setAmp({ ...amp, [key]: next });
          }}
        >
          <cylinderGeometry args={[0.035, 0.035, 0.03, 16]} />
          <meshStandardMaterial color="#c5c8cc" metalness={0.85} roughness={0.25} />
        </mesh>
      ))}
    </group>
  );
}
