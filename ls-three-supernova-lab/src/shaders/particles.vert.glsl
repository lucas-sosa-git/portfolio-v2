uniform float uTime;
uniform float uProgress;
uniform float uOpacity;
uniform float uMode;
uniform float uAsymmetry;
uniform float uLobeStrength;

attribute vec3 aDirection;
attribute float aRadius;
attribute float aSpeed;
attribute float aOffset;
attribute float aSize;
attribute float aTemperature;
attribute float aLife;

varying float vAlpha;
varying float vTemperature;

mat2 rotate2d(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

void main() {
  float progress = clamp(uProgress, 0.0, 1.0);
  vec3 transformed;

  if (uMode < 0.5) {
    float collapse = progress * progress * (3.0 - 2.0 * progress);
    float radius = mix(aRadius, 0.035, collapse);
    transformed = aDirection * radius;
    transformed.xy = rotate2d(collapse * aSpeed * 0.35 + aOffset) * transformed.xy;
    vAlpha = uOpacity * (1.0 - smoothstep(0.72, 1.0, collapse));
  } else {
    float age = clamp((progress - aOffset) / max(0.08, aLife), 0.0, 1.0);
    float acceleration = age * age * (3.0 - 2.0 * age);
    float lobe = mix(0.72, 1.45, aSpeed) * mix(1.0, uLobeStrength, 0.45);
    vec3 radial = aDirection * acceleration * lobe * 2.7;
    vec3 tangent = normalize(cross(aDirection, vec3(0.21, 0.84, 0.49)) + vec3(0.0001));
    float turbulence = sin(aOffset * 91.0 + uTime * (2.0 + aSpeed)) * 0.18;
    transformed = radial + tangent * turbulence * age * age * uAsymmetry;
    float sourceReveal = smoothstep(0.0, 0.012, age);
    vAlpha = uOpacity * sourceReveal * (1.0 - smoothstep(0.62, 1.0, age));
  }

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_PointSize = aSize * (14.0 / max(1.0, -mvPosition.z));
  gl_Position = projectionMatrix * mvPosition;
  vTemperature = aTemperature;
}
