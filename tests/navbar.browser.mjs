import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

// Use an existing Playwright installation; no browser dependency is bundled with the site.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const baseUrl = process.env.PORTFOLIO_TEST_URL || "http://127.0.0.1:4173/portfolio-v2/";

test("visible navigation exposes its links and supports keyboard activation at every breakpoint", async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [390, 768, 1366]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
      await page.goto(`${baseUrl}?intro=0`);
      const origin = await page.locator(".navbar-logo").evaluate(element => element.getBoundingClientRect().left);
      const heroOrigin = await page.locator("h1").evaluate(element => element.getBoundingClientRect().left);
      assert.ok(Math.abs(origin - heroOrigin) < 1, "logo and hero share their left edge");
      const desktop = width > 840;
      const navigation = page.getByRole("navigation", {
        name: desktop ? "Principal" : "Navegación principal", exact: true,
      });
      const links = navigation.getByRole("link");
      assert.equal(await links.count(), desktop ? 6 : 5);
      const inactive = page.getByRole("navigation", {
        name: desktop ? "Navegación principal" : "Principal", exact: true,
      });
      assert.equal(await inactive.getByRole("link", { name: "Contacto", exact: true }).count(), 0);

      const contact = navigation.getByRole("link", { name: "Contacto", exact: true });
      await contact.focus();
      assert.equal(await contact.evaluate(element => document.activeElement === element), true);
      await page.keyboard.press("Enter");
      await page.waitForURL(url => url.hash === "#contact");
      assert.equal(await page.locator("#contact").isVisible(), true);
      await page.waitForFunction(() => Math.abs(document.querySelector(".navbar-logo").getBoundingClientRect().left - document.querySelector("#contact h2").getBoundingClientRect().left) < 1);
      await page.close();
    }
  } finally {
    await browser.close();
  }
});
