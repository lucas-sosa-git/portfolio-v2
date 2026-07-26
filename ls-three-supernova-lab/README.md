# LS Three.js Supernova Lab

Laboratorio independiente para estudiar una supernova por colapso del núcleo naciendo desde el bloque LS. No está integrado al portfolio y no comparte su renderer.

## Ejecutar

Desde esta carpeta:

```bash
npm install
npm run dev
```

El laboratorio usa únicamente `three` como dependencia visual. Los scripts reutilizan el Vite ya instalado en la raíz del workspace para evitar sumar otro runtime al experimento.

Para verificar:

```bash
npm test
npm run build
```

## Arquitectura

La escena mantiene un único `WebGLRenderer`, un único canvas y un único loop:

```text
Scene
├── starField
├── logoGroup
│   └── LogoBlock
├── collapseGroup
│   ├── InfallParticles
│   └── CompactCore
├── shockGroup
│   ├── StalledShock
│   └── ShockFront
└── explosionGroup
    ├── WhiteFlash
    ├── EjectaShell
    └── EjectaParticles
```

`SupernovaController` centraliza la máquina de estados, el reloj de reproducción, bloom, cámara y parámetros. `reset()` restaura uniforms y visibilidad sin recrear geometrías, materiales ni sistemas de partículas.

Todos los subsistemas visuales son hijos de un único
`LS_SUPERNOVA_ORIGIN`. Ese origen se proyecta al centro real del viewport
en cada `resize`; las partículas de eyección se vuelven visibles junto al
núcleo y el núcleo blanco persiste brevemente durante el lanzamiento para
que la materia no parezca aparecer a mitad de los lóbulos.

## Shaders

- `logoBlock`: contrae el bloque, hunde el centro de las caras, atrae las esquinas y suma asimetría acotada.
- `compactCore`: deforma una icosfera con dos escalas de ruido y un pulso nervioso compacto.
- `particles`: ejecuta tanto la caída hacia dentro como la eyección lobulada íntegramente en GPU.
- `shockFront`: dibuja un aro radial fino con distorsión angular de varias frecuencias.
- `flash`: propaga un gradiente HDR más rápido que la materia.
- `ejectaShell`: expande una carcasa irregular con cinco direcciones dominantes.

## Configuración inicial

| Parámetro | Valor |
|---|---:|
| Duración total | 3.65 s |
| Núcleo mínimo | 6% |
| Choque detenido | 180 ms |
| Partículas de caída | 3,200 desktop / 1,200 mobile |
| Partículas de eyección | 7,600 desktop / 3,200 mobile |
| DPR máximo | 1.75 |
| Bloom máximo base | 2.20 |
| Lóbulos | 5 |

La secuencia se puede pausar, resetear, repetir y abrir desde una fase concreta.

## Rendimiento y diagnóstico

El panel muestra FPS aproximados, draw calls y partículas activas configuradas. Las partículas son un único `THREE.Points` por sistema y no actualizan posiciones desde CPU por frame.

Objetivos:

- Desktop: 60 FPS.
- Mobile: 30–60 FPS.
- Draw calls observadas con el compositor completo: alrededor de 18.
- Recursos pesados creados una sola vez.

Con `prefers-reduced-motion`, se reduce el número visible de partículas, el bloom y el flash blanco; el bloque permanece visible antes de una ejecución manual.

## Riesgos para una integración futura

1. El portfolio ya tiene renderer y loop propios: no debe montarse este laboratorio como segundo canvas.
2. El `EffectComposer` deberá incorporarse al pipeline existente o reemplazarse por bloom selectivo compatible.
3. El centro de la supernova debe proyectarse desde la posición real del logo a coordenadas de viewport.
4. El evento de progreso del frente sólo debería coordinar el recorte DOM; el efecto visual debe seguir en Three.js.
5. En móviles conviene conservar el perfil reducido y medir fill-rate del bloom antes de producción.

## Parámetros recomendados para producción

- Núcleo: 5–7%.
- Implosión: 0.62–0.72 s.
- Choque detenido: 160–190 ms.
- Flash: 160–200 ms.
- Explosión: 0.9–1.1 s.
- Disipación: 0.6–0.75 s.
- Bloom de pico: 1.7–2.0 si comparte escena con contenido legible.
- Eyección: 4,500–6,500 partículas desktop y 2,000–3,000 mobile.
