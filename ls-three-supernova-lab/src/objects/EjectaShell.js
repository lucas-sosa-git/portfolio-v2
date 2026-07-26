import * as THREE from "three";
import vertexShader from "../shaders/ejectaShell.vert.glsl?raw";
import fragmentShader from "../shaders/ejectaShell.frag.glsl?raw";

export class EjectaShell {
  constructor() {
    this.geometry = new THREE.IcosahedronGeometry(1, 5);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uExpansion: { value: 0 },
        uAsymmetry: { value: 0.68 },
        uLobeStrength: { value: 0.82 },
        uOpacity: { value: 0 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.visible = false;
    this.mesh.renderOrder = 5;
  }

  update({ time, progress = 0, asymmetry = 0.68, lobeStrength = 0.82, opacity = 0 }) {
    const { uniforms } = this.material;
    uniforms.uTime.value = time;
    uniforms.uExpansion.value = progress;
    uniforms.uAsymmetry.value = asymmetry;
    uniforms.uLobeStrength.value = lobeStrength;
    uniforms.uOpacity.value = opacity;
    this.mesh.rotation.y = time * 0.06;
    this.mesh.visible = opacity > 0.001;
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
