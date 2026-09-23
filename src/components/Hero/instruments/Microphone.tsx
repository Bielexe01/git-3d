import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import { MathUtils, type Group } from "three";
import type { SampleId } from "../../../audio/samples";
import { playHit } from "../../../audio/playHit";
import { hoverStore } from "../../../utils/hits";
import { setAnchor } from "../anchors";

const mics = {
  vitin: {
    id: "mic-vitin",
    name: "VITIN",
    sample: "voice-vitin" as SampleId,
    position: [-0.95, 0, 0.45] as [number, number, number],
    lean: 0.08,
    color: "#c6a36a",
  },
  will: {
    id: "mic-will",
    name: "WILL",
    sample: "voice-will" as SampleId,
    position: [1.05, 0, 0.35] as [number, number, number],
    lean: -0.1,
    color: "#c5c8cc",
  },
};

export function Microphone({ who }: { who: "vitin" | "will" }) {
  const mic = mics[who];
  const ref = useRef<Group>(null);
  const head = useRef<Group>(null);
  const reduced = useReducedMotion();

  useFrame((_, delta) => {
    if (!ref.current || !head.current) return;
    setAnchor(mic.id, ref.current);
    const hot = hoverStore.get()?.id === mic.id;
    const target = reduced ? 0 : hot ? mic.lean : mic.lean * 0.25;
    head.current.rotation.z = MathUtils.damp(head.current.rotation.z, target, 4, delta);
  });

  return (
    <group ref={ref} position={mic.position}>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 1.1, 10]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.4} roughness={0.45} />
      </mesh>
      <group
        ref={head}
        position={[0, 1.12, 0]}
        onClick={(event) => {
          event.stopPropagation();
          playHit(mic.sample, mic.id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          hoverStore.set({ id: mic.id, name: mic.name, role: "Voz" });
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          if (hoverStore.get()?.id === mic.id) hoverStore.set(null);
        }}
      >
        <mesh rotation={[0.4, 0, 0]}>
          <capsuleGeometry args={[0.045, 0.12, 6, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0.02, 0.08]} rotation={[0.4, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 12]} />
          <meshStandardMaterial color={mic.color} metalness={0.85} roughness={0.22} />
        </mesh>
      </group>
    </group>
  );
}
