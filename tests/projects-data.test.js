import test from "node:test";
import assert from "node:assert/strict";
import { projects } from "../src/data/projects.js";

test("every project provides a complete, non-empty case narrative", () => {
  const narrativeFields = [
    "summary",
    "problem",
    "role",
    "challenge",
    "result",
    "learning",
  ];

  projects.forEach((project) => {
    narrativeFields.forEach((field) => {
      assert.equal(
        typeof project[field],
        "string",
        `${project.id}.${field} must be a string`,
      );
      assert.ok(project[field].trim(), `${project.id}.${field} must not be empty`);
    });
    assert.ok(project.technologies.length, `${project.id} needs technologies`);
  });
});

test("the main gallery leads with validated work and gives each card a clear result and role", () => {
  assert.deepEqual(
    projects.map((project) => project.id),
    ["vla-mermas", "proyecto-rojas", "gestor-turnos-ids"],
  );

  projects.forEach((project) => {
    assert.ok(project.impact.trim(), `${project.id} needs a clear outcome`);
    assert.ok(project.cardRole.trim(), `${project.id} needs a role and stack line`);
  });

  assert.match(projects[0].impact, /varios días a cerca de una hora/i);
  assert.equal(projects[0].status, "En producción");
  assert.equal(projects[1].status, "Cliente real");
});

test("IDS documents collaboration and Docker without claiming production deployment", () => {
  const ids = projects.find((project) => project.id === "gestor-turnos-ids");
  assert.ok(ids.technologies.includes("Docker"));
  assert.ok(ids.technologies.includes("Git"));
  assert.match(ids.learning, /desarrollo y la integración local/i);
  assert.match(ids.learning, /no se presenta como despliegue productivo/i);
});
