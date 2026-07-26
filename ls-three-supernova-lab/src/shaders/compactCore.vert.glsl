uniform float uTime;
uniform float uCorePulse;
uniform float uInstability;
uniform float uCompression;
uniform float uShockCharge;

varying vec3 vNormalView;
varying float vNoise;

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i), hash31(i + vec3(1,0,0)), f.x),
        mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
        mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

void main() {
  float n1 = noise3(normal * 4.0 + vec3(uTime * 4.0)) - 0.5;
  float n2 = noise3(normal * 9.0 - vec3(uTime * 7.0)) - 0.5;
  float displacement = n1 * 0.11 * uInstability + n2 * 0.038 * uInstability;
  vec3 transformed = position + normal * displacement;
  float pulse = 1.0 + sin(uTime * 13.0) * 0.035 * uCorePulse;
  transformed *= pulse * mix(1.0, 0.84, uCompression);
  transformed += normal * uShockCharge * 0.012;
  vNoise = n1 + n2 * 0.35;
  vNormalView = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
