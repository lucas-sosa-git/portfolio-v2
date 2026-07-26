uniform float uOpacity;
varying float vHeat;
varying vec3 vNormalView;

void main() {
  float fresnel = pow(1.0 - abs(dot(normalize(vNormalView), vec3(0.0, 0.0, 1.0))), 2.4);
  vec3 color = mix(vec3(0.42, 0.012, 0.06), vec3(0.96, 0.24, 1.38), vHeat);
  color += fresnel * vec3(0.72, 0.1, 0.92);
  gl_FragColor = vec4(color, uOpacity * (0.18 + fresnel * 0.82));
}
