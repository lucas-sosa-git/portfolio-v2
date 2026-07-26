import { useEffect, useRef } from "react";
import {
  BACKGROUND_SECTION_IDS,
  getSectionProgress,
} from "./backgroundState";
import "./site-background.css";

export function SiteBackground() {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return undefined;

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (reducedMotionQuery.matches) {
      root.dataset.mode = "fallback";
      return undefined;
    }

    let disposed = false;
    let started = false;
    let scene = null;
    let frame = 0;
    let lastRenderAt = 0;
    let sectionCenters = [];
    let layoutDirty = true;
    let scrollDirty = true;
    let introObserver = null;
    let layoutObserver = null;
    let themeObserver = null;

    const mobileQuery = window.matchMedia("(max-width: 640px)");
    const finePointerQuery = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    );

    const measureLayout = () => {
      scene.resize(window.innerWidth, window.innerHeight);
      sectionCenters = BACKGROUND_SECTION_IDS.map((id) =>
        document.getElementById(id),
      )
        .filter(Boolean)
        .map((section) => {
          const rect = section.getBoundingClientRect();
          return rect.top + window.scrollY + rect.height * 0.5;
        });
      layoutDirty = false;
      scrollDirty = true;
    };

    const updateScrollProgress = () => {
      scene.setScrollProgress(
        getSectionProgress(
          sectionCenters,
          window.scrollY,
          window.innerHeight,
        ),
      );
      scrollDirty = false;
    };

    const requestFrame = () => {
      if (!frame && !disposed && !document.hidden) {
        frame = window.requestAnimationFrame(renderFrame);
      }
    };

    function renderFrame(timestamp) {
      frame = 0;
      if (disposed || !scene || document.hidden) return;

      const minimumFrameTime = mobileQuery.matches ? 1000 / 30 : 0;
      if (lastRenderAt && timestamp - lastRenderAt < minimumFrameTime) {
        requestFrame();
        return;
      }

      if (layoutDirty) measureLayout();
      if (scrollDirty) updateScrollProgress();

      const delta = lastRenderAt
        ? Math.min((timestamp - lastRenderAt) / 1000, 0.08)
        : 1 / 60;
      lastRenderAt = timestamp;
      scene.render(timestamp / 1000, delta);
      requestFrame();
    }

    const onScroll = () => {
      scrollDirty = true;
    };
    const onResize = () => {
      layoutDirty = true;
    };
    const onPointerMove = (event) => {
      scene?.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    };
    const onVisibilityChange = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        return;
      }
      lastRenderAt = 0;
      requestFrame();
    };

    const removeSceneListeners = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      layoutObserver?.disconnect();
      themeObserver?.disconnect();
    };

    const start = async () => {
      if (started || disposed) return;
      started = true;

      try {
        const { createSiteBackground } = await import(
          "./createSiteBackground"
        );
        if (disposed) return;

        scene = createSiteBackground(canvas, {
          isMobile: mobileQuery.matches,
        });
        scene.setTheme(document.body.classList.contains("light"));

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
        document.addEventListener("visibilitychange", onVisibilityChange);
        if (finePointerQuery.matches) {
          window.addEventListener("pointermove", onPointerMove, {
            passive: true,
          });
        }

        const main = document.getElementById("main");
        if (main && "ResizeObserver" in window) {
          layoutObserver = new ResizeObserver(() => {
            layoutDirty = true;
          });
          layoutObserver.observe(main);
        }

        themeObserver = new MutationObserver(() => {
          scene?.setTheme(document.body.classList.contains("light"));
        });
        themeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ["class"],
        });

        root.dataset.mode = "webgl";
        requestFrame();
      } catch {
        root.dataset.mode = "fallback";
        removeSceneListeners();
        scene?.dispose();
        scene = null;
      }
    };

    if (document.documentElement.classList.contains("intro-pending")) {
      introObserver = new MutationObserver(() => {
        if (!document.documentElement.classList.contains("intro-pending")) {
          introObserver?.disconnect();
          introObserver = null;
          start();
        }
      });
      introObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    } else {
      start();
    }

    return () => {
      disposed = true;
      introObserver?.disconnect();
      window.cancelAnimationFrame(frame);
      removeSceneListeners();
      scene?.dispose();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="site-background"
      data-mode="fallback"
      aria-hidden="true"
    >
      <div className="site-background__fallback" />
      <canvas ref={canvasRef} className="site-background__canvas" />
      <div className="site-background__vignette" />
    </div>
  );
}
