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
    themeBtn.setAttribute('aria-label', mode === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
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
if (!userHasChoice) {
  (mqlDark.addEventListener ? mqlDark.addEventListener('change', (e)=>setTheme(e.matches?'dark':'light'))
                            : mqlDark.addListener && mqlDark.addListener((e)=>setTheme(e.matches?'dark':'light')));
}

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.getElementById('nav-menu');

if (navToggle && navMenu) {
  const setHidden = (hidden) => {
    navMenu.setAttribute('aria-hidden', String(hidden));
    navToggle.setAttribute('aria-expanded', String(!hidden));
  };

  setHidden(true); // estado inicial

  navToggle.addEventListener('click', () => {
    const hidden = navMenu.getAttribute('aria-hidden') === 'true';
    setHidden(!hidden);
  });

  navMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setHidden(true));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setHidden(true);
  });

  document.addEventListener('click', (e) => {
    if (navMenu.contains(e.target) || navToggle.contains(e.target)) return;
    setHidden(true);
  });
}

// ============================
// NAVBAR elevación on scroll (opcional)
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

    center: { x: 0.54, y: 0.50 },
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
  const bleedMin = 72;
  const bleedRatio = 0.20;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, L3D.dprMax);
    w = canvas.clientWidth;
    h = canvas.clientHeight;

    bleed = Math.max(bleedMin, Math.round(Math.min(w, h) * bleedRatio));

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

      // Glow
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

// ====== PROYECTS: fondo waves por card (solo corre en hover) ======
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const cards = document.querySelectorAll('.proj-card');
  if (!cards.length) return;

  cards.forEach(setupWave);

  function setupWave(card){
    const canvas = card.querySelector('.proj-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w=0, h=0, dpr=1, t=0, raf=null;

    function cssVar(name, fb){
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fb;
    }
    function palette(){
      return {
        red:  cssVar('--contact-accent', '#e43f5a'),
        pink: cssVar('--accent', '#f37676'),
        soft: 'rgba(255,220,220,.6)'
      };
    }

    function resize(){
      const rect = card.getBoundingClientRect();
      w = Math.max(160, Math.floor(rect.width));   // sin "bleed", 1:1 con la tarjeta
      h = Math.max(120, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }


    function drawWave({ amp, kx, speed, phase, lw, color, blur }){
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.shadowBlur = blur;
      ctx.shadowColor = color;

      for (let x = 0; x <= w; x += 1.5) {   // antes iba de -20 a w+20
        const y = h * 0.2 + Math.sin(x * kx + t * speed + phase) * amp;
        (x === 0) ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }

      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.restore();
    }

    function render(){
      const { red, pink, soft } = palette();
      ctx.clearRect(0, 0, w, h);

      drawWave({ amp: h * 0.16, kx: 0.012, speed: 0.70, phase: 0.0, lw: 2.8, color: red,  blur: 18 });
      drawWave({ amp: h * 0.12, kx: 0.017, speed: 0.55, phase: 1.1, lw: 2.2, color: pink, blur: 14 });
      drawWave({ amp: h * 0.10, kx: 0.020, speed: 0.45, phase: 2.2, lw: 1.8, color: soft, blur: 12 });

      t += 0.015;  // antes 0.03 → más lento y suave
      raf = requestAnimationFrame(render);
    }


    function start(){ if (!raf){ resize(); render(); } }
    function stop(){ if (raf){ cancelAnimationFrame(raf); raf = null; } }

    // Arranca/para con hover
    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);

    // Si el card desaparece del viewport, nos aseguramos de parar
    const io = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); });
    io.observe(card);

    // Recalcular en resize
    window.addEventListener('resize', () => { if (raf) resize(); }, { passive:true });
  }
})();
