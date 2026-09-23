import { useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "motion/react";
import type * as THREE from "three";
import type { SampleId } from "../../../audio/samples";
import { playHit } from "../../../audio/playHit";
import { hitAt, hoverStore } from "../../../utils/hits";
import { setAnchor } from "../anchors";

type PieceProps = {
  id: string;
  sample: SampleId;
  label: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  children: ReactNode;
};

function Piece({ id, sample, label, position, rotation, children }: PieceProps) {
  const ref = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  useFrame(() => {
    const group = ref.current;
    if (!group) return;
    setAnchor(id, group);
    const baseZ = group.userData.baseZ as number | undefined;
    if (baseZ === undefined) group.userData.baseZ = group.rotation.z;
    const originZ = group.userData.baseZ as number;
    const at = hitAt.get(id);
    if (!at || reduced) {
      group.scale.setScalar(1);
      group.rotation.z = originZ;
      return;
    }
    const t = (performance.now() - at) / 1000;
    if (t > 0.55) {
      group.scale.setScalar(1);
      group.rotation.z = originZ;
      return;
    }
    const damp = Math.exp(-t * 7);
    group.scale.setScalar(1 + Math.sin(t * 40) * 0.03 * damp);
    if (id === "drums-crash" || id === "drums-ride" || id === "drums-hihat") {
      group.rotation.z = originZ + Math.sin(t * 46) * 0.08 * damp;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      onClick={(event) => {
        event.stopPropagation();
        playHit(sample, id);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        hoverStore.set({ id, name: "BIEL", role: label });
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        if (hoverStore.get()?.id === id) hoverStore.set(null);
      }}
    >
      {children}
    </group>
  );
}

function Shell({ radius, depth, color }: { radius: number; depth: number; color: string }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[radius, radius * 0.98, depth, 28]} />
        <meshStandardMaterial color={color} roughness={0.58} metalness={0.08} />
      </mesh>
      <mesh position={[0, depth / 2 + 0.01, 0]}>
        <cylinderGeometry args={[radius * 0.94, radius * 0.94, 0.02, 28]} />
        <meshStandardMaterial color="#e6e0d4" roughness={0.42} metalness={0.02} />
      </mesh>
      <mesh position={[0, depth / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.012, 8, 28]} />
        <meshStandardMaterial color="#c5c8cc" roughness={0.25} metalness={0.9} />
      </mesh>
    </group>
  );
}

function Cymbal({ radius }: { radius: number }) {
  return (
    <mesh>
      <cylinderGeometry args={[radius, radius, 0.012, 32]} />
      <meshStandardMaterial color="#c6a36a" roughness={0.28} metalness={0.92} />
    </mesh>
  );
}

export function Drums() {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) setAnchor("drums-biel", ref.current);
  });

  return (
    <group ref={ref} position={[0.15, 0, -0.55]} scale={1.05}>
      <Piece id="drums-kick" sample="kick" label="Bumbo" position={[0, 0.24, 0.42]} rotation={[1.15, 0.15, 0]}>
        <Shell radius={0.28} depth={0.32} color="#1a120e" />
      </Piece>
      <Piece id="drums-snare" sample="snare" label="Caixa" position={[-0.34, 0.42, 0.05]}>
        <Shell radius={0.16} depth={0.12} color="#4a301c" />
      </Piece>
      <Piece id="drums-tom" sample="tom" label="Tom" position={[0.22, 0.5, -0.18]}>
        <Shell radius={0.15} depth={0.14} color="#3a2618" />
      </Piece>
      <Piece id="drums-floor" sample="floor" label="Surdo" position={[0.52, 0.34, 0.22]}>
        <Shell radius={0.2} depth={0.28} color="#241810" />
      </Piece>
      <Piece id="drums-hihat" sample="hihat" label="Chimbal" position={[-0.62, 0.62, 0.02]} rotation={[0.2, 0, 0]}>
        <Cymbal radius={0.16} />
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.01, 28]} />
          <meshStandardMaterial color="#b8924a" metalness={0.9} roughness={0.3} />
        </mesh>
      </Piece>
      <Piece id="drums-crash" sample="crash" label="Crash" position={[-0.38, 0.92, -0.42]} rotation={[0.45, 0.2, -0.2]}>
        <Cymbal radius={0.24} />
      </Piece>
      <Piece id="drums-ride" sample="ride" label="Ride" position={[0.58, 0.96, -0.28]} rotation={[0.4, -0.2, 0.25]}>
        <Cymbal radius={0.26} />
      </Piece>
      <mesh position={[-0.62, 0.3, 0.02]}>
        <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
        <meshStandardMaterial color="#9aa0a6" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.58, 0.45, -0.28]}>
        <cylinderGeometry args={[0.012, 0.012, 0.9, 8]} />
        <meshStandardMaterial color="#9aa0a6" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}
