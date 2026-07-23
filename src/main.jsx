import { createRoot } from "react-dom/client";
import { ProjectsSection } from "./components/projects/ProjectsSection";
import "./components/projects/projects.css";

const projectsRoot = document.getElementById("projects-root");

if (projectsRoot) {
  createRoot(projectsRoot).render(<ProjectsSection />);
}
