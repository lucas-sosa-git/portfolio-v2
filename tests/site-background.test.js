import test from "node:test";
import assert from "node:assert/strict";
import {
  BACKGROUND_STATES,
  getSectionProgress,
  interpolateBackgroundState,
} from "../src/components/site-background/backgroundState.js";

test("section progress follows the viewport center and clamps at both ends", () => {
  const centers = [500, 1500, 2500];

  assert.equal(getSectionProgress(centers, 0, 800), 0);
  assert.equal(getSectionProgress(centers, 1000, 1000), 1);
  assert.equal(getSectionProgress(centers, 3000, 800), 2);
});

test("background states interpolate smoothly between section keyframes", () => {
  const first = BACKGROUND_STATES[0];
  const second = BACKGROUND_STATES[1];
  const midpoint = interpolateBackgroundState(0.5);

  assert.equal(interpolateBackgroundState(-5).focusX, first.focusX);
  assert.equal(
    interpolateBackgroundState(BACKGROUND_STATES.length + 5).focusX,
    BACKGROUND_STATES.at(-1).focusX,
  );
  assert.ok(
    Math.abs(midpoint.focusX - (first.focusX + second.focusX) / 2) < 1e-12,
  );
  assert.ok(
    Math.abs(
      midpoint.lineOpacity - (first.lineOpacity + second.lineOpacity) / 2,
    ) < 1e-12,
  );
});
