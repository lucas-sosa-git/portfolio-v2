import * as THREE from "three";
import vertexShader from "../shaders/shockFront.vert.glsl?raw";
import fragmentShader from "../shaders/shockFront.frag.glsl?raw";

export class StalledShock {
  constructor() {
    this.geometry = new THREE.PlaneGeometry(2.6, 2.6, 1, 1);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRadius: { value: 0.06 },
        uThickness: { value: 0.006 },
        uIrregularity: { value: 0.4 },
        uOpacity: { value: 0 },
        uAspect: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 0.25;
    this.mesh.visible = false;
    this.mesh.renderOrder = 8;
  }

  update({ time, radius = 0.06, thickness = 0.006, irregularity = 0.4, opacity = 0 }) {
    const { uniforms } = this.material;
    uniforms.uTime.value = time;
    uniforms.uRadius.value = radius;
    uniforms.uThickness.value = thickness;
    uniforms.uIrregularity.value = irregularity;
    uniforms.uOpacity.value = opacity;
    this.mesh.visible = opacity > 0.001;
  }

  resize(aspect) {
    this.material.uniforms.uAspect.value = aspect;
    this.mesh.scale.x = aspect < 1 ? 1 / aspect : 1;
  }

  reset() {
    this.material.uniforms.uOpacity.value = 0;
    this.mesh.visible = false;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
