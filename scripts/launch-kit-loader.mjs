// scripts/launch-kit-loader.mjs
//
// Bundles lib/launch-kit.ts with esbuild and imports the result, so prerender.mjs (a plain
// .mjs build script) can call the real getLaunchKitHtml() function instead of re-deriving the
// Launch Kit box's HTML by hand. Mirrors scripts/verdict-ssr-loader.mjs's pattern exactly.
//
// WHY THIS EXISTS: blog/*.ts content template literals are read by prerender.mjs as raw TEXT
// (see loadBlogContent in prerender.mjs), not executed as code, so a literal `${getLaunchKitHtml()}`
// call inside a post's content string is never evaluated by that text-extraction step on its own.
// prerender.mjs resolves it afterwards with a regex replace against the REAL HTML this loader
// returns — the same two-step pattern already used for `${AFFILIATE_LINKS['slug']}`.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function loadLaunchKitHtml() {
  const outDir = path.join(ROOT, 'node_modules', '.cache', 'ai-nexus-prerender');
  fs.mkdirSync(outDir, { recursive: true });
  const outfile = path.join(outDir, `launch-kit-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'lib', 'launch-kit.ts')],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    packages: 'external',
    logLevel: 'silent',
  });
  try {
    const mod = await import(pathToFileURL(outfile).href);
    return mod.getLaunchKitHtml();
  } finally {
    fs.rmSync(outfile, { force: true });
  }
}
