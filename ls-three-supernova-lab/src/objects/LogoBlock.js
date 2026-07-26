import * as THREE from "three";
import vertexShader from "../shaders/logoBlock.vert.glsl?raw";
import fragmentShader from "../shaders/logoBlock.frag.glsl?raw";

function createLogoTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 512, 512);
  gradient.addColorStop(0, "#f13a46");
  gradient.addColorStop(1, "#8e1026");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 512, 512);
  context.fillStyle = "#fffaf7";
  context.font = "800 220px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("LS", 256, 273);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export class LogoBlock {
  constructor() {
    this.texture = createLogoTexture();
    this.geometry = new THREE.BoxGeometry(1.6, 1.6, 1.6, 12, 12, 12);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uCollapse: { value: 0 },
        uConcavity: { value: 0.72 },
        uCornerResistance: { value: 0.76 },
        uFinalScale: { value: 0.3 },
        uNoiseMax: { value: 0.06 },
        uImplosionDuration: { value: 0.72 },
        uInstability: { value: 0.58 },
        uAsymmetry: { value: 0.28 },
        uDebugMode: { value: 0 },
        uHeat: { value: 0 },
        uOpacity: { value: 1 },
        uLogoTexture: { value: this.texture },
      },
      transparent: true,
      depthWrite: true,
      extensions: { derivatives: true },
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.rotation.set(-0.12, 0.18, -0.035);
    this.mesh.renderOrder = 2;
    this.debugMode = "solid";
  }

  reset() {
    const { uniforms } = this.material;
    uniforms.uCollapse.value = 0;
    uniforms.uHeat.value = 0;
    uniforms.uOpacity.value = 1;
    this.mesh.visible = true;
    this.mesh.scale.setScalar(1);
    this.mesh.rotation.set(-0.12, 0.18, -0.035);
  }

  setDebugMode(mode) {
    this.debugMode = ["solid", "wireframe", "weights"].includes(mode)
      ? mode
      : "solid";
    this.material.wireframe = this.debugMode === "wireframe";
    this.material.uniforms.uDebugMode.value = this.debugMode === "weights" ? 1 : 0;
    this.material.needsUpdate = true;
  }

  update({
    time,
    collapse = 0,
    opacity = 1,
    heat = 0,
    concavity,
    cornerResistance,
    finalScale,
    noise,
    implosionDuration,
    instability,
    asymmetry,
    stablePulse = 0,
  }) {
    const { uniforms } = this.material;
    uniforms.uTime.value = time;
    uniforms.uCollapse.value = collapse;
    uniforms.uOpacity.value = opacity;
    uniforms.uHeat.value = heat;
    uniforms.uConcavity.value = concavity;
    uniforms.uCornerResistance.value = cornerResistance;
    uniforms.uFinalScale.value = finalScale;
    uniforms.uNoiseMax.value = Math.min(noise, 0.1);
    uniforms.uImplosionDuration.value = implosionDuration;
    uniforms.uInstability.value = instability;
    uniforms.uAsymmetry.value = asymmetry;
    this.mesh.visible = opacity > 0.001;
    this.mesh.scale.setScalar(1 + stablePulse * 0.004);
    this.mesh.rotation.z = -0.035 + Math.sin(time * 1.7) * 0.006 * (1 - collapse);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
