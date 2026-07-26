# Portfolio de Lucas Sosa

Portfolio personal orientado a datos, automatización, desarrollo e IA aplicada.
La base del sitio sigue siendo HTML, CSS y JavaScript; React se usa como isla
para la introducción y la galería de proyectos.

`index.html` es el único documento de entrada. Vite lo compone en desarrollo y
en el build reemplazando las directivas `@include` por los fragmentos de
`templates/`; el navegador recibe un HTML completo, sin requests adicionales
para construir las secciones.

## Desarrollo local

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
npm run preview
```

Vite genera el sitio desplegable en `dist/` y conserva rutas relativas para
GitHub Pages.

## Arquitectura visual

- `index.html`: shell del documento, metadatos, orden de secciones y scripts.
- `templates/`: un fragmento HTML por sección estática, desde navbar hasta
  footer. Cada archivo conserva el `id` público usado por navegación y scripts.
- `vite.config.js`: composición build-time de los fragmentos y recarga completa
  al editarlos durante desarrollo.
- `src/components/portfolio-intro/`: secuencia de entrada y su escena Three.js.
- `src/components/projects/ProjectsSection.jsx`: estructura semántica y acciones
  de la galería de proyectos.
- `src/components/projects/projects-gallery.css`: composición editorial,
  responsive, temas y movimiento progresivo de la galería.
- `src/components/ProjectDetailsDialog.jsx`: detalle accesible de cada caso.
- `src/data/projects.js`: única fuente de contenido real de los proyectos.

## Principios

- Contenido y navegación disponibles sin WebGL.
- Scroll vertical natural, sin scroll artificial ni captura de `wheel`.
- Imágenes reales, enlaces reales y estructura semántica para SEO y teclado.
- Diseño responsive con soporte para tema claro y `prefers-reduced-motion`.
- La introducción conserva su escena Three.js independiente y su propio ciclo de
  vida.

## Validación

```bash
npm test
npm run build
git diff --check
```

También se debe comprobar el recorrido completo, enlaces, teclado, diálogo de
detalle, responsive, tema claro/oscuro y ausencia de overflow horizontal.
