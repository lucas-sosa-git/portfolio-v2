export const INTRO_SESSION_KEY = "ls-portfolio-intro-played";

export const INTRO_CONFIG = {
  enabled: true,
  playOncePerSession: true,
  allowSkip: true,
  debugAlwaysPlay: false,
  timing: {
    stable: 220,
    implosion: 720,
    coreFormation: 250,
    finalCompression: 140,
    tension: 170,
    wave: 1700,
    cleanupFade: 180,
    elementReveal: 320,
  },
  motion: {
    revealOffset: 18,
    maxBlur: 8,
  },
  implosion: {
    concavity: 0.76,
    cornerResistance: 0.78,
    asymmetry: 0.64,
    finalScale: 0.3,
    noise: 0.06,
  },
};

export const EXPLOSION_ENTRY_STATE = Object.freeze({
  timestamp: 1500,
  logo: Object.freeze({
    scaleX: 0.03,
    scaleY: 0.03,
    opacity: 0.1,
    filter: "brightness(4)",
  }),
  core: Object.freeze({
    scale: 0.88,
    opacity: 1,
    filter: "brightness(1.25)",
  }),
  flash: Object.freeze({ opacity: 0, scale: 0 }),
  raysOpacity: 0,
  wave: Object.freeze({ opacity: 0, scale: 0.01 }),
});

export function getIntroPreference({
  search = window.location.search,
  reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches,
} = {}) {
  const params = new URLSearchParams(search);
  const queryMode = params.get("intro");

  if (!INTRO_CONFIG.enabled || queryMode === "0" || reducedMotion) {
    return "skip";
  }

  if (INTRO_CONFIG.debugAlwaysPlay || queryMode === "1") {
    return "play";
  }

  if (!INTRO_CONFIG.playOncePerSession) {
    return "play";
  }

  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "true"
      ? "already-played"
      : "play";
  } catch {
    return "play";
  }
}
