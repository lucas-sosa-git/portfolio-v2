uniform float uTime;
uniform float uCollapse;
uniform float uConcavity;
uniform float uCornerResistance;
uniform float uFinalScale;
uniform float uNoiseMax;
uniform float uImplosionDuration;
uniform float uInstability;
uniform float uAsymmetry;

varying vec2 vUv;
varying vec3 vNormalView;
varying vec3 vViewPosition;
varying float vFront;
varying float vPressure;
varying float vDeformWeight;
varying float vConcavity;

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
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
  vUv = uv;
  vFront = smoothstep(0.62, 0.92, normal.z);

  vec3 q = clamp(abs(position) / vec3(0.8), 0.0, 1.0);
  vec3 centerDistance = 1.0 - smoothstep(vec3(0.04), vec3(0.96), q);

  float faceX = smoothstep(0.94, 1.0, q.x) * centerDistance.y * centerDistance.z;
  float faceY = smoothstep(0.94, 1.0, q.y) * centerDistance.x * centerDistance.z;
  float faceZ = smoothstep(0.94, 1.0, q.z) * centerDistance.x * centerDistance.y;
  float faceCenterWeight = max(faceX, max(faceY, faceZ));

  float edgeProximity = max(q.x * q.y, max(q.x * q.z, q.y * q.z));
  float cornerWeight = smoothstep(0.56, 0.96, min(q.x, min(q.y, q.z)));
  float edgeWeight = smoothstep(0.48, 0.96, edgeProximity) * (1.0 - cornerWeight);

  float cornerId =
    step(0.0, position.x) +
    step(0.0, position.y) * 2.0 +
    step(0.0, position.z) * 4.0;
  float regionOffsetSeconds = mix(
    0.03,
    0.08,
    fract((cornerId + 1.0) * 0.61803398875)
  );
  float regionOffset = regionOffsetSeconds / max(uImplosionDuration, 0.001);

  float faceProgress = smoothstep(0.02, 0.43, uCollapse);
  float edgeProgress = smoothstep(
    0.18 + regionOffset * 0.35,
    0.74 + regionOffset * 0.35,
    uCollapse
  );
  float cornerStart = mix(0.32, 0.46, uCornerResistance) + regionOffset;
  float cornerEnd = cornerStart + mix(0.34, 0.42, uCornerResistance);
  float cornerProgress = smoothstep(cornerStart, cornerEnd, uCollapse);

  float globalProgress = smoothstep(0.36, 0.98, uCollapse);
  vec3 faceAxisWeight = vec3(faceX, faceY, faceZ);
  vec3 edgeAxisWeight = vec3(
    max(q.x * q.y, q.x * q.z),
    max(q.y * q.x, q.y * q.z),
    max(q.z * q.x, q.z * q.y)
  );
  vec3 axisProgress = vec3(globalProgress);
  axisProgress +=
    faceAxisWeight *
    faceProgress *
    (1.0 - globalProgress) *
    0.34;
  axisProgress +=
    edgeAxisWeight *
    edgeWeight *
    edgeProgress *
    (1.0 - globalProgress) *
    0.08;

  float cornerLag =
    cornerWeight *
    (1.0 - cornerProgress) *
    uCornerResistance *
    min(globalProgress, 0.24);
  axisProgress -= vec3(cornerLag);
  axisProgress = clamp(
    axisProgress,
    vec3(max(0.0, globalProgress - 0.24)),
    vec3(min(1.0, globalProgress + 0.28))
  );

  float structuralBias = hash31(sign(position) * vec3(5.3, 9.7, 13.1));
  float asymmetryFactor = 1.0 + (structuralBias - 0.5) * uAsymmetry * 0.22;
  float surfaceNoise = noise3(
    position * (5.2 + uInstability * 1.4) + vec3(uTime * 0.22)
  );
  float remainingStructure = 1.0 - globalProgress;
  float noiseFactor =
    1.0 +
    (surfaceNoise - 0.5) *
    2.0 *
    min(uNoiseMax, 0.1) *
    remainingStructure;
  float regionFactor = mix(1.0, asymmetryFactor, remainingStructure);
  axisProgress = clamp(axisProgress * noiseFactor * regionFactor, 0.0, 1.0);

  vec3 localScale = mix(vec3(1.0), vec3(uFinalScale), axisProgress);
  vec3 inward = -position / max(length(position), 0.0001);
  vec3 transformed = position * localScale;

  float concavityRelease = 1.0 - smoothstep(0.68, 0.96, uCollapse);
  float faceSink = faceCenterWeight * faceProgress * concavityRelease * uConcavity;
  transformed +=
    inward *
    faceSink *
    0.18 *
    mix(1.0, uFinalScale, globalProgress);
  float cornerSink =
    cornerWeight *
    cornerProgress *
    uCornerResistance *
    (1.0 - globalProgress) *
    mix(0.12, 0.2, structuralBias);
  transformed += inward * cornerSink;

  float inwardProgress = max(axisProgress.x, max(axisProgress.y, axisProgress.z));
  vConcavity = faceSink;
  vPressure = clamp(max(faceSink, inwardProgress), 0.0, 1.0);
  vDeformWeight = clamp(
    faceCenterWeight * faceProgress * 0.4 +
    edgeWeight * edgeProgress * 0.62 +
    cornerWeight * cornerProgress,
    0.0,
    1.0
  );

  vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
  vec4 viewPosition = viewMatrix * worldPosition;
  vViewPosition = viewPosition.xyz;
  vNormalView = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * viewPosition;
}
