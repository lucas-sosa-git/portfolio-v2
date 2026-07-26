import * as THREE from "three";
import vertexShader from "../shaders/shockFront.vert.glsl?raw";
import fragmentShader from "../shaders/shockFront.frag.glsl?raw";

export class ShockFront {
  constructor() {
    this.geometry = new THREE.PlaneGeometry(5.6, 5.6);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRadius: { value: 0.015 },
        uThickness: { value: 0.0028 },
        uIrregularity: { value: 0.7 },
        uOpacity: { value: 0 },
        uAspect: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 0.3;
    this.mesh.visible = false;
    this.mesh.renderOrder = 10;
  }

  update({ time, progress = 0, opacity = 0, irregularity = 0.7 }) {
    const { uniforms } = this.material;
    uniforms.uTime.value = time;
    uniforms.uRadius.value = THREE.MathUtils.lerp(0.015, 0.68, progress);
    uniforms.uThickness.value = THREE.MathUtils.lerp(0.004, 0.0018, progress);
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
