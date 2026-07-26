import * as THREE from "three";

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / Math.max(window.innerHeight, 1),
    0.1,
    100,
  );
  camera.position.set(0, 0, 7);
  return camera;
}
