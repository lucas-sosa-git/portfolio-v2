import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = process.cwd();
const templatesDirectory = resolve(projectRoot, "templates");
const includeDirective = /<!--\s*@include\s+(templates\/[\w-]+\.html)\s*-->/g;
const staticAssets = [
  "assets/cv_sosa_lucas.pdf",
  "assets/og-favicon-v4.png",
  "assets/courses/c-sharp-para-no-programadores.pdf",
  "assets/courses/desarrollo-web-con-html.pdf",
  "assets/courses/ia-para-programadores.pdf",
  "assets/courses/introduccion-a-base-de-datos.pdf",
  "assets/courses/js-desde-cero.pdf",
  "assets/courses/power-bi.pdf",
  "assets/courses/poo_con_ia.pdf",
  "assets/courses/sql_server_programming.pdf",
];

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
    generateBundle() {
      staticAssets.forEach((assetPath) => {
        this.emitFile({
          type: "asset",
          fileName: assetPath,
          source: readFileSync(resolve(projectRoot, assetPath)),
        });
      });
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
