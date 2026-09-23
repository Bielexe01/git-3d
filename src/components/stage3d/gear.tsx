import { Html, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { playHit } from "../../audio/playHit";
import { bassStrings, vitinStrings, willStrings, type SampleId } from "../../audio/samples";

type Piece = { sample: SampleId; id: string; role: string };

const standUp: [number, number, number] = [Math.PI / 2, 0, 0];
const standFlat: [number, number, number] = [0, 0, 0];

const models = {
  offset: "/models/guitar-vitin.glb",
  sg: "/models/guitar-will.glb",
  bass: "/models/bass.glb",
  drums: "/models/drums.glb",
  amp: "/models/amp.glb",
  mic: "/models/mic.glb",
};

function drumPiece(name: string): Piece | null {
  const label = name.toLowerCase();
  if (label.includes("kick")) return { sample: "kick", id: "drums-kick", role: "Bumbo" };
  if (label.includes("snare")) return { sample: "snare", id: "drums-snare", role: "Caixa" };
  if (label.includes("tom")) return { sample: "tom", id: "drums-tom", role: "Tom" };
  if (label.includes("fl")) return { sample: "floor", id: "drums-floor", role: "Surdo" };
  if (label.includes("hh")) return { sample: "hihat", id: "drums-hihat", role: "Chimbal" };
  if (label.includes("ride")) return { sample: "ride", id: "drums-ride", role: "Ride" };
  if (label.includes("crash")) return { sample: "crash", id: "drums-crash", role: "Crash" };
  if (label.includes("sgab")) return { sample: "snare", id: "drums-stool", role: "Banco" };
  return { sample: "tick", id: "drums-hardware", role: "Ferragem" };
}

function Model({
  url,
  height,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  yaw = [0, 0, 0],
  drift = false,
  wobble = false,
  name,
  role,
  sample,
  id,
  strings,
  onPiece,
  labelAt = [0, 0.2, 0],
}: {
  url: string;
  height: number;
  rotation?: [number, number, number];
  position?: [number, number, number];
  yaw?: [number, number, number];
  drift?: boolean;
  wobble?: boolean;
  name: string;
  role: string;
  sample: SampleId;
  id: string;
  strings?: { id: SampleId; label: string }[];
  onPiece?: (meshName: string) => Piece | null;
  labelAt?: [number, number, number];
}) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const fitted = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const pulse = useRef<THREE.Group>(null);
  const localBox = useRef(new THREE.Box3());
  const hit = useRef(0);
  const drag = useRef({ x: 0, y: 0, moved: false });
  const [hot, setHot] = useState(role);
  const [show, setShow] = useState(false);

  useLayoutEffect(() => {
    scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh && onPiece) obj.userData.piece = onPiece(obj.name);
    });
    const group = fitted.current;
    if (!group) return;
    group.rotation.set(rotation[0], rotation[1], rotation[2]);
    group.scale.set(1, 1, 1);
    group.position.set(0, 0, 0);
    group.updateWorldMatrix(true, true);
    const world = new THREE.Box3().setFromObject(group);
    const parentInv = new THREE.Matrix4();
    if (group.parent) parentInv.copy(group.parent.matrixWorld).invert();
    else parentInv.identity();
    const measured = world.clone().applyMatrix4(parentInv);
    const size = measured.getSize(new THREE.Vector3());
    const scale = height / (Math.max(size.x, size.y, size.z) || 1);
    group.scale.setScalar(scale);
    group.updateWorldMatrix(true, true);
    const scaled = new THREE.Box3().setFromObject(group).applyMatrix4(parentInv);
    const center = scaled.getCenter(new THREE.Vector3());
    group.position.set(-center.x, -scaled.min.y, -center.z);
    group.updateWorldMatrix(true, true);
    const local = new THREE.Box3().setFromObject(group);
    local.applyMatrix4(new THREE.Matrix4().copy(group.matrixWorld).invert());
    localBox.current.copy(local);
  }, [height, onPiece, rotation, scene]); // rotation is a stable tuple from the caller

  useFrame((state, dt) => {
    hit.current = Math.max(0, hit.current - dt * 2.4);
    if (pulse.current) {
      pulse.current.scale.setScalar(1 + hit.current * 0.04);
      pulse.current.rotation.x = wobble ? Math.sin(hit.current * 28) * hit.current * 0.12 : 0;
    }
    if (spin.current) spin.current.rotation.y = drift ? Math.sin(state.clock.elapsedTime * 0.4) * 0.12 : 0;
  });

  const playAt = (point: THREE.Vector3, mesh?: THREE.Object3D) => {
    const piece = mesh?.userData.piece as Piece | undefined;
    if (piece) return piece;
    const box = localBox.current;
    const group = fitted.current;
    if (!strings || !group || box.isEmpty()) return { sample, id, role };
    const local = group.worldToLocal(point.clone());
    const spanY = box.max.y - box.min.y || 1;
    const spanX = box.max.x - box.min.x || 1;
    const yN = (local.y - box.min.y) / spanY;
    const xN = (local.x - box.min.x) / spanX;
    if (yN < 0.42 || Math.abs(xN - 0.5) > 0.22) return { sample, id, role };
    const index = Math.min(strings.length - 1, Math.max(0, Math.floor(xN * strings.length)));
    const string = strings[index];
    return { sample: string.id, id: `${id}-${string.id}`, role: string.label };
  };

  return (
    <group position={position} rotation={yaw}>
      <group ref={spin}>
        <group
          ref={pulse}
          onPointerDown={(event) => {
            drag.current = { x: event.clientX, y: event.clientY, moved: false };
          }}
          onPointerMove={(event) => {
            if (Math.hypot(event.clientX - drag.current.x, event.clientY - drag.current.y) > 6) drag.current.moved = true;
            const piece = playAt(event.point, event.object);
            setHot(piece.role);
            setShow(true);
          }}
          onPointerOver={(event) => {
            event.stopPropagation();
            setShow(true);
            setHot(playAt(event.point, event.object).role);
          }}
          onPointerOut={() => setShow(false)}
          onClick={(event) => {
            event.stopPropagation();
            if (drag.current.moved) return;
            const piece = playAt(event.point, event.object);
            playHit(piece.sample, piece.id);
            hit.current = 1;
            setHot(piece.role);
          }}
        >
          <group ref={fitted}>
            <primitive object={scene} />
          </group>
          {show ? <Label name={name} role={hot} at={labelAt} /> : null}
        </group>
      </group>
    </group>
  );
}

function Label({ name, role, at }: { name: string; role: string; at: [number, number, number] }) {
  return (
    <Html position={at} center zIndexRange={[30, 0]} style={{ pointerEvents: "none" }}>
      <div className="whitespace-nowrap text-center">
        <div className="font-display text-sm tracking-[0.14em] text-[#e7e1d6]" style={{ textShadow: "0 2px 16px #000" }}>
          {name}
        </div>
        <div className="text-[11px] text-[#c6a36a]" style={{ textShadow: "0 2px 12px #000" }}>
          {role}
        </div>
      </div>
    </Html>
  );
}

export function DrumKit({ drift = false, height = 1.7 }: { drift?: boolean; height?: number }) {
  return (
    <Model
      url={models.drums}
      height={height}
      name="BIEL"
      role="Bateria"
      sample="kick"
      id="drums-kick"
      drift={drift}
      onPiece={drumPiece}
      labelAt={[0, height + 0.08, 0]}
    />
  );
}

export function BandGuitar({
  kind,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  drift = false,
}: {
  kind: "offset" | "sg" | "bass";
  position?: [number, number, number];
  rotation?: [number, number, number];
  drift?: boolean;
}) {
  const spec =
    kind === "offset"
      ? { url: models.offset, strings: vitinStrings, sample: "vitin-strum" as SampleId, id: "guitar-vitin", name: "VITIN", stand: standUp }
      : kind === "sg"
        ? { url: models.sg, strings: willStrings, sample: "will-strum" as SampleId, id: "guitar-will", name: "WILL", stand: standUp }
        : { url: models.bass, strings: bassStrings, sample: "bass-strum" as SampleId, id: "bass-hiagolas", name: "HIAGOLAS", stand: standFlat };
  return (
    <Model
      url={spec.url}
      height={kind === "bass" ? 1.12 : 1.05}
      rotation={spec.stand}
      yaw={rotation}
      position={position}
      name={spec.name}
      role="Corpo"
      sample={spec.sample}
      id={spec.id}
      strings={spec.strings}
      drift={drift}
      labelAt={[0, 1.12, 0]}
    />
  );
}

export function BandAmp({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  drift = false,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  drift?: boolean;
}) {
  return <Model url={models.amp} height={0.58} yaw={rotation} position={position} name="HIAGOLAS" role="Amplificador" sample="amp" id="amp-hiagolas" drift={drift} labelAt={[0, 0.66, 0]} />;
}

export function BandMic({
  who,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  drift = false,
}: {
  who: "vitin" | "will";
  position?: [number, number, number];
  rotation?: [number, number, number];
  drift?: boolean;
}) {
  return (
    <Model
      url={models.mic}
      height={1.32}
      yaw={rotation}
      position={position}
      name={who === "vitin" ? "VITIN" : "WILL"}
      role="Voz"
      sample={who === "vitin" ? "voice-vitin" : "voice-will"}
      id={`mic-${who}`}
      drift={drift}
      labelAt={[0, 1.4, 0]}
    />
  );
}

export const drumHits: { id: string; sample: SampleId; label: string }[] = [
  { id: "drums-kick", sample: "kick", label: "Biel, bumbo" },
  { id: "drums-snare", sample: "snare", label: "Biel, caixa" },
  { id: "drums-tom", sample: "tom", label: "Biel, tom" },
  { id: "drums-floor", sample: "floor", label: "Biel, surdo" },
  { id: "drums-hihat", sample: "hihat", label: "Biel, chimbal" },
  { id: "drums-ride", sample: "ride", label: "Biel, ride" },
  { id: "drums-crash", sample: "crash", label: "Biel, crash" },
];

for (const url of Object.values(models)) useGLTF.preload(url);
