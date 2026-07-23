import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { projects } from "../../data/projects";
import { useResponsiveCylinder } from "../../hooks/useResponsiveCylinder";
import { ProjectsCylinder } from "./ProjectsCylinder";
import { ProjectsTransition } from "./ProjectsTransition";

export function ProjectsSection() {
  const reducedMotion = Boolean(useReducedMotion());
  const config = useResponsiveCylinder(projects.length);
  const storyRef = useRef(null);
  const shellRef = useRef(null);
  const scrollStep = config.isMobile ? 40 : 32;
  const storyHeight = reducedMotion
    ? "auto"
    : `calc(100svh - var(--nav-h) - var(--projects-bottom-reserve) + ${
        (projects.length - 1) * scrollStep
      }svh)`;

  useEffect(() => {
    const section = shellRef.current?.closest("#projects");
    if (!section) return undefined;

    section.style.setProperty(
      "--projects-viewport-inline-size",
      `${document.documentElement.clientWidth}px`,
    );

    return () =>
      section.style.removeProperty("--projects-viewport-inline-size");
  }, [config.viewportWidth]);

  return (
    <div
      className="projects-shell"
      ref={shellRef}
      data-reduced-motion={reducedMotion ? "true" : "false"}
      data-layout={config.isMobile ? "mobile" : config.isTablet ? "tablet" : "desktop"}
    >
      <ProjectsTransition reducedMotion={reducedMotion} />

      <motion.header
        className="projects-intro"
        initial={reducedMotion ? false : { opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.55 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.62, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="projects-intro__index" aria-hidden="true">
          <span>01</span>
          <i />
          <span>PROYECTOS</span>
        </div>
        <div className="projects-intro__copy">
          <p>Selección 2026</p>
          <h2 id="projects-title">
            Sistemas, herramientas y experiencias
            <span> construidas para aprender haciendo.</span>
          </h2>
        </div>
        <p className="projects-intro__aside">
          Datos, automatización, producto e IA aplicada. Cada proyecto registra una
          decisión, un problema y un aprendizaje concreto. Scrolleá para recorrerlos.
        </p>
      </motion.header>

      <div
        className="projects-scroll-story"
        ref={storyRef}
        style={{ minHeight: storyHeight }}
      >
        <div className="projects-scroll-sticky">
          <ProjectsCylinder
            projects={projects}
            config={config}
            reducedMotion={reducedMotion}
            storyRef={storyRef}
          />

          <p className="projects-gesture-hint" aria-hidden="true">
            <span>Scroll para avanzar</span>
            <i />
            <span>Arrastrá o usá las flechas</span>
          </p>
        </div>
      </div>
    </div>
  );
}
