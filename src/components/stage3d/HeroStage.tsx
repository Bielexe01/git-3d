import { useFrame } from "@react-three/fiber";
import { useMemo, type MutableRefObject } from "react";
import * as THREE from "three";
import { BandAmp, BandGuitar, BandMic, DrumKit } from "./gear";
import { Studio } from "./Studio";

export const heroCamera = {
  position: [0.7, 1.05, 4.35] as [number, number, number],
  fov: 34,
  look: [0.85, 0.55, 0] as [number, number, number],
};

export function HeroStage({ tilt, still }: { tilt: MutableRefObject<{ x: number; y: number }>; still: boolean }) {
  const look = useMemo(() => new THREE.Vector3(...heroCamera.look), []);

  useFrame((state, dt) => {
    const cam = state.camera;
    const k = still ? 1 : 1 - Math.exp(-2.6 * dt);
    const x = heroCamera.position[0] + (still ? 0 : tilt.current.x);
    const y = heroCamera.position[1] + (still ? 0 : tilt.current.y);
    cam.position.x += (x - cam.position.x) * k;
    cam.position.y += (y - cam.position.y) * k;
    cam.position.z += (heroCamera.position[2] - cam.position.z) * k;
    cam.lookAt(look);
  });

  return (
    <>
      <Studio wide />
      <group position={[-0.55, 0, 0.08]} rotation={[0, 0.35, 0]} scale={0.78}>
        <BandGuitar kind="offset" />
      </group>
      <group position={[0.2, 0, 0]} rotation={[0, -0.1, 0]} scale={0.78}>
        <BandGuitar kind="sg" />
      </group>
      <group position={[0.9, 0, 0.04]} rotation={[0, 0.2, 0]} scale={0.78}>
        <BandGuitar kind="bass" />
      </group>
      <group position={[1.85, 0, -0.28]} scale={0.62}>
        <DrumKit />
      </group>
      <BandAmp position={[1.25, 0, 0.42]} rotation={[0, -0.45, 0]} />
      <BandMic who="vitin" position={[2.45, 0, 0.12]} rotation={[0, -0.4, 0]} />
      <BandMic who="will" position={[2.9, 0, -0.02]} rotation={[0, -0.6, 0]} />
    </>
  );
}
