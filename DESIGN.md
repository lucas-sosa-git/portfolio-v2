---
name: Lucas Sosa Portfolio
description: Un observatorio editorial de procesos, datos y automatización.
colors:
  primary: "#ef6a70"
  primary-strong: "#e43f4a"
  primary-soft: "rgb(228 63 74 / 0.12)"
  dark-background: "#09090b"
  dark-surface: "#111216"
  dark-text: "#f5f3f0"
  dark-muted: "#aaa8a6"
  dark-faint: "#737278"
  dark-border: "rgb(245 243 240 / 0.14)"
  light-background: "#f4f3f1"
  light-surface: "#ebe9e6"
  light-text: "#17171a"
  light-muted: "#55545a"
  light-faint: "#77767c"
  light-border: "rgb(23 23 26 / 0.16)"
  light-primary: "#b82330"
  light-primary-strong: "#a61723"
  light-primary-soft: "rgb(184 35 48 / 0.09)"
  on-primary: "#ffffff"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(3.5rem, 6.4vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.84
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(3.25rem, 7vw, 5.8rem)"
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.4rem)"
    fontWeight: 600
    lineHeight: 0.96
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.12em"
rounded:
  square: "0"
  pill: "999px"
  circle: "50%"
spacing:
  content-gutter: "clamp(1rem, 3vw, 2rem)"
  section: "clamp(5.5rem, 11vw, 10rem)"
components:
  button-primary:
    backgroundColor: "{colors.primary-strong}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.15rem"
    height: "48px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.75rem 1.15rem"
    height: "48px"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.dark-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.55rem 0.9rem"
    height: "44px"
  text-field:
    backgroundColor: "transparent"
    textColor: "{colors.dark-text}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "0.8rem 0"
---

# Design System: Lucas Sosa Portfolio

## Overview

**Creative North Star: "El Observatorio de Procesos"**

El portfolio se comporta como un instrumento de lectura: la línea Lissajous y la profundidad Three.js forman el campo espacial, mientras el contenido editorial interpreta anomalías, métodos y resultados. La experiencia es oscura por defecto, precisa y cinematográfica, con suficiente calma para que los proyectos y la trayectoria sigan siendo la evidencia principal.

La composición evita una retícula de tarjetas intercambiables. Alterna bloques editoriales, líneas divisorias, imágenes y un observatorio de proyectos con jerarquías asimétricas. El acento rojo es una señal funcional y escasa; no convierte la interfaz en neón ni compite con la lectura.

**Key Characteristics:**

- Fondo matemático persistente con alternativa estática y control de pausa.
- Contenido alineado a un único eje horizontal compartido con el wordmark.
- Titulares condensados de gran escala sobre texto de lectura sobrio.
- Superficies planas, bordes finos y profundidad reservada para navegación y escena.
- Movimiento ambiental gradual; las acciones de interfaz responden con gestos breves.

## Colors

La paleta combina un campo casi negro y neutros cálidos con un único acento rojo coral. El tema claro conserva la misma jerarquía mediante una inversión cálida, no una identidad paralela.

### Primary

- **Señal Coral:** identifica palabras clave, estados activos, foco, progreso y acciones principales.
- **Coral de Acción:** sostiene botones primarios y estados de mayor énfasis.
- **Halo Coral:** marca selecciones y hover sin convertir superficies completas en color.

### Neutral

- **Campo Nocturno:** es el lienzo oscuro y continuo detrás del contenido y la escena.
- **Superficie de Instrumento:** separa imágenes, paneles y fallbacks del campo sin elevarlos artificialmente.
- **Texto Marfil:** ofrece el máximo contraste para contenido y títulos.
- **Lectura Atenuada:** jerarquiza explicaciones, resúmenes y metadatos secundarios.
- **Línea Espectral:** construye divisores, contornos y estructura con baja opacidad.
- **Papel Cálido:** traduce el sistema al tema claro sin usar blanco frío como fondo principal.

### Named Rules

**The One Signal Rule.** El coral es el único acento cromático de interfaz; úsalo para orientación, acción o significado, no como relleno decorativo general.

**The Dark-First Rule.** El tema oscuro es la expresión principal. El tema claro debe preservar contraste, jerarquía y significado sin introducir nuevos colores de marca.

## Typography

**Display Font:** Barlow Condensed (con Arial Narrow como respaldo)  
**Body Font:** Manrope (con system-ui como respaldo)

**Character:** La pareja separa señal y explicación. Barlow Condensed produce titulares verticales, compactos y editoriales; Manrope mantiene controles, etiquetas y lectura técnica con una voz contenida.

### Hierarchy

- **Display** (peso 700, escala fluida compacta, interlínea 0.84): promesa del primer viewport y frases que deben leerse como una sola forma.
- **Headline** (peso 600, escala fluida amplia, interlínea 0.96): títulos de las grandes etapas del recorrido.
- **Title** (peso 600, escala fluida intermedia, interlínea 0.96): encabezados de proyectos, experiencia y subsecciones.
- **Body** (peso 400, 1rem, interlínea 1.65): narración y evidencia; los bloques de lectura se mantienen cerca de 65 caracteres.
- **Label** (peso 700, 0.72rem, tracking amplio, mayúsculas): kickers, estados y metadatos operativos.

### Named Rules

**The Instrument-and-Reading Rule.** Barlow Condensed nombra la señal; Manrope explica el proceso. No intercambies sus roles para producir variedad artificial.

**The Short Display Rule.** Un titular grande debe conservar una forma compacta. Si se convierte en párrafo, baja de nivel antes de reducirlo hasta perder presencia.

## Layout

El contenido visible usa un contenedor compartido de 1180px como máximo con un gutter fluido y simétrico. El borde izquierdo del wordmark `L-Sosa` es el origen horizontal de encabezados, texto, grillas, formularios y controles; los fondos y el campo Three.js pueden ser full-bleed, pero su contenido no crea un segundo inset.

Las secciones respiran con un intervalo vertical fluido amplio. En desktop predominan composiciones asimétricas de dos columnas: el hero reserva espacio visual a la derecha, la biografía combina retrato fijo y relato, y la experiencia separa metadatos de evidencia. A 960px las estructuras espaciales empiezan a apilarse; a 840px la navegación cambia al control inferior móvil y los principales bloques pasan a una columna; a 640px se usa un gutter de 1rem y las acciones del hero ocupan todo el ancho.

El observatorio de proyectos puede ocupar el viewport completo como fondo, pero tanto su encabezado como su selector y escenario vuelven al mismo contenedor. En desktop el selector es fijo durante la lectura; en pantallas estrechas se vuelve una banda horizontal desplazable y el escenario se apila.

### Named Rules

**The Shared Axis Rule.** Ninguna sección añade un segundo max-width, margen automático o padding horizontal dentro del contenedor compartido salvo que sea un elemento visual full-bleed.

**The Editorial Asymmetry Rule.** La asimetría debe expresar la relación entre instrumento y lectura; no alternes columnas solo para hacer cada sección diferente.

## Elevation & Depth

El sistema es plano por defecto. La profundidad principal proviene de la escena Three.js, la superposición de capas, la perspectiva del selector de proyectos y el contraste tonal. No hay una biblioteca de sombras para tarjetas: la única elevación material recurrente aparece cuando la navegación se compacta y necesita separarse del contenido en movimiento.

### Shadow Vocabulary

- **Navegación suspendida** (`0 16px 48px rgb(0 0 0 / 0.24)`): se usa únicamente en el shell compacto junto con blur y borde; no es una sombra general de contenedor.

### Named Rules

**The Scene Carries Depth Rule.** La escena y el staging crean profundidad. Las superficies de contenido conservan bordes finos y fondos planos.

**The One Floating Layer Rule.** Solo la navegación compacta adopta elevación ambiental persistente; no copies su sombra a tarjetas o formularios.

## Shapes

La forma base es recta y editorial: campos sin radio, tarjetas sin esquinas infladas, imágenes apenas suavizadas y paneles definidos por líneas. Los controles de acción son cápsulas y los controles iconográficos son círculos de 44px; estas siluetas indican interactividad, no una decoración universal.

El observatorio utiliza rectángulos de imagen, líneas horizontales, chips tecnológicos sin redondeo y una curva espacial implícita en el selector. La figura Lissajous es la única geometría orgánica protagonista.

### Named Rules

**The Action Shape Rule.** Cápsulas y círculos pertenecen a acciones y filtros. El contenido editorial permanece rectilíneo.

**The Lissajous Exception.** No agregues blobs ni curvas decorativas competidoras; la forma orgánica de marca ya es la línea Lissajous.

## Components

### Buttons

- **Shape:** las acciones con texto son cápsulas; los controles solo-icono son círculos de 44px.
- **Primary:** coral de acción, texto blanco, altura mínima táctil y peso alto.
- **Hover / Focus:** el hover aclara o perfila con coral en 180ms; el foco usa un outline coral de 2px con 4px de separación; el estado activo escala apenas.
- **Secondary:** fondo transparente, borde espectral y texto marfil; el hover cambia borde y texto a coral.

### Chips

- **Style:** filtros en cápsula y tecnologías en rectángulos de borde fino.
- **State:** el filtro seleccionado combina borde coral, texto principal y halo coral; el estado se comunica también con `aria-pressed`.

### Cards / Containers

- **Corner Style:** recto por defecto.
- **Background:** cursos y paneles parten del campo o de la superficie de instrumento.
- **Shadow Strategy:** sin sombra; bordes de 1px y contraste tonal organizan el contenido.
- **Border:** líneas espectrales compartidas, usadas como estructura y no como marco ornamental.
- **Internal Padding:** los cursos usan una densidad compacta; los paneles de caso amplían el padding de forma fluida.

### Inputs / Fields

- **Style:** fondo transparente, borde inferior de 1px, radio cero y tipografía de cuerpo.
- **Focus:** el borde inferior cambia a coral; el foco visible global conserva su outline.
- **Error / Disabled:** los errores usan el coral y revelan un hint; los controles deshabilitados descienden a texto faint.

### Navigation

La navegación desktop es transparente en reposo y se compacta en un shell difuminado de borde fino al desplazarse. Los enlaces usan Manrope pequeña y una línea coral que crece desde la izquierda para hover, foco y sección activa. En móvil, una barra inferior fija concentra cinco destinos y reserva el header superior para identidad y tema.

### Project Observatory

El selector enumera casos como lecturas orbitales: el activo recupera contraste y avanza hacia el usuario; los demás pierden presencia según su distancia. El escenario combina una imagen protagonista, estado, resumen, problema, resultado, tecnologías y dos acciones. Las variaciones de composición dependen del tipo real de proyecto, pero mantienen la misma jerarquía semántica.

El detalle se abre como un panel lateral modal. Entra con desplazamiento y enfoque suave, sale más rápido que la entrada, retiene el foco y devuelve el foco al control que lo abrió. Con movimiento reducido, ambos cambios son inmediatos.

## Do's and Don'ts

### Do:

- **Do** alinear todo el contenido visible con el eje del wordmark y el contenedor compartido.
- **Do** reservar el coral para acción, foco, estado o énfasis narrativo.
- **Do** usar líneas, contraste tonal y espacio para agrupar antes de sumar contenedores.
- **Do** mantener una experiencia completa con fondo estático, WebGL no disponible o movimiento reducido.
- **Do** respetar objetivos táctiles de al menos 44px y foco visible en cada control.
- **Do** mantener las transiciones de interfaz breves y reversibles; el movimiento ambiental puede ser más lento y pausarse.

### Don't:

- **Don't** introducir gradientes neón, glassmorphism generalizado o una paleta secundaria que compita con el coral.
- **Don't** convertir cada bloque en una tarjeta redondeada o elevada.
- **Don't** agregar loops de render, timelines o estados de animación paralelos a los propietarios existentes.
- **Don't** usar la escena Three.js como sustituto de contenido, jerarquía o texto alternativo.
- **Don't** animar layout de forma continua ni mantener movimiento ambiental bajo `prefers-reduced-motion`.
- **Don't** inventar métricas, fechas, responsabilidades o resultados para llenar una composición.
