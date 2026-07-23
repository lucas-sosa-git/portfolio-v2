import { useCallback } from "react";

export function useProjectNavigation({ activeIndex, projectCount, goTo }) {
  const previous = useCallback(
    () => goTo(Math.max(0, activeIndex - 1)),
    [activeIndex, goTo],
  );

  const next = useCallback(
    () => goTo(Math.min(projectCount - 1, activeIndex + 1)),
    [activeIndex, goTo, projectCount],
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        previous();
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        next();
      }

      if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      }

      if (event.key === "End") {
        event.preventDefault();
        goTo(projectCount - 1);
      }
    },
    [goTo, next, previous, projectCount],
  );

  return {
    previous,
    next,
    onKeyDown,
    canGoPrevious: activeIndex > 0,
    canGoNext: activeIndex < projectCount - 1,
  };
}
