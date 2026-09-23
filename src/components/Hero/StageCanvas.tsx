import { Component, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { pointer, hoverStore } from "../../utils/hits";
import { StageScene } from "./StageScene";

class Boundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function StageCanvas({ onUnavailable }: { onUnavailable: () => void }) {
  return (
    <Boundary onFail={onUnavailable}>
      <div
        className="absolute inset-0"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          pointer.mx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          pointer.my = ((event.clientY - rect.top) / rect.height) * 2 - 1;
        }}
        onPointerLeave={() => {
          pointer.mx = 0;
          pointer.my = 0;
          hoverStore.set(null);
        }}
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0.35, 1.72, 6.7], fov: 32 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.setClearColor("#000000");
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.28;
          }}
        >
          <StageScene />
        </Canvas>
      </div>
    </Boundary>
  );
}
