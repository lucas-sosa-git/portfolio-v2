varying float vAlpha;
varying float vTemperature;

void main() {
  vec2 point = gl_PointCoord - 0.5;
  float d = length(point);
  float alpha = smoothstep(0.5, 0.05, d) * vAlpha;
  vec3 red = vec3(0.78, 0.015, 0.06);
  vec3 violet = vec3(0.56, 0.09, 1.16);
  vec3 lavender = vec3(0.92, 0.34, 1.48);
  vec3 whiteHot = vec3(1.8);
  vec3 color = mix(red, violet, smoothstep(0.05, 0.45, vTemperature));
  color = mix(color, lavender, smoothstep(0.4, 0.76, vTemperature));
  color = mix(color, whiteHot, smoothstep(0.76, 1.0, vTemperature));
  gl_FragColor = vec4(color, alpha);
}
