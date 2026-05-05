/**
 * Post-build script for Vercel deployment
 * Generates the missing index.html for SPA static serving
 * 
 * TanStack Start with Cloudflare generates SSR output (dist/server)
 * but Vercel needs a static index.html in dist/client
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");

const clientDir = path.join(rootDir, "dist", "client");
const indexPath = path.join(clientDir, "index.html");

// Find the main JS bundle
const assetsDir = path.join(clientDir, "assets");
let mainBundle = "";
let mainCss = "";

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find((f) => f.startsWith("client-") && f.endsWith(".js"));
  const cssFile = files.find((f) => f.startsWith("styles-") && f.endsWith(".css"));

  if (jsFile) mainBundle = `/assets/${jsFile}`;
  if (cssFile) mainCss = `/assets/${cssFile}`;
}

// Generate the HTML template
const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Avocat-Link — Premium LegalTech</title>
    <meta name="description" content="Find, book, and consult vetted lawyers with end-to-end encryption." />
    <meta name="author" content="Avocat-Link" />
    ${mainCss ? `<link rel="stylesheet" href="${mainCss}" />` : ""}
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${mainBundle}"></script>
  </body>
</html>
`;

// Ensure directory exists
if (!fs.existsSync(clientDir)) {
  fs.mkdirSync(clientDir, { recursive: true });
}

// Write the index.html
fs.writeFileSync(indexPath, html, "utf-8");

console.log("✅ Post-build: Generated dist/client/index.html");
console.log(`   - Main bundle: ${mainBundle}`);
console.log(`   - Main CSS: ${mainCss}`);
console.log(`\n📋 SPA ready for Vercel deployment!`);
