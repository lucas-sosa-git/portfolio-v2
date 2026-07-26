# AGENTS.md

## Engineering objective

Keep this repository understandable, cohesive, and easy to modify.

The default solution must be the smallest clear change that fully solves the requested problem. Avoid patch stacking, duplicated behavior, speculative abstractions, unnecessary indirection, and code added only to conceal an underlying lifecycle, state, layout, or timing problem.

## Mandatory workflow

Before editing:

1. Trace the existing flow from its entry point.
2. Search for existing related implementations and abstractions.
3. Identify the minimum files that need modification.
4. Identify obsolete or overlapping patches that the new solution can replace.
5. Preserve working behavior that is outside the requested scope.

After editing:

1. Search for references to replaced code.
2. Remove dead imports, functions, files, styles, listeners, timers, animation frames, resources, and dependencies.
3. Run the repository's lint, typecheck, tests, and build commands when available.
4. Inspect the final diff and remove unrelated churn.
5. Report what was simplified, removed, preserved, and validated.

## Simplicity rules

- Prefer direct, readable code over architecture for architecture's sake.
- Reuse an existing clear solution before creating a new one.
- Do not create a helper for a single trivial expression or a one-line forwarding call.
- Do not split one simple operation into many tiny functions.
- Create an abstraction only when it removes real duplication, isolates a meaningful responsibility, or makes substantial logic independently testable.
- Do not add factories, managers, adapters, controllers, services, wrappers, registries, or configuration layers without a concrete need in the current task.
- Do not add extension points for hypothetical future requirements.
- Do not introduce a dependency when the current stack already provides a clear solution.
- Keep one source of truth for each state value, business rule, configuration value, and animation timeline.

## Duplication rules

- Search the repository before copying logic.
- Consolidate duplicated business rules, validation, constants, calculations, lifecycle handling, and state transitions.
- Do not create a misleading generic abstraction for code that only looks similar.
- When replacing an implementation, delete the superseded implementation after verifying all references.

## Refactoring rules

- Preserve observable behavior unless a behavior change is explicitly requested.
- Keep cleanup separate from unrelated features.
- Prefer small, reviewable refactors over full rewrites.
- Never keep commented-out implementations as backups; Git is the backup.
- Never label something “temporary” without an explicit removal condition.
- Do not silence errors with broad ignores, blanket lint disables, empty catches, or unjustified `any`.

## Frontend and Three.js rules

- Maintain one authoritative animation/render loop unless multiple loops are demonstrably required.
- Reuse the existing renderer, scene, camera, clock, resize lifecycle, and state ownership.
- Dispose listeners, observers, timers, animation frames, controls, geometries, materials, and textures.
- Avoid mirroring frame-by-frame animation state in React state.
- Keep tunable visual parameters centralized and named.
- Fix the underlying timing, state, ownership, or layout problem instead of stacking effects that hide it.
- Responsive behavior must work at normal browser zoom; do not design around a 50% zoom workaround.

## Horizontal alignment contract

- The left edge of the `L-Sosa` navbar logo is the authoritative horizontal origin for page content.
- Every section's visible inner content—including headings, copy, grids, cards, forms, and controls—must start on that same left axis and respect the matching right edge of the shared content container.
- Full-bleed backgrounds and decorative layers are allowed, but their inner content must still use the shared `--content-max` and `--content-gutter` values.
- Do not add section-specific widths, auto margins, or horizontal padding that create a second inset inside the shared page container.
- Validate alignment at normal browser zoom on desktop and mobile after layout changes; compare the navbar logo and section content edges, not only their centered outer boxes.

## HTML template ownership

- `index.html` is the only document entry point and owns metadata, global roots, section order, and script loading.
- Static section markup belongs in one cohesive file under `templates/`; do not duplicate that markup in `index.html` or load it with client-side `fetch`.
- Keep each section's public IDs, classes, anchors, accessibility relationships, and DOM order stable unless a requested behavior change requires otherwise.
- Add or remove a static section by updating both its template file and the matching `@include` directive in `index.html`.

## Function and module quality

Every function and module must have a clear responsibility.

Avoid vague containers and names such as `helpers`, `utils`, `common`, `misc`, `manager`, `handleThing`, or `processData` unless their scope is genuinely precise.

A new function or file must justify its existence through at least one of these:

- reuse by multiple real callers;
- isolation of a meaningful domain concept;
- independent testing of non-trivial logic;
- substantial reduction in cognitive complexity;
- framework-required structure.

## Definition of done

Work is not complete until:

- the requested behavior works;
- existing relevant behavior still works;
- lint/typecheck/tests/build pass when configured;
- no known unused imports or variables remain;
- no replaced implementation remains active;
- no avoidable duplicate logic was introduced;
- lifecycle resources are cleaned up;
- the final diff contains no unrelated formatting or file churn.

Use the `maintainable-code-guardian` skill for feature implementation, bug fixes, cleanup, refactoring, and code review.
