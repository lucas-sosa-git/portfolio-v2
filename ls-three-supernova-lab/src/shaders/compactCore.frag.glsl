uniform float uHeat;
uniform float uIgnition;
uniform float uOpacity;

varying vec3 vNormalView;
varying float vNoise;

void main() {
  vec3 coldColor = vec3(0.30, 0.005, 0.02);
  vec3 violet = vec3(0.48, 0.08, 1.0);
  vec3 lavender = vec3(1.1, 0.45, 1.8);
  vec3 whiteHot = vec3(4.0);
  float fresnel = pow(1.0 - max(dot(normalize(vNormalView), vec3(0.0, 0.0, 1.0)), 0.0), 2.0);
  vec3 color = mix(coldColor, violet, uHeat);
  color = mix(color, lavender, smoothstep(0.25, 0.9, uHeat + vNoise * 0.12));
  color = mix(color, whiteHot, uIgnition * (1.0 - fresnel * 0.32));
  color += fresnel * vec3(0.32, 0.04, 0.65);
  gl_FragColor = vec4(color, uOpacity);
}
