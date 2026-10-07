import { useRef, useState } from "react";
import { projects } from "../../data/projects";
import { ProjectDetailsDialog } from "../ProjectDetailsDialog";

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState(null);
  const openerRef = useRef(null);

  const openDetails = (project, opener) => {
    openerRef.current = opener;
    setSelectedProject(project);
  };

  return (
    <>
      <div className="projects-gallery">
        <header className="projects-gallery__header">
          <h2 className="section-title">Proyectos</h2>
        </header>
        <ol className="projects-gallery__list">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className={`project-entry${index === 0 ? " project-entry--featured" : ""}`}
            >
              <article aria-labelledby={`${project.id}-title`}>
                <figure className="project-entry__visual">
                  <img
                    src={project.image}
                    alt={project.imageAlt}
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <div className="project-entry__content">
                  <div className="project-entry__meta">
                    <p className="project-entry__eyebrow">{project.eyebrow}</p>
                    <span className="project-entry__status">{project.status}</span>
                  </div>
                  <h3 id={`${project.id}-title`}>
                    <button
                      type="button"
                      className="project-entry__open"
                      aria-haspopup="dialog"
                      aria-label={`Ver proyecto: ${project.title}`}
                      aria-expanded={selectedProject?.id === project.id}
                      onClick={(event) =>
                        openDetails(project, event.currentTarget)
                      }
                    >
                      {project.title}
                    </button>
                  </h3>
                  <p className="project-entry__impact">{project.impact}</p>
                  <p className="project-entry__role">{project.cardRole}</p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>

      <ProjectDetailsDialog
        project={selectedProject}
        opener={openerRef.current}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
