# Memoria del portfolio — Proyectos 3D

Última actualización: 23 de julio de 2026.

Este archivo conserva las decisiones y pedidos acordados para que futuras iteraciones no vuelvan a una dirección visual o de interacción ya descartada.

## Intención del proyecto

- Rediseñar solamente la sección de proyectos; el resto del portfolio debe seguir funcionando como antes.
- Conservar el hero, su canvas y su lenguaje de líneas sinusoidales.
- Mantener la paleta roja, blanca y oscura, la tipografía Rubik, los temas claro/oscuro y el estilo general existente.
- Usar una isla de React montada en `#projects-root`; no migrar todo el sitio.
- Usar React, Vite, Motion y CSS 3D. No introducir Three.js, React Three Fiber ni una escena WebGL.
- Utilizar exclusivamente contenido, imágenes y enlaces reales del portfolio. No inventar métricas, roles, tecnologías o resultados.

## Experiencia acordada

- No es un carrusel horizontal infinito ni una ruleta.
- La navegación principal es el scroll vertical normal de la página.
- Al bajar, la sección queda fija temporalmente y los proyectos descienden como una hélice o espiral vertical alrededor de un cilindro invisible.
- El proyecto activo debe encajar exactamente en el centro, frontal, nítido, iluminado y completamente interactivo.
- Los proyectos anteriores y siguientes se alejan hacia arriba o abajo, los laterales y el fondo.
- Debe haber más aire entre proyectos y un hilo visual largo, continuo y en movimiento que los conecte.
- La rueda del mouse no debe exigir demasiados giros. La distancia actual es de aproximadamente `32svh` por proyecto en tablet/escritorio y `40svh` en mobile.
- El drag horizontal debe mover el recorrido en vivo, sentirse cómodo y terminar con snap al proyecto más cercano.
- También deben funcionar flechas, teclado, Home/End e indicadores.
- El snap automático ocurre después de una pausa breve del scroll; no debe interrumpir un gesto activo.
- Durante el drag no deben activarse enlaces, seleccionarse texto ni producirse clics accidentales.

## Movimiento matemático

Para `N` proyectos y progreso normalizado `p`:

```text
u = p × (N - 1)
angleStep = 360 / N
rotation = -u × angleStep
y(i) = (i - u) × helixPitch
```

Cada tarjeta conserva su geometría base:

```text
rotateY(i × angleStep) translateZ(radius)
```

La distancia angular respecto del frente controla de forma continua:

- escala;
- opacidad;
- blur;
- saturación;
- brillo;
- profundidad.

No usar solamente estados rígidos de anterior/activo/siguiente. El cambio debe ser continuo durante scroll y drag.

Configuración responsive actual:

| Modo | Radio | Perspectiva | Blur máximo | Paso vertical |
| --- | ---: | ---: | ---: | ---: |
| Desktop | 590–720 px | 1550 px | 6.5 px | 178 px |
| Tablet | 440–540 px | 1250 px | 5 px | 138 px |
| Mobile | 270–350 px | 900 px | 3.2 px | 104 px |

El drag horizontal se convierte en scroll vertical con un factor actual de `2.4`. Al soltar, la velocidad aporta una proyección pequeña, limitada al 30% de un paso de proyecto, antes del snap.

## Fondo y transición

- La transición desde el hero debe continuar su línea sinusoidal, concentrarla y convertirla visualmente en la referencia circular de la galería.
- El fondo de proyectos debe tener más vida, con sensación subacuática o de corrientes lentas.
- Usar corrientes SVG largas, partículas determinísticas y luces cáusticas sutiles.
- Las animaciones deben ser precisas, fluidas y controladas: sin caos, rebotes exagerados, elasticidad infantil ni movimiento decorativo que dificulte leer.
- Mantener rojo, rosa, blanco y los colores ya definidos por el tema.

## Scrollbar y overflow

- Debe existir exactamente una scrollbar vertical: la nativa del documento.
- Su carril es una línea roja y el indicador interior es blanco, inspirado en la línea del hero.
- No crear una segunda barra de progreso fija encima de la scrollbar nativa.
- La página no debe mostrar una scrollbar horizontal inferior.
- `html` y `body` mantienen `overflow-x: clip`; no usar `hidden` allí porque convierte el eje vertical en `auto` y puede romper el comportamiento sticky de la hélice.
- La escena recorta la geometría dentro de `.projects-stage`, sin convertir el contenedor narrativo en un scroll interno.
- El query de `styles/main.css` en `index.html` debe actualizarse cuando cambie CSS global para evitar que el navegador conserve una versión anterior.

## Responsive y accesibilidad

- Desktop conserva profundidad y proyectos vecinos visibles.
- Mobile prioriza una tarjeta legible; las tarjetas no activas se ocultan visualmente para evitar ruido y overflow.
- Debe haber un único proyecto activo e interactivo. Los demás usan `aria-hidden` e `inert`.
- Mantener foco visible, etiquetas accesibles, navegación sin drag y enlaces reales.
- Respetar `prefers-reduced-motion`: quitar la geometría compleja y conservar el contenido y los controles.
- Las imágenes secundarias usan lazy loading.

## Arquitectura actual

```text
src/
├── components/projects/
│   ├── ProjectCard.jsx
│   ├── ProjectsAtmosphere.jsx
│   ├── ProjectsCylinder.jsx
│   ├── ProjectsNavigation.jsx
│   ├── ProjectsSection.jsx
│   ├── ProjectsTransition.jsx
│   └── projects.css
├── data/projects.js
├── hooks/
│   ├── useCylinderRotation.js
│   ├── useProjectNavigation.js
│   └── useResponsiveCylinder.js
└── main.jsx
```

- `src/data/projects.js` es la única fuente de datos de la galería.
- `ProjectsSection.jsx` controla la longitud del relato vertical.
- `useCylinderRotation.js` relaciona scroll, drag, velocidad, índice activo y snap.
- `useResponsiveCylinder.js` contiene radio, perspectiva, blur, paso helicoidal y breakpoints.
- `projects.css` contiene geometría, jerarquía visual, atmósfera, responsive y reduced motion.
- El ancho de `.project-card-center` debe calcularse con `vw`, no con `%`: su padre geométrico mide `0 × 0` y un porcentaje produciría una tarjeta invisible.
- El HTML original dentro de `.projects-fallback` queda como alternativa si JavaScript falla.

## Validación mínima para futuras modificaciones

Ejecutar:

```bash
npm run build
git diff --check
```

Y comprobar visualmente:

- 7 tarjetas renderizadas y solo 1 activa;
- consola sin errores;
- centro de la tarjeta activa alineado con el centro del escenario;
- wheel y drag avanzan sin exigir un gesto largo;
- snap consistente;
- una sola scrollbar vertical;
- ningún overflow horizontal en desktop o mobile;
- temas claro y oscuro;
- teclado y reduced motion;
- hero y secciones restantes intactos.
