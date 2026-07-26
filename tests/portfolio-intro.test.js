import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  getImpactGeometry,
  getWaveRevealMetrics,
} from "../src/components/portfolio-intro/introMath.js";
import {
  EXPLOSION_ENTRY_STATE,
  getIntroPreference,
  INTRO_CONFIG,
} from "../src/components/portfolio-intro/introConfig.js";

test("impact geometry covers every viewport corner", () => {
  const geometry = getImpactGeometry({
    viewportWidth: 1440,
    viewportHeight: 900,
  });

  assert.equal(geometry.x, 720);
  assert.equal(geometry.y, 450);
  assert.equal(geometry.maxRadius, Math.hypot(720, 450));
});

test("wave delays increase with physical distance from impact", () => {
  const common = {
    impactX: 500,
    impactY: 400,
    maxRadius: 700,
    waveDuration: 950,
    revealDuration: 320,
  };
  const near = getWaveRevealMetrics({
    ...common,
    elementRect: { left: 480, top: 380, width: 40, height: 40 },
  });
  const far = getWaveRevealMetrics({
    ...common,
    elementRect: { left: 80, top: 50, width: 40, height: 40 },
  });

  assert.equal(near.distance, 0);
  assert.ok(far.delay > near.delay);
  assert.ok(far.initialX > 0);
  assert.ok(far.initialY > 0);
});

test("reduced motion and the explicit skip query bypass the intro", () => {
  assert.equal(
    getIntroPreference({ search: "?intro=1", reducedMotion: true }),
    "skip",
  );
  assert.equal(
    getIntroPreference({ search: "?intro=0", reducedMotion: false }),
    "skip",
  );
});

test("the reveal keeps its approved wave timing", () => {
  assert.equal(INTRO_CONFIG.timing.wave, 1700);
});

test("the integrated implosion hands off after exactly 1.5 seconds", () => {
  const { timing } = INTRO_CONFIG;
  const preExplosionDuration =
    timing.stable +
    timing.implosion +
    timing.coreFormation +
    timing.finalCompression +
    timing.tension;

  assert.equal(preExplosionDuration, 1500);
  assert.equal(preExplosionDuration, EXPLOSION_ENTRY_STATE.timestamp);
});

test("the approved explosion entry values remain explicit and unchanged", () => {
  assert.deepEqual(EXPLOSION_ENTRY_STATE.logo, {
    scaleX: 0.03,
    scaleY: 0.03,
    opacity: 0.1,
    filter: "brightness(4)",
  });
  assert.deepEqual(EXPLOSION_ENTRY_STATE.core, {
    scale: 0.88,
    opacity: 1,
    filter: "brightness(1.25)",
  });
  assert.deepEqual(EXPLOSION_ENTRY_STATE.flash, {
    opacity: 0,
    scale: 0,
  });
  assert.equal(EXPLOSION_ENTRY_STATE.raysOpacity, 0);
  assert.deepEqual(EXPLOSION_ENTRY_STATE.wave, {
    opacity: 0,
    scale: 0.01,
  });
});

test("the expanding wave keeps centering separate from its animated scale", () => {
  const css = readFileSync(
    new URL(
      "../src/components/portfolio-intro/portfolio-intro.css",
      import.meta.url,
    ),
    "utf8",
  );
  const waveRule = css.match(/\.portfolio-intro-wave\s*\{[^}]+\}/)?.[0];

  assert.ok(waveRule);
  assert.match(waveRule, /translate:\s*-50%\s+-50%/);
  assert.doesNotMatch(waveRule, /transform:\s*translate\(/);
});

test("the intro clips only the site header, not nested section headers", () => {
  const component = readFileSync(
    new URL(
      "../src/components/portfolio-intro/PortfolioIntro.jsx",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(
    component,
    /const CLIP_SELECTOR = "\.site-header, #main, \.mobile-bottom-nav";/,
  );
  assert.doesNotMatch(component, /const CLIP_SELECTOR = "header,/);
});
