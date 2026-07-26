import * as THREE from "three";
import vertexShader from "../shaders/particles.vert.glsl?raw";
import fragmentShader from "../shaders/particles.frag.glsl?raw";

function seededRandom(seed = 28411) {
  let state = seed;
  return () => {
    state = (state * 48271) % 2147483647;
    return (state - 1) / 2147483646;
  };
}

const LOBES = [
  { direction: new THREE.Vector3(0.9, 0.3, 0.15).normalize(), width: 0.34, weight: 1.45 },
  { direction: new THREE.Vector3(-0.48, 0.82, -0.12).normalize(), width: 0.42, weight: 1.1 },
  { direction: new THREE.Vector3(-0.72, -0.28, 0.63).normalize(), width: 0.38, weight: 0.92 },
  { direction: new THREE.Vector3(0.2, -0.91, -0.36).normalize(), width: 0.3, weight: 0.75 },
  { direction: new THREE.Vector3(0.54, -0.22, 0.81).normalize(), width: 0.27, weight: 0.58 },
];

export class EjectaParticles {
  constructor({ mobile = false } = {}) {
    this.count = mobile ? 3200 : 7600;
    const random = seededRandom();
    const positions = new Float32Array(this.count * 3);
    const directions = new Float32Array(this.count * 3);
    const radii = new Float32Array(this.count);
    const speeds = new Float32Array(this.count);
    const offsets = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);
    const temperatures = new Float32Array(this.count);
    const lives = new Float32Array(this.count);
    const totalWeight = LOBES.reduce((sum, lobe) => sum + lobe.weight, 0);
    const direction = new THREE.Vector3();

    for (let index = 0; index < this.count; index += 1) {
      let pick = random() * totalWeight;
      let lobe = LOBES[0];
      for (const candidate of LOBES) {
        pick -= candidate.weight;
        if (pick <= 0) {
          lobe = candidate;
          break;
        }
      }

      direction.copy(lobe.direction);
      direction.x += (random() - 0.5) * lobe.width;
      direction.y += (random() - 0.5) * lobe.width;
      direction.z += (random() - 0.5) * lobe.width;
      direction.normalize();
      directions.set(direction.toArray(), index * 3);
      radii[index] = 0;
      speeds[index] = 0.25 + random() * 0.75;
      offsets[index] = random() ** 1.8 * 0.22;
      sizes[index] = mobile ? 1.1 + random() * 2.4 : 1.3 + random() * 3.2;
      temperatures[index] = Math.min(
        1,
        0.08 + random() * 0.68 + (1 - offsets[index]) * 0.08,
      );
      lives[index] = 0.62 + random() * 0.36;
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
        uMode: { value: 1 },
        uAsymmetry: { value: 0.68 },
        uLobeStrength: { value: 0.82 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.visible = false;
    this.points.frustumCulled = false;
    this.points.renderOrder = 7;
  }

  update({
    time,
    progress = 0,
    opacity = 0,
    amount = 1,
    asymmetry = 0.68,
    lobeStrength = 0.82,
  }) {
    const { uniforms } = this.material;
    uniforms.uTime.value = time;
    uniforms.uProgress.value = progress;
    uniforms.uOpacity.value = opacity;
    uniforms.uAsymmetry.value = asymmetry;
    uniforms.uLobeStrength.value = lobeStrength;
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
