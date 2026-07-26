import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  Group,
  IcosahedronGeometry,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
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

export function createSiteBackground(canvas, { isMobile = false } = {}) {
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

  const pointCount = isMobile ? 60 : 140;
  const connectionCount = isMobile ? 30 : 90;
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

  const coreGeometry = new IcosahedronGeometry(0.82, isMobile ? 1 : 2);
  const accentCoreMaterial = new MeshBasicMaterial({
    color: DARK_PALETTE.accent,
    wireframe: true,
    transparent: true,
    opacity: 0.58,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const neutralCoreMaterial = new MeshBasicMaterial({
    color: DARK_PALETTE.core,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const accentCore = new Mesh(coreGeometry, accentCoreMaterial);
  const neutralCore = new Mesh(coreGeometry, neutralCoreMaterial);
  neutralCore.scale.setScalar(1.22);
  neutralCore.rotation.set(0.35, 0.28, 0.18);
  core.add(accentCore, neutralCore);

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
    setTheme,
    render(time, delta) {
      const progressMix = 1 - Math.exp(-delta * 2.6);
      const pointerMix = 1 - Math.exp(-delta * 4.5);
      currentProgress += (targetProgress - currentProgress) * progressMix;
      currentPointerX += (targetPointerX - currentPointerX) * pointerMix;
      currentPointerY += (targetPointerY - currentPointerY) * pointerMix;

      const state = interpolateBackgroundState(currentProgress);
      const horizontalScale = isMobile ? 0.36 : 1;
      composition.position.x =
        state.focusX * horizontalScale + currentPointerX * 0.22;
      composition.position.y = state.focusY - currentPointerY * 0.15;

      network.scale.set(state.scaleX, state.scaleY, state.depthScale);
      network.rotation.x = -0.08 + currentPointerY * 0.035;
      network.rotation.y = time * 0.026 + currentPointerX * 0.05;
      network.rotation.z = state.rotationZ + Math.sin(time * 0.18) * 0.015;

      const pulse = 1 + Math.sin(time * 1.35) * 0.035;
      core.scale.setScalar(state.coreScale * pulse);
      accentCore.rotation.x = time * 0.11;
      accentCore.rotation.y = time * 0.15;
      neutralCore.rotation.x = 0.35 - time * 0.065;
      neutralCore.rotation.y = 0.28 + time * 0.08;

      const colorMix = 1 - Math.exp(-delta * 3.2);
      accentMaterial.color.lerp(targetColors.accent, colorMix);
      neutralMaterial.color.lerp(targetColors.neutral, colorMix);
      lineMaterial.color.lerp(targetColors.line, colorMix);
      accentCoreMaterial.color.lerp(targetColors.accent, colorMix);
      neutralCoreMaterial.color.lerp(targetColors.core, colorMix);
      glowMaterial.color.lerp(targetColors.accent, colorMix);

      const themeOpacity = lightTheme ? 0.68 : 1;
      accentMaterial.opacity = state.pointOpacity * themeOpacity;
      neutralMaterial.opacity = state.pointOpacity * 0.7 * themeOpacity;
      lineMaterial.opacity = state.lineOpacity * themeOpacity;
      accentCoreMaterial.opacity = state.coreOpacity * 0.74 * themeOpacity;
      neutralCoreMaterial.opacity = state.coreOpacity * 0.38 * themeOpacity;
      glowMaterial.opacity = state.coreOpacity * 0.5 * themeOpacity;

      renderer.render(scene, camera);
    },
    dispose() {
      accentGeometry.dispose();
      neutralGeometry.dispose();
      connectionGeometry.dispose();
      coreGeometry.dispose();
      accentMaterial.dispose();
      neutralMaterial.dispose();
      lineMaterial.dispose();
      accentCoreMaterial.dispose();
      neutralCoreMaterial.dispose();
      glowMaterial.dispose();
      glowTexture?.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
