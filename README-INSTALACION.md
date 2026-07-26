# Codex Clean Code Kit

Este kit combina dos mecanismos distintos:

1. `AGENTS.md`: reglas persistentes del repositorio que Codex lee antes de trabajar.
2. `.agents/skills/maintainable-code-guardian/SKILL.md`: flujo reutilizable para implementar, refactorizar, limpiar y revisar código.

## Instalación en un repositorio

Copiá dentro de la raíz del proyecto:

```text
AGENTS.md
.agents/
  skills/
    maintainable-code-guardian/
      SKILL.md
```

Después reiniciá la sesión de Codex o abrí una nueva desde la raíz del repositorio.

## Verificación

Pedile a Codex:

```text
Mostrame qué archivos de instrucciones y skills están activos para este repositorio.
```

Para invocar la skill explícitamente en Codex CLI o en la extensión:

```text
$maintainable-code-guardian
```

Ejemplo de tarea:

```text
$maintainable-code-guardian

Auditá esta implementación antes de agregar el nuevo comportamiento.
Detectá parches superpuestos, código muerto, duplicación y abstracciones innecesarias.
Después aplicá la solución más simple que preserve el comportamiento existente.
Ejecutá lint, typecheck, tests y build, e informá exactamente qué eliminaste.
```

## Recomendación de uso

Usá la skill explícitamente para la primera limpieza grande. Luego dejala instalada para que Codex pueda activarla automáticamente cuando la descripción coincida con tareas de implementación, refactorización, corrección de errores o revisión.

No uses una instrucción genérica como “hacé clean code”. Pedí resultados verificables:

- rastrear referencias;
- identificar duplicación;
- eliminar código reemplazado;
- ejecutar validaciones;
- revisar el diff;
- justificar cada archivo, función y dependencia agregada.
