import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import type * as THREE from "three";
import type { SampleId } from "../../../audio/samples";
import { playHit } from "../../../audio/playHit";
import { hitAt, hoverStore } from "../../../utils/hits";
import { setAnchor } from "../anchors";
import { bodyGeometry } from "./geometry";

const notes: SampleId[] = ["bass-e1", "bass-a1", "bass-d2", "bass-g2"];

export function Bass() {
  const group = useRef<THREE.Group>(null);
  const strings = useRef<(THREE.Mesh | null)[]>([]);
  const reduced = useReducedMotion();
  const body = useMemo(() => bodyGeometry("bass"), []);

  useFrame((state) => {
    const root = group.current;
    if (!root) return;
    setAnchor("bass-hiagolas", root);
    if (!reduced) {
      root.rotation.z = 0.05 + Math.sin(state.clock.elapsedTime * 0.22) * 0.015;
    }
    const at = hitAt.get("bass-hiagolas");
    if (at && !reduced) {
      const t = (performance.now() - at) / 1000;
      root.position.y = 0.7 + Math.sin(t * 18) * 0.015 * Math.exp(-t * 4);
    }
    strings.current.forEach((mesh, index) => {
      if (!mesh) return;
      const baseX = mesh.userData.baseX as number;
      const hit = hitAt.get(`bass-string-${index}`);
      if (!hit || reduced) {
        mesh.position.x = baseX;
        return;
      }
      const t = (performance.now() - hit) / 1000;
      mesh.position.x = baseX + Math.sin(t * 36) * 0.012 * Math.exp(-t * 5);
    });
  });

  return (
    <group ref={group} position={[-0.35, 0.7, 0.85]} rotation={[0.35, 0.7, 0.12]} scale={0.58}>
      <mesh
        geometry={body}
        onClick={(event) => {
          event.stopPropagation();
          playHit("bass-strum", "bass-hiagolas");
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoverStore.set({ id: "bass-hiagolas", name: "HIAGOLAS", role: "Baixo" });
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          if (hoverStore.get()?.id === "bass-hiagolas") hoverStore.set(null);
        }}
      >
        <meshStandardMaterial color="#14110f" roughness={0.42} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.055, 0.92, 0.038]} />
        <meshStandardMaterial color="#4a3428" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.04, 0.03]}>
        <boxGeometry args={[0.12, 0.08, 0.015]} />
        <meshStandardMaterial color="#c6a36a" metalness={0.7} roughness={0.3} />
      </mesh>
      {notes.map((sample, index) => {
        const x = -0.018 + index * 0.012;
        return (
          <mesh
            key={sample}
            ref={(node) => {
              strings.current[index] = node;
              if (node) node.userData.baseX = x;
            }}
            position={[x, 0.4, 0.034]}
            onClick={(event) => {
              event.stopPropagation();
              playHit(sample, `bass-string-${index}`);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              hoverStore.set({ id: `bass-string-${index}`, name: "HIAGOLAS", role: "Baixo" });
            }}
            onPointerOut={(event) => {
              event.stopPropagation();
              if (hoverStore.get()?.id === `bass-string-${index}`) hoverStore.set(null);
            }}
          >
            <boxGeometry args={[0.006, 1.05, 0.006]} />
            <meshStandardMaterial color="#d7d1c6" metalness={0.7} roughness={0.28} />
          </mesh>
        );
      })}
    </group>
  );
}
