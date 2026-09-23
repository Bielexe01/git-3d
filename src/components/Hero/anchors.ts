import * as THREE from "three";

export const anchors = new Map<string, THREE.Vector3>();
const tmp = new THREE.Vector3();

export function setAnchor(id: string, object: THREE.Object3D) {
  object.getWorldPosition(tmp);
  const current = anchors.get(id);
  if (current) current.copy(tmp);
  else anchors.set(id, tmp.clone());
}
