import { motion } from "motion/react";

export function ProjectsTransition({ reducedMotion }) {
  const duration = reducedMotion ? 0.01 : 1.15;

  return (
    <div className="projects-transition" aria-hidden="true">
      <svg viewBox="0 0 1200 210" preserveAspectRatio="none">
        <defs>
          <linearGradient id="projects-line-gradient" x1="0" x2="1">
            <stop offset="0" stopColor="var(--contact-accent)" stopOpacity="0" />
            <stop offset="0.28" stopColor="var(--contact-accent)" stopOpacity="0.8" />
            <stop offset="0.72" stopColor="var(--accent)" stopOpacity="0.72" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
          <filter id="projects-line-glow" x="-30%" y="-60%" width="160%" height="220%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          className="projects-transition__wave"
          d="M0 36 C150 4 205 78 344 57 C472 38 535 96 654 76 C772 56 827 102 920 92 C1030 80 1090 103 1200 103"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.ellipse
          className="projects-transition__orbit"
          cx="600"
          cy="133"
          rx="224"
          ry="48"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 0.72 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: duration * 0.9, delay: reducedMotion ? 0 : 0.45 }}
        />
        <circle className="projects-transition__node" cx="600" cy="133" r="4" />
      </svg>
    </div>
  );
}
