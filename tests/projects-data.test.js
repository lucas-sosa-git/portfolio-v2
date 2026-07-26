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

test("IDS documents collaboration and Docker without claiming production deployment", () => {
  const ids = projects.find((project) => project.id === "gestor-turnos-ids");
  assert.ok(ids.technologies.includes("Docker"));
  assert.ok(ids.technologies.includes("Git"));
  assert.match(ids.learning, /desarrollo y la integración local/i);
  assert.match(ids.learning, /no se presenta como despliegue productivo/i);
});
