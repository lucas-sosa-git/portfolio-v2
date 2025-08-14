// ============================
// THEME (claro/oscuro)
// ============================
const themeBtn = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
const mqlDark = window.matchMedia('(prefers-color-scheme: dark)');
const userHasChoice = savedTheme === 'light' || savedTheme === 'dark';
const startLight = userHasChoice ? savedTheme === 'light' : !mqlDark.matches;

function setTheme(mode) {
  document.body.classList.toggle('light', mode === 'light');
  if (themeBtn) {
    themeBtn.textContent = mode === 'light' ? '🌞' : '🌙';
    themeBtn.setAttribute(
      'aria-label',
      mode === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'
    );
  }
}
setTheme(startLight ? 'light' : 'dark');

themeBtn?.addEventListener('click', () => {
  const next = document.body.classList.contains('light') ? 'dark' : 'light';
  setTheme(next);
  localStorage.setItem('theme', next);
});

if (!userHasChoice) {
  mqlDark.addEventListener('change', (e) => setTheme(e.matches ? 'dark' : 'light'));
}

// ============================
// COPIAR AL PORTAPAPELES
// ============================
document.querySelectorAll('.copy-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    btn.classList.add('ok');
    setTimeout(() => btn.classList.remove('ok'), 1200);
  });
});

// ============================
// VALIDACIÓN FORMULARIO (ES)
// ============================
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = Array.from(form.querySelectorAll('.field'));

  const validateField = (field) => {
    const input = field.querySelector('input, textarea');
    if (!input) return true;

    let valid = true;

    if (input.hasAttribute('required') && !input.value.trim()) valid = false;

    if (valid && input.type === 'email') {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!ok) valid = false;
    }

    field.classList.toggle('error', !valid);
    return valid;
  };

  // Validación progresiva
  fields.forEach((field) => {
    const input = field.querySelector('input, textarea');
    if (!input) return;

    input.addEventListener('blur', () => validateField(field));
    input.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  form.addEventListener('submit', (e) => {
    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) {
      e.preventDefault();
      const firstError = form.querySelector('.field.error input, .field.error textarea');
      firstError?.focus();
    }
  });
})();

// ============================
// MENÚ MÓVIL (accesible)
// ============================
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  const setHidden = (hidden) => {
    navMenu.setAttribute('aria-hidden', String(hidden));
    navToggle.setAttribute('aria-expanded', String(!hidden));
  };

  // Estado inicial en mobile
  setHidden(true);

  navToggle.addEventListener('click', () => {
    const hidden = navMenu.getAttribute('aria-hidden') === 'true';
    setHidden(!hidden);
  });

  // Cerrar al hacer click en un link
  navMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setHidden(true));
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setHidden(true);
  });

  // Cerrar al clickear fuera
  document.addEventListener('click', (e) => {
    if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
    setHidden(true);
  });
}

// ============================
// SCROLL SPY (opcional - DESACTIVADO)
// ============================
const ENABLE_SCROLL_SPY = false;

if (ENABLE_SCROLL_SPY) {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.navbar-links a');
  const byId = (id) => [...navLinks].find(a => a.getAttribute('href') === `#${id}`);

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = byId(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

  sections.forEach((s) => io.observe(s));
}

// ============================
// NAVBAR elevación on scroll
// ============================
const navbar = document.querySelector('.navbar');
let ticking = false;

function updateNavbarElevation() {
  if (!navbar) return;
  if (window.scrollY > 8) {
    navbar.setAttribute('data-elevated', 'true');
  } else {
    navbar.removeAttribute('data-elevated');
  }
  ticking = false;
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateNavbarElevation);
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
updateNavbarElevation();

// ==== HERO · Lissajous 3D (con bleed dinámico anti-cortes) =================
(() => {
  const canvas = document.getElementById('hero-waves');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const L3D = {
    freq: { ax: 3, by: 2, cz: 1 },

    // Centro un toque más a la izquierda para evitar rozar el borde derecho
    center: { x: 0.54, y: 0.50 },
    // Escala “segura” (si querés más grande, subí esto y/o el bleedMin)
    radiusScale: 0.33,
    perspective: 3.0,

    rotation:      { x: 0.009, y: 0.00, z: 0.00 },
    rotationSpeed: { x: 0.00,  y: 0.03, z: 0.02 },

    paramSpeed: 0.25,
    phaseDrift: 0.00,

    passes: 3,
    colorsFromCSS: true,
    colors: ['#e43f5a', '#f37676', 'rgba(255,220,220,.65)'],

    glowBlur:  [18, 14, 10],
    glowAlpha: [0.55, 0.38, 0.30],
    glowScale: 1.6,
    coreWidth: [3.0, 2.2, 1.6],
    compositeGlow: 'screen',
    compositeCore: 'source-over',

    quality: 720,
    dprMax: 2,
    jitter: 0.03,
  };

  // Random SOLO del estado inicial (posición de arranque)
  const START = {
    time:  Math.random() * 1000,
    phase: Math.random() * Math.PI * 2
  };
  const PASS_PHASE = [0.0, 0.8, 1.6];

  // ------- BLEED dinámico (borde extra) ------------------------------------
  let w, h, dpr, time = START.time;
  let bleed = 0;
  const bleedMin = 72;           // piso en px
  const bleedRatio = 0.20;       // % del menor lado (subí a 0.24 si aún roza)

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, L3D.dprMax);
    w = canvas.clientWidth;
    h = canvas.clientHeight;

    // Cálculo dinámico del bleed
    bleed = Math.max(bleedMin, Math.round(Math.min(w, h) * bleedRatio));

    // Hacemos el lienzo más grande y dibujamos con un offset
    const Wbuf = w + bleed * 2;
    const Hbuf = h + bleed * 2;
    canvas.width  = Math.floor(Wbuf * dpr);
    canvas.height = Math.floor(Hbuf * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(bleed, bleed);
    ctx.scale(dpr, dpr);
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  function cssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function updatePalette() {
    if (!L3D.colorsFromCSS) return;
    L3D.colors = [
      cssVar('--contact-accent', '#e43f5a'),
      cssVar('--accent', '#f37676'),
      'rgba(255,220,220,.65)',
    ];
  }
  updatePalette();

  function project3D(x, y, z, s, cx, cy, rx, ry, rz, persp) {
    let c = Math.cos(rx), srx = Math.sin(rx);
    let Y = y * c - z * srx, Z = y * srx + z * c, X = x;
    c = Math.cos(ry); let sry = Math.sin(ry);
    let X2 = X * c + Z * sry, Z2 = -X * sry + Z * c; X = X2; Z = Z2;
    c = Math.cos(rz); let szz = Math.sin(rz);
    let X3 = X * c - Y * szz, Y3 = X * szz + Y * c; X = X3; Y = Y3;
    const k = persp / (persp + Z * 0.8);
    return { x: cx + X * s * k, y: cy + Y * s * k };
  }

  function buildPath(pIndex, steps, ax, by, cz, cx, cy, s, rx, ry, rz) {
    const off = PASS_PHASE[pIndex % PASS_PHASE.length];
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const u = (i / steps) * Math.PI * 2;
      const jitter = L3D.jitter ? Math.sin(i * 0.07 + pIndex * 1.3 + time) * L3D.jitter : 0;

      const px = Math.sin(ax * u + L3D.paramSpeed * time + START.phase + off + L3D.phaseDrift * time) + jitter;
      const py = Math.sin(by * u + L3D.paramSpeed * 1.22 * time + START.phase * 0.9 + off * 0.8) + jitter;
      const pz = Math.sin(cz * u + START.phase * 1.1 + off * 1.1);

      const P = project3D(px, py, pz, s, cx, cy, rx, ry, rz, L3D.perspective);
      (i === 0) ? ctx.moveTo(P.x, P.y) : ctx.lineTo(P.x, P.y);
    }
  }

  function drawLissajous() {
    const cx = w * L3D.center.x, cy = h * L3D.center.y;
    // “safeScale” para no tocar bordes cuando la perspectiva agranda
    const safeScale = 0.98;
    const s  = Math.min(w, h) * L3D.radiusScale * safeScale;

    const rx = L3D.rotation.x + L3D.rotationSpeed.x * time;
    const ry = L3D.rotation.y + L3D.rotationSpeed.y * time;
    const rz = L3D.rotation.z + L3D.rotationSpeed.z * time;

    const { ax, by, cz } = L3D.freq;
    const steps = Math.max(120, Math.floor(L3D.quality));

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;

    for (let p = 0; p < L3D.passes; p++) {
      const col = L3D.colors[p % L3D.colors.length];

      buildPath(p, steps, ax, by, cz, cx, cy, s, rx, ry, rz);

      // Glow difuso
      ctx.save();
      ctx.globalCompositeOperation = L3D.compositeGlow;
      ctx.globalAlpha = L3D.glowAlpha[p] ?? L3D.glowAlpha.at(-1);
      ctx.strokeStyle = col;
      ctx.shadowBlur  = L3D.glowBlur[p] ?? L3D.glowBlur.at(-1);
      ctx.shadowColor = col;
      ctx.lineWidth   = (L3D.coreWidth[p] ?? L3D.coreWidth.at(-1)) * L3D.glowScale;
      ctx.stroke();
      ctx.restore();

      // Trazo nítido
      ctx.save();
      ctx.globalCompositeOperation = L3D.compositeCore;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = col;
      ctx.shadowBlur  = 0;
      ctx.lineWidth   = (L3D.coreWidth[p] ?? L3D.coreWidth.at(-1));
      ctx.stroke();
      ctx.restore();
    }
  }

  function clearAll() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function frame() {
    clearAll();
    drawLissajous();
    time += 0.005;
    requestAnimationFrame(frame);
  }
  frame();

  const mo = new MutationObserver(updatePalette);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'style'] });
})();
