import * as THREE from "three";
import {
  BLOOM_BY_PHASE,
  DEFAULT_PARAMS,
  DEFAULT_TIMING,
  EXPLOSION_ENTRY_STATE,
  PHASE,
  PHASE_ORDER,
  clamp01,
  easeOutExpo,
  getEjectaExpansionProgress,
  getExplosionFlashProgress,
  getExplosionShockProgress,
  getExplosionSourceVisibility,
  getFlashShockProgress,
  smoothstep,
} from "./config";

export class SupernovaController extends EventTarget {
  constructor({
    objects,
    bloomPass,
    camera,
    origin,
    reducedMotion = false,
  }) {
    super();
    this.objects = objects;
    this.bloomPass = bloomPass;
    this.camera = camera;
    this.origin = origin;
    this.reducedMotion = reducedMotion;
    this.params = { ...DEFAULT_PARAMS };
    this.phase = PHASE.IDLE;
    this.phaseProgress = 0;
    this.globalProgress = 0;
    this.phaseTime = 0;
    this.playbackTime = 0;
    this.running = false;
    this.paused = false;
    this.totalDuration = this.calculateTotalDuration();
    this.reset();
  }

  get timings() {
    return {
      ...DEFAULT_TIMING,
      [PHASE.IMPLOSION]: this.params.implosionDuration,
      [PHASE.TENSION]: this.params.tensionDuration,
      [PHASE.STALLED_SHOCK]: this.params.stallDuration,
      [PHASE.DISSIPATION]: this.params.dissipation,
    };
  }

  calculateTotalDuration() {
    const timings = this.timings;
    return PHASE_ORDER.reduce((total, phase) => total + timings[phase], 0);
  }

  getPhaseStart(targetPhase) {
    const timings = this.timings;
    let cursor = 0;
    for (const phase of PHASE_ORDER) {
      if (phase === targetPhase) return cursor;
      cursor += timings[phase];
    }
    return 0;
  }

  setParams(nextParams) {
    Object.assign(this.params, nextParams);
    this.totalDuration = this.calculateTotalDuration();
  }

  play() {
    if (this.phase === PHASE.COMPLETE) this.reset();
    this.running = true;
    this.paused = false;
    this.dispatchState();
  }

  pause() {
    if (!this.running) return;
    this.paused = !this.paused;
    this.dispatchState();
  }

  jumpToPhase(phase) {
    if (!PHASE_ORDER.includes(phase)) return;
    this.reset();
    this.playbackTime =
      this.getPhaseStart(phase) + this.timings[phase] * 0.06;
    this.running = true;
    this.paused = false;
    this.dispatchState();
  }

  reset() {
    this.playbackTime = 0;
    this.phaseTime = 0;
    this.phase = PHASE.IDLE;
    this.phaseProgress = 0;
    this.globalProgress = 0;
    this.running = false;
    this.paused = false;
    this.camera.position.set(0, 0, 7);
    this.origin.position.set(0, 0, 0);
    this.camera.lookAt(this.origin.position);
    Object.values(this.objects).forEach((object) => object.reset?.());
    this.objects.logo.update({
      time: 0,
      collapse: 0,
      opacity: 1,
      heat: 0,
      concavity: this.params.concavity,
      cornerResistance: this.params.cornerResistance,
      finalScale: this.params.coreScale,
      noise: this.params.noise,
      implosionDuration: this.params.implosionDuration,
      instability: this.params.instability,
      asymmetry: this.params.implosionAsymmetry * 0.42,
    });
    this.applyBloom(PHASE.IDLE, 0);
    this.dispatchState();
  }

  setPhase(phase, phaseProgress, phaseTime) {
    const changed = this.phase !== phase;
    this.phase = phase;
    this.phaseProgress = phaseProgress;
    this.phaseTime = phaseTime;
    if (changed) this.dispatchEvent(new CustomEvent("phasechange", { detail: this.getState() }));
  }

  resolvePhase(time) {
    const timings = this.timings;
    let cursor = 0;
    for (const phase of PHASE_ORDER) {
      const duration = timings[phase];
      if (time <= cursor + duration) {
        const phaseTime = Math.max(0, time - cursor);
        return {
          phase,
          phaseTime,
          progress: clamp01(phaseTime / duration),
        };
      }
      cursor += duration;
    }
    return { phase: PHASE.COMPLETE, phaseTime: 0, progress: 1 };
  }

  update(delta, elapsed) {
    if (this.running && !this.paused) {
      this.playbackTime += delta * this.params.speed;
    }

    const resolved = this.running || this.playbackTime > 0
      ? this.resolvePhase(this.playbackTime)
      : { phase: PHASE.IDLE, phaseTime: 0, progress: 0 };
    this.globalProgress = clamp01(this.playbackTime / this.totalDuration);
    this.setPhase(resolved.phase, resolved.progress, resolved.phaseTime);
    this.updateVisuals(elapsed);
    this.applyBloom(this.phase, this.phaseProgress);

    if (this.phase === PHASE.COMPLETE && this.running) {
      this.running = false;
      this.paused = false;
      this.dispatchState();
    }
  }

  updateVisuals(time) {
    const p = this.phaseProgress;
    const {
      logo,
      core,
      infall,
      stalledShock,
      flash,
      shockFront,
      ejectaShell,
      ejectaParticles,
    } = this.objects;
    const amount = this.reducedMotion
      ? Math.min(this.params.particleAmount, 0.35)
      : this.params.particleAmount;
    const commonLogo = {
      time,
      concavity: this.params.concavity,
      cornerResistance: this.params.cornerResistance,
      finalScale: this.params.coreScale,
      noise: this.params.noise,
      implosionDuration: this.params.implosionDuration,
      instability: this.params.instability,
      asymmetry: this.params.implosionAsymmetry * 0.42,
    };

    logo.update({ ...commonLogo, collapse: 0, opacity: 0, heat: 0 });
    core.update({ time, opacity: 0, instability: this.params.instability });
    infall.update({ time, progress: 0, opacity: 0, amount });
    stalledShock.update({ time, opacity: 0 });
    flash.update({ progress: 0, opacity: 0 });
    shockFront.update({ time, progress: 0, opacity: 0 });
    ejectaShell.update({ time, progress: 0, opacity: 0 });
    ejectaParticles.update({ time, progress: 0, opacity: 0, amount });
    this.camera.position.z = 7;

    if (this.phase === PHASE.IDLE || this.phase === PHASE.STABILITY) {
      logo.update({
        ...commonLogo,
        collapse: 0,
        opacity: 1,
        heat: p * 0.08,
        stablePulse: Math.sin(p * Math.PI),
      });
      return;
    }

    if (this.phase === PHASE.IMPLOSION) {
      logo.update({
        ...commonLogo,
        collapse: p,
        opacity: 1,
        heat: smoothstep(p) * 0.4,
      });
      return;
    }

    if (this.phase === PHASE.CORE) {
      const exchange = smoothstep(p);
      const matchingCoreScale = THREE.MathUtils.clamp(
        this.params.coreScale / 0.3,
        0.1,
        0.5,
      );
      logo.update({
        ...commonLogo,
        collapse: 1,
        opacity: 1 - exchange,
        heat: 0.7,
      });
      core.update({
        time,
        opacity: exchange,
        pulse: exchange,
        instability: this.params.instability,
        heat: 0.28 + exchange * 0.25,
        scale: THREE.MathUtils.lerp(matchingCoreScale, 1, exchange),
      });
      return;
    }

    if (this.phase === PHASE.BOUNCE) {
      const bounceScale =
        p < 0.5
          ? THREE.MathUtils.lerp(1, 0.86, smoothstep(p / 0.5))
          : THREE.MathUtils.lerp(0.86, 1, smoothstep((p - 0.5) / 0.5));
      core.update({
        time,
        opacity: 1,
        pulse: 1,
        instability: this.params.instability,
        compression: 1 - bounceScale,
        shockCharge: THREE.MathUtils.lerp(0.5, 0.72, smoothstep(p)),
        heat: THREE.MathUtils.lerp(0.53, 0.58, smoothstep(p)),
        scale: bounceScale,
      });
      return;
    }

    if (this.phase === PHASE.TENSION) {
      const handoff = EXPLOSION_ENTRY_STATE;
      const tensionEase = smoothstep(p);
      const vibration =
        Math.sin(p * Math.PI * 6) * 0.004 * (1 - tensionEase);
      const shockReveal = smoothstep((p - 0.78) / 0.22);
      const shockOpacity =
        handoff.stalledShock.opacity + Math.sin(time * 24) * 0.1;

      core.update({
        time,
        opacity: handoff.core.opacity,
        pulse: handoff.core.pulse,
        instability: this.params.instability,
        compression: handoff.core.compression,
        shockCharge: handoff.core.shockCharge,
        heat: THREE.MathUtils.lerp(0.58, handoff.core.heat, tensionEase),
        ignition: handoff.core.ignition,
        scale: handoff.core.scale + vibration,
      });
      stalledShock.update({
        time,
        radius: handoff.stalledShock.radius,
        thickness:
          handoff.stalledShock.thickness + Math.sin(time * 28) * 0.0008,
        irregularity: handoff.stalledShock.irregularity,
        opacity: shockOpacity * shockReveal,
      });
      return;
    }

    if (this.phase === PHASE.STALLED_SHOCK) {
      core.update({
        time,
        opacity: 1,
        pulse: 1,
        instability: this.params.instability,
        shockCharge: 0.72 + p * 0.28,
        heat: 0.62 + p * 0.12,
      });
      stalledShock.update({
        time,
        radius: 0.085 + easeOutExpo(Math.min(p * 1.5, 1)) * 0.035,
        thickness: 0.006 + Math.sin(time * 28) * 0.0008,
        irregularity: 0.46 + p * 0.34,
        opacity: 0.65 + Math.sin(time * 24) * 0.1,
      });
      return;
    }

    if (this.phase === PHASE.IGNITION) {
      core.update({
        time,
        opacity: 1,
        pulse: 1,
        instability: this.params.instability * (1 - p * 0.4),
        shockCharge: 1,
        heat: 0.74 + p * 0.26,
        ignition: smoothstep(p),
      });
      stalledShock.update({
        time,
        radius: 0.12 + p * 0.012,
        thickness: 0.0055,
        irregularity: 0.8 + p * 0.2,
        opacity: 0.74 + p * 0.2,
      });
      return;
    }

    if (this.phase === PHASE.FLASH) {
      const flashOpacity = this.reducedMotion
        ? 0
        : Math.sin(p * Math.PI) * 0.72;
      core.update({
        time,
        opacity: 1 - smoothstep(p),
        pulse: 1,
        instability: this.params.instability,
        heat: 1,
        ignition: 1,
        scale: 1 + p * 1.8,
      });
      flash.update({ progress: easeOutExpo(p), opacity: flashOpacity });
      shockFront.update({
        time,
        progress: getFlashShockProgress(p),
        opacity: this.reducedMotion ? 0.25 : smoothstep(p),
        irregularity: 0.45,
      });
      this.camera.position.z = 7 + Math.sin(p * Math.PI) * 0.1;
      return;
    }

    if (this.phase === PHASE.EXPLOSION) {
      const sourceVisibility = getExplosionSourceVisibility(p);
      core.update({
        time,
        opacity: sourceVisibility,
        pulse: 1,
        instability: this.params.instability * 0.45,
        heat: 1,
        ignition: 1,
        scale: 1 + p * 2.2,
      });
      flash.update({
        progress: getExplosionFlashProgress(p),
        opacity: this.reducedMotion ? 0 : sourceVisibility * 0.42,
      });
      shockFront.update({
        time,
        progress: getExplosionShockProgress(p),
        opacity: (1 - p * 0.7) * (this.reducedMotion ? 0.35 : 1),
        irregularity: 0.58 + this.params.asymmetry * 0.52,
      });
      ejectaShell.update({
        time,
        progress: getEjectaExpansionProgress(p),
        asymmetry: this.params.asymmetry,
        lobeStrength: this.params.lobeStrength,
        opacity: Math.sin(Math.min(1, p * 1.25) * Math.PI) * 0.075,
      });
      ejectaParticles.update({
        time,
        progress: p,
        opacity: 0.22,
        amount,
        asymmetry: this.params.asymmetry,
        lobeStrength: this.params.lobeStrength,
      });
      return;
    }

    if (this.phase === PHASE.DISSIPATION) {
      const fade = 1 - smoothstep(p);
      shockFront.update({
        time,
        progress: 1,
        opacity: fade * 0.28,
        irregularity: 0.9,
      });
      ejectaShell.update({
        time,
        progress: 0.82 + p * 0.18,
        asymmetry: this.params.asymmetry,
        lobeStrength: this.params.lobeStrength,
        opacity: fade * 0.18,
      });
      ejectaParticles.update({
        time,
        progress: 1,
        opacity: fade,
        amount,
        asymmetry: this.params.asymmetry,
        lobeStrength: this.params.lobeStrength,
      });
    }
  }

  applyBloom(phase, progress) {
    if (phase === PHASE.TENSION) {
      const from = BLOOM_BY_PHASE[PHASE.BOUNCE];
      const to = EXPLOSION_ENTRY_STATE.bloom;
      const lift = smoothstep(progress);
      const reducedMultiplier = this.reducedMotion ? 0.28 : 1;
      this.bloomPass.strength =
        THREE.MathUtils.lerp(from[0], to[0], lift) *
        this.params.bloom *
        reducedMultiplier;
      this.bloomPass.radius = THREE.MathUtils.lerp(from[1], to[1], lift);
      this.bloomPass.threshold = THREE.MathUtils.lerp(from[2], to[2], lift);
      return;
    }

    const [strength, radius, threshold] =
      BLOOM_BY_PHASE[phase] || BLOOM_BY_PHASE[PHASE.IDLE];
    const reducedMultiplier = this.reducedMotion ? 0.28 : 1;
    const ignitionLift =
      phase === PHASE.IGNITION || phase === PHASE.FLASH
        ? smoothstep(progress) * 0.12
        : 0;
    this.bloomPass.strength =
      (strength + ignitionLift) * this.params.bloom * reducedMultiplier;
    this.bloomPass.radius = radius;
    this.bloomPass.threshold = threshold;
  }

  getState() {
    return {
      phase: this.phase,
      phaseProgress: this.phaseProgress,
      phaseTime: this.phaseTime,
      globalProgress: this.globalProgress,
      totalDuration: this.totalDuration,
      running: this.running,
      paused: this.paused,
    };
  }

  dispatchState() {
    this.dispatchEvent(new CustomEvent("statechange", { detail: this.getState() }));
  }

  dispose() {
    this.running = false;
    Object.values(this.objects).forEach((object) => object.dispose?.());
  }
}
