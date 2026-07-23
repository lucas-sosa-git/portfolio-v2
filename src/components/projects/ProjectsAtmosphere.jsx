import { motion, useTransform } from "motion/react";

const particles = Array.from({ length: 15 }, (_, index) => index);

export function ProjectsAtmosphere({ progress }) {
  const y = useTransform(progress, [0, 1], [36, -44]);
  const rotate = useTransform(progress, [0, 1], [-1.2, 1.4]);

  return (
    <motion.div className="projects-atmosphere" style={{ y, rotate }} aria-hidden="true">
      <div className="projects-atmosphere__caustic projects-atmosphere__caustic--one" />
      <div className="projects-atmosphere__caustic projects-atmosphere__caustic--two" />

      <svg viewBox="0 0 1400 720" preserveAspectRatio="none">
        <path
          className="projects-current projects-current--main"
          d="M-80 574 C145 420 235 648 430 482 C616 325 667 124 884 188 C1084 248 1113 508 1480 298"
        />
        <path
          className="projects-current projects-current--soft"
          d="M-60 236 C188 390 300 98 532 240 C752 375 864 554 1072 386 C1218 268 1308 310 1460 414"
        />
        <path
          className="projects-current projects-current--white"
          d="M-100 452 C164 262 318 538 538 398 C770 252 850 78 1108 214 C1250 289 1340 232 1490 154"
        />
      </svg>

      <div className="projects-particles">
        {particles.map((particle) => (
          <i
            key={particle}
            style={{
              "--particle-x": `${4 + ((particle * 37) % 92)}%`,
              "--particle-size": `${2 + ((particle * 5) % 6)}px`,
              "--particle-delay": `${-((particle * 1.7) % 12)}s`,
              "--particle-duration": `${10 + ((particle * 3) % 9)}s`,
              "--particle-drift": `${-34 + ((particle * 19) % 68)}px`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
