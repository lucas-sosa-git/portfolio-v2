export function ProjectsNavigation({
  projects,
  activeIndex,
  goTo,
  previous,
  next,
  canGoPrevious,
  canGoNext,
}) {
  return (
    <div className="projects-navigation">
      <button
        type="button"
        className="projects-navigation__arrow"
        onClick={previous}
        disabled={!canGoPrevious}
        aria-label="Ver proyecto anterior"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 5-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>

      <div className="projects-navigation__dots" aria-label="Elegir proyecto">
        {projects.map((project, index) => (
          <button
            type="button"
            key={project.id}
            className="projects-navigation__dot"
            aria-label={`Mostrar ${project.title}`}
            aria-pressed={index === activeIndex}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => goTo(index)}
          >
            <span />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="projects-navigation__arrow"
        onClick={next}
        disabled={!canGoNext}
        aria-label="Ver proyecto siguiente"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </button>
    </div>
  );
}
