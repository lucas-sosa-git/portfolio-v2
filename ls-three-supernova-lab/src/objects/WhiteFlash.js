import * as THREE from "three";
import vertexShader from "../shaders/flash.vert.glsl?raw";
import fragmentShader from "../shaders/flash.frag.glsl?raw";

export class WhiteFlash {
  constructor() {
    this.geometry = new THREE.PlaneGeometry(12, 12);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uFlashProgress: { value: 0 },
        uFlashOpacity: { value: 0 },
        uAspect: { value: 1 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.z = 0.34;
    this.mesh.visible = false;
    this.mesh.renderOrder = 12;
  }

  update({ progress = 0, opacity = 0 }) {
    this.material.uniforms.uFlashProgress.value = progress;
    this.material.uniforms.uFlashOpacity.value = opacity;
    this.mesh.visible = opacity > 0.001;
  }

  resize(aspect) {
    this.material.uniforms.uAspect.value = aspect;
    this.mesh.scale.x = aspect < 1 ? 1 / aspect : 1;
  }

  reset() {
    this.material.uniforms.uFlashProgress.value = 0;
    this.material.uniforms.uFlashOpacity.value = 0;
    this.mesh.visible = false;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
