🌐 Mi Portfolio Personal

Este es mi portfolio web, un espacio donde muestro mi experiencia, proyectos y aprendizajes en el área de Ingeniería de Datos, Administración de Bases de Datos y desarrollo experimental.

🚀 Características principales

- Diseño limpio y coherente: cada sección (Hero, Proyectos, Cursos, Contacto) mantiene una estética unificada.

- Animaciones sutiles y matemáticas: efectos tipo ondas y trayectorias físicas que acompañan las tarjetas sin invadir el contenido.

- Sistema de filtros: tanto en proyectos como en cursos, se pueden seleccionar categorías para navegar de forma intuitiva.

- Feedback elegante: los formularios y botones (ej. copiar mail, enviar contacto) brindan retroalimentación visual sin redirigir al usuario.

- Certificados PDF integrados: en la sección Cursos, se pueden consultar los certificados aprobados y los cursos en curso.

📂 Estructura del proyecto

- index.html: la estructura principal de la página.

- assets/: contiene imágenes, íconos y PDFs de los certificados de cursos.

- style.css: estilos generales y animaciones hover.

- script.js: lógica de interacción (filtros, animaciones, feedback en formularios, copiar mail, etc.).

📚 Secciones

- Hero: presentación breve y clara, destacando mi rol y experiencia.

- Proyectos: tarjetas con descripción, imágenes y hover animado.

- Cursos: dividido en categorías (Introductorio, Avanzado, Habilidades Blandas). Cada tarjeta muestra el curso, estado y link a certificado en PDF.

- Contacto: formulario con feedback visual y botón para copiar email.

🛠️ Tecnologías utilizadas

- HTML5 / CSS3 / JavaScript

- Animaciones con keyframes personalizadas

- Formspree para el envío de formularios (configurado con feedback interno, sin redirecciones)

🎨 Inspiración

El diseño busca transmitir un equilibrio entre rigor técnico y curiosidad experimental

## Desarrollo local

La página continúa siendo HTML/CSS/JavaScript y usa una isla React únicamente para la galería de proyectos.

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
npm run preview
```

Vite genera el sitio desplegable en `dist/` y usa rutas relativas para conservar la compatibilidad con GitHub Pages.

## Galería 3D de proyectos

- `src/data/projects.js`: fuente única de contenido, imágenes y enlaces reales.
- `src/components/projects/`: transición narrativa, cilindro, tarjetas y navegación.
- `src/hooks/`: rotación/snap, navegación por teclado y configuración responsive.
- `src/components/projects/projects.css`: sistema visual, profundidad, mobile y reduced motion.

Para agregar un proyecto, sumar un objeto a `projects` con un `id` único, textos, rol, tecnologías, imagen y al menos un enlace (`liveUrl` o `githubUrl`). El ángulo entre tarjetas se recalcula automáticamente según la cantidad de proyectos.

Los principales valores configurables están en `useResponsiveCylinder.js` (radio, perspectiva, blur, paso helicoidal y breakpoints), `ProjectsSection.jsx` (distancia de scroll por proyecto) y `useCylinderRotation.js` (drag, proyección y snap). Los tamaños y alturas de tarjeta se controlan con `--projects-card-width` y `--projects-card-height` en `projects.css`. Las decisiones completas de interacción quedan registradas en `MEMORY.md`.
