uniform float uTime;
uniform float uRadius;
uniform float uThickness;
uniform float uIrregularity;
uniform float uOpacity;
uniform float uAspect;

varying vec2 vUv;

void main() {
  vec2 centered = vUv - 0.5;
  centered.x *= uAspect;
  float angle = atan(centered.y, centered.x);
  float radialNoise =
    sin(angle * 3.0 + uTime * 0.8) * 0.018 +
    sin(angle * 6.0 - uTime * 1.1) * 0.010 +
    sin(angle * 11.0 + uTime * 1.7) * 0.004;
  float radius = uRadius + radialNoise * uIrregularity;
  float d = abs(length(centered) - radius);
  float ring = 1.0 - smoothstep(uThickness, uThickness * 2.6, d);
  float glow = 1.0 - smoothstep(uThickness * 2.0, uThickness * 7.0, d);
  vec3 color = vec3(2.8, 1.45, 2.4) * ring + vec3(0.72, 0.04, 0.18) * glow;
  gl_FragColor = vec4(color, (ring + glow * 0.2) * uOpacity);
}
