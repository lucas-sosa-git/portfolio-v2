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
        <ol className="projects-gallery__list">
          {projects.map((project, index) => {
            const primaryUrl = project.liveUrl || project.githubUrl;

            return (
              <li key={project.id} className="project-entry">
                <article aria-labelledby={`${project.id}-title`}>
                  <figure className="project-entry__visual">
                    <img
                      src={project.image}
                      alt={project.imageAlt}
                      loading={index < 2 ? "eager" : "lazy"}
                      fetchPriority={index === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                    <figcaption>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <span>{project.status}</span>
                    </figcaption>
                  </figure>

                  <div className="project-entry__content">
                    <p className="project-entry__eyebrow">{project.eyebrow}</p>
                    <h3 id={`${project.id}-title`}>{project.title}</h3>
                    <p className="project-entry__summary">{project.summary}</p>
                    <p className="project-entry__result">
                      <span>Resultado</span>
                      {project.result}
                    </p>

                    <ul aria-label="Tecnologías principales">
                      {project.technologies.map((technology) => (
                        <li key={technology}>{technology}</li>
                      ))}
                    </ul>

                    <div className="project-entry__actions">
                      <button
                        type="button"
                        aria-controls="project-details-dialog"
                        aria-expanded={selectedProject?.id === project.id}
                        onClick={(event) =>
                          openDetails(project, event.currentTarget)
                        }
                      >
                        Explorar caso
                      </button>
                      {primaryUrl && (
                        <a
                          href={primaryUrl}
                          target={
                            primaryUrl.startsWith("http")
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            primaryUrl.startsWith("http")
                              ? "noopener noreferrer"
                              : undefined
                          }
                        >
                          {project.primaryLabel}
                          <span aria-hidden="true">↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
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
