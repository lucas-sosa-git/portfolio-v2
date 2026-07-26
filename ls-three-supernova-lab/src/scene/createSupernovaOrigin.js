import * as THREE from "three";

const GROUP_NAMES = [
  "logoGroup",
  "collapseGroup",
  "shockGroup",
  "explosionGroup",
];

export function createSupernovaOrigin() {
  const origin = new THREE.Group();
  origin.name = "LS_SUPERNOVA_ORIGIN";
  origin.position.set(0, 0, 0);

  const groups = Object.fromEntries(
    GROUP_NAMES.map((name) => {
      const group = new THREE.Group();
      group.name = name;
      group.position.set(0, 0, 0);
      origin.add(group);
      return [name, group];
    }),
  );

  return { origin, groups };
}

export function getProjectedOrigin({
  origin,
  camera,
  viewportWidth,
  viewportHeight,
}) {
  const projected = origin.getWorldPosition(new THREE.Vector3());
  projected.project(camera);

  return {
    x: (projected.x + 1) * viewportWidth * 0.5,
    y: (1 - projected.y) * viewportHeight * 0.5,
  };
}
