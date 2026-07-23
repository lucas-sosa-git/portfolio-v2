import { useEffect, useMemo, useState } from "react";

const DRAG_SCROLL_FACTOR = 2.4;
const VELOCITY_PROJECTION = 0.018;

const getViewportWidth = () =>
  typeof document === "undefined"
    ? 1280
    : document.documentElement.clientWidth;

export function useResponsiveCylinder(projectCount) {
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setViewportWidth(document.documentElement.clientWidth),
      );
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return useMemo(() => {
    const isMobile = viewportWidth <= 640;
    const isTablet = viewportWidth <= 960;
    const angleStep = 360 / projectCount;

    if (isMobile) {
      return {
        angleStep,
        radius: Math.max(270, Math.min(350, viewportWidth * 0.82)),
        perspective: 900,
        dragScrollFactor: DRAG_SCROLL_FACTOR,
        velocityProjection: VELOCITY_PROJECTION,
        blurMax: 3.2,
        helixPitch: 104,
        falloffAngle: 88,
        isMobile,
        isTablet,
        viewportWidth,
      };
    }

    if (isTablet) {
      return {
        angleStep,
        radius: Math.max(440, Math.min(540, viewportWidth * 0.56)),
        perspective: 1250,
        dragScrollFactor: DRAG_SCROLL_FACTOR,
        velocityProjection: VELOCITY_PROJECTION,
        blurMax: 5,
        helixPitch: 138,
        falloffAngle: 94,
        isMobile,
        isTablet,
        viewportWidth,
      };
    }

    return {
      angleStep,
      radius: Math.max(590, Math.min(720, viewportWidth * 0.5)),
      perspective: 1550,
      dragScrollFactor: DRAG_SCROLL_FACTOR,
      velocityProjection: VELOCITY_PROJECTION,
      blurMax: 6.5,
      helixPitch: 178,
      falloffAngle: 100,
      isMobile,
      isTablet,
      viewportWidth,
    };
  }, [projectCount, viewportWidth]);
}
