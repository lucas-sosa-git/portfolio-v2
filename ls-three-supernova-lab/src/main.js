import * as THREE from "three";
import { PHASE_LABELS } from "./config";
import { SupernovaController } from "./SupernovaController";
import { createCamera } from "./scene/createCamera";
import { createPostprocessing } from "./scene/createPostprocessing";
import { createRenderer } from "./scene/createRenderer";
import {
  createSupernovaOrigin,
  getProjectedOrigin,
} from "./scene/createSupernovaOrigin";
import { CompactCore } from "./objects/CompactCore";
import { EjectaParticles } from "./objects/EjectaParticles";
import { EjectaShell } from "./objects/EjectaShell";
import { InfallParticles } from "./objects/InfallParticles";
import { LogoBlock } from "./objects/LogoBlock";
import { ShockFront } from "./objects/ShockFront";
import { StalledShock } from "./objects/StalledShock";
import { WhiteFlash } from "./objects/WhiteFlash";

const canvas = document.querySelector("#supernovaCanvas");
const fallback = document.querySelector("#webglFallback");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mobile = window.matchMedia("(max-width: 760px)").matches;

let renderer;
try {
  renderer = createRenderer(canvas);
  renderer.getContext();
} catch (error) {
  console.error("WebGL initialization failed", error);
  fallback.hidden = false;
  canvas.hidden = true;
  throw error;
}

const scene = new THREE.Scene();
scene.background = new THREE.Color("#050507");
scene.fog = new THREE.FogExp2("#050507", 0.052);
const camera = createCamera();
const postprocessing = createPostprocessing(renderer, scene, camera);
renderer.info.autoReset = false;

const { origin: supernovaOrigin, groups } = createSupernovaOrigin();
const {
  logoGroup,
  collapseGroup,
  shockGroup,
  explosionGroup,
} = groups;
scene.add(supernovaOrigin);

const objects = {
  logo: new LogoBlock(),
  core: new CompactCore(),
  infall: new InfallParticles({ mobile }),
  stalledShock: new StalledShock(),
  flash: new WhiteFlash(),
  shockFront: new ShockFront(),
  ejectaShell: new EjectaShell(),
  ejectaParticles: new EjectaParticles({ mobile }),
};

logoGroup.add(objects.logo.mesh);
collapseGroup.add(objects.infall.points, objects.core.mesh);
shockGroup.add(objects.stalledShock.mesh, objects.shockFront.mesh);
explosionGroup.add(
  objects.flash.mesh,
  objects.ejectaShell.mesh,
  objects.ejectaParticles.points,
);

const controller = new SupernovaController({
  objects,
  bloomPass: postprocessing.bloomPass,
  camera,
  origin: supernovaOrigin,
  reducedMotion,
});

function createBackgroundStars() {
  const count = mobile ? 280 : 680;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const white = new THREE.Color("#b8b6c1");
  const red = new THREE.Color("#8f2538");
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (Math.random() - 0.5) * 22;
    positions[offset + 1] = (Math.random() - 0.5) * 15;
    positions[offset + 2] = -2 - Math.random() * 7;
    const color = Math.random() > 0.92 ? red : white;
    colors[offset] = color.r;
    colors[offset + 1] = color.g;
    colors[offset + 2] = color.b;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const material = new THREE.PointsMaterial({
    size: mobile ? 0.018 : 0.024,
    vertexColors: true,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    toneMapped: false,
  });
  const points = new THREE.Points(geometry, material);
  points.renderOrder = -1;
  scene.add(points);
  return { points, geometry, material };
}

const starField = createBackgroundStars();

const ui = {
  phase: document.querySelector("#phaseValue"),
  phaseLabel: document.querySelector("#phaseLabel"),
  phaseTime: document.querySelector("#phaseTimeValue"),
  progressValue: document.querySelector("#globalProgressValue"),
  progressBar: document.querySelector("#globalProgressBar"),
  fps: document.querySelector("#fpsValue"),
  drawCalls: document.querySelector("#drawCallsValue"),
  particles: document.querySelector("#particlesValue"),
  play: document.querySelector("#playButton"),
  pause: document.querySelector("#pauseButton"),
  reset: document.querySelector("#resetButton"),
  phaseSelect: document.querySelector("#phaseSelect"),
};

const paramFormatters = {
  speed: (value) => `${Number(value).toFixed(2)}×`,
  coreScale: (value) => `${value}%`,
  concavity: (value) => `${value}%`,
  cornerResistance: (value) => `${value}%`,
  implosionAsymmetry: (value) => `${value}%`,
  implosionDuration: (value) => `${value} ms`,
  noise: (value) => `${value}%`,
  tensionDuration: (value) => `${value} ms`,
  instability: (value) => `${value}%`,
  stallDuration: (value) => `${value} ms`,
  bloom: (value) => `${value}%`,
  particleAmount: (value) => `${value}%`,
  asymmetry: (value) => `${value}%`,
  lobeStrength: (value) => `${value}%`,
  dissipation: (value) => `${value} ms`,
};

function readParams() {
  return {
    speed: Number(document.querySelector("#speed").value),
    coreScale: Number(document.querySelector("#coreScale").value) / 100,
    concavity: Number(document.querySelector("#concavity").value) / 100,
    cornerResistance:
      Number(document.querySelector("#cornerResistance").value) / 100,
    implosionAsymmetry:
      Number(document.querySelector("#implosionAsymmetry").value) / 100,
    implosionDuration:
      Number(document.querySelector("#implosionDuration").value) / 1000,
    noise: Number(document.querySelector("#noise").value) / 100,
    tensionDuration:
      Number(document.querySelector("#tensionDuration").value) / 1000,
    instability: Number(document.querySelector("#instability").value) / 100,
    stallDuration: Number(document.querySelector("#stallDuration").value) / 1000,
    bloom: Number(document.querySelector("#bloom").value) / 100,
    particleAmount: Number(document.querySelector("#particleAmount").value) / 100,
    asymmetry: Number(document.querySelector("#asymmetry").value) / 100,
    lobeStrength: Number(document.querySelector("#lobeStrength").value) / 100,
    dissipation: Number(document.querySelector("#dissipation").value) / 1000,
  };
}

document.querySelectorAll('input[type="range"]').forEach((input) => {
  const output = document.querySelector(`[data-output-for="${input.id}"]`);
  const update = () => {
    output.value = paramFormatters[input.id](input.value);
    controller.setParams(readParams());
  };
  input.addEventListener("input", update);
  update();
});

document.querySelectorAll('input[name="debugMode"]').forEach((input) => {
  input.addEventListener("change", () => {
    if (input.checked) objects.logo.setDebugMode(input.value);
  });
});

ui.play.addEventListener("click", () => {
  if (controller.running || controller.phase === "complete") controller.reset();
  controller.play();
});
ui.pause.addEventListener("click", () => controller.pause());
ui.reset.addEventListener("click", () => controller.reset());
ui.phaseSelect.addEventListener("change", () => {
  if (ui.phaseSelect.value) controller.jumpToPhase(ui.phaseSelect.value);
  ui.phaseSelect.value = "";
});

function updateControls(state) {
  ui.play.textContent = state.running ? "Reiniciar supernova" : "Invocar supernova";
  ui.pause.disabled = !state.running;
  ui.pause.textContent = state.paused ? "Reanudar" : "Pausar";
}

controller.addEventListener("statechange", (event) => updateControls(event.detail));
controller.addEventListener("phasechange", (event) => updateControls(event.detail));
updateControls(controller.getState());

function resize() {
  const width = window.innerWidth;
  const height = Math.max(window.innerHeight, 1);
  const aspect = width / height;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(width, height, false);
  camera.aspect = aspect;
  camera.updateProjectionMatrix();
  postprocessing.resize(width, height);
  objects.stalledShock.resize(aspect);
  objects.shockFront.resize(aspect);
  objects.flash.resize(aspect);
  const projectedOrigin = getProjectedOrigin({
    origin: supernovaOrigin,
    camera,
    viewportWidth: width,
    viewportHeight: height,
  });
  canvas.dataset.originX = projectedOrigin.x.toFixed(2);
  canvas.dataset.originY = projectedOrigin.y.toFixed(2);
}

window.addEventListener("resize", resize, { passive: true });
resize();

const timer = new THREE.Timer();
timer.connect(document);
let animationFrame = 0;
let fpsFrames = 0;
let fpsElapsed = 0;
let displayFps = 0;

function render(timestamp) {
  animationFrame = requestAnimationFrame(render);
  timer.update(timestamp);
  const delta = Math.min(timer.getDelta(), 0.05);
  const elapsed = timer.getElapsed();
  controller.update(delta, elapsed);

  const state = controller.getState();
  starField.points.rotation.z = reducedMotion ? 0 : elapsed * 0.003;
  starField.points.position.x = Math.sin(elapsed * 0.08) * 0.04;
  renderer.info.reset();
  postprocessing.composer.render(delta);

  fpsFrames += 1;
  fpsElapsed += delta;
  if (fpsElapsed >= 0.5) {
    displayFps = Math.round(fpsFrames / fpsElapsed);
    fpsFrames = 0;
    fpsElapsed = 0;
  }

  const visibleParticles = Math.round(
    (objects.infall.count + objects.ejectaParticles.count) *
      controller.params.particleAmount,
  );
  ui.phase.textContent = state.phase.toUpperCase();
  ui.phaseLabel.textContent = PHASE_LABELS[state.phase];
  ui.phaseTime.textContent = `${state.phaseTime.toFixed(2)} s`;
  ui.progressValue.value = `${Math.round(state.globalProgress * 100)}%`;
  ui.progressBar.style.transform = `scaleX(${state.globalProgress})`;
  ui.fps.textContent = displayFps || "—";
  ui.drawCalls.textContent = renderer.info.render.calls;
  ui.particles.textContent = visibleParticles.toLocaleString("es-AR");
}

animationFrame = requestAnimationFrame(render);

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(animationFrame);
  window.removeEventListener("resize", resize);
  timer.dispose();
  controller.dispose();
  starField.geometry.dispose();
  starField.material.dispose();
  postprocessing.dispose();
  renderer.dispose();
});

window.__LS_SUPERNOVA_LAB__ = {
  controller,
  renderer,
  scene,
  origin: supernovaOrigin,
  objects,
};
