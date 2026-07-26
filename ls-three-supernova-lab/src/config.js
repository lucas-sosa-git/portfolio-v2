export const PHASE = Object.freeze({
  IDLE: "idle",
  STABILITY: "stability",
  IMPLOSION: "implosion",
  CORE: "core",
  BOUNCE: "bounce",
  TENSION: "tension",
  STALLED_SHOCK: "stalled-shock",
  IGNITION: "ignition",
  FLASH: "flash",
  EXPLOSION: "explosion",
  DISSIPATION: "dissipation",
  COMPLETE: "complete",
});

export const PHASE_LABELS = Object.freeze({
  [PHASE.IDLE]: "Sistema estable",
  [PHASE.STABILITY]: "Estabilidad",
  [PHASE.IMPLOSION]: "La gravedad gana",
  [PHASE.CORE]: "Núcleo ultracompacto",
  [PHASE.BOUNCE]: "Compresión final",
  [PHASE.TENSION]: "Pausa de tensión",
  [PHASE.STALLED_SHOCK]: "Choque detenido",
  [PHASE.IGNITION]: "Ignición blanca",
  [PHASE.FLASH]: "La luz escapa",
  [PHASE.EXPLOSION]: "Supernova",
  [PHASE.DISSIPATION]: "Disipación",
  [PHASE.COMPLETE]: "Secuencia completa",
});

export const DEFAULT_TIMING = Object.freeze({
  [PHASE.STABILITY]: 0.22,
  [PHASE.IMPLOSION]: 0.72,
  [PHASE.CORE]: 0.25,
  [PHASE.BOUNCE]: 0.14,
  [PHASE.TENSION]: 0.17,
  [PHASE.STALLED_SHOCK]: 0.18,
  [PHASE.IGNITION]: 0.14,
  [PHASE.FLASH]: 0.2,
  [PHASE.EXPLOSION]: 1.05,
  [PHASE.DISSIPATION]: 0.72,
});

export const PHASE_ORDER = Object.freeze(Object.keys(DEFAULT_TIMING));

export const DEFAULT_PARAMS = Object.freeze({
  speed: 1,
  coreScale: 0.3,
  concavity: 0.72,
  cornerResistance: 0.76,
  implosionAsymmetry: 0.68,
  implosionDuration: 0.72,
  noise: 0.06,
  tensionDuration: 0.17,
  instability: 0.58,
  stallDuration: 0.18,
  bloom: 1,
  particleAmount: 1,
  asymmetry: 0.68,
  lobeStrength: 0.82,
  dissipation: 0.72,
});

export const BLOOM_BY_PHASE = Object.freeze({
  [PHASE.IDLE]: [0.15, 0.2, 0.9],
  [PHASE.STABILITY]: [0.15, 0.2, 0.9],
  [PHASE.IMPLOSION]: [0.25, 0.28, 0.86],
  [PHASE.CORE]: [0.65, 0.38, 0.72],
  [PHASE.BOUNCE]: [0.88, 0.42, 0.62],
  [PHASE.TENSION]: [1.02, 0.46, 0.55],
  [PHASE.STALLED_SHOCK]: [1.02, 0.46, 0.55],
  [PHASE.IGNITION]: [1.6, 0.55, 0.32],
  [PHASE.FLASH]: [1.75, 0.58, 0.08],
  [PHASE.EXPLOSION]: [0.52, 0.34, 0.42],
  [PHASE.DISSIPATION]: [0.4, 0.3, 0.75],
  [PHASE.COMPLETE]: [0.15, 0.2, 0.9],
});

export const EXPLOSION_ENTRY_STATE = Object.freeze({
  phase: PHASE.STALLED_SHOCK,
  defaultTimestamp: 1.5,
  position: Object.freeze([0, 0, 0]),
  rotation: Object.freeze([0, 0, 0]),
  cameraZ: 7,
  core: Object.freeze({
    scale: 1,
    opacity: 1,
    pulse: 1,
    compression: 0,
    shockCharge: 0.72,
    heat: 0.62,
    ignition: 0,
  }),
  stalledShock: Object.freeze({
    radius: 0.085,
    thickness: 0.006,
    irregularity: 0.46,
    opacity: 0.65,
  }),
  bloom: Object.freeze([1.02, 0.46, 0.55]),
  particles: Object.freeze({
    infallOpacity: 0,
    ejectaOpacity: 0,
    ejectaProgress: 0,
  }),
  colorSource: "compactCore shader (unchanged)",
});

export function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

export function easeInCubic(value) {
  const t = clamp01(value);
  return t * t * t;
}

export function easeOutExpo(value) {
  const t = clamp01(value);
  return t === 1 ? 1 : 1 - 2 ** (-10 * t);
}

export function smoothstep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

export function getCornerDelaySeconds(cornerId) {
  const normalizedId = Math.min(7, Math.max(0, Math.floor(cornerId)));
  const sequence = ((normalizedId + 1) * 0.61803398875) % 1;
  return 0.03 + sequence * 0.05;
}

export function getExplosionSourceVisibility(progress) {
  return 1 - smoothstep(clamp01(progress / 0.2));
}

export function getExplosionFlashProgress(progress) {
  return smoothstep(progress);
}

const FLASH_SHOCK_TRAVEL = 0.05;
const EJECTA_TRAVEL = 0.82;

export function getFlashShockProgress(progress) {
  return smoothstep(progress) * FLASH_SHOCK_TRAVEL;
}

export function getExplosionShockProgress(progress) {
  return (
    FLASH_SHOCK_TRAVEL +
    smoothstep(progress) * (1 - FLASH_SHOCK_TRAVEL)
  );
}

export function getEjectaExpansionProgress(progress) {
  return smoothstep(progress) * EJECTA_TRAVEL;
}
