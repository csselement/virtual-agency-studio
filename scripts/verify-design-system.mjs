import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const cssPath = resolve("apps/web/src/styles.css");
const css = readFileSync(cssPath, "utf8");
const failures = [];

const lines = css.split("\n");
const stalePalettePattern =
  /#(?:1f5f93|26352f|fbfcf8|fffefa|f4faf7|29443a|277260|1f806c|d64c3d|1d65a6|dce8f7|2864aa|2d6fb4|65a30d|146157|2d6b35|f0fdf4|fff8e8|fff3f0|edf5f1|f0f8f1)\b/i;
const allowedSystemHex = new Set([
  "#fafaf9",
  "#f5f5f4",
  "#efedeb",
  "#e7e5e4",
  "#d6d3d1",
  "#a8a29e",
  "#78716c",
  "#57534e",
  "#44403c",
  "#292524",
  "#1c1917",
  "#ca8a04",
  "#dc2626",
  "#e4405f",
  "#ff0000",
  "#ff0033",
  "#fcb045",
  "#fd8d32",
  "#fd1d1d",
  "#e1306c",
  "#833ab4",
  "#25f4ee",
  "#fe2c55",
  "#000000"
]);
const systemOverrideLine = lines.findIndex((line) => line.includes("ThoughtStream monochrome system override"));

for (const [index, rawLine] of lines.entries()) {
  const lineNumber = index + 1;
  const line = rawLine.trim();

  if (/\b(?:linear|radial)-gradient\(/.test(line)) {
    failures.push(`no gradients: ${cssPath}:${lineNumber}: ${line}`);
  }

  if (stalePalettePattern.test(line)) {
    failures.push(`no stale off-palette color: ${cssPath}:${lineNumber}: ${line}`);
  }

  if (systemOverrideLine >= 0 && index > systemOverrideLine) {
    for (const [rawHex] of line.matchAll(/#[0-9a-f]{6}\b/gi)) {
      if (!allowedSystemHex.has(rawHex.toLowerCase())) {
        failures.push(`no raw hex outside ThoughtStream palette in active system: ${cssPath}:${lineNumber}: ${line}`);
      }
    }
  }

  if (/font-size:\s*clamp\(/.test(line)) {
    failures.push(`no viewport-scaled typography: ${cssPath}:${lineNumber}: ${line}`);
  }

  if (/transform:\s*translateY\(-/.test(line) && !line.includes("translateY(-140%)")) {
    failures.push(`no lifted hover transforms: ${cssPath}:${lineNumber}: ${line}`);
  }

  const radius = line.match(/border-radius:\s*([^;]+)/);
  if (radius) {
    const value = radius[1].trim();
    const allowed = value.startsWith("0") || value.startsWith("999px") || value.startsWith("var(--radius");
    if (!allowed) {
      failures.push(`no explicit nonzero radius except status dots: ${cssPath}:${lineNumber}: ${line}`);
    }
  }

  const shadow = line.match(/box-shadow:\s*([^;]+)/);
  if (shadow) {
    const value = shadow[1].trim();
    const allowed =
      value.startsWith("none") ||
      value.startsWith("var(--shadow-focus)") ||
      value.startsWith("var(--shadow-panel)") ||
      value.startsWith("var(--shadow-soft)");
    if (!allowed) {
      failures.push(`no explicit shadows except design tokens: ${cssPath}:${lineNumber}: ${line}`);
    }
  }
}

if (failures.length) {
  console.error("Design-system verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Design-system verification passed.");
