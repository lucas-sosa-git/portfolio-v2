export const INTRO_SESSION_KEY = "ls-hero-intro-played";

export const HERO_MOTION = Object.freeze({
  wordStagger: 55,
  charStagger: 22,
  titlePartDuration: 500,
  chaosDistance: 18,
  chaosRotation: 4,
  labels: Object.freeze({
    sceneStart: 0,
    navStart: 120,
    labelStart: 180,
    copyStart: 280,
    chaos: 480,
    resolution: 850,
    supportingCopy: 1250,
    ready: 1600,
  }),
});

export function getIntroPreference({
  search = window.location.search,
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches,
} = {}) {
  const queryMode = new URLSearchParams(search).get("intro");

  if (queryMode === "0" || reducedMotion) return "skip";
  if (queryMode === "1") return "play";

  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "true"
      ? "already-played"
      : "play";
  } catch {
    return "play";
  }
}
