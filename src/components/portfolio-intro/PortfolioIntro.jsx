import { useEffect, useRef, useState } from "react";
import {
  EXPLOSION_ENTRY_STATE,
  INTRO_CONFIG,
  INTRO_SESSION_KEY,
  getIntroPreference,
} from "./introConfig";
import { getImpactGeometry, getWaveRevealMetrics } from "./introMath";
import { createIntroTimeline } from "./createIntroTimeline";
import "./portfolio-intro.css";

const REVEAL_SELECTOR =
  "[data-wave-reveal], .hero-kicker, .mobile-bottom-nav";
const CLIP_SELECTOR = ".site-header, #main, .mobile-bottom-nav";

function waitForInitialLayout() {
  const fontReady = document.fonts?.ready || Promise.resolve();
  let fallbackTimer = 0;
  const fallback = new Promise((resolve) => {
    fallbackTimer = window.setTimeout(resolve, 700);
  });
  return Promise.race([fontReady, fallback]).finally(() =>
    window.clearTimeout(fallbackTimer),
  );
}

function clearRevealStyles(revealTargets, clipTargets) {
  revealTargets.forEach((element) => {
    [
      "opacity",
      "visibility",
      "transform",
      "filter",
      "transition-property",
      "transition-duration",
      "transition-delay",
      "transition-timing-function",
      "will-change",
    ].forEach((property) => element.style.removeProperty(property));
  });

  clipTargets.forEach((element) => {
    [
      "clip-path",
      "transition-property",
      "transition-duration",
      "transition-timing-function",
      "will-change",
    ].forEach((property) => element.style.removeProperty(property));
  });
}

function markIntroPlayed() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch {
    // Storage can be disabled without preventing access to the portfolio.
  }
}

export function PortfolioIntro() {
  const initialPreferenceRef = useRef(getIntroPreference());
  const [mounted, setMounted] = useState(
    initialPreferenceRef.current === "play",
  );
  const overlayRef = useRef(null);
  const logoRef = useRef(null);
  const implosionCanvasRef = useRef(null);
  const shadowRef = useRef(null);
  const energyRef = useRef(null);
  const flashRef = useRef(null);
  const raysRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    if (initialPreferenceRef.current !== "play") {
      document.documentElement.classList.remove("intro-pending");
      document.body.classList.remove("intro-running");
      return undefined;
    }

    const overlay = overlayRef.current;
    const logo = logoRef.current;
    const implosionCanvas = implosionCanvasRef.current;
    const shadow = shadowRef.current;
    const energy = energyRef.current;
    const flash = flashRef.current;
    const rays = raysRef.current;
    const wave = waveRef.current;

    if (
      !overlay ||
      !logo ||
      !implosionCanvas ||
      !shadow ||
      !energy ||
      !flash ||
      !rays ||
      !wave
    ) {
      document.documentElement.classList.remove("intro-pending");
      return undefined;
    }
    const rayElements = Array.from(rays.querySelectorAll("i"));

    let disposed = false;
    let completed = false;
    let timeline = null;
    let implosionFrame = 0;
    let implosionCube = null;
    const implosionMotion = {
      collapse: 0,
      opacity: 1,
      heat: 0,
      pulse: 0,
    };
    const revealTargets = Array.from(
      document.querySelectorAll(REVEAL_SELECTOR),
    );
    const clipTargets = Array.from(document.querySelectorAll(CLIP_SELECTOR));

    const removeListeners = () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("portfolio-intro-timeout", onTimeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      overlay.removeEventListener("pointerdown", onPointerDown);
    };

    const disposeImplosion = () => {
      cancelAnimationFrame(implosionFrame);
      implosionFrame = 0;
      implosionCube?.dispose();
      implosionCube = null;
    };

    const transitionState = (state) => {
      if (overlay.isConnected) overlay.dataset.introState = state;
    };

    const finish = ({ skipped = false } = {}) => {
      if (completed) return;
      completed = true;
      transitionState(skipped ? "SKIPPED" : "COMPLETE");
      const finishedTimeline = timeline;
      timeline = null;
      finishedTimeline?.pause();
      disposeImplosion();
      clearRevealStyles(revealTargets, clipTargets);
      document.documentElement.classList.remove(
        "intro-pending",
        "intro-wave-active",
      );
      document.body.classList.remove("intro-running");
      removeListeners();
      markIntroPlayed();
      setMounted(false);
      queueMicrotask(() => finishedTimeline?.revert());
    };

    function onKeyDown(event) {
      if (
        INTRO_CONFIG.allowSkip &&
        event.key === "Escape" &&
        !event.defaultPrevented
      ) {
        event.preventDefault();
        finish({ skipped: true });
      }
    }

    function onPointerDown(event) {
      if (!INTRO_CONFIG.allowSkip || event.button > 0) return;
      finish({ skipped: true });
    }

    function onVisibilityChange() {
      if (document.hidden) finish({ skipped: true });
    }

    function onTimeout() {
      finish({ skipped: true });
    }

    const prepareReveal = () => {
      if (completed) return;

      const logoRect = logo.getBoundingClientRect();
      const logoCenterX = logoRect.left + logoRect.width / 2;
      const logoCenterY = logoRect.top + logoRect.height / 2;
      const { x, y, maxRadius } = getImpactGeometry({
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        xRatio: logoCenterX / window.innerWidth,
        yRatio: logoCenterY / window.innerHeight,
      });
      const {
        wave: waveDuration,
        elementReveal: revealDuration,
      } = INTRO_CONFIG.timing;
      const blur = window.matchMedia("(max-width: 640px)").matches
        ? Math.min(5, INTRO_CONFIG.motion.maxBlur)
        : INTRO_CONFIG.motion.maxBlur;

      overlay.style.setProperty(
        "--intro-wave-diameter",
        `${maxRadius * 2 + 16}px`,
      );
      overlay.style.setProperty("--intro-impact-x", `${x}px`);
      overlay.style.setProperty("--intro-impact-y", `${y}px`);

      clipTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const localX = x - rect.left;
        const localY = y - rect.top;
        element.style.clipPath = `circle(0px at ${localX}px ${localY}px)`;
        element.style.willChange = "clip-path";
      });

      revealTargets.forEach((element) => {
        const metrics = getWaveRevealMetrics({
          elementRect: element.getBoundingClientRect(),
          impactX: x,
          impactY: y,
          maxRadius,
          waveDuration,
          revealDuration,
          revealOffset: INTRO_CONFIG.motion.revealOffset,
        });

        element.style.visibility = "visible";
        element.style.opacity = "0";
        element.style.transform = `translate3d(${metrics.initialX}px, ${metrics.initialY}px, 0) scale(.985)`;
        element.style.filter = `blur(${blur}px)`;
        element.style.willChange = "transform, opacity, filter";
        element.style.transitionProperty = "opacity, transform, filter";
        element.style.transitionDuration = `${revealDuration}ms`;
        element.style.transitionDelay = `${Math.round(metrics.delay)}ms`;
        element.style.transitionTimingFunction =
          "cubic-bezier(.16, 1, .3, 1)";
      });

      // Commit the zero-radius and inward states before releasing the wave.
      overlay.getBoundingClientRect();

      clipTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const localX = x - rect.left;
        const localY = y - rect.top;
        element.style.transitionProperty = "clip-path";
        element.style.transitionDuration = `${waveDuration}ms`;
        element.style.transitionTimingFunction =
          "cubic-bezier(.16, 1, .3, 1)";
        element.style.clipPath =
          `circle(${maxRadius + 24}px at ${localX}px ${localY}px)`;
      });

      revealTargets.forEach((element) => {
        element.style.opacity = "1";
        element.style.transform = "translate3d(0, 0, 0) scale(1)";
        element.style.filter = "blur(0px)";
      });

      document.documentElement.classList.add("intro-wave-active");
    };

    document.documentElement.classList.add("intro-pending");
    document.body.classList.add("intro-running");
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("portfolio-intro-timeout", onTimeout);
    document.addEventListener("visibilitychange", onVisibilityChange);
    overlay.addEventListener("pointerdown", onPointerDown);

    const initialiseTimeline = async () => {
      const [{ createTimeline, utils }, { createImplosionCube }] =
        await Promise.all([
          import("animejs"),
          import("./createImplosionCube"),
        ]);
      await waitForInitialLayout();
      if (disposed || completed) return;

      const { timing } = INTRO_CONFIG;
      const implosionParams = { ...INTRO_CONFIG.implosion };

      implosionCube = createImplosionCube(
        implosionCanvas,
        implosionParams,
      );
      const implosionStartedAt = performance.now();
      const renderImplosion = (frameTime) => {
        if (disposed || completed || !implosionCube) return;
        implosionCube.render({
          time: (frameTime - implosionStartedAt) / 1000,
          ...implosionMotion,
          params: implosionParams,
        });
        implosionFrame = requestAnimationFrame(renderImplosion);
      };
      implosionFrame = requestAnimationFrame(renderImplosion);

      utils.set(logo, {
        translateX: "0px",
        translateY: "0px",
        rotate: "0deg",
        scaleX: 1,
        scaleY: 1,
        opacity: 0,
        filter: "brightness(1)",
      });
      utils.set(shadow, {
        opacity: 0,
        scaleX: 0.12,
        scaleY: 0.22,
      });
      utils.set(energy, {
        opacity: 0,
        scale: EXPLOSION_ENTRY_STATE.core.scale,
        filter: "brightness(1)",
      });
      utils.set(flash, EXPLOSION_ENTRY_STATE.flash);
      utils.set(rays, { opacity: EXPLOSION_ENTRY_STATE.raysOpacity });
      rayElements.forEach((ray, index) => {
        utils.set(ray, {
          scaleX: 0,
          rotate: `${index * 45}deg`,
        });
      });
      utils.set(wave, EXPLOSION_ENTRY_STATE.wave);

      timeline = createIntroTimeline({
        createTimeline,
        timing,
        implosionMotion,
        logo,
        energy,
        flash,
        rays,
        rayElements,
        wave,
        overlay,
        transitionState,
        prepareReveal,
        onComplete: () => finish(),
      });

      timeline.play();
    };

    initialiseTimeline().catch(() => finish({ skipped: true }));

    return () => {
      disposed = true;
      timeline?.revert();
      disposeImplosion();
      removeListeners();
      clearRevealStyles(revealTargets, clipTargets);
      document.documentElement.classList.remove(
        "intro-pending",
        "intro-wave-active",
      );
      document.body.classList.remove("intro-running");
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="portfolio-intro-overlay"
      data-intro-state="IDLE"
      aria-hidden="true"
    >
      <div className="portfolio-intro-stage">
        <div ref={shadowRef} className="portfolio-intro-shadow" />
        <canvas
          ref={implosionCanvasRef}
          className="portfolio-intro-implosion-canvas"
        />
        <div ref={energyRef} className="portfolio-intro-energy" />
        <div ref={flashRef} className="portfolio-intro-flash" />
        <div ref={raysRef} className="portfolio-intro-rays">
          {Array.from({ length: 8 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <div ref={logoRef} className="portfolio-intro-logo-motion">
          <svg
            className="portfolio-intro-logo"
            viewBox="0 0 64 64"
            xmlns="http://www.w3.org/2000/svg"
            focusable="false"
          >
            <defs>
              <filter
                id="impact-distortion"
                x="-40%"
                y="-40%"
                width="180%"
                height="180%"
              >
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.025 0.08"
                  numOctaves="2"
                  seed="7"
                  result="noise"
                />
                <feDisplacementMap
                  in="SourceGraphic"
                  in2="noise"
                  scale="0"
                  xChannelSelector="R"
                  yChannelSelector="G"
                />
              </filter>
            </defs>
            <g filter="url(#impact-distortion)">
              <rect width="64" height="64" rx="12" fill="#D52A2A" />
              <text
                x="50%"
                y="50%"
                dominantBaseline="middle"
                textAnchor="middle"
                fontFamily="Rubik, Arial, sans-serif"
                fontSize="28"
                fontWeight="700"
                fill="#FFFFFF"
              >
                LS
              </text>
            </g>
          </svg>
        </div>

        <div className="portfolio-intro-wave-anchor">
          <div ref={waveRef} className="portfolio-intro-wave" />
        </div>
      </div>

      <span className="portfolio-intro-skip-hint">Esc o toque para omitir</span>
    </div>
  );
}
