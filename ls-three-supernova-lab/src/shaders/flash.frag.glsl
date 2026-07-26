uniform float uFlashProgress;
uniform float uFlashOpacity;
uniform float uAspect;

varying vec2 vUv;

void main() {
  vec2 centered = vUv - 0.5;
  centered.x *= uAspect;
  float d = length(centered);
  float radius = mix(0.0006, 0.052, uFlashProgress);
  float glow = exp(-(d * d) / max(0.0001, radius));
  vec3 color = mix(vec3(1.6, 0.18, 0.45), vec3(3.8), glow);
  gl_FragColor = vec4(color, glow * uFlashOpacity);
}
