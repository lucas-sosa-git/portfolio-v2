const themeButton = document.getElementById("theme-toggle");
const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
let savedTheme = null;

try {
  savedTheme = localStorage.getItem("theme");
} catch {
  // The system preference remains available when storage is disabled.
}

const userHasThemeChoice = savedTheme === "light" || savedTheme === "dark";

function setTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  if (!themeButton) return;
  themeButton.textContent = mode === "light" ? "☀️" : "🌙";
  themeButton.setAttribute(
    "aria-label",
    mode === "light" ? "Cambiar a tema oscuro" : "Cambiar a tema claro",
  );
}

setTheme(
  userHasThemeChoice
    ? savedTheme
    : darkModeQuery.matches
      ? "dark"
      : "light",
);

themeButton?.addEventListener("click", () => {
  const next = document.body.classList.contains("light") ? "dark" : "light";
  setTheme(next);
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Theme selection still applies to the current page.
  }
});

if (!userHasThemeChoice) {
  const followSystemTheme = (event) => setTheme(event.matches ? "dark" : "light");
  darkModeQuery.addEventListener?.("change", followSystemTheme);
}

const navbar = document.querySelector(".navbar");

if (navbar) {
  const COMPACT_SCROLL_Y = 90;
  const EXPANDED_SCROLL_Y = 35;
  let isCompact = window.scrollY > COMPACT_SCROLL_Y;

  navbar.dataset.compact = String(isCompact);

  window.addEventListener(
    "scroll",
    () => {
      const nextCompact = isCompact
        ? window.scrollY >= EXPANDED_SCROLL_Y
        : window.scrollY > COMPACT_SCROLL_Y;

      if (nextCompact === isCompact) return;
      isCompact = nextCompact;
      navbar.dataset.compact = String(isCompact);
    },
    { passive: true },
  );
}

document.querySelectorAll(".copy-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy || "";
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const input = document.createElement("input");
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    button.classList.add("ok");
    window.setTimeout(() => button.classList.remove("ok"), 1200);
  });
});

(() => {
  const items = Array.from(document.querySelectorAll(".mobile-bottom-nav .mbn-item"));
  const observedSections = items
    .map((item) => document.querySelector(item.getAttribute("href") || ""))
    .filter(Boolean);
  if (!items.length || !observedSections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible?.target?.id) return;
      items.forEach((item) => {
        item.classList.toggle(
          "active",
          item.getAttribute("href") === `#${visible.target.id}`,
        );
      });
    },
    { rootMargin: "-35% 0px -45% 0px", threshold: [0.15, 0.35, 0.6] },
  );
  observedSections.forEach((section) => observer.observe(section));
})();

(() => {
  const section = document.querySelector("#courses");
  const toolbar = section?.querySelector(".courses-toolbar");
  if (!section || !toolbar) return;
  const buttons = Array.from(toolbar.querySelectorAll(".chip-btn"));
  const cards = Array.from(section.querySelectorAll(".course-card"));

  const applyFilter = (button) => {
    buttons.forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    const selected = button.dataset.cat.toLowerCase();
    cards.forEach((card) => {
      const categories = (card.dataset.cat || "")
        .split(",")
        .map((category) => category.trim().toLowerCase());
      card.classList.toggle(
        "hidden-display",
        selected !== "all" && !categories.includes(selected),
      );
    });
  };

  toolbar.addEventListener("click", (event) => {
    const button = event.target.closest(".chip-btn");
    if (button) applyFilter(button);
  });
  applyFilter(
    buttons.find((button) => button.dataset.cat === "all") || buttons[0],
  );
})();
