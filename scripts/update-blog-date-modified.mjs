#!/usr/bin/env node
/**
 * scripts/update-blog-date-modified.mjs
 *
 * T8 (EEAT-Medium): Batch-update `dateModified` across every blog post .ts file.
 *
 * Most posts currently have `dateModified === datePublished` — a stale
 * freshness signal to Google. This script sets `dateModified` on every
 * post in blog/*.ts (excluding index.ts and types.ts) to the date the
 * script is run, signalling a content refresh across the entire blog.
 *
 * Usage:
 *   node scripts/update-blog-date-modified.mjs
 *
 * Optional — pin to a specific date instead of "today":
 *   node scripts/update-blog-date-modified.mjs 2026-06-14
 *
 * Safe to re-run — it only rewrites the `dateModified: '...'` line and
 * leaves `datePublished` and everything else untouched.
 */

import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.join(__dir, '..');
const BLOG  = path.join(ROOT, 'blog');

// Allow an optional date override as the first CLI arg, else use today (UTC).
const override = process.argv[2];
const today = override || new Date().toISOString().slice(0, 10); // YYYY-MM-DD

if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) {
  console.error(`Invalid date "${today}" — expected format YYYY-MM-DD`);
  process.exit(1);
}

const SKIP = new Set(['index.ts', 'types.ts']);
const DATE_MODIFIED_RE = /dateModified:\s*'(\d{4}-\d{2}-\d{2})'/;

const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.ts') && !SKIP.has(f));

let updated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = path.join(BLOG, file);
  const src = fs.readFileSync(filePath, 'utf8');

  if (!DATE_MODIFIED_RE.test(src)) {
    console.warn(`⚠️  No dateModified field found in ${file} — skipped`);
    skipped++;
    continue;
  }

  const next = src.replace(DATE_MODIFIED_RE, (match, oldDate) => {
    if (oldDate === today) return match; // already up to date
    return `dateModified: '${today}'`;
  });

  if (next !== src) {
    fs.writeFileSync(filePath, next, 'utf8');
    console.log(`✅ ${file} → dateModified: '${today}'`);
    updated++;
  } else {
    console.log(`↪️  ${file} already '${today}' — no change`);
  }
}

console.log(`\nDone. Updated ${updated}/${files.length} post(s) to dateModified: '${today}'.`);
if (skipped) console.log(`Skipped ${skipped} file(s) with no dateModified field.`);
