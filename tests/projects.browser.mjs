import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { projects } from "../src/data/projects.js";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || "playwright");
const baseUrl = process.env.PORTFOLIO_TEST_URL || "http://127.0.0.1:4173/portfolio-v2/";

test("featured and supporting project cards stay aligned and readable across viewport sizes and themes", async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome" });
  try {
    for (const width of [320, 390, 768, 1366]) {
      for (const colorScheme of ["dark", "light"]) {
        const page = await browser.newPage({ viewport: { width, height: 768 }, colorScheme, reducedMotion: "reduce" });
        await page.goto(`${baseUrl}?intro=0#projects`);
        await page.locator(".project-entry").last().waitFor();
        await page.evaluate(() => document.fonts.ready);
        const layout = await page.evaluate(() => {
          const rect = selector => document.querySelector(selector).getBoundingClientRect();
          const cards = [...document.querySelectorAll(".project-entry")].map(card => {
            const { width, height, top } = card.getBoundingClientRect();
            return { width, height, top };
          });
          return {
            logo: rect(".navbar-logo").left,
            heading: rect(".projects-gallery__header h2").left,
            left: rect(".projects-gallery__list").left,
            right: rect(".projects-gallery__list").right,
            contentRight: rect("main").right - parseFloat(getComputedStyle(document.querySelector("main")).paddingRight),
            gridHeight: rect(".projects-gallery__list").height,
            overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
            cards,
          };
        });
        assert.equal(layout.cards.length, projects.length);
        assert.ok(Math.abs(layout.logo - layout.left) < 1, `${width}: grid aligns with logo`);
        assert.ok(Math.abs(layout.logo - layout.heading) < 1, `${width}: heading aligns with logo`);
        assert.ok(Math.abs(layout.right - layout.contentRight) < 1);
        assert.equal(layout.overflow, false);
        assert.equal(layout.cards.filter(card => card.top === layout.cards[0].top).length, 1);
        assert.ok(Math.abs(layout.cards[0].width - (layout.right - layout.left)) < 1);
        if (width === 1366) assert.ok(layout.gridHeight < 1000, "the three cases fit in a compact gallery");

        await page.getByRole("button", { name: `Ver proyecto: ${projects[0].title}`, exact: true }).click();
        await page.getByRole("dialog").waitFor();
        assert.equal(await page.locator(".project-dialog__panel").evaluate(element => element.scrollWidth <= element.clientWidth), true);
        assert.equal(await page.locator(".project-dialog__body").evaluate(element => element.scrollWidth <= element.clientWidth), true);
        await page.getByRole("button", { name: "Cerrar caso" }).click();
        await page.locator(".project-dialog").waitFor({ state: "detached" });
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
});
test("every card opens its case and the modal restores focus, contains keyboard navigation and follows links", async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || "chrome" });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 768 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(`${baseUrl}?intro=0#projects`);
    for (const project of projects) {
      const opener = page.getByRole("button", { name: `Ver proyecto: ${project.title}`, exact: true });
      await opener.focus();
      await page.keyboard.press("Enter");
      const dialog = page.getByRole("dialog", { name: project.title, exact: true });
      await dialog.waitFor();
      assert.equal(await dialog.locator(".project-dialog__summary").textContent(), project.summary);
      assert.equal(await dialog.locator(".project-dialog__technologies li").count(), project.technologies.length);
      assert.equal(await dialog.getAttribute("data-keyboard"), "true");
      assert.equal(await page.evaluate(() => document.body.style.overflow), "hidden");
      const close = dialog.getByRole("button", { name: "Cerrar caso" });
      assert.equal(await close.evaluate(element => document.activeElement === element), true);
      await opener.evaluate(element => element.focus());
      assert.equal(await close.evaluate(element => document.activeElement === element), true, "the background is inert");
      for (let index = 0; index < 5; index++) {
        await page.keyboard.press("Tab");
        // Native dialogs allow visiting browser chrome; no background control may receive focus.
        assert.equal(await dialog.evaluate(element => document.activeElement === document.body || element.contains(document.activeElement)), true);
      }
      for (const href of [project.liveUrl, project.githubUrl].filter(Boolean)) {
        assert.equal(await dialog.locator(`a[href="${href}"]`).count(), 1);
      }
      await page.keyboard.press("Escape");
      await page.locator(".project-dialog").waitFor({ state: "detached" });
      assert.equal(await opener.evaluate(element => document.activeElement === element), true);
      assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    }

    // The image is covered by the same accessible button as the title.
    await page.locator(".project-entry article").first().click({ position: { x: 20, y: 20 } });
    await page.getByRole("dialog").waitFor();
    await page.mouse.click(4, 4);
    await page.locator(".project-dialog").waitFor({ state: "detached" });

    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
