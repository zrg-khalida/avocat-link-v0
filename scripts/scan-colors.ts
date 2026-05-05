#!/usr/bin/env bun
/**
 * Banned-color guard.
 *
 * Scans src/ for any color value that violates the monochromatic Legal palette.
 * Tan / Cream / Brown / Gray / Rust / Sand only.
 *
 * Run: bun run lint:colors
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(import.meta.dir, "..", "src");

// Banned literals — Tailwind utility shades and raw hex codes.
const BANNED: { pattern: RegExp; label: string }[] = [
  // Tailwind utilities (any shade) — strictly classnames so we don't false-match
  // identifier substrings or comments.
  { pattern: /\b(?:text|bg|border|ring|from|to|via|fill|stroke|shadow|outline|decoration|divide|placeholder|caret|accent)-(?:green|emerald|teal|lime|red|rose|pink|fuchsia|yellow|orange|amber|cyan|sky|blue|indigo|violet|purple)-\d{2,3}\b/g, label: "Tailwind colored utility" },
  // Raw greens
  { pattern: /#(?:10b981|22c55e|16a34a|15803d|059669|34d399|6ee7b7|a7f3d0)\b/gi, label: "green hex" },
  // Raw bright reds (allow rust/burgundy oklch only)
  { pattern: /#(?:ef4444|dc2626|f87171|fca5a5|b91c1c|991b1b)\b/gi, label: "bright red hex" },
  // Raw yellows
  { pattern: /#(?:eab308|facc15|fde047|fef08a|f59e0b|fbbf24|fcd34d)\b/gi, label: "yellow hex" },
  // Teal / cyan
  { pattern: /#(?:14b8a6|0d9488|06b6d4|22d3ee)\b/gi, label: "teal/cyan hex" },
];

// Files allowed to mention these tokens (legacy aliases live in styles.css).
const ALLOWLIST = [
  "src/styles.css",
  "src/lib/notifications.ts", // tone *names* (string identifiers, not colors)
  "src/lib/notif-settings.ts",
];

const violations: { file: string; line: number; match: string; label: string }[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const rel = relative(process.cwd(), full);
    const s = statSync(full);
    if (s.isDirectory()) {
      if (entry === "node_modules" || entry === "dist" || entry === ".output") continue;
      walk(full);
      continue;
    }
    if (!/\.(tsx?|css)$/.test(entry)) continue;
    if (ALLOWLIST.includes(rel)) continue;

    const src = readFileSync(full, "utf8");
    const lines = src.split("\n");
    for (const { pattern, label } of BANNED) {
      pattern.lastIndex = 0;
      lines.forEach((line, i) => {
        const m = line.match(pattern);
        if (m) {
          for (const hit of m) {
            violations.push({ file: rel, line: i + 1, match: hit, label });
          }
        }
      });
    }
  }
}

walk(ROOT);

if (violations.length === 0) {
  console.log("✓ Color guard clean — no banned hues found.");
  process.exit(0);
}

console.error(`\n✗ Color guard FAILED — ${violations.length} banned color(s) found:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}  [${v.label}]  ${v.match}`);
}
console.error(`\nUse semantic tokens (text-primary, bg-success, chip-amber, etc.) defined in src/styles.css.`);
process.exit(1);
