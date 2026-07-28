import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  HERO_MOTION,
  getIntroPreference,
} from "../src/components/portfolio-intro/introConfig.js";

const component = readFileSync(
  new URL(
    "../src/components/portfolio-intro/PortfolioIntro.jsx",
    import.meta.url,
  ),
  "utf8",
);
const heroTemplate = readFileSync(
  new URL("../templates/hero.html", import.meta.url),
  "utf8",
);

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

test("the hero intro uses one scoped master timeline", () => {
  assert.equal(component.match(/createTimeline\(/g)?.length, 1);
  assert.match(component, /createScope\(/);
  assert.match(component, /splitText\(/);
  assert.match(component, /scrambleText\(/);
  assert.match(component, /onScroll\(/);
  assert.doesNotMatch(component, /requestAnimationFrame|setTimeout|setInterval/);
});

test("all title regions enter together over half a second", () => {
  assert.equal(HERO_MOTION.titlePartDuration, 500);
  assert.deepEqual(HERO_MOTION.labels, {
    sceneStart: 0,
    navStart: 120,
    labelStart: 180,
    copyStart: 280,
    chaos: 480,
    resolution: 850,
    supportingCopy: 1250,
    ready: 1600,
  });
  assert.match(component, /set\(chaosChars, \{\s*opacity: 0,/);
  assert.equal(component.match(/"copy-start"/g)?.length, 5);
  assert.doesNotMatch(component, /"chaos\+=140"/);
  assert.doesNotMatch(component, /accentColor|textColor|color:\s*\[/);
  assert.equal(HERO_MOTION.labels.ready + 500, 2100);
});

test("the first viewport keeps two calls to action without a detached strengths list", () => {
  const heroSection = heroTemplate.match(/<section id="hero"[\s\S]*?<\/section>/)?.[0];

  assert.ok(heroSection);
  assert.equal(heroSection.match(/class="(?:primary|secondary)-btn"/g)?.length, 2);
  assert.doesNotMatch(heroSection, /LinkedIn/);
  assert.doesNotMatch(heroTemplate, /hero-capabilities/);
});

test("the title keeps semantic regions for precision, chaos and resolution", () => {
  assert.match(heroTemplate, /data-hero-normal/);
  assert.match(heroTemplate, /data-hero-chaos/);
  assert.match(heroTemplate, /data-hero-result/);
  assert.match(
    heroTemplate,
    /aria-label="Convierto datos desordenados en información confiable\."/,
  );
});
