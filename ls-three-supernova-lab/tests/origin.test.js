import test from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import {
  createSupernovaOrigin,
  getProjectedOrigin,
} from "../src/scene/createSupernovaOrigin.js";

test("every supernova subsystem shares one scene origin", () => {
  const { origin, groups } = createSupernovaOrigin();

  Object.values(groups).forEach((group) => {
    assert.equal(group.parent, origin);
    assert.deepEqual(group.position.toArray(), [0, 0, 0]);
  });
});

test("the shared origin projects to the exact viewport center", () => {
  const { origin } = createSupernovaOrigin();
  const camera = new THREE.PerspectiveCamera(35, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, 7);
  camera.lookAt(origin.position);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  assert.deepEqual(
    getProjectedOrigin({
      origin,
      camera,
      viewportWidth: 1920,
      viewportHeight: 1080,
    }),
    { x: 960, y: 540 },
  );
});
