export const BACKGROUND_SECTION_IDS = [
  "hero",
  "about",
  "projects",
  "skills",
  "courses",
  "contact",
];

export const BACKGROUND_STATES = [
  {
    focusX: 2.35,
    focusY: 0.2,
    scaleX: 0.9,
    scaleY: 1.05,
    depthScale: 1,
    rotationZ: -0.08,
    coreScale: 1.08,
    coreOpacity: 0.72,
    lineOpacity: 0.27,
    pointOpacity: 0.9,
  },
  {
    focusX: -1.55,
    focusY: 0.12,
    scaleX: 1.16,
    scaleY: 0.94,
    depthScale: 1.05,
    rotationZ: 0.07,
    coreScale: 0.72,
    coreOpacity: 0.48,
    lineOpacity: 0.18,
    pointOpacity: 0.74,
  },
  {
    focusX: 0.05,
    focusY: 0,
    scaleX: 1.42,
    scaleY: 0.58,
    depthScale: 0.82,
    rotationZ: 0,
    coreScale: 0.46,
    coreOpacity: 0.38,
    lineOpacity: 0.3,
    pointOpacity: 0.72,
  },
  {
    focusX: 1.5,
    focusY: 0.22,
    scaleX: 0.82,
    scaleY: 0.82,
    depthScale: 1.12,
    rotationZ: -0.05,
    coreScale: 0.62,
    coreOpacity: 0.45,
    lineOpacity: 0.16,
    pointOpacity: 0.68,
  },
  {
    focusX: -1.42,
    focusY: -0.12,
    scaleX: 1.06,
    scaleY: 0.7,
    depthScale: 0.94,
    rotationZ: 0.06,
    coreScale: 0.52,
    coreOpacity: 0.4,
    lineOpacity: 0.14,
    pointOpacity: 0.64,
  },
  {
    focusX: 1.72,
    focusY: -0.42,
    scaleX: 0.74,
    scaleY: 0.74,
    depthScale: 1,
    rotationZ: -0.03,
    coreScale: 0.92,
    coreOpacity: 0.68,
    lineOpacity: 0.24,
    pointOpacity: 0.82,
  },
];

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function getSectionProgress(sectionCenters, scrollY, viewportHeight) {
  if (!sectionCenters.length) return 0;

  const viewportCenter = scrollY + viewportHeight * 0.5;
  if (viewportCenter <= sectionCenters[0]) return 0;

  const lastIndex = sectionCenters.length - 1;
  if (viewportCenter >= sectionCenters[lastIndex]) return lastIndex;

  for (let index = 0; index < lastIndex; index += 1) {
    const start = sectionCenters[index];
    const end = sectionCenters[index + 1];
    if (viewportCenter <= end) {
      return index + (viewportCenter - start) / Math.max(end - start, 1);
    }
  }

  return lastIndex;
}

export function interpolateBackgroundState(
  progress,
  states = BACKGROUND_STATES,
) {
  const lastIndex = states.length - 1;
  const clampedProgress = clamp(progress, 0, lastIndex);
  const startIndex = Math.floor(clampedProgress);
  const endIndex = Math.min(startIndex + 1, lastIndex);
  const linearMix = clampedProgress - startIndex;
  const mix = linearMix * linearMix * (3 - 2 * linearMix);
  const start = states[startIndex];
  const end = states[endIndex];

  return Object.fromEntries(
    Object.keys(start).map((key) => [
      key,
      start[key] + (end[key] - start[key]) * mix,
    ]),
  );
}
