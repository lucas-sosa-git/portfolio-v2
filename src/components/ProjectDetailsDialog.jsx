import { useEffect, useRef } from "react";

function Detail({ label, children }) {
  return (
    <section className="project-dialog__detail">
      <h3>{label}</h3>
      <p>{children}</p>
    </section>
  );
}

export function ProjectDetailsDialog({ project, opener, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !project) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
      opener?.focus?.({ preventScroll: true });
    };
  }, [opener, project]);

  const closeFromBackdrop = (event) => {
    if (event.target === dialogRef.current) dialogRef.current.close();
  };

  if (!project) return null;

  return (
    <dialog
      id="project-details-dialog"
      ref={dialogRef}
      className="project-dialog"
      aria-labelledby="project-dialog-title"
      onClick={closeFromBackdrop}
      onCancel={() => dialogRef.current?.close()}
      onClose={onClose}
    >
      <div className="project-dialog__panel">
        <header className="project-dialog__header">
          <div>
            <p>{project.eyebrow}</p>
            <h2 id="project-dialog-title">{project.title}</h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="project-dialog__close"
            aria-label="Cerrar caso"
            onClick={() => dialogRef.current?.close()}
          >
            ×
          </button>
        </header>

        <div className="project-dialog__content">
          <Detail label="Problema">{project.problem}</Detail>
          <Detail label="Responsabilidad">{project.role}</Detail>
          <Detail label="Dificultad">{project.challenge}</Detail>
          <Detail label="Resultado">{project.result}</Detail>
          <Detail label="Aprendizaje">{project.learning}</Detail>

          <section className="project-dialog__detail">
            <h3>Tecnologías</h3>
            <ul className="project-dialog__technologies">
              {project.technologies.map((technology) => (
                <li key={technology}>{technology}</li>
              ))}
            </ul>
          </section>

          {(project.liveUrl || project.githubUrl) && (
            <nav className="project-dialog__links" aria-label="Enlaces del caso">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
                  rel={project.liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                >
                  {project.primaryLabel}
                </a>
              )}
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                  Ver código
                </a>
              )}
            </nav>
          )}
        </div>
      </div>
    </dialog>
  );
}
