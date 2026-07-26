# Memoria del portfolio — Galería editorial

Última actualización: 26 de julio de 2026.

## Dirección vigente

- Proyectos se presenta como una galería editorial 2D, no como carrusel o
  escena tridimensional.
- La estética conserva negro profundo, rojo, rosa pálido y blanco cálido.
- Cada caso combina una imagen amplia, una narrativa breve, tecnologías y dos
  niveles de acción: detalle y enlace principal.
- `src/data/projects.js` sigue siendo la única fuente de contenido.

## Interacción

- La navegación usa el scroll vertical nativo del documento.
- No hay scroll interno, timeline artificial, raycasting ni scrollbar sustituta.
- “Explorar caso” abre un diálogo nativo y devuelve el foco al botón de origen.
- Los enlaces externos siguen siendo elementos `<a>` reales.
- La animación de entrada es CSS progresiva y se elimina con
  `prefers-reduced-motion`.

## Responsive y accesibilidad

- Desktop alterna imagen y contenido para crear ritmo editorial.
- Mobile conserva siempre imagen, texto y acciones en ese orden.
- La sección usa encabezados, lista y artículos semánticos.
- El diálogo bloquea el scroll mientras está abierto y restaura foco y estado al
  cerrar.
- Debe haber cero overflow horizontal a zoom 100 %.

## Validación mínima

```bash
npm test
npm run build
git diff --check
```

Probar al menos 1366×768, 390×844, teclado, enlaces, diálogo, tema claro,
reduced motion y consola.
