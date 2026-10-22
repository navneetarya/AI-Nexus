// scripts/verdict-ssr-loader.mjs  (Phase 2, task 2.4)
//
// Bundles lib/verdict-card-ssr.tsx with esbuild and imports the result, so the
// build scripts (plain .mjs) can call the real React component. Shared by
// prerender.mjs and verify-prerender.mjs so both see exactly the same card.
//
// Only relative imports are bundled; react, react-dom and lucide-react stay
// external and resolve from node_modules. The bundle is written to
// node_modules/.cache/, which is git-ignored and never deployed.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function loadVerdictSsr() {
  const outDir = path.join(ROOT, 'node_modules', '.cache', 'ai-nexus-prerender');
  fs.mkdirSync(outDir, { recursive: true });
  const outfile = path.join(outDir, `verdict-card-ssr-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'lib', 'verdict-card-ssr.tsx')],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    packages: 'external',
    jsx: 'automatic',
    logLevel: 'silent',
  });
  try {
    return await import(pathToFileURL(outfile).href);
  } finally {
    fs.rmSync(outfile, { force: true });
  }
}
