import {
  useMotionValue,
  useMotionValueEvent,
  useScroll,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const SNAP_TOLERANCE = 0.025;
const CLICK_CANCEL_DISTANCE = 8;
const FALLBACK_SCROLL_END_DELAY = 170;
const WHEEL_SETTLE_DELAY = 120;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const readNavHeight = () =>
  Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue("--nav-h"),
  ) || 64;

export function useCylinderRotation({
  projectCount,
  angleStep,
  dragScrollFactor,
  velocityProjection,
  reducedMotion,
  storyRef,
}) {
  const rotation = useMotionValue(0);
  const scrollYProgress = useMotionValue(0);
  const { scrollY } = useScroll();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const activeIndexRef = useRef(0);
  const dragDistanceRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const previousScrollBehaviorRef = useRef("");
  const isDraggingRef = useRef(false);
  const isWheelActiveRef = useRef(false);
  const isTouchActiveRef = useRef(false);
  const isPointerActiveRef = useRef(false);
  const programmaticTargetRef = useRef(null);
  const suppressNextClickRef = useRef(false);
  const snapTimeoutRef = useRef(null);
  const wheelTimeoutRef = useRef(null);

  const readStoryMetrics = useCallback(() => {
    const story = storyRef.current;
    if (!story) return null;

    const sticky = story.querySelector(".projects-scroll-sticky");
    if (!sticky) return null;

    const storyTop = window.scrollY + story.getBoundingClientRect().top;
    const navHeight = readNavHeight();
    const start = storyTop - navHeight;
    const end =
      storyTop +
      story.offsetHeight -
      navHeight -
      sticky.offsetHeight;

    return {
      start,
      end: Math.max(start, end),
      range: Math.max(1, end - start),
    };
  }, [storyRef]);

  const setVisualIndex = useCallback(
    (requestedIndex) => {
      const exactIndex = clamp(requestedIndex, 0, projectCount - 1);
      const nextActiveIndex = Math.round(exactIndex);
      const progress =
        projectCount <= 1 ? 0 : exactIndex / (projectCount - 1);

      scrollYProgress.set(progress);
      rotation.set(-exactIndex * angleStep);

      if (activeIndexRef.current !== nextActiveIndex) {
        activeIndexRef.current = nextActiveIndex;
        setActiveIndex(nextActiveIndex);
      }
    },
    [angleStep, projectCount, rotation, scrollYProgress],
  );

  const updateFromScroll = useCallback(
    (currentScroll) => {
      if (reducedMotion) return;

      const metrics = readStoryMetrics();
      if (!metrics) return;

      const progress = clamp(
        (currentScroll - metrics.start) / metrics.range,
        0,
        1,
      );

      setVisualIndex(progress * (projectCount - 1));

      const target = programmaticTargetRef.current;
      if (target !== null && Math.abs(currentScroll - target) <= 1.5) {
        programmaticTargetRef.current = null;
      }
    },
    [projectCount, readStoryMetrics, reducedMotion, setVisualIndex],
  );

  const goTo = useCallback(
    (requestedIndex) => {
      const index = clamp(Math.round(requestedIndex), 0, projectCount - 1);

      if (reducedMotion) {
        programmaticTargetRef.current = null;
        setVisualIndex(index);
        return;
      }

      const metrics = readStoryMetrics();
      if (!metrics) return;

      const progress = projectCount <= 1 ? 0 : index / (projectCount - 1);
      const target = metrics.start + metrics.range * progress;

      if (Math.abs(window.scrollY - target) <= 1.5) {
        programmaticTargetRef.current = null;
        setVisualIndex(index);
        return;
      }

      programmaticTargetRef.current = target;
      clearTimeout(snapTimeoutRef.current);

      window.scrollTo({
        top: target,
        behavior: "smooth",
      });
    },
    [projectCount, readStoryMetrics, reducedMotion, setVisualIndex],
  );

  const snapToNearest = useCallback(() => {
    if (
      reducedMotion ||
      isDraggingRef.current ||
      isWheelActiveRef.current ||
      isTouchActiveRef.current ||
      isPointerActiveRef.current ||
      programmaticTargetRef.current !== null
    ) {
      return;
    }

    const metrics = readStoryMetrics();
    if (!metrics) return;

    const currentScroll = window.scrollY;
    if (
      currentScroll < metrics.start - 2 ||
      currentScroll > metrics.end + 2
    ) {
      return;
    }

    const exactIndex =
      clamp((currentScroll - metrics.start) / metrics.range, 0, 1) *
      (projectCount - 1);
    const nearestIndex = Math.round(exactIndex);

    if (Math.abs(exactIndex - nearestIndex) <= SNAP_TOLERANCE) return;
    goTo(nearestIndex);
  }, [goTo, projectCount, readStoryMetrics, reducedMotion]);

  const scheduleSnap = useCallback(
    (delay = FALLBACK_SCROLL_END_DELAY) => {
      clearTimeout(snapTimeoutRef.current);
      if (reducedMotion || programmaticTargetRef.current !== null) return;

      snapTimeoutRef.current = window.setTimeout(snapToNearest, delay);
    },
    [reducedMotion, snapToNearest],
  );

  useMotionValueEvent(scrollY, "change", (latest) => {
    updateFromScroll(latest);

    if (
      !isDraggingRef.current &&
      !isWheelActiveRef.current &&
      !isTouchActiveRef.current &&
      !isPointerActiveRef.current &&
      programmaticTargetRef.current === null
    ) {
      scheduleSnap();
    }
  });

  useEffect(() => {
    if (reducedMotion) {
      clearTimeout(snapTimeoutRef.current);
      programmaticTargetRef.current = null;
      setVisualIndex(activeIndexRef.current);
      return undefined;
    }

    updateFromScroll(window.scrollY);

    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() =>
        updateFromScroll(window.scrollY),
      );
    };

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
    };
  }, [reducedMotion, setVisualIndex, updateFromScroll]);

  useEffect(() => {
    const cancelProgrammaticScroll = () => {
      programmaticTargetRef.current = null;
    };

    const onWheel = () => {
      cancelProgrammaticScroll();
      isWheelActiveRef.current = true;
      clearTimeout(wheelTimeoutRef.current);
      clearTimeout(snapTimeoutRef.current);

      wheelTimeoutRef.current = window.setTimeout(() => {
        isWheelActiveRef.current = false;
        scheduleSnap();
      }, WHEEL_SETTLE_DELAY);
    };

    const onTouchStart = () => {
      cancelProgrammaticScroll();
      isTouchActiveRef.current = true;
      clearTimeout(snapTimeoutRef.current);
    };

    const onTouchEnd = () => {
      isTouchActiveRef.current = false;
      scheduleSnap();
    };

    const onPointerUp = () => {
      isPointerActiveRef.current = false;
    };

    const onScrollEnd = () => {
      isWheelActiveRef.current = false;
      programmaticTargetRef.current = null;
      if (!isDraggingRef.current && !isTouchActiveRef.current) {
        scheduleSnap(0);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("scrollend", onScrollEnd, { passive: true });

    return () => {
      clearTimeout(snapTimeoutRef.current);
      clearTimeout(wheelTimeoutRef.current);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("scrollend", onScrollEnd);
    };
  }, [scheduleSnap]);

  useEffect(
    () => () => {
      document.documentElement.style.scrollBehavior =
        previousScrollBehaviorRef.current;
    },
    [],
  );

  const onPointerDownCapture = useCallback(() => {
    if (!isDraggingRef.current) suppressNextClickRef.current = false;
    isPointerActiveRef.current = true;
    programmaticTargetRef.current = null;
    clearTimeout(snapTimeoutRef.current);
  }, []);

  const onPanStart = useCallback(() => {
    dragDistanceRef.current = 0;
    dragStartScrollRef.current = window.scrollY;
    previousScrollBehaviorRef.current =
      document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    programmaticTargetRef.current = null;
    isDraggingRef.current = true;
    clearTimeout(snapTimeoutRef.current);
    setIsDragging(true);
  }, []);

  const onPan = useCallback(
    (_, info) => {
      dragDistanceRef.current = Math.max(
        dragDistanceRef.current,
        Math.abs(info.offset.x),
      );
      window.scrollTo({
        top: dragStartScrollRef.current - info.offset.x * dragScrollFactor,
        behavior: "auto",
      });
    },
    [dragScrollFactor],
  );

  const onPanEnd = useCallback(
    (_, info) => {
      dragDistanceRef.current = Math.max(
        dragDistanceRef.current,
        Math.abs(info.offset.x),
      );
      suppressNextClickRef.current =
        dragDistanceRef.current > CLICK_CANCEL_DISTANCE;
      isDraggingRef.current = false;
      setIsDragging(false);
      document.documentElement.style.scrollBehavior =
        previousScrollBehaviorRef.current;

      const metrics = readStoryMetrics();
      if (!metrics) return;

      const projectStep =
        projectCount <= 1 ? metrics.range : metrics.range / (projectCount - 1);
      const velocityOffset = clamp(
        info.velocity.x * velocityProjection,
        -projectStep * 0.3,
        projectStep * 0.3,
      );
      const projectedScroll =
        window.scrollY - velocityOffset;
      const projectedProgress = clamp(
        (projectedScroll - metrics.start) / metrics.range,
        0,
        1,
      );

      goTo(Math.round(projectedProgress * (projectCount - 1)));
    },
    [goTo, projectCount, readStoryMetrics, velocityProjection],
  );

  const consumeDraggedClick = useCallback((event) => {
    if (!suppressNextClickRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    suppressNextClickRef.current = false;
  }, []);

  return {
    rotation,
    scrollYProgress,
    activeIndex,
    isDragging,
    goTo,
    onPointerDownCapture,
    onPanStart,
    onPan,
    onPanEnd,
    consumeDraggedClick,
  };
}
