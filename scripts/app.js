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

// Si el usuario no eligió manualmente, seguimos cambios del SO
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
      // Fallback
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
  // Alterna el atributo data-elevated (CSS decide el estilo)
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