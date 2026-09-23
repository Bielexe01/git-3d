import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import type * as THREE from "three";
import type { SampleId } from "../../../audio/samples";
import { playHit } from "../../../audio/playHit";
import { hitAt, hoverStore } from "../../../utils/hits";
import { setAnchor } from "../anchors";
import { bodyGeometry } from "./geometry";

const variants = {
  vitin: {
    id: "guitar-vitin",
    name: "VITIN",
    role: "Guitarra + Voz",
    strum: "vitin-strum" as SampleId,
    strings: ["vitin-e2", "vitin-a2", "vitin-d3", "vitin-g3", "vitin-b3", "vitin-e4"] as SampleId[],
    body: "offset" as const,
    color: "#e4d8c4",
    guard: "#1a120e",
    metal: "#c6a36a",
    position: [-1.35, 0.86, 0.15] as [number, number, number],
    rotation: [0.15, 0.55, 0.08] as [number, number, number],
    sway: 0.4,
  },
  will: {
    id: "guitar-will",
    name: "WILL",
    role: "Guitarra + Voz",
    strum: "will-strum" as SampleId,
    strings: ["will-e2", "will-a2", "will-d3", "will-g3", "will-b3", "will-e4"] as SampleId[],
    body: "double" as const,
    color: "#23262b",
    guard: "#e7e1d6",
    metal: "#c5c8cc",
    position: [1.45, 0.84, 0.02] as [number, number, number],
    rotation: [0.12, -0.62, -0.06] as [number, number, number],
    sway: -0.28,
  },
};

export function Guitar({ player }: { player: "vitin" | "will" }) {
  const config = variants[player];
  const group = useRef<THREE.Group>(null);
  const strings = useRef<(THREE.Mesh | null)[]>([]);
  const reduced = useReducedMotion();
  const body = useMemo(() => bodyGeometry(config.body), [config.body]);
  const base = useRef(config.rotation);

  useFrame((state) => {
    const root = group.current;
    if (!root) return;
    setAnchor(config.id, root);
    if (!reduced) {
      root.rotation.z = base.current[2] + Math.sin(state.clock.elapsedTime * config.sway) * 0.03;
    }
    const bodyHit = hitAt.get(config.id);
    if (bodyHit && !reduced) {
      const t = (performance.now() - bodyHit) / 1000;
      const damp = Math.exp(-t * 6);
      root.rotation.x = base.current[0] + Math.sin(t * 28) * 0.04 * damp;
    }
    strings.current.forEach((mesh, index) => {
      if (!mesh) return;
      const baseX = mesh.userData.baseX as number;
      const at = hitAt.get(`${config.id}-string-${index}`);
      if (!at || reduced) {
        mesh.position.x = baseX;
        return;
      }
      const t = (performance.now() - at) / 1000;
      const damp = Math.exp(-t * 8);
      mesh.position.x = baseX + Math.sin(t * 72) * 0.01 * damp;
    });
  });

  return (
    <group ref={group} position={config.position} rotation={config.rotation} scale={0.72}>
      <mesh
        geometry={body}
        onClick={(event) => {
          event.stopPropagation();
          playHit(config.strum, config.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoverStore.set({ id: config.id, name: config.name, role: config.role });
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          if (hoverStore.get()?.id === config.id) hoverStore.set(null);
        }}
      >
        <meshStandardMaterial color={config.color} roughness={0.48} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.02, 0.03]}>
        <boxGeometry args={[0.16, 0.22, 0.01]} />
        <meshStandardMaterial color={config.guard} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.05, 0.78, 0.028]} />
        <meshStandardMaterial color="#c2a277" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.94, 0]}>
        <boxGeometry args={[0.09, 0.12, 0.025]} />
        <meshStandardMaterial color={config.color} roughness={0.4} metalness={0.2} />
      </mesh>
      {config.strings.map((sample, index) => {
        const x = -0.018 + index * 0.0072;
        return (
          <mesh
            key={sample}
            ref={(node) => {
              strings.current[index] = node;
              if (node) node.userData.baseX = x;
            }}
            position={[x, 0.42, 0.028]}
            onClick={(event) => {
              event.stopPropagation();
              playHit(sample, `${config.id}-string-${index}`);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              hoverStore.set({ id: `${config.id}-string-${index}`, name: config.name, role: "Corda" });
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              if (hoverStore.get()?.id === `${config.id}-string-${index}`) hoverStore.set(null);
            }}
          >
            <boxGeometry args={[0.004, 0.86, 0.004]} />
            <meshStandardMaterial color={config.metal} metalness={0.8} roughness={0.25} />
          </mesh>
        );
      })}
    </group>
  );
}
