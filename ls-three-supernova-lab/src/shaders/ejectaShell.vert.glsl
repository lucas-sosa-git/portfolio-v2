uniform float uTime;
uniform float uExpansion;
uniform float uAsymmetry;
uniform float uLobeStrength;

varying float vHeat;
varying vec3 vNormalView;

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 31.32);
  return fract((p.x + p.y) * p.z);
}

void main() {
  vec3 transformed = position;
  float coarse = hash31(floor(normal * 8.0 + uTime * 0.7)) - 0.5;
  float fine = sin(dot(normal, vec3(12.7, 18.3, 8.9)) + uTime * 1.6);
  vec3 lobeA = normalize(vec3(0.82, 0.36, 0.22));
  vec3 lobeB = normalize(vec3(-0.45, 0.77, -0.18));
  vec3 lobeC = normalize(vec3(-0.64, -0.34, 0.69));
  float lobes =
    pow(max(dot(normal, lobeA), 0.0), 5.0) +
    pow(max(dot(normal, lobeB), 0.0), 7.0) * 0.8 +
    pow(max(dot(normal, lobeC), 0.0), 6.0) * 0.65;
  float displacement = coarse * 0.28 + fine * 0.07;
  transformed += normal * (displacement * uAsymmetry + lobes * uLobeStrength * 0.42) * uExpansion;
  transformed *= 0.14 + uExpansion * 1.5;
  vHeat = 1.0 - uExpansion;
  vNormalView = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
