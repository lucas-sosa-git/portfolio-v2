import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readProjectFile = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

const template = readProjectFile("templates/sobre-mi.html");
const component = readProjectFile(
  "src/components/about/AboutSectionMotion.jsx",
);
const styles = readProjectFile("styles/main.css");

test("about follows the requested semantic reading order", () => {
  const indexPosition = template.indexOf("data-about-index");
  const titlePosition = template.indexOf("data-about-title");
  const photoPosition = template.indexOf("data-about-photo");
  const detailPosition = template.indexOf("data-about-detail");

  assert.ok(indexPosition < titlePosition);
  assert.ok(titlePosition < photoPosition);
  assert.ok(photoPosition < detailPosition);
  assert.equal(template.match(/data-about-area/g)?.length, 3);
  assert.match(template, /<dl class="about-areas"/);
  assert.doesNotMatch(template, /about-list|about-lead/);
});

test("about motion uses one scoped, one-shot Anime.js timeline", () => {
  assert.equal(component.match(/createTimeline\(/g)?.length, 1);
  assert.equal(component.match(/new IntersectionObserver\(/g)?.length, 1);
  assert.match(component, /mobile: "\(max-width: 760px\)"/);
  assert.match(component, /self\.matches\.mobile/);
  assert.match(component, /scrambleText\(\{/);
  assert.match(component, /observer\?\.disconnect\(\)/);
  assert.match(component, /scope\.revert\(\)/);
  assert.doesNotMatch(component, /requestAnimationFrame|setTimeout|setInterval/);
});

test("about reserves the final title and provides reduced motion styles", () => {
  assert.match(template, /class="about-title-reserve"/);
  assert.match(styles, /\.about-title-reserve\s*{[^}]*visibility:hidden/s);
  assert.match(styles, /@media \(prefers-reduced-motion:reduce\)/);
  assert.doesNotMatch(styles, /\.about-photo:hover/);
});
