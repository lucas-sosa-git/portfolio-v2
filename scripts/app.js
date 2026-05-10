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
    a.addEventListener('click', (e) => {
      const isMobileMenu = window.matchMedia('(max-width: 840px)').matches;
      const href = a.getAttribute('href') || '';
      const target = href.startsWith('#') ? document.querySelector(href) : null;

      if (!target || !isMobileMenu) {
        setHidden(true);
        return;
      }

      e.preventDefault();
      setHidden(true);
      window.setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.pushState(null, '', href);
      }, 120);
    });
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
// BOTTOM NAV MOBILE: estado activo
// ============================
(() => {
  const items = Array.from(document.querySelectorAll('.mobile-bottom-nav .mbn-item'));
  if (!items.length) return;

  const byId = new Map(
    items
      .map((item) => {
        const id = (item.getAttribute('href') || '').replace('#', '');
        const section = id ? document.getElementById(id) : null;
        return section ? [id, { item, section }] : null;
      })
      .filter(Boolean)
  );

  const setActive = (id) => {
    items.forEach((item) => {
      item.classList.toggle('active', (item.getAttribute('href') || '') === `#${id}`);
    });
  };

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible?.target?.id) setActive(visible.target.id);
  }, {
    rootMargin: '-35% 0px -45% 0px',
    threshold: [0.15, 0.35, 0.6],
  });

  byId.forEach(({ section }) => observer.observe(section));
})();



// ==== HERO · Lissajous 3D (con bleed dinámico) =================
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
  // **Ajuste de color en LIGHT (solo color, sin tocar tamaños)**
  function updatePalette() {
    if (!L3D.colorsFromCSS) return;
    const isLight = document.body.classList.contains('light');
    L3D.colors = [
      cssVar('--contact-accent', '#e43f5a'),
      cssVar('--accent', '#f37676'),
      isLight ? 'rgba(255,170,170,.65)' : 'rgba(255,220,220,.65)',
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
    // --- Fade-out sin cambiar tamaños ---
    const FADE_MS = 260;
    let state = 'stopped';        // 'running' | 'fading' | 'stopped'
    let fadeStart = 0, fadeUntil = 0;

function palette(){
  return document.body.classList.contains('light')
    ? {
        red:  '#c81e1e',              // rojo profundo (más contraste en fondo claro)
        pink: '#ff6a7a',              // rosa/coral vivo (más saturado que #F37676)
        soft: 'rgba(255,196,201,.58)' // brillo rosado suave (sin tirarse a ámbar)
      }
    : {
        red:  '#e43f5a',
        pink: '#f37676',
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

    function clearCanvas(){
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    function drawWave(params, alpha){
      const { amp, kx, speed, phase, lw, color, blur } = params;
      ctx.save();
      ctx.globalAlpha = alpha;  // <- fade aplicado aquí
      ctx.beginPath();
      ctx.lineWidth = lw;
      ctx.lineCap = 'round';
      ctx.shadowBlur = blur;
      ctx.shadowColor = color;

      for (let x = 0; x <= w; x += 1.5) {
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

      const now = performance.now();
      let alpha = 1;
      if (state === 'fading') alpha = Math.max(0, (fadeUntil - now) / FADE_MS);

      // mismos parámetros que tenías (sin cambios de tamaño/velocidad)
      drawWave({ amp: h * 0.16, kx: 0.012, speed: 0.70, phase: 0.0, lw: 2.8, color: red,  blur: 18 }, alpha);
      drawWave({ amp: h * 0.12, kx: 0.017, speed: 0.55, phase: 1.1, lw: 2.2, color: pink, blur: 14 }, alpha);
      drawWave({ amp: h * 0.10, kx: 0.020, speed: 0.45, phase: 2.2, lw: 1.8, color: soft, blur: 12 }, alpha);

      t += 0.015;

      if (state === 'fading' && alpha === 0) {
        // fin del fade: limpiar y cortar el loop
        clearCanvas();
        cancelAnimationFrame(raf);
        raf = null;
        state = 'stopped';
        return;
      }

      raf = requestAnimationFrame(render);
    }

    function start(){
      if (!raf){
        resize();
        state = 'running';
        render();
      } else {
        state = 'running';
      }
    }

    function stop(){
      // no cortamos de golpe; iniciamos fade-out
      if (raf && state !== 'fading') {
        state = 'fading';
        fadeStart = performance.now();
        fadeUntil = fadeStart + FADE_MS;
      }
    }

    // Arranca/para con hover
    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);

    // Si el card desaparece del viewport, que no quede pintado
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && raf) {
        state = 'fading';
        fadeStart = performance.now();
        fadeUntil = fadeStart + FADE_MS;
      }
    });
    io.observe(card);

    // Recalcular en resize si está corriendo
    window.addEventListener('resize', () => { if (raf) resize(); }, { passive:true });
  }
})();

(() => {
  const carousel = document.getElementById('projects-carousel');
  const cards = carousel ? Array.from(carousel.querySelectorAll('.proj-card')) : [];
  const prev = document.querySelector('[data-carousel-prev]');
  const next = document.querySelector('[data-carousel-next]');
  const dots = document.querySelector('.projects-carousel-dots');

  if (!carousel || !cards.length) return;

  const scrollToCard = (index) => {
    const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  };

  const getActiveIndex = () => {
    const left = carousel.getBoundingClientRect().left;
    let closest = 0;
    let distance = Infinity;

    cards.forEach((card, index) => {
      const delta = Math.abs(card.getBoundingClientRect().left - left);
      if (delta < distance) {
        closest = index;
        distance = delta;
      }
    });

    return closest;
  };

  const setActive = () => {
    const index = getActiveIndex();
    prev?.toggleAttribute('disabled', index === 0);
    next?.toggleAttribute('disabled', index === cards.length - 1);
    dots?.querySelectorAll('button').forEach((dot, dotIndex) => {
      dot.setAttribute('aria-current', String(dotIndex === index));
    });
  };

  if (dots) {
    cards.forEach((card, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ver proyecto ${index + 1}: ${card.querySelector('.proj-title')?.textContent?.trim() || 'Proyecto'}`);
      dot.addEventListener('click', () => scrollToCard(index));
      dots.appendChild(dot);
    });
  }

  prev?.addEventListener('click', () => scrollToCard(getActiveIndex() - 1));
  next?.addEventListener('click', () => scrollToCard(getActiveIndex() + 1));

  carousel.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();
    scrollToCard(getActiveIndex() + (e.key === 'ArrowRight' ? 1 : -1));
  });

  carousel.addEventListener('scroll', () => {
    window.requestAnimationFrame(setActive);
  }, { passive: true });

  window.addEventListener('resize', setActive, { passive: true });
  setActive();
})();


// ====== COURSES: fondo waves por card (hover) ======
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Reutilizo la misma idea que en Proyectos, con fade-out al salir
  function setupCourseWave(card){
    // Si la tarjeta no tiene canvas, lo insertamos como primer hijo
    let canvas = card.querySelector('.course-bg');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'course-bg';
      canvas.setAttribute('aria-hidden', 'true');
      card.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let w=0, h=0, dpr=1, t=0, raf=null;
    // --- Fade-out sin cambiar tamaños ---
    const FADE_MS = 260;
    let state = 'stopped';        // 'running' | 'fading' | 'stopped'
    let fadeStart = 0, fadeUntil = 0;

function palette(){
  return document.body.classList.contains('light')
    ? {
        red:  '#c81e1e',              // rojo profundo (más contraste en fondo claro)
        pink: '#ff6a7a',              // rosa/coral vivo (más saturado que #F37676)
        soft: 'rgba(255,196,201,.58)' // brillo rosado suave (sin tirarse a ámbar)
      }
    : {
        red:  '#e43f5a',
        pink: '#f37676',
        soft: 'rgba(255,220,220,.6)'
      };
}



    function resize(){
      const rect = card.getBoundingClientRect();
      w = Math.max(160, Math.floor(rect.width));
      h = Math.max(120, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = '100%';
      canvas.style.height = '100%';

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function clearCanvas(){
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    function drawWave(params, alpha){
      const { amp, kx, speed, phase, lw, color, blur } = params;
      ctx.save();
      ctx.globalAlpha   = alpha;   // <- fade aplicado aquí
      ctx.beginPath();
      ctx.lineWidth     = lw;
      ctx.lineCap       = 'round';
      ctx.shadowBlur    = blur;
      ctx.shadowColor   = color;

      // Base un poco más baja que en proyectos para no invadir los títulos
      const yBase = h * 0.22;
      for (let x = 0; x <= w; x += 1.5) {
        const y = yBase + Math.sin(x * kx + t * speed + phase) * amp;
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

      const now = performance.now();
      let alpha = 1;
      if (state === 'fading') alpha = Math.max(0, (fadeUntil - now) / FADE_MS);

      // mismos parámetros que tenías
      drawWave({ amp: h * 2,   kx: 0.012, speed: 0.1,  phase: 0.0, lw: 2.4, color: red,  blur: 14 }, alpha);
      drawWave({ amp: h * 2.1, kx: 0.017, speed: 0.05, phase: 1.1, lw: 2.0, color: pink, blur: 12 }, alpha);
      drawWave({ amp: h * 1.9, kx: 0.020, speed: 0.23, phase: 2.2, lw: 1.6, color: soft, blur: 10 }, alpha);

      t += 0.015;

      if (state === 'fading' && alpha === 0) {
        clearCanvas();
        cancelAnimationFrame(raf);
        raf = null;
        state = 'stopped';
        return;
      }

      raf = requestAnimationFrame(render);
    }

    function start(){
      if (!raf){
        resize();
        state = 'running';
        render();
      } else {
        state = 'running';
      }
    }
    function stop(){
      if (raf && state !== 'fading') {
        state = 'fading';
        fadeStart = performance.now();
        fadeUntil = fadeStart + FADE_MS;
      }
    }

    card.addEventListener('mouseenter', start);
    card.addEventListener('mouseleave', stop);

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && raf) {
        state = 'fading';
        fadeStart = performance.now();
        fadeUntil = fadeStart + FADE_MS;
      }
    });
    io.observe(card);

    window.addEventListener('resize', () => { if (raf) resize(); }, { passive:true });
  }

  const cards = document.querySelectorAll('.course-card');
  if (!cards.length) return;
  cards.forEach(setupCourseWave);
})();

// ============================
// CURSOS: filtro por categoría
// ============================
(() => {
  const section = document.querySelector('#courses');
  if (!section) return;

  const toolbar = section.querySelector('.courses-toolbar');
  const buttons = [...toolbar.querySelectorAll('.chip-btn')];
  const cards   = [...section.querySelectorAll('.course-card')];

  function setActive(btn) {
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
  }
  function applyFilter(cat) {
    const wanted = cat.toLowerCase();
    cards.forEach(card => {
      const list = (card.dataset.cat || '').split(',').map(s => s.trim().toLowerCase());
      const show = (wanted === 'all') || list.includes(wanted);
      card.classList.toggle('hidden-display', !show);
    });
  }

  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.chip-btn');
    if (!btn) return;
    setActive(btn);
    applyFilter(btn.dataset.cat);
  });

  // Estado inicial: Avanzados
  const defaultBtn = buttons.find(b => b.dataset.cat === 'Avanzado') || buttons[0];
  setActive(defaultBtn);
  applyFilter(defaultBtn.dataset.cat);
})();
