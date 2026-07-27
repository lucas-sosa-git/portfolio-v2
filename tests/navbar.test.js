import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readProjectFile = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("navbar markup keeps one shell with two converging groups", () => {
  const markup = readProjectFile("templates/navbar.html");

  assert.equal(markup.match(/class="navbar-shell"/g)?.length, 1);
  assert.equal(markup.match(/class="navbar-group navbar-group-(left|right)"/g)?.length, 2);
});

test("navbar styles preserve the expanded-to-compact horizontal contract", () => {
  const styles = readProjectFile("styles/main.css");

  assert.match(styles, /\.site-header\s*{[^}]*position:fixed/s);
  assert.match(styles, /\.navbar-shell\s*{[^}]*justify-content:space-between/s);
  assert.match(styles, /--nav-shell-expanded-max:1440px/);
  assert.match(styles, /--nav-shell-compact-max:1120px/);
  assert.match(
    styles,
    /padding-top:calc\(var\(--nav-top\) \+ var\(--nav-expanded-height\) \+ var\(--nav-hero-gap\)\)/,
  );
  assert.match(
    styles,
    /\.navbar\[data-compact="true"\] \.navbar-shell\s*{[^}]*max-width:var\(--nav-shell-compact-max\)/s,
  );
  assert.doesNotMatch(styles, /data-elevated/);
});

test("navbar scroll state uses passive hysteresis without redundant updates", () => {
  const script = readProjectFile("scripts/app.js");

  assert.match(script, /COMPACT_SCROLL_Y = 90/);
  assert.match(script, /EXPANDED_SCROLL_Y = 35/);
  assert.match(script, /if \(nextCompact === isCompact\) return/);
  assert.match(script, /{ passive: true }/);
});
