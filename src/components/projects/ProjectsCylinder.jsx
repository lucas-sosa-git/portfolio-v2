import { motion } from "motion/react";
import { ProjectCard } from "./ProjectCard";
import { ProjectsNavigation } from "./ProjectsNavigation";
import { ProjectsAtmosphere } from "./ProjectsAtmosphere";
import { useCylinderRotation } from "../../hooks/useCylinderRotation";
import { useProjectNavigation } from "../../hooks/useProjectNavigation";

export function ProjectsCylinder({ projects, config, reducedMotion, storyRef }) {
  const {
    rotation,
    scrollYProgress,
    activeIndex,
    isDragging,
    goTo,
    onPanStart,
    onPan,
    onPanEnd,
    onPointerDownCapture,
    consumeDraggedClick,
  } = useCylinderRotation({
    projectCount: projects.length,
    angleStep: config.angleStep,
    dragScrollFactor: config.dragScrollFactor,
    velocityProjection: config.velocityProjection,
    reducedMotion,
    storyRef,
  });

  const navigation = useProjectNavigation({
    activeIndex,
    projectCount: projects.length,
    goTo,
  });

  return (
    <div className="projects-cylinder-wrap">
      <motion.div
        className={`projects-stage${isDragging ? " is-dragging" : ""}${
          reducedMotion ? " is-reduced" : ""
        }`}
        style={{ perspective: `${config.perspective}px` }}
        tabIndex={0}
        role="region"
        aria-label="Galería de proyectos en hélice controlada por scroll vertical. También podés arrastrar horizontalmente o usar las flechas."
        onKeyDown={navigation.onKeyDown}
        onPointerDownCapture={onPointerDownCapture}
        onPanStart={onPanStart}
        onPan={onPan}
        onPanEnd={onPanEnd}
        onClickCapture={consumeDraggedClick}
      >
        <ProjectsAtmosphere progress={scrollYProgress} />

        <div className="projects-stage__orbit" aria-hidden="true">
          <span />
          <span />
        </div>

        <div
          className="projects-cylinder-depth"
          style={
            reducedMotion
              ? undefined
              : { transform: `translateZ(-${config.radius}px)` }
          }
        >
          <motion.div
            className="projects-cylinder"
            style={reducedMotion ? undefined : { rotateY: rotation }}
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                projectCount={projects.length}
                baseAngle={index * config.angleStep}
                angleStep={config.angleStep}
                helixPitch={config.helixPitch}
                radius={config.radius}
                rotation={rotation}
                blurMax={config.blurMax}
                falloffAngle={config.falloffAngle}
                active={index === activeIndex}
                reducedMotion={reducedMotion}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>

      <div className="projects-cylinder__status" aria-live="polite" aria-atomic="true">
        <span>{String(activeIndex + 1).padStart(2, "0")}</span>
        <p>
          Proyecto activo: <strong>{projects[activeIndex].title}</strong>
        </p>
        <span>{String(projects.length).padStart(2, "0")}</span>
      </div>

      <ProjectsNavigation
        projects={projects}
        activeIndex={activeIndex}
        goTo={goTo}
        {...navigation}
      />
    </div>
  );
}
