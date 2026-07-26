export function getImpactGeometry({
  viewportWidth,
  viewportHeight,
  xRatio = 0.5,
  yRatio = 0.5,
}) {
  const x = viewportWidth * xRatio;
  const y = viewportHeight * yRatio;
  const maxRadius = Math.max(
    Math.hypot(x, y),
    Math.hypot(viewportWidth - x, y),
    Math.hypot(x, viewportHeight - y),
    Math.hypot(viewportWidth - x, viewportHeight - y),
  );

  return { x, y, maxRadius };
}

export function getWaveRevealMetrics({
  elementRect,
  impactX,
  impactY,
  maxRadius,
  waveDuration,
  revealDuration,
  baseDelay = 24,
  revealOffset = 18,
}) {
  const elementCenterX = elementRect.left + elementRect.width / 2;
  const elementCenterY = elementRect.top + elementRect.height / 2;
  const dx = elementCenterX - impactX;
  const dy = elementCenterY - impactY;
  const distance = Math.hypot(dx, dy);
  const length = distance || 1;
  const travelWindow = Math.max(240, waveDuration - revealDuration - baseDelay);
  const waveSpeed = maxRadius / travelWindow;

  return {
    distance,
    delay: baseDelay + distance / waveSpeed,
    initialX: -(dx / length) * revealOffset,
    initialY: -(dy / length) * revealOffset,
  };
}
