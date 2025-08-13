const btn = document.getElementById('theme-toggle');
const saved = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
const startLight = saved ? saved === 'light' : !prefersDark;

document.body.classList.toggle('light', startLight);
if (btn) btn.textContent = document.body.classList.contains('light') ? '🌙' : '☀️';

if (btn) {
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    btn.textContent = isLight ? '🌙' : '☀️';
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });
}
