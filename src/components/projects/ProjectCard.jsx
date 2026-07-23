import { motion, useTransform } from "motion/react";

const normalizeAngle = (angle) => ((angle + 180) % 360 + 360) % 360 - 180;

function ActionLink({ href, children, secondary = false, active }) {
  const external = href.startsWith("http");

  return (
    <a
      className={`project3d-card__action${secondary ? " is-secondary" : ""}`}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener" : undefined}
      tabIndex={active ? 0 : -1}
    >
      <span>{children}</span>
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 15 15 5M7 5h8v8" fill="none" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    </a>
  );
}

export function ProjectCard({
  project,
  index,
  projectCount,
  baseAngle,
  angleStep,
  helixPitch,
  radius,
  rotation,
  blurMax,
  falloffAngle,
  active,
  reducedMotion,
}) {
  const relativeAngle = useTransform(rotation, (value) =>
    normalizeAngle(baseAngle + value),
  );
  const distance = useTransform(relativeAngle, (value) =>
    Math.min(Math.abs(value) / falloffAngle, 1),
  );
  const opacity = useTransform(distance, [0, 0.48, 1], [1, 0.62, 0.12]);
  const scale = useTransform(distance, [0, 0.58, 1], [1, 0.84, 0.7]);
  const filter = useTransform(
    distance,
    (value) =>
      `blur(${(value * blurMax).toFixed(2)}px) saturate(${(
        1 - value * 0.56
      ).toFixed(2)}) brightness(${(1 - value * 0.47).toFixed(2)})`,
  );
  const helixY = useTransform(
    rotation,
    (value) => (index + value / angleStep) * helixPitch,
  );

  const geometryStyle = reducedMotion
    ? undefined
    : {
        transform: `rotateY(${baseAngle}deg) translateZ(${radius}px)`,
      };

  return (
    <motion.div
      className={`project-position${active ? " is-active" : ""}`}
      style={reducedMotion ? undefined : { y: helixY }}
      aria-hidden={active ? "false" : "true"}
      inert={active ? undefined : true}
    >
      <div className="project-geometry" style={geometryStyle}>
        <div className="project-card-center">
          <motion.article
            className="project3d-card"
            style={reducedMotion ? undefined : { opacity, scale }}
            data-active={active}
            tabIndex={active ? 0 : -1}
            aria-label={`${project.title}, proyecto ${index + 1} de ${projectCount}`}
          >
            <motion.div
              className="project3d-card__surface"
              style={reducedMotion ? undefined : { filter }}
            >
              <div className="project3d-card__media">
            <img
              src={project.image}
              alt={project.imageAlt}
              width="1200"
              height="760"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
            <div className="project3d-card__media-shade" />
            <span className="project3d-card__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="project3d-card__status">{project.status}</span>
              </div>

              <div className="project3d-card__body">
            <header className="project3d-card__header">
              <p>{project.eyebrow}</p>
              <h3>{project.title}</h3>
              <span>{project.summary}</span>
            </header>

            <div className="project3d-card__story">
              <div>
                <span className="project3d-card__label">Necesidad</span>
                <p>{project.problem}</p>
              </div>
              <div className="project3d-card__learning">
                <span className="project3d-card__label">Qué aprendí</span>
                <p>{project.learning}</p>
              </div>
            </div>

            <div className="project3d-card__meta">
              <p>
                <span>Rol</span>
                {project.role}
              </p>
              <ul aria-label="Tecnologías principales">
                {project.technologies.map((technology) => (
                  <li key={technology}>{technology}</li>
                ))}
              </ul>
            </div>

            <footer className="project3d-card__footer">
              <p>
                <span>Resultado</span>
                {project.result}
              </p>
              <div className="project3d-card__actions">
                {project.liveUrl && (
                  <ActionLink href={project.liveUrl} active={active}>
                    {project.primaryLabel}
                  </ActionLink>
                )}
                {project.githubUrl && (
                  <ActionLink
                    href={project.githubUrl}
                    secondary={Boolean(project.liveUrl)}
                    active={active}
                  >
                    GitHub
                  </ActionLink>
                )}
              </div>
            </footer>
              </div>
            </motion.div>
          </motion.article>
        </div>
      </div>
    </motion.div>
  );
}
