import { Component, Suspense, useRef, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useInView } from "motion/react";
import * as THREE from "three";

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

export function StageBoundary({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  return <Boundary fallback={fallback}>{children}</Boundary>;
}

type CameraSpec = {
  position: [number, number, number];
  fov: number;
  look?: [number, number, number];
};

export function StageView({
  className,
  camera,
  orbit = false,
  target,
  children,
}: {
  className?: string;
  camera: CameraSpec;
  orbit?: boolean;
  target?: [number, number, number];
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInView(ref, { margin: "240px 0px" });

  return (
    <div ref={ref} className={className} data-cursor="TOCAR">
      {shown ? (
        <Canvas
          className="h-full w-full"
          dpr={[1, 1.5]}
          camera={{ position: camera.position, fov: camera.fov, near: 0.05, far: 40 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl, camera: cam }) => {
            gl.setClearColor("#0c0c0f");
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.14;
            if (camera.look) cam.lookAt(...camera.look);
          }}
        >
          <Suspense fallback={null}>
            {children}
            {orbit ? (
              <OrbitControls
                makeDefault
                enablePan={false}
                enableZoom={false}
                target={target ?? [0, 0, 0]}
                minPolarAngle={Math.PI / 2 - 0.38}
                maxPolarAngle={Math.PI / 2 + 0.22}
                minAzimuthAngle={-0.55}
                maxAzimuthAngle={0.55}
              />
            ) : null}
          </Suspense>
        </Canvas>
      ) : (
        <div className="h-full w-full bg-black" />
      )}
    </div>
  );
}
