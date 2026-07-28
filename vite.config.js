import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = process.cwd();
const templatesDirectory = resolve(projectRoot, "templates");
const includeDirective = /<!--\s*@include\s+(templates\/[\w-]+\.html)\s*-->/g;

function htmlTemplates() {
  return {
    name: "html-templates",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        return html.replace(includeDirective, (_, templatePath) =>
          readFileSync(resolve(projectRoot, templatePath), "utf8").trim(),
        );
      },
    },
    handleHotUpdate({ file, server }) {
      if (file.startsWith(templatesDirectory) && file.endsWith(".html")) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}

export default defineConfig({
  base: "/portfolio-v2/",
  plugins: [htmlTemplates(), react()],
  build: {
    target: "es2020",
    // Three.js is isolated in its own lazy chunk; the application entry stays small.
    chunkSizeWarningLimit: 550,
  },
});
