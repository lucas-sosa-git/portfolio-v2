import { useEffect } from "react";
import { createScope } from "animejs/scope";
import { scrambleText } from "animejs/text";
import { createTimeline } from "animejs/timeline";
import { set, stagger } from "animejs/utils";

const FINAL_TITLE = "Primero entiendo el problema.";

const ABOUT_MOTION = Object.freeze({
  observerThreshold: 0.18,
  labels: Object.freeze({
    index: 0,
    scramble: 300,
    photo: 430,
    details: 900,
  }),
});

export function AboutSectionMotion() {
  useEffect(() => {
    const section = document.getElementById("about");
    if (!section) return undefined;

    let scope = createScope({
      root: section,
      mediaQueries: {
        mobile: "(max-width: 760px)",
        reducedMotion: "(prefers-reduced-motion: reduce)",
      },
    }).add((self) => {
      const index = section.querySelector("[data-about-index]");
      const title = section.querySelector("[data-about-title]");
      const photo = section.querySelector("[data-about-photo]");
      const details = section.querySelectorAll("[data-about-detail]");
      const areas = section.querySelectorAll("[data-about-area]");

      if (!index || !title || !photo || !details.length || !areas.length) {
        return undefined;
      }

      if (self.matches.reducedMotion) {
        title.textContent = FINAL_TITLE;
        return undefined;
      }

      title.textContent = "Sobre mí";
      set(index, { opacity: 0, y: 8 });
      set(
        photo,
        self.matches.mobile
          ? { opacity: 0 }
          : { opacity: 0.98, clipPath: "inset(0 0 100% 0)" },
      );
      set(details, { opacity: 0, y: 14, filter: "blur(4px)" });
      set(areas, { opacity: 0, y: 12, filter: "blur(3px)" });

      let hasPlayed = false;
      let observer = null;
      let timeline = null;

      const playSequence = () => {
        if (hasPlayed) return;
        hasPlayed = true;
        observer?.disconnect();

        timeline = createTimeline({
          autoplay: false,
          defaults: { ease: "out(4)" },
          onComplete: () => {
            title.textContent = FINAL_TITLE;
            section.classList.add("about-motion-complete");
          },
        })
          .add(
            index,
            { opacity: [0, 1], y: [8, 0], duration: 380 },
            ABOUT_MOTION.labels.index,
          )
          .add(
            title,
            {
              innerHTML: scrambleText({
                text: FINAL_TITLE,
                chars: "A-Z0-9ÁÉÍÓÚÑ_",
                duration: 900,
                settleDuration: 260,
                settleRate: 28,
                perturbation: 0.08,
                seed: 29,
                override: false,
              }),
              duration: 900,
              ease: "linear",
            },
            ABOUT_MOTION.labels.scramble,
          )
          .add(
            photo,
            self.matches.mobile
              ? { opacity: [0, 1], duration: 500 }
              : {
                  opacity: [0.98, 1],
                  clipPath: ["inset(0 0 100% 0)", "inset(0 0 0% 0)"],
                  duration: 680,
                },
            ABOUT_MOTION.labels.photo,
          )
          .add(
            details,
            {
              opacity: [0, 1],
              y: [14, 0],
              filter: ["blur(4px)", "blur(0px)"],
              delay: stagger(90),
              duration: 540,
            },
            ABOUT_MOTION.labels.details,
          )
          .add(
            areas,
            {
              opacity: [0, 1],
              y: [12, 0],
              filter: ["blur(3px)", "blur(0px)"],
              delay: stagger(80),
              duration: 500,
            },
            ABOUT_MOTION.labels.details + 170,
          );

        timeline.play();
      };

      if ("IntersectionObserver" in window) {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              playSequence();
            }
          },
          {
            rootMargin: "0px 0px -10% 0px",
            threshold: ABOUT_MOTION.observerThreshold,
          },
        );
        observer.observe(section);
      } else {
        playSequence();
      }

      const onVisibilityChange = () => {
        if (!timeline) return;
        if (document.hidden) timeline.pause();
        else if (!timeline.completed) timeline.play();
      };

      document.addEventListener("visibilitychange", onVisibilityChange);

      return () => {
        observer?.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
      };
    });

    return () => {
      scope.revert();
      scope = null;
    };
  }, []);

  return null;
}
