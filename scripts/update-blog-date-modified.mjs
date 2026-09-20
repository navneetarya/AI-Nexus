#!/usr/bin/env node
/**
 * scripts/update-blog-date-modified.mjs
 *
 * Sets each blog post's `dateModified` to the date it was REALLY last edited —
 * never "today" for every post.
 *
 * Why: the previous version stamped the run date on every post, which tells
 * Google (and AI engines) that the whole blog was refreshed when it wasn't.
 * Google's guidance is to change dates only when content changes significantly.
 *
 * How the real date is found, per blog/<slug>.ts:
 *   1. Uncommitted content edits          -> today (a real edit in progress)
 *   2. Otherwise the newest git commit whose diff changed something OTHER than a
 *      dateModified line (so earlier date-only commits never count as edits)
 *   3. Never earlier than datePublished, never later than today
 *
 * Usage (needs FULL git history — run locally, not on a shallow CI checkout):
 *   node scripts/update-blog-date-modified.mjs --dry-run   # preview changes
 *   node scripts/update-blog-date-modified.mjs             # apply
 *
 * Safe to re-run: it only rewrites the `dateModified: '...'` line.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.join(__dir, '..');
const BLOG  = path.join(ROOT, 'blog');
const DRY   = process.argv.includes('--dry-run');
const TODAY = new Date().toISOString().slice(0, 10);

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

try {
  if (git(['rev-parse', '--is-shallow-repository']).trim() === 'true') {
    console.error('This is a shallow clone — git history is incomplete, so real edit dates cannot be derived.\nRun `git fetch --unshallow` first (or run this script in a full local clone).');
    process.exit(1);
  }
} catch {
  console.error('Not a git repository (or git is unavailable) — cannot derive real edit dates.');
  process.exit(1);
}

const SKIP = new Set(['index.ts', 'types.ts', 'metadata.ts', 'loaders.ts']);
const DATE_MODIFIED_RE = /dateModified:\s*'(\d{4}-\d{2}-\d{2})'/;
const DATE_PUBLISHED_RE = /datePublished:\s*'(\d{4}-\d{2}-\d{2})'/;

/** true if a unified diff (-U0) changes any line other than a dateModified line */
function hasContentChange(diffText) {
  return diffText
    .split('\n')
    .filter(l => (l.startsWith('+') || l.startsWith('-')) && !l.startsWith('+++') && !l.startsWith('---'))
    .some(l => !/dateModified/.test(l));
}

function realEditDate(rel) {
  // 1. uncommitted content edits
  const dirty = git(['status', '--porcelain', '--', rel]).trim();
  if (dirty) {
    const wt = git(['diff', 'HEAD', '-U0', '--', rel]);
    if (!wt || hasContentChange(wt)) return TODAY;
  }
  // 2. newest commit with a real content change
  const log = git(['log', '--format=%H %cs', '--', rel]).trim();
  if (!log) return null;
  for (const line of log.split('\n')) {
    const [sha, date] = line.split(' ');
    const diff = git(['show', '--format=', '-U0', sha, '--', rel]);
    if (hasContentChange(diff)) return date;
  }
  return null;
}

const files = fs.readdirSync(BLOG).filter(f => f.endsWith('.ts') && !SKIP.has(f)).sort();
let changed = 0, same = 0, skipped = 0;

for (const file of files) {
  const abs = path.join(BLOG, file);
  const rel = path.posix.join('blog', file);
  const src = fs.readFileSync(abs, 'utf8');
  const cur = src.match(DATE_MODIFIED_RE);
  const pub = src.match(DATE_PUBLISHED_RE);
  if (!cur || !pub) { console.warn(`skip  ${file} — no dateModified/datePublished field`); skipped++; continue; }

  let real = realEditDate(rel) || pub[1];
  if (real < pub[1]) real = pub[1];   // never before publication
  if (real > TODAY)  real = TODAY;    // never in the future

  if (real === cur[1]) { same++; continue; }
  console.log(`${DRY ? 'would set' : 'set'}  ${file}: ${cur[1]} -> ${real}`);
  if (!DRY) fs.writeFileSync(abs, src.replace(DATE_MODIFIED_RE, `dateModified: '${real}'`));
  changed++;
}

console.log(`\n${DRY ? '[dry run] ' : ''}${changed} changed, ${same} already correct, ${skipped} skipped (${files.length} posts).`);
