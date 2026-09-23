import { useMemo, useState } from "react";
import * as THREE from "three";
import { playHit } from "../../../audio/playHit";
import { hoverStore } from "../../../utils/hits";

const cableA: [number, number, number][] = [
  [-1.5, 0.02, 0.2],
  [-0.8, 0.04, 0.7],
  [-0.2, 0.02, 1.1],
  [0.4, 0.03, 0.8],
];

const cableB: [number, number, number][] = [
  [1.6, 0.02, 0.1],
  [1.1, 0.05, 0.6],
  [0.7, 0.02, 1.2],
];

function Cable({ points }: { points: [number, number, number][] }) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)));
    return new THREE.TubeGeometry(curve, 28, 0.012, 5, false);
  }, [points]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#161616" roughness={0.8} />
    </mesh>
  );
}

export function RoomDressing() {
  const [pedals, setPedals] = useState([true, false, false]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#161616" roughness={0.9} metalness={0.05} />
      </mesh>
      <mesh position={[0, 2.2, -3.4]}>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#090909" roughness={1} />
      </mesh>
      <mesh position={[-4.2, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4.4]} />
        <meshStandardMaterial color="#080808" />
      </mesh>
      <mesh position={[4.2, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4.4]} />
        <meshStandardMaterial color="#080808" />
      </mesh>
      <mesh position={[0, 0.01, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.35, 40]} />
        <meshStandardMaterial color="#080808" />
      </mesh>
      <Cable points={cableA} />
      <Cable points={cableB} />
      <group position={[0.85, 0.04, 1.35]}>
        {pedals.map((on, index) => (
          <mesh
            key={index}
            position={[index * 0.18, 0.03, 0]}
            onClick={(event) => {
              event.stopPropagation();
              setPedals((current) => current.map((value, i) => (i === index ? !value : value)));
              playHit("tick", `pedal-${index}`);
            }}
            onPointerOver={(event) => {
              event.stopPropagation();
              hoverStore.set({ id: `pedal-${index}`, name: "PEDAL", role: on ? "Ligado" : "Desligado" });
            }}
            onPointerOut={() => {
              if (hoverStore.get()?.id === `pedal-${index}`) hoverStore.set(null);
            }}
          >
            <boxGeometry args={[0.14, 0.05, 0.2]} />
            <meshStandardMaterial
              color={on ? "#2a241c" : "#1a1a1a"}
              emissive={on ? "#c6a36a" : "#000000"}
              emissiveIntensity={on ? 0.35 : 0}
              roughness={0.6}
            />
          </mesh>
        ))}
      </group>
      {[-3.1, 3.1].map((x) => (
        <group key={x} position={[x, 0.45, -0.4]}>
          <mesh>
            <boxGeometry args={[0.46, 0.7, 0.4]} />
            <meshStandardMaterial color="#121212" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.02, 0.21]}>
            <circleGeometry args={[0.16, 20]} />
            <meshStandardMaterial color="#2c2824" />
          </mesh>
        </group>
      ))}
      <group position={[-2.4, 2.4, -1.6]} rotation={[0.5, 0.3, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.16, 0.28, 16]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      <group position={[2.5, 2.35, -1.4]} rotation={[0.4, -0.4, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.16, 0.28, 16]} />
          <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>
      <mesh position={[0.15, 0.28, -0.55]}>
        <cylinderGeometry args={[0.16, 0.16, 0.06, 20]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.15, 0.55, -0.55]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
        <meshStandardMaterial color="#8e9398" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  );
}
