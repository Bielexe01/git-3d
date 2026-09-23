import * as THREE from "three";

const cache = new Map<string, THREE.BufferGeometry>();

export function bodyGeometry(kind: "offset" | "double" | "bass") {
  const cached = cache.get(kind);
  if (cached) return cached;
  const shape = new THREE.Shape();
  if (kind === "offset") {
    shape.moveTo(0.02, 0.34);
    shape.bezierCurveTo(0.16, 0.4, 0.28, 0.3, 0.24, 0.16);
    shape.bezierCurveTo(0.2, 0.06, 0.1, 0.02, 0.08, -0.04);
    shape.bezierCurveTo(0.22, -0.08, 0.32, -0.22, 0.22, -0.4);
    shape.bezierCurveTo(0.12, -0.56, -0.08, -0.58, -0.16, -0.42);
    shape.bezierCurveTo(-0.26, -0.24, -0.22, -0.06, -0.12, 0.04);
    shape.bezierCurveTo(-0.2, 0.16, -0.16, 0.34, 0.02, 0.34);
  } else if (kind === "double") {
    shape.moveTo(0, 0.36);
    shape.bezierCurveTo(0.14, 0.42, 0.26, 0.28, 0.2, 0.14);
    shape.bezierCurveTo(0.28, 0.08, 0.22, -0.04, 0.1, -0.02);
    shape.bezierCurveTo(0.24, -0.12, 0.28, -0.36, 0.12, -0.52);
    shape.bezierCurveTo(0, -0.6, -0.14, -0.5, -0.12, -0.34);
    shape.bezierCurveTo(-0.24, -0.28, -0.3, -0.08, -0.2, 0.08);
    shape.bezierCurveTo(-0.28, 0.2, -0.16, 0.4, 0, 0.36);
  } else {
    shape.moveTo(0.02, 0.28);
    shape.bezierCurveTo(0.22, 0.36, 0.34, 0.16, 0.26, 0);
    shape.bezierCurveTo(0.34, -0.16, 0.24, -0.42, 0.06, -0.52);
    shape.bezierCurveTo(-0.1, -0.6, -0.28, -0.46, -0.28, -0.24);
    shape.bezierCurveTo(-0.36, -0.02, -0.24, 0.24, 0.02, 0.28);
  }
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: kind === "bass" ? 0.062 : 0.046,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
    curveSegments: 10,
  });
  geo.center();
  cache.set(kind, geo);
  return geo;
}
