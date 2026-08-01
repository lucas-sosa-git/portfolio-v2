import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  LineLoop,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import {
  BACKGROUND_STATES,
  interpolateBackgroundState,
} from "./backgroundState";

const DARK_PALETTE = {
  accent: "#e9444a",
  neutral: "#fff2ea",
  line: "#f37676",
  core: "#fff8f3",
};

const LIGHT_PALETTE = {
  accent: "#b32222",
  neutral: "#713838",
  line: "#c63a3a",
  core: "#7b2121",
};

const SCROLL_RESPONSE_RATE = 0.72;
const LISSAJOUS_PHASES = [0, 0.8, 1.6];
const LISSAJOUS_OPACITY = [1, 0.72, 0.48];
const LISSAJOUS_COLOR_KEYS = ["accent", "line", "core"];
const LISSAJOUS_SCALE = { mobile: 1.72, desktop: 1.04 };

function createSeededRandom(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function createPointGeometry(positions) {
  const geometry = new BufferGeometry();
  geometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(positions), 3),
  );
  return geometry;
}

function createNetwork(pointCount, connectionCount) {
  const random = createSeededRandom(0x4c534f53);
  const positions = [];
  const accentPositions = [];
  const neutralPositions = [];

  for (let index = 0; index < pointCount; index += 1) {
    const lane = index % 7;
    const angle = (index / pointCount) * Math.PI * 4.6 + lane * 0.44;
    const radius = 2.1 + random() * 5.8;
    const x = Math.cos(angle) * radius + (random() - 0.5) * 1.1;
    const y = Math.sin(angle * 0.63) * 2.7 + (random() - 0.5) * 1.7;
    const z = (random() - 0.5) * 5.8;
    const point = [x, y, z];

    positions.push(point);
    (index % 4 === 0 ? accentPositions : neutralPositions).push(...point);
  }

  const candidates = [];
  for (let first = 0; first < positions.length; first += 1) {
    for (let second = first + 1; second < positions.length; second += 1) {
      const dx = positions[first][0] - positions[second][0];
      const dy = positions[first][1] - positions[second][1];
      const dz = positions[first][2] - positions[second][2];
      candidates.push({ first, second, distance: dx * dx + dy * dy + dz * dz });
    }
  }
  candidates.sort((a, b) => a.distance - b.distance);

  const connectionPositions = [];
  candidates.slice(0, connectionCount).forEach(({ first, second }) => {
    connectionPositions.push(...positions[first], ...positions[second]);
  });

  return {
    accentGeometry: createPointGeometry(accentPositions),
    neutralGeometry: createPointGeometry(neutralPositions),
    connectionGeometry: createPointGeometry(connectionPositions),
  };
}

function createGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext("2d");
  if (!context) return null;

  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.98)");
  gradient.addColorStop(0.08, "rgba(255,242,235,0.88)");
  gradient.addColorStop(0.3, "rgba(233,68,74,0.48)");
  gradient.addColorStop(1, "rgba(213,42,42,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

function updateLissajousGeometry(
  geometry,
  phaseOffset,
  time,
  reveal = 1,
  regularity = 1,
) {
  const positions = geometry.getAttribute("position");
  const pointCount = positions.count;
  const phase = time * 0.075;
  const amplitude = 0.68 + reveal * 0.32;
  const chaos = 1 - regularity;

  for (let index = 0; index < pointCount; index += 1) {
    const angle = (index / pointCount) * Math.PI * 2;
    const jitter =
      Math.sin(index * 0.07 + phaseOffset * 1.3 + time * 0.3) * 0.02 +
      chaos *
        (Math.sin(index * 0.61 + phaseOffset * 2.4) * 0.12 +
          Math.cos(index * 0.19 - phaseOffset) * 0.055);

    positions.setXYZ(
      index,
      Math.sin(3 * angle + phase + phaseOffset) * amplitude + jitter,
      Math.sin(2 * angle + phase * 1.22 + phaseOffset * 0.8) *
        amplitude +
        jitter,
      Math.sin(angle + phaseOffset * 1.1 + 0.55) * amplitude,
    );
  }

  positions.needsUpdate = true;
}

export function createSiteBackground(
  canvas,
  { isMobile = false, introState = null, reducedMotion = false } = {},
) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(44, 1, 0.1, 50);
  const composition = new Group();
  const network = new Group();
  const core = new Group();
  scene.add(composition);
  composition.add(network, core);

  const pointCount = isMobile ? 38 : 92;
  const connectionCount = isMobile ? 16 : 46;
  const {
    accentGeometry,
    neutralGeometry,
    connectionGeometry,
  } = createNetwork(pointCount, connectionCount);

  const accentMaterial = new PointsMaterial({
    color: DARK_PALETTE.accent,
    size: isMobile ? 0.105 : 0.082,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const neutralMaterial = new PointsMaterial({
    color: DARK_PALETTE.neutral,
    size: isMobile ? 0.07 : 0.055,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.72,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const lineMaterial = new LineBasicMaterial({
    color: DARK_PALETTE.line,
    transparent: true,
    opacity: 0.24,
    blending: AdditiveBlending,
    depthWrite: false,
  });

  network.add(
    new Points(accentGeometry, accentMaterial),
    new Points(neutralGeometry, neutralMaterial),
    new LineSegments(connectionGeometry, lineMaterial),
  );

  const lissajousPointCount = isMobile ? 160 : 260;
  const lissajousGeometries = LISSAJOUS_PHASES.map(() =>
    createPointGeometry(new Array(lissajousPointCount * 3).fill(0)),
  );
  const lissajousMaterials = LISSAJOUS_COLOR_KEYS.map(
    (colorKey) => new LineBasicMaterial({
      color: DARK_PALETTE[colorKey],
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    }),
  );
  const lissajous = new Group();
  lissajous.scale.setScalar(
    isMobile ? LISSAJOUS_SCALE.mobile : LISSAJOUS_SCALE.desktop,
  );
  lissajous.rotation.x = 0.16;
  LISSAJOUS_PHASES.forEach((phaseOffset, index) => {
    updateLissajousGeometry(lissajousGeometries[index], phaseOffset, 0);
    lissajous.add(
      new LineLoop(lissajousGeometries[index], lissajousMaterials[index]),
    );
  });
  core.add(lissajous);

  const glowTexture = createGlowTexture();
  const glowMaterial = new SpriteMaterial({
    map: glowTexture,
    color: DARK_PALETTE.accent,
    transparent: true,
    opacity: 0.4,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const glow = new Sprite(glowMaterial);
  glow.scale.set(4.2, 4.2, 1);
  core.add(glow);

  let targetProgress = 0;
  let currentProgress = 0;
  let targetPointerX = 0;
  let targetPointerY = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;
  let lightTheme = false;
  let reducedMotionEnabled = reducedMotion;
  const targetColors = {
    accent: new Color(DARK_PALETTE.accent),
    neutral: new Color(DARK_PALETTE.neutral),
    line: new Color(DARK_PALETTE.line),
    core: new Color(DARK_PALETTE.core),
  };

  const setTheme = (isLight) => {
    lightTheme = isLight;
    const palette = isLight ? LIGHT_PALETTE : DARK_PALETTE;
    Object.entries(targetColors).forEach(([key, color]) => {
      color.set(palette[key]);
    });
  };

  return {
    resize(width, height) {
      const safeWidth = Math.max(width, 1);
      const safeHeight = Math.max(height, 1);
      const mobileViewport = safeWidth <= 640;
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, mobileViewport ? 1 : 1.5),
      );
      renderer.setSize(safeWidth, safeHeight, false);
      camera.aspect = safeWidth / safeHeight;
      camera.position.z = camera.aspect < 0.8 ? 14.5 : 11.8;
      camera.updateProjectionMatrix();
    },
    setScrollProgress(progress) {
      targetProgress = Math.min(
        Math.max(progress, 0),
        BACKGROUND_STATES.length - 1,
      );
    },
    setPointer(x, y) {
      targetPointerX = x;
      targetPointerY = y;
    },
    setReducedMotion(value) {
      reducedMotionEnabled = value;
      if (value) {
        targetPointerX = 0;
        targetPointerY = 0;
      }
    },
    setTheme,
    render(time, delta) {
      const progressMix = 1 - Math.exp(-delta * SCROLL_RESPONSE_RATE);
      const pointerMix = 1 - Math.exp(-delta * 4.5);
      currentProgress += (targetProgress - currentProgress) * progressMix;
      currentPointerX += (targetPointerX - currentPointerX) * pointerMix;
      currentPointerY += (targetPointerY - currentPointerY) * pointerMix;

      const state = interpolateBackgroundState(currentProgress);
      const introReveal = introState?.reveal ?? 1;
      const introEnergy = introState?.energy ?? 1;
      const introRegularity = introState?.regularity ?? 1;
      const introEnvironment = introState?.environment ?? 1;
      const ambientSectionMix = 0.52 + Math.min(currentProgress, 1) * 0.48;
      const motionTime = time * (reducedMotionEnabled ? 0.14 : 1);
      const heroProgress = Math.min(currentProgress, 1);
      const horizontalScale = isMobile ? 0.3 + heroProgress * 0.32 : 1;
      const mobileIntensity = isMobile ? 0.72 : 1;
      composition.position.x =
        state.focusX * horizontalScale + currentPointerX * 0.22;
      composition.position.y =
        state.focusY -
        currentPointerY * 0.15 -
        (isMobile ? (1 - heroProgress) * 2.05 : 0);

      network.scale.set(state.scaleX, state.scaleY, state.depthScale);
      network.rotation.x = -0.08 + currentPointerY * 0.035;
      network.rotation.y = motionTime * 0.026 + currentPointerX * 0.05;
      network.rotation.z =
        state.rotationZ + Math.sin(motionTime * 0.18) * 0.015;

      const pulseAmount = reducedMotionEnabled ? 0.008 : 0.035;
      const pulse = 1 + Math.sin(motionTime * 1.35) * pulseAmount;
      core.scale.setScalar(
        state.coreScale *
          pulse *
          (0.58 + introReveal * 0.42) *
          (isMobile ? 0.68 : 1),
      );
      lissajous.rotation.y = motionTime * 0.045;
      lissajous.rotation.z = motionTime * 0.025;
      LISSAJOUS_PHASES.forEach((phaseOffset, index) => {
        updateLissajousGeometry(
          lissajousGeometries[index],
          phaseOffset,
          motionTime,
          introReveal,
          introRegularity,
        );
      });

      const colorMix = 1 - Math.exp(-delta * 3.2);
      accentMaterial.color.lerp(targetColors.accent, colorMix);
      neutralMaterial.color.lerp(targetColors.neutral, colorMix);
      lineMaterial.color.lerp(targetColors.line, colorMix);
      glowMaterial.color.lerp(targetColors.accent, colorMix);
      lissajousMaterials.forEach((material, index) => {
        material.color.lerp(
          targetColors[LISSAJOUS_COLOR_KEYS[index]],
          colorMix,
        );
      });

      const themeOpacity = lightTheme ? 0.68 : 1;
      accentMaterial.opacity =
        state.pointOpacity *
        themeOpacity *
        mobileIntensity *
        ambientSectionMix *
        introEnvironment;
      neutralMaterial.opacity =
        state.pointOpacity *
        0.7 *
        themeOpacity *
        mobileIntensity *
        ambientSectionMix *
        introEnvironment;
      lineMaterial.opacity =
        state.lineOpacity *
        themeOpacity *
        mobileIntensity *
        ambientSectionMix *
        introEnvironment;
      glowMaterial.opacity =
        state.coreOpacity *
        0.5 *
        themeOpacity *
        mobileIntensity *
        introEnergy;
      lissajousMaterials.forEach((material, index) => {
        material.opacity =
          state.coreOpacity *
          LISSAJOUS_OPACITY[index] *
          themeOpacity *
          mobileIntensity *
          Math.max(0.04, introReveal) *
          (0.72 + introEnergy * 0.28);
      });

      renderer.render(scene, camera);
    },
    dispose() {
      accentGeometry.dispose();
      neutralGeometry.dispose();
      connectionGeometry.dispose();
      lissajousGeometries.forEach((geometry) => geometry.dispose());
      accentMaterial.dispose();
      neutralMaterial.dispose();
      lineMaterial.dispose();
      glowMaterial.dispose();
      lissajousMaterials.forEach((material) => material.dispose());
      glowTexture?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
