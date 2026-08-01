import { createRoot } from "react-dom/client";
import { AboutSectionMotion } from "./components/about/AboutSectionMotion";
import { PortfolioIntro } from "./components/portfolio-intro/PortfolioIntro";
import { ProjectsSection } from "./components/projects/ProjectsSection";
import { SiteBackground } from "./components/site-background/SiteBackground";
import "./components/projects/projects-gallery.css";

const backgroundRoot = document.getElementById("site-background-root");
const introRoot = document.getElementById("portfolio-intro-root");
const projectsRoot = document.getElementById("projects-root");

if (backgroundRoot) {
  createRoot(backgroundRoot).render(<SiteBackground />);
}

if (introRoot) {
  createRoot(introRoot).render(
    <>
      <PortfolioIntro />
      <AboutSectionMotion />
    </>,
  );
}

if (projectsRoot) {
  createRoot(projectsRoot).render(<ProjectsSection />);
}
