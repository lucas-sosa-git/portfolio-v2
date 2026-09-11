# Revisión del portfolio

## Resultado de esta entrega

Se eliminó el formulario y toda su integración de envío, validación y estados.
Contacto conserva el mail, copiar dirección y redes con etiquetas visibles y
áreas táctiles de al menos 44 × 44 px. La portada ofrece Explorar proyectos y
Contactarme. El CV no se incluye en el sitio compilado; los archivos personales
y los ocho certificados permanecen intactos.

La navegación de escritorio vuelve a exponer sus enlaces a tecnologías de
asistencia. Se retiraron el menú oculto y sus eventos. La barra comparte el
contenedor de contenido: conserva la transición de fondo, borde y sombra al
desplazarse, pero deja de contraerse horizontalmente para que el logo no cambie
de eje. No se modificaron la escena 3D ni las narrativas de los proyectos.

## Mejoras siguientes, ordenadas por impacto

Estas observaciones quedan fuera de los cambios implementados.

| Prioridad | Evidencia e impacto | Cambio recomendado | Skill |
| --- | --- | --- | --- |
| P1 | En el detalle de Matching GPC ↔ CPC, Consultar caso cambia la URL a `#contact`, pero el diálogo continúa abierto y mantiene bloqueado el fondo. La persona no llega al contacto disponible. | Cerrar el diálogo antes de navegar y llevar el foco al destino, evitando que la restauración al botón de apertura lo intercepte. | impeccable: harden + maintainable-code-guardian |
| P1 | A 768 × 900 px, con scroll inicial en cero, el texto superior de la portada comienza en y=27 mientras la barra termina en y=72. Se superpone con la identidad de navegación. | Corregir el espacio superior del hero en el intervalo de tablet; comprobar también alturas cortas y movimiento reducido. | impeccable: adapt |
| P1 | En tema claro, las etiquetas de proyectos Full-stack colaborativo y Resultado conservan `rgb(249,168,168)` sobre un fondo cercano a `rgb(249,250,251)`. Su tamaño es de aproximadamente 10–12 px y el contraste es insuficiente. | Asignarles un acento oscuro del tema claro y verificar contraste sobre el fondo renderizado y estados interactivos. | impeccable: colorize |
| P2 | La barra móvil puede seguir marcando Sobre mí mientras se lee Proyectos. El observador compara proporciones de intersección; Proyectos mide unos 5929 px en móvil y puede no alcanzar el umbral mínimo. | Determinar la sección activa a partir de una línea de lectura del viewport, compartiendo un único estado y comunicándolo con `aria-current`. | impeccable: harden + maintainable-code-guardian |
| P2 | Con la preferencia de movimiento reducido, el estilo computado de la página sigue siendo `scroll-behavior: smooth`. | Desactivar el desplazamiento suave bajo esa preferencia; conservar destinos y foco. | impeccable: adapt |
| P2 | El perfil promete datos, automatización e IA, pero el primer caso es una aplicación académica full-stack. VLA aparece después y ya contiene evidencia concreta: varios días de trabajo reducidos a aproximadamente una hora. | Proponer VLA como primer caso y Matching como siguiente; mantener el proyecto colaborativo como evidencia complementaria, sin inventar métricas ni responsabilidades. | impeccable: critique / clarify |
| P2 | Skills ocupa unos 2165 px a 390 px de ancho y repite Python y SQLAlchemy entre categorías. Proyectos ocupa otros 5929 px. El recorrido exige bastante lectura antes del contacto. | Priorizar las capacidades ligadas a datos y automatización; reducir repeticiones visuales y reservar el detalle extenso para cada caso. | impeccable: distill |
| P3 | La imagen de Rojas pesa unos 654 kB. El módulo diferido del fondo pesa unos 521 kB sin comprimir, 131 kB gzip. Esto es una oportunidad de optimización, no una medición de lentitud en dispositivos reales. | Comparar una imagen WebP/AVIF equivalente y perfilar el fondo en un móvil real antes de alterar la escena o su calidad. | impeccable: optimize |
| P3 | El detector señala diferencias de fuentes, colores y radios respecto de DESIGN.md; la guía describe Barlow/Manrope y un observatorio orbital, mientras la implementación usa Rubik y una galería editorial. | Actualizar la documentación en una tarea separada. No aplicar automáticamente esos avisos como cambios de identidad. | impeccable: document |

P1 identifica problemas funcionales o de lectura importantes; P2, mejoras del
recorrido; P3, optimización y mantenimiento. La revisión es técnica y visual,
no una certificación completa de accesibilidad.

## Validación y aspectos que funcionan

- Pasan las 22 pruebas existentes y la nueva prueba real de navegador.
- Compilación de producción y comprobación del diff correctas. No existen
  scripts configurados de lint ni typecheck.
- Chrome: 390, 768 y 1366 px, altura de 900 px, ambos temas y movimiento reducido.
  No se detectó desbordamiento horizontal del documento ni errores de ejecución
  en los recorridos automatizados. Las superposiciones puntuales se registran arriba.
- Logo, portada y Contacto comparten x=16 px en móvil/tablet y x=128 px en
  escritorio, incluidos los estados de la barra antes y después del scroll.
- Copiar dirección devuelve el mail esperado. Los enlaces de mail y redes
  conservan sus destinos. No se enviaron mensajes ni se validó disponibilidad
  de servicios externos.
- Los casos abren, contienen el foco y lo devuelven al control de origen al
  cerrar con Escape. La excepción de navegación interna se registra arriba.
- El filtro introductorio muestra cuatro cursos; Todos restaura ocho. Los ocho
  enlaces locales de certificados responden con PDF y estado 200.
- Comparación SHA-256 del CV contra todos los archivos compilados: ninguna
  copia, incluso con otro nombre. Sin referencias activas al formulario o al CV.
- Entrada normal: título visible y fondo WebGL activo. Sin WebGL: fondo
  alternativo, portada y siete proyectos disponibles.

Las capturas y mediciones de esta revisión se encuentran en
`output/portfolio-review/`. Se mantuvieron las pruebas de navegador separadas
de la suite básica para no agregar una dependencia al sitio ni exigir Chrome
en la publicación actual. La entrega es local; no se publicó.
