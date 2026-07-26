uniform sampler2D uLogoTexture;
uniform float uHeat;
uniform float uOpacity;
uniform float uDebugMode;

varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying float vFront;
varying float vPressure;
varying float vDeformWeight;
varying float vConcavity;

void main() {
  if (uDebugMode > 0.5) {
    vec3 lowWeight = vec3(0.03, 0.18, 0.42);
    vec3 middleWeight = vec3(1.0, 0.48, 0.03);
    vec3 highWeight = vec3(1.55, 0.04, 0.08);
    vec3 debugColor = vDeformWeight < 0.5
      ? mix(lowWeight, middleWeight, vDeformWeight * 2.0)
      : mix(middleWeight, highWeight, (vDeformWeight - 0.5) * 2.0);
    gl_FragColor = vec4(debugColor, uOpacity);
    return;
  }

  vec4 logo = texture2D(uLogoTexture, vUv);
  vec3 deepRed = vec3(0.42, 0.008, 0.025);
  vec3 hotRed = vec3(1.35, 0.045, 0.09);
  vec3 base = mix(deepRed, hotRed, 0.3 + vPressure * 0.52);
  base = mix(base, logo.rgb * 1.08, vFront);
  base = mix(base, vec3(2.1, 0.42, 0.6), uHeat * 0.28);
  base *= 1.0 - vConcavity * 0.34;

  vec3 deformedNormal = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition)));
  if (!gl_FrontFacing) deformedNormal *= -1.0;
  vec3 shadingNormal = normalize(mix(vNormalView, deformedNormal, 0.84));
  float lighting =
    0.4 +
    max(dot(shadingNormal, normalize(vec3(0.2, 0.4, 1.0))), 0.0) * 0.78;
  gl_FragColor = vec4(base * lighting, uOpacity);
}
