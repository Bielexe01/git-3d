import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "motion/react";
import * as THREE from "three";
import { Amp } from "./instruments/Amp";
import { Bass } from "./instruments/Bass";
import { Drums } from "./instruments/Drums";
import { Guitar } from "./instruments/Guitar";
import { Microphone } from "./instruments/Microphone";
import { RoomDressing } from "./instruments/RoomDressing";
import { anchors } from "./anchors";
import { hoverStore, labelNode, pointer, stageBus } from "../../utils/hits";

function CameraRig() {
  const { camera } = useThree();
  const reduced = useReducedMotion() ?? false;
  const current = useRef(new THREE.Vector3(0.35, 1.72, 6.7));

  useFrame((_, delta) => {
    const travel = reduced ? 0 : pointer.scroll;
    const sway = reduced ? 0 : 1;
    const kick = reduced ? 0 : pointer.kick;
    pointer.kick = Math.max(0, pointer.kick - delta * 1.5);
    const targetX = 0.35 + pointer.mx * 0.28 * sway;
    const targetY = 1.72 - pointer.my * 0.1 * sway + travel * 0.4;
    const targetZ = 6.7 + travel * 2.6 - kick * 0.1;
    const blend = 1 - Math.exp(-2.8 * delta);
    current.current.x += (targetX - current.current.x) * blend;
    current.current.y += (targetY - current.current.y) * blend;
    current.current.z += (targetZ - current.current.z) * blend;
    camera.position.copy(current.current);
    camera.lookAt(0.25 + pointer.mx * 0.08 * sway, 0.78 - travel * 0.08, -0.45);
  });

  return null;
}

function LabelProjector() {
  const { camera, size } = useThree();
  const point = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    const node = labelNode.current;
    if (!node) return;
    const hover = hoverStore.get();
    const resolved = hover ? findAnchor(hover.id) : null;
    if (!hover || !resolved) {
      node.style.opacity = "0";
      return;
    }
    point.copy(resolved);
    point.project(camera);
    const x = Math.min(size.width - 180, Math.max(12, (point.x * 0.5 + 0.5) * size.width + 18));
    const y = Math.min(size.height - 72, Math.max(12, (-point.y * 0.5 + 0.5) * size.height - 28));
    node.style.opacity = "1";
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  return null;
}

function findAnchor(id: string) {
  if (anchors.has(id)) return anchors.get(id) ?? null;
  if (id.startsWith("guitar-vitin")) return anchors.get("guitar-vitin") ?? null;
  if (id.startsWith("guitar-will")) return anchors.get("guitar-will") ?? null;
  if (id.startsWith("bass")) return anchors.get("bass-hiagolas") ?? null;
  if (id.startsWith("drums")) return anchors.get("drums-biel") ?? null;
  if (id.startsWith("amp")) return anchors.get(id) ?? null;
  return null;
}

function Sparks() {
  const reduced = useReducedMotion() ?? false;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const sparkGeometry = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
  const sparkMaterial = useMemo(() => new THREE.MeshBasicMaterial({ color: "#e7d7b0", toneMapped: false }), []);
  const pool = useMemo(
    () =>
      Array.from({ length: 36 }, () => ({
        active: false,
        life: 0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
      })),
    [],
  );

  useEffect(() => {
    if (reduced) return;
    return stageBus.on((id) => {
      const origin = findAnchor(id);
      if (!origin) return;
      const count = id.startsWith("bass") ? 8 : 5;
      for (let i = 0; i < count; i++) {
        const spark = pool.find((item) => !item.active);
        if (!spark) return;
        spark.active = true;
        spark.life = 1;
        spark.pos.copy(origin);
        spark.vel.set((Math.random() - 0.5) * 1.2, Math.random() * 1.1, (Math.random() - 0.5) * 1.2);
      }
    });
  }, [pool, reduced]);

  useFrame((_, delta) => {
    const target = mesh.current;
    if (!target) return;
    pool.forEach((spark, index) => {
      if (!spark.active) {
        dummy.position.set(0, -10, 0);
        dummy.scale.setScalar(0);
      } else {
        spark.life -= delta * 1.5;
        spark.vel.y -= delta * 1.4;
        spark.pos.addScaledVector(spark.vel, delta);
        if (spark.life <= 0) spark.active = false;
        dummy.position.copy(spark.pos);
        dummy.scale.setScalar(Math.max(spark.life, 0) * 0.035);
      }
      dummy.updateMatrix();
      target.setMatrixAt(index, dummy.matrix);
    });
    target.instanceMatrix.needsUpdate = true;
  });

  if (reduced) return null;

  return (
    <instancedMesh ref={mesh} args={[sparkGeometry, sparkMaterial, 36]} />
  );
}

function HitLight() {
  const light = useRef<THREE.PointLight>(null);
  const started = useRef(0);

  useEffect(() => stageBus.on(() => {
    started.current = performance.now();
  }), []);

  useFrame(() => {
    if (!light.current) return;
    const t = (performance.now() - started.current) / 1000;
    light.current.intensity = Math.max(0, 7 * Math.exp(-t * 3.4));
  });

  return <pointLight ref={light} position={[0, 1.7, 0.8]} color="#f0d7a4" intensity={0} distance={8} />;
}

function MouseLight() {
  const light = useRef<THREE.PointLight>(null);
  const reduced = useReducedMotion() ?? false;
  useFrame(() => {
    if (!light.current || reduced) return;
    light.current.position.x += (pointer.mx * 1.8 - light.current.position.x) * 0.08;
    light.current.position.z = 1.1 + pointer.my * 0.35;
  });
  return <pointLight ref={light} position={[0, 1.5, 1.1]} intensity={2.2} distance={7} color="#f3ecdf" />;
}

export function StageScene() {
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 12, 26]} />
      <ambientLight intensity={0.34} />
      <spotLight position={[0.4, 6.2, 4.2]} angle={0.72} penumbra={0.75} intensity={80} color="#f7f1e6" />
      <spotLight position={[-3.2, 4.2, 1.2]} angle={0.55} penumbra={0.9} intensity={36} color="#e7c98a" />
      <spotLight position={[3.4, 3.6, 1]} angle={0.5} penumbra={1} intensity={22} color="#c5d0da" />
      <directionalLight position={[-2, 3, 4]} intensity={1.4} color="#f3ecdf" />
      <CameraRig />
      <MouseLight />
      <HitLight />
      <LabelProjector />
      <RoomDressing />
      <group position={[0.35, 0, -0.15]}>
        <Drums />
        <Guitar player="vitin" />
        <Guitar player="will" />
        <Bass />
        <Microphone who="vitin" />
        <Microphone who="will" />
        <Amp position={[-2.05, 0.26, -0.7]} owner="hiagolas" />
        <Amp position={[2.15, 0.24, -0.85]} owner="backline" />
      </group>
      <Sparks />
      <ContactShadows opacity={0.28} scale={16} blur={2.2} far={5} resolution={256} frames={1} color="#000000" />
    </>
  );
}
