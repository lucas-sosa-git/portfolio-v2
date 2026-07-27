import { useEffect } from "react";
import { animate } from "animejs/animation";
import { onScroll } from "animejs/events";
import { createScope } from "animejs/scope";
import { scrambleText, splitText } from "animejs/text";
import { createTimeline } from "animejs/timeline";
import { set, stagger } from "animejs/utils";
import { heroIntroState } from "./heroIntroState";
import {
  HERO_MOTION,
  INTRO_SESSION_KEY,
  getIntroPreference,
} from "./introConfig";

function showFinalHero() {
  Object.assign(heroIntroState, {
    reveal: 1,
    energy: 1,
    regularity: 1,
    environment: 1,
  });
  document.documentElement.classList.remove("hero-motion-pending");
}

function markIntroPlayed() {
  try {
    sessionStorage.setItem(INTRO_SESSION_KEY, "true");
  } catch {
    // Storage can be unavailable without blocking access to the portfolio.
  }
}

export function PortfolioIntro() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    const preference = getIntroPreference();
    if (!hero) {
      showFinalHero();
      return undefined;
    }
    const shouldPlayIntro = preference === "play";

    let disposed = false;
    let timedOut = false;
    let scope = null;
    let introStarted = false;

    const finishImmediately = () => {
      if (timedOut) return;
      timedOut = true;
      scope?.revert();
      scope = null;
      markIntroPlayed();
      showFinalHero();
    };

    if (shouldPlayIntro) {
      window.addEventListener("hero-motion-timeout", finishImmediately);
    }

    const initialiseMotion = async () => {
      await (document.fonts?.ready || Promise.resolve());
      if (disposed || timedOut) return;

      scope = createScope({
        root: hero,
        mediaQueries: {
          reducedMotion: "(prefers-reduced-motion: reduce)",
          compact: "(max-width: 768px)",
        },
      }).add((self) => {
        const heroCopy = hero.querySelector(".hero-copy");
        const title = hero.querySelector("[data-hero-title]");
        const kicker = hero.querySelector("[data-hero-kicker]");
        const supportTargets = hero.querySelectorAll("[data-hero-support]");
        const navTargets = document.querySelectorAll(
          ".site-header, .mobile-bottom-nav",
        );

        if (!heroCopy || !title || !kicker) {
          showFinalHero();
          return undefined;
        }

        if (!self.matches.reducedMotion) {
          animate(heroCopy, {
            y: [0, -24],
            opacity: [1, 0.74],
            ease: "linear",
            autoplay: onScroll({
              target: hero,
              enter: { target: "top", container: "top" },
              leave: { target: "bottom", container: "top" },
              sync: true,
              repeat: true,
            }),
          });
        }

        if (
          !shouldPlayIntro ||
          self.matches.reducedMotion ||
          introStarted
        ) {
          showFinalHero();
          return undefined;
        }
        introStarted = true;

        const result = title.querySelector("[data-hero-result]");
        const split = splitText(title, {
          words: { class: "hero-word", wrap: "clip" },
          chars: { class: "hero-char" },
          accessible: true,
        });
        const normalWords = title.querySelectorAll(
          "[data-hero-normal] .hero-word",
        );
        const chaosChars = title.querySelectorAll(
          "[data-hero-chaos] .hero-char",
        );
        const bridgeWords = title.querySelectorAll(
          "[data-hero-bridge] .hero-word",
        );
        const resultWords = title.querySelectorAll(
          "[data-hero-result] .hero-word",
        );
        const bodyStyles = getComputedStyle(document.body);
        const textColor = bodyStyles.getPropertyValue("--text").trim();
        const accentColor = bodyStyles
          .getPropertyValue("--contact-accent")
          .trim();

        Object.assign(heroIntroState, {
          reveal: 0.06,
          energy: 0.05,
          regularity: 0.52,
          environment: 0.08,
        });

        set(navTargets, { opacity: 0, y: -8 });
        set(kicker, { opacity: 0, y: 8 });
        set(normalWords, { opacity: 0, y: "92%" });
        set(bridgeWords, { opacity: 0, y: "52%" });
        set(resultWords, { opacity: 0, y: "82%" });
        set(supportTargets, { opacity: 0, y: 16 });
        set(chaosChars, {
          opacity: 0.22,
          x: (_, index) =>
            ((index * 7) % 9 - 4) * (HERO_MOTION.chaosDistance / 4),
          y: (_, index) =>
            ((index * 5) % 7 - 3) * (HERO_MOTION.chaosDistance / 5),
          rotate: (_, index) =>
            ((index * 11) % 9 - 4) * (HERO_MOTION.chaosRotation / 4),
        });

        const { labels } = HERO_MOTION;
        const timeline = createTimeline({
          autoplay: false,
          defaults: { ease: "out(4)" },
          onComplete: () => {
            split.words.forEach((word) =>
              word.style.removeProperty("will-change"),
            );
            split.chars.forEach((char) =>
              char.style.removeProperty("will-change"),
            );
            result?.style.removeProperty("color");
            markIntroPlayed();
            showFinalHero();
            window.removeEventListener(
              "hero-motion-timeout",
              finishImmediately,
            );
          },
        })
          .label("scene-start", labels.sceneStart)
          .label("nav-start", labels.navStart)
          .label("label-start", labels.labelStart)
          .label("copy-start", labels.copyStart)
          .label("chaos", labels.chaos)
          .label("resolution", labels.resolution)
          .label("supporting-copy", labels.supportingCopy)
          .label("ready", labels.ready)
          .add(
            heroIntroState,
            {
              reveal: [0.06, 0.42],
              energy: [0.05, 0.78],
              regularity: [0.52, 0.72],
              duration: 620,
              ease: "out(3)",
            },
            "scene-start",
          )
          .add(
            navTargets,
            { opacity: [0, 1], y: [-8, 0], duration: 480 },
            "nav-start",
          )
          .add(
            kicker,
            {
              opacity: [0, 1],
              y: [8, 0],
              innerHTML: scrambleText({
                chars: "A-Z0-9_",
                duration: 500,
                settleDuration: 170,
                settleRate: 24,
                perturbation: 0.12,
                seed: 73,
              }),
              duration: 500,
              ease: "out(3)",
            },
            "label-start",
          )
          .add(
            normalWords,
            {
              opacity: [0, 1],
              y: ["92%", "0%"],
              delay: stagger(HERO_MOTION.wordStagger),
              duration: 570,
            },
            "copy-start",
          )
          .add(
            heroIntroState,
            {
              reveal: [0.42, 0.8],
              energy: [0.78, 0.92],
              regularity: [0.72, 0.18, 0.82],
              duration: 670,
              ease: "inOut(3)",
            },
            "chaos",
          )
          .add(
            chaosChars,
            {
              opacity: [0.22, 1],
              x: 0,
              y: 0,
              rotate: 0,
              delay: stagger(
                self.matches.compact ? 14 : HERO_MOTION.charStagger,
              ),
              duration: self.matches.compact ? 520 : 670,
              ease: "out(4)",
            },
            "chaos",
          )
          .add(
            bridgeWords,
            { opacity: [0, 1], y: ["52%", "0%"], duration: 430 },
            "chaos+=140",
          )
          .add(
            resultWords,
            {
              opacity: [0, 1],
              y: ["82%", "0%"],
              delay: stagger(38),
              duration: 500,
            },
            "resolution",
          )
          .add(
            heroIntroState,
            {
              reveal: 1,
              energy: 1,
              regularity: 1,
              duration: 550,
              ease: "out(4)",
            },
            "resolution",
          )
          .add(
            supportTargets,
            {
              opacity: [0, 1],
              y: [16, 0],
              delay: stagger(100),
              duration: 480,
            },
            "supporting-copy",
          )
          .add(
            result,
            {
              color: [accentColor, textColor],
              duration: 360,
              ease: "out(2)",
            },
            "ready",
          )
          .add(
            heroIntroState,
            { environment: 1, duration: 500, ease: "out(3)" },
            "ready",
          );

        const onVisibilityChange = () => {
          if (document.hidden) timeline.pause();
          else if (!timeline.completed) timeline.play();
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        document.documentElement.classList.remove("hero-motion-pending");
        timeline.play();

        return () => {
          document.removeEventListener(
            "visibilitychange",
            onVisibilityChange,
          );
        };
      });
    };

    initialiseMotion().catch(() => finishImmediately());

    return () => {
      disposed = true;
      window.removeEventListener("hero-motion-timeout", finishImmediately);
      scope?.revert();
      showFinalHero();
    };
  }, []);

  return null;
}
