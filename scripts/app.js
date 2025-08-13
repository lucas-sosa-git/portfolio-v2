const btn = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Configuración inicial
const startLight = saved ? saved === 'light' : !prefersDark;
document.body.classList.toggle('light', startLight);
btn.textContent = startLight ? '🌞' : '🌙';

// Evento de click
btn.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light');
  btn.textContent = isLight ? '🌞' : '🌙';
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Copiar email al portapapeles con feedback
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const text = btn.dataset.copy || '';
    try {
      await navigator.clipboard.writeText(text);
      btn.classList.add('ok');
      setTimeout(() => btn.classList.remove('ok'), 1200);
    } catch (e) {
      // Fallback si el navegador no permite copiar
      const input = document.createElement('input');
      input.value = text; document.body.appendChild(input);
      input.select(); document.execCommand('copy'); document.body.removeChild(input);
      btn.classList.add('ok');
      setTimeout(() => btn.classList.remove('ok'), 1200);
    }
  });
});

// --- Validación en español con mensajes dinámicos ---
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const fields = Array.from(form.querySelectorAll('.field'));

  // Valida un campo y aplica/remueve .error
  const validateField = (field) => {
    const input = field.querySelector('input, textarea');
    if (!input) return true;

    let valid = true;

    // Reglas básicas
    if (input.hasAttribute('required') && !input.value.trim()) valid = false;
    if (valid && input.type === 'email') {
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      if (!emailOk) valid = false;
    }

    field.classList.toggle('error', !valid);
    return valid;
  };

  // Blur/input: validar a medida que el usuario interactúa (pero no al cargar)
  fields.forEach((field) => {
    const input = field.querySelector('input, textarea');
    if (!input) return;

    input.addEventListener('blur', () => validateField(field));
    input.addEventListener('input', () => {
      if (field.classList.contains('error')) validateField(field);
    });
  });

  // Submit: validar todo y bloquear si hay errores
  form.addEventListener('submit', (e) => {
    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) {
      e.preventDefault();
      // foco en el primero con error
      const firstError = form.querySelector('.field.error input, .field.error textarea');
      if (firstError) firstError.focus();
    }
  });
})();
