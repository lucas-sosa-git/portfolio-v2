import { EXPLOSION_ENTRY_STATE } from "./introConfig";

export function createIntroTimeline({
  createTimeline,
  timing,
  implosionMotion,
  logo,
  energy,
  flash,
  rays,
  rayElements,
  wave,
  overlay,
  transitionState,
  prepareReveal,
  onComplete,
}) {
  const implosionAt = timing.stable;
  const formationAt = implosionAt + timing.implosion;
  const compressionAt = formationAt + timing.coreFormation;
  const tensionAt = compressionAt + timing.finalCompression;
  const releaseAt = tensionAt + timing.tension;
  const waveAt = releaseAt + 80;
  const endAt = waveAt + timing.wave;

  return createTimeline({
    autoplay: false,
    defaults: { ease: "out(3)" },
    onComplete,
  })
    .call(() => transitionState("STABLE"), 0)
    .add(
      implosionMotion,
      { pulse: [0, 1, 0], duration: timing.stable, ease: "inOut(2)" },
      0,
    )
    .call(() => transitionState("COLLAPSING"), implosionAt)
    .add(
      implosionMotion,
      {
        collapse: [0, 1],
        heat: [0, 0.38],
        duration: timing.implosion,
        ease: "linear",
      },
      implosionAt,
    )
    .call(() => transitionState("FORMING_CORE"), formationAt)
    .add(
      implosionMotion,
      {
        opacity: [1, 0],
        heat: [0.38, 0.62],
        duration: timing.coreFormation,
        ease: "inOut(2)",
      },
      formationAt,
    )
    .add(
      logo,
      {
        scaleX: EXPLOSION_ENTRY_STATE.logo.scaleX,
        scaleY: EXPLOSION_ENTRY_STATE.logo.scaleY,
        opacity: EXPLOSION_ENTRY_STATE.logo.opacity,
        filter: EXPLOSION_ENTRY_STATE.logo.filter,
        duration: timing.coreFormation,
        ease: "linear",
      },
      formationAt,
    )
    .add(
      energy,
      {
        opacity: [0, EXPLOSION_ENTRY_STATE.core.opacity],
        scale: EXPLOSION_ENTRY_STATE.core.scale,
        filter: ["brightness(1)", "brightness(1.08)"],
        duration: timing.coreFormation,
        ease: "inOut(2)",
      },
      formationAt,
    )
    .call(() => transitionState("COMPRESSING"), compressionAt)
    .add(
      energy,
      {
        scale: [
          EXPLOSION_ENTRY_STATE.core.scale,
          EXPLOSION_ENTRY_STATE.core.scale * 0.86,
          EXPLOSION_ENTRY_STATE.core.scale,
        ],
        filter: ["brightness(1.08)", "brightness(1.18)", "brightness(1.12)"],
        duration: timing.finalCompression,
        ease: "inOut(3)",
      },
      compressionAt,
    )
    .call(() => transitionState("TENSION"), tensionAt)
    .add(
      energy,
      {
        opacity: EXPLOSION_ENTRY_STATE.core.opacity,
        scale: EXPLOSION_ENTRY_STATE.core.scale,
        filter: EXPLOSION_ENTRY_STATE.core.filter,
        duration: timing.tension,
        ease: "linear",
      },
      tensionAt,
    )
    .call(() => transitionState("RELEASING"), releaseAt)
    .add(
      logo,
      { opacity: 0, duration: 120, ease: "linear" },
      releaseAt,
    )
    .add(
      energy,
      {
        scale: [0.88, 4.4],
        opacity: [1, 0],
        filter: ["brightness(1.4)", "brightness(6)"],
        duration: 260,
        ease: "out(5)",
      },
      releaseAt,
    )
    .add(
      flash,
      {
        opacity: [0, 0.96, 0],
        scale: [0, 1],
        duration: timing.wave * 0.82,
        ease: "out(5)",
      },
      releaseAt,
    )
    .add(
      rays,
      {
        opacity: [0, 0.95, 0],
        duration: Math.min(620, timing.wave * 0.65),
        ease: "out(4)",
      },
      releaseAt,
    )
    .add(
      rayElements,
      {
        scaleX: [0, 1],
        duration: Math.min(520, timing.wave * 0.55),
        ease: "out(5)",
      },
      releaseAt,
    )
    .call(() => {
      transitionState("REVEALING");
      prepareReveal();
    }, waveAt)
    .set(wave, { opacity: 1, scale: 0.01 }, waveAt)
    .add(
      wave,
      { scale: 1, duration: timing.wave, ease: "out(4)" },
      waveAt,
    )
    .add(
      wave,
      { opacity: 0, duration: 220, ease: "in(2)" },
      endAt - 220,
    )
    .add(
      overlay,
      { opacity: 0, duration: timing.cleanupFade, ease: "linear" },
      endAt - timing.cleanupFade,
    );
}
