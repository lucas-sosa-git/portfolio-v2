import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_TIMING,
  EXPLOSION_ENTRY_STATE,
  PHASE,
  PHASE_ORDER,
  easeInCubic,
  easeOutExpo,
  getCornerDelaySeconds,
  getEjectaExpansionProgress,
  getExplosionFlashProgress,
  getExplosionShockProgress,
  getExplosionSourceVisibility,
  getFlashShockProgress,
} from "../src/config.js";

test("the default physical sequence remains below four seconds", () => {
  const duration = PHASE_ORDER.reduce(
    (total, phase) => total + DEFAULT_TIMING[phase],
    0,
  );
  assert.equal(Number(duration.toFixed(2)), 3.79);
  assert.ok(duration < 4);
});

test("the replacement implosion hands off at exactly 1.5 seconds", () => {
  const explosionIndex = PHASE_ORDER.indexOf(PHASE.STALLED_SHOCK);
  const preExplosionDuration = PHASE_ORDER.slice(0, explosionIndex).reduce(
    (total, phase) => total + DEFAULT_TIMING[phase],
    0,
  );

  assert.equal(preExplosionDuration, EXPLOSION_ENTRY_STATE.defaultTimestamp);
  assert.equal(preExplosionDuration, 1.5);
});

test("corner regions have independent 30–80 ms absorption offsets", () => {
  const delays = Array.from({ length: 8 }, (_, cornerId) =>
    getCornerDelaySeconds(cornerId),
  );

  assert.equal(new Set(delays.map((delay) => delay.toFixed(6))).size, 8);
  delays.forEach((delay) => {
    assert.ok(delay >= 0.03);
    assert.ok(delay <= 0.08);
  });
});

test("the final tension frame matches the existing explosion entry state", () => {
  assert.deepEqual(EXPLOSION_ENTRY_STATE.position, [0, 0, 0]);
  assert.deepEqual(EXPLOSION_ENTRY_STATE.rotation, [0, 0, 0]);
  assert.equal(EXPLOSION_ENTRY_STATE.cameraZ, 7);
  assert.deepEqual(EXPLOSION_ENTRY_STATE.core, {
    scale: 1,
    opacity: 1,
    pulse: 1,
    compression: 0,
    shockCharge: 0.72,
    heat: 0.62,
    ignition: 0,
  });
  assert.deepEqual(EXPLOSION_ENTRY_STATE.bloom, [1.02, 0.46, 0.55]);
  assert.deepEqual(EXPLOSION_ENTRY_STATE.particles, {
    infallOpacity: 0,
    ejectaOpacity: 0,
    ejectaProgress: 0,
  });
});

test("the white core remains visible while ejecta is born at the origin", () => {
  assert.equal(getExplosionSourceVisibility(0), 1);
  assert.ok(getExplosionSourceVisibility(0.1) > 0);
  assert.equal(getExplosionSourceVisibility(0.2), 0);
});

test("light, shock and matter phases remain independently timed", () => {
  assert.equal(DEFAULT_TIMING[PHASE.FLASH], 0.2);
  assert.equal(DEFAULT_TIMING[PHASE.EXPLOSION], 1.05);
  assert.equal(DEFAULT_TIMING[PHASE.DISSIPATION], 0.72);
});

test("implosion and shock easing preserve their physical directions", () => {
  assert.ok(easeInCubic(0.25) < 0.25);
  assert.ok(easeOutExpo(0.25) > 0.25);
  assert.equal(easeInCubic(1), 1);
  assert.equal(easeOutExpo(1), 1);
});

test("the expanding shock remains continuous across flash and explosion", () => {
  assert.equal(getFlashShockProgress(0), 0);
  assert.equal(getFlashShockProgress(1), 0.05);
  assert.equal(getExplosionShockProgress(0), 0.05);
  assert.equal(getExplosionShockProgress(1), 1);
});

test("shock and ejecta are still compact in the first readable explosion frame", () => {
  const firstReadableFrame = 0.1;
  const flash = getExplosionFlashProgress(firstReadableFrame);
  const shock = getExplosionShockProgress(firstReadableFrame);
  const ejecta = getEjectaExpansionProgress(firstReadableFrame);

  assert.ok(flash < 0.03);
  assert.ok(shock > ejecta);
  assert.ok(shock < 0.08);
  assert.ok(ejecta < 0.03);
});

test("shock and ejecta expansion are monotonic", () => {
  const samples = [0, 0.1, 0.25, 0.5, 0.75, 1];
  const shock = samples.map(getExplosionShockProgress);
  const ejecta = samples.map(getEjectaExpansionProgress);

  for (let index = 1; index < samples.length; index += 1) {
    assert.ok(shock[index] >= shock[index - 1]);
    assert.ok(ejecta[index] >= ejecta[index - 1]);
  }

  assert.equal(getEjectaExpansionProgress(0), 0);
  assert.equal(getEjectaExpansionProgress(1), 0.82);
});
