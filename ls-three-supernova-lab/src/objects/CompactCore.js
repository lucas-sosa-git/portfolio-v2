import * as THREE from "three";
import vertexShader from "../shaders/compactCore.vert.glsl?raw";
import fragmentShader from "../shaders/compactCore.frag.glsl?raw";

export class CompactCore {
  constructor() {
    this.geometry = new THREE.IcosahedronGeometry(0.24, 5);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uCorePulse: { value: 0 },
        uInstability: { value: 0.58 },
        uCompression: { value: 0 },
        uShockCharge: { value: 0 },
        uHeat: { value: 0 },
        uIgnition: { value: 0 },
        uOpacity: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.visible = false;
    this.mesh.renderOrder = 6;
  }

  reset() {
    const { uniforms } = this.material;
    uniforms.uOpacity.value = 0;
    uniforms.uHeat.value = 0;
    uniforms.uIgnition.value = 0;
    uniforms.uCompression.value = 0;
    uniforms.uShockCharge.value = 0;
    this.mesh.scale.setScalar(1);
    this.mesh.visible = false;
  }

  update({
    time,
    opacity = 0,
    pulse = 0,
    instability = 0.58,
    compression = 0,
    shockCharge = 0,
    heat = 0,
    ignition = 0,
    scale = 1,
  }) {
    const { uniforms } = this.material;
    uniforms.uTime.value = time;
    uniforms.uOpacity.value = opacity;
    uniforms.uCorePulse.value = pulse;
    uniforms.uInstability.value = instability;
    uniforms.uCompression.value = compression;
    uniforms.uShockCharge.value = shockCharge;
    uniforms.uHeat.value = heat;
    uniforms.uIgnition.value = ignition;
    this.mesh.scale.setScalar(scale);
    this.mesh.visible = opacity > 0.001;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
