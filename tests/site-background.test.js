import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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

test("the site background keeps one authoritative render loop", () => {
  const component = readFileSync(
    new URL(
      "../src/components/site-background/SiteBackground.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.equal(component.match(/requestAnimationFrame\(/g)?.length, 1);
  assert.match(component, /cancelAnimationFrame\(frame\)/);
  assert.doesNotMatch(component, /introObserver|intro-pending/);
});

test("the existing scene consumes finite hero intro state without a new loop", () => {
  const scene = readFileSync(
    new URL(
      "../src/components/site-background/createSiteBackground.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(scene, /introState\?\.reveal/);
  assert.match(scene, /introState\?\.regularity/);
  assert.doesNotMatch(scene, /requestAnimationFrame|setInterval|setTimeout/);
});

test("content sections preserve the shared site background", () => {
  const mainStyles = readFileSync(
    new URL("../styles/main.css", import.meta.url),
    "utf8",
  );
  const projectStyles = readFileSync(
    new URL(
      "../src/components/projects/projects-gallery.css",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    projectStyles,
    /#projects\.projects-section\s*{[^}]*background:\s*transparent;/s,
  );
  assert.doesNotMatch(projectStyles, /#projects\.projects-section::before/);
  assert.doesNotMatch(
    mainStyles,
    /\.skills-section::before|#courses::before|#contact::before/,
  );
});
