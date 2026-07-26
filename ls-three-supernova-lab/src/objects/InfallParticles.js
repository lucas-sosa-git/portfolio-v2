import * as THREE from "three";
import vertexShader from "../shaders/particles.vert.glsl?raw";
import fragmentShader from "../shaders/particles.frag.glsl?raw";

function seededRandom(seed = 7619) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

export class InfallParticles {
  constructor({ mobile = false } = {}) {
    this.count = mobile ? 1200 : 3200;
    const random = seededRandom();
    const positions = new Float32Array(this.count * 3);
    const directions = new Float32Array(this.count * 3);
    const radii = new Float32Array(this.count);
    const speeds = new Float32Array(this.count);
    const offsets = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);
    const temperatures = new Float32Array(this.count);
    const lives = new Float32Array(this.count);
    const direction = new THREE.Vector3();

    for (let index = 0; index < this.count; index += 1) {
      const offset = index * 3;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      direction.set(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi) * 0.45,
      ).normalize();
      directions.set(direction.toArray(), offset);
      radii[index] = 1.2 + random() * 2.9;
      speeds[index] = 0.55 + random() * 1.25;
      offsets[index] = random() * Math.PI * 2;
      sizes[index] = mobile ? 1.2 + random() * 1.8 : 1.4 + random() * 2.4;
      temperatures[index] = 0.25 + random() * 0.72;
      lives[index] = 1;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aDirection", new THREE.BufferAttribute(directions, 3));
    this.geometry.setAttribute("aRadius", new THREE.BufferAttribute(radii, 1));
    this.geometry.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    this.geometry.setAttribute("aOffset", new THREE.BufferAttribute(offsets, 1));
    this.geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    this.geometry.setAttribute("aTemperature", new THREE.BufferAttribute(temperatures, 1));
    this.geometry.setAttribute("aLife", new THREE.BufferAttribute(lives, 1));
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uOpacity: { value: 0 },
        uMode: { value: 0 },
        uAsymmetry: { value: 0 },
        uLobeStrength: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
    this.points.frustumCulled = false;
    this.points.renderOrder = 1;
  }

  update({ time, progress = 0, opacity = 0, amount = 1 }) {
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uProgress.value = progress;
    this.material.uniforms.uOpacity.value = opacity;
    this.geometry.setDrawRange(0, Math.round(this.count * amount));
    this.points.visible = opacity > 0.001;
  }

  reset() {
    this.material.uniforms.uOpacity.value = 0;
    this.points.visible = false;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}
