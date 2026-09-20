#!/usr/bin/env node
/**
 * scripts/check-affiliate-links.mjs
 *
 * Build guard for the single-source-of-truth rule in lib/affiliate-links.ts.
 *
 * THE RULE
 * Every affiliate/referral URL must live in exactly one place:
 *   - constants.ts                          → tools with a /tools/<slug>/ page
 *   - lib/affiliate-links.ts (SUPPLEMENTARY) → blog-only mentions, no page yet
 * Everywhere else reads it via AFFILIATE_LINKS['<slug>'], so changing a link
 * is a one-line edit instead of a site-wide find-and-replace.
 *
 * TWO SEVERITIES
 *   BLOCKING  — impact.com tracking domains (sjv.io, pxf.io, ojrq.net, …).
 *               These are the newest programs and are 100% clean today, so
 *               any occurrence outside the allowed files fails the build.
 *   BASELINED — legacy `?via=` / `?fpr=` style referral URLs. ~230 of these
 *               were hardcoded into blog posts before this rule existed.
 *               They're recorded in scripts/affiliate-links-baseline.json.
 *               Existing ones pass; ANY NEW ONE FAILS THE BUILD. As posts
 *               get migrated to AFFILIATE_LINKS, re-run with
 *               --update-baseline to shrink the baseline. It can only ever
 *               go down.
 *
 * USAGE
 *   node scripts/check-affiliate-links.mjs                  # check (CI/build)
 *   node scripts/check-affiliate-links.mjs --update-baseline # after migrating
 *   node scripts/check-affiliate-links.mjs --strict          # ignore baseline
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const BASELINE_PATH = join(ROOT, 'scripts', 'affiliate-links-baseline.json');

const UPDATE = process.argv.includes('--update-baseline');
const STRICT = process.argv.includes('--strict');

/** The only files allowed to contain a raw affiliate URL. */
const ALLOWED_FILES = new Set(['constants.ts', join('lib', 'affiliate-links.ts')]);

const SKIP_DIRS = new Set([
  'node_modules', 'dist', '.git', '.github', '__pycache__', 'public', 'docs', 'tests',
]);

const SCAN_EXTENSIONS = ['.ts', '.tsx', '.mjs', '.js', '.jsx'];

/**
 * `blocking: true`  → any hit fails the build immediately.
 * `blocking: false` → checked against the baseline.
 */
const PATTERNS = [
  {
    name: 'impact.com tracking link',
    blocking: true,
    re: /https?:\/\/[^\s'"`)<]*\b(?:sjv\.io|pxf\.io|ojrq\.net|7eer\.net|evyy\.net|ojmp\.net|prf\.hn)\b[^\s'"`)<]*/gi,
  },
  {
    name: 'referral query param (?via=)',
    blocking: false,
    re: /https?:\/\/[^\s'"`)<]*[?&]via=[^\s'"`)<]*/gi,
  },
  {
    name: 'referral query param (?fpr= / ?aff= / ?affiliate=)',
    blocking: false,
    re: /https?:\/\/[^\s'"`)<]*[?&](?:fpr|aff|affiliate)=[^\s'"`)<]*/gi,
  },
  {
    name: 'PartnerStack referral link',
    blocking: false,
    re: /https?:\/\/[^\s'"`)<]*\bpartnerstack\.com\b[^\s'"`)<]*/gi,
  },
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith('.')) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (SKIP_DIRS.has(entry)) continue;
      walk(full, out);
    } else if (SCAN_EXTENSIONS.some((e) => entry.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

/** Blank out // and block comments so a documented link isn't a violation. */
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) =>
      p1 + ' '.repeat(Math.max(0, m.length - p1.length))
    );
}

const blocking = [];
/** key = `${relPath}|${url}` → count. Line numbers deliberately excluded so
 *  the baseline doesn't churn every time a post is edited. */
const baselined = new Map();

for (const file of walk(ROOT)) {
  const rel = relative(ROOT, file);
  if (ALLOWED_FILES.has(rel)) continue;
  if (rel === join('scripts', 'check-affiliate-links.mjs')) continue;

  const src = stripComments(readFileSync(file, 'utf8'));

  for (const { name, re, blocking: isBlocking } of PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(src)) !== null) {
      const line = src.slice(0, m.index).split('\n').length;
      if (isBlocking) {
        blocking.push({ rel, line, name, url: m[0] });
      } else {
        const key = `${rel.split(sep).join('/')}|${m[0]}`;
        baselined.set(key, (baselined.get(key) || 0) + 1);
      }
    }
  }
}

const current = Object.fromEntries([...baselined.entries()].sort());

if (UPDATE) {
  writeFileSync(
    BASELINE_PATH,
    JSON.stringify(
      {
        _comment:
          'Legacy hardcoded referral URLs that predate the AFFILIATE_LINKS rule. ' +
          'This list may only shrink. Migrate a post to AFFILIATE_LINKS, then run ' +
          'node scripts/check-affiliate-links.mjs --update-baseline',
        _generated: new Date().toISOString().slice(0, 10),
        _total: Object.values(current).reduce((a, b) => a + b, 0),
        entries: current,
      },
      null,
      2
    ) + '\n'
  );
  const total = Object.values(current).reduce((a, b) => a + b, 0);
  console.log(`✓ Baseline written: ${total} legacy hardcoded link(s) recorded.`);
  process.exit(0);
}

let failed = false;

if (blocking.length > 0) {
  failed = true;
  console.error('\n✖ BLOCKING: hardcoded impact.com affiliate link(s) found.\n');
  for (const v of blocking) {
    console.error(`  ${v.rel}:${v.line}\n    ${v.url}\n`);
  }
  console.error(
    "  Move the link into constants.ts and reference it as ${AFFILIATE_LINKS['<slug>']}\n" +
      "  inside blog template literals, or AFFILIATE_LINKS['<slug>'] in .ts/.tsx.\n"
  );
}

const baseline = existsSync(BASELINE_PATH)
  ? JSON.parse(readFileSync(BASELINE_PATH, 'utf8')).entries || {}
  : {};

const regressions = [];
for (const [key, count] of Object.entries(current)) {
  const allowed = STRICT ? 0 : baseline[key] || 0;
  if (count > allowed) {
    const [file, url] = key.split('|');
    regressions.push({ file, url, count, allowed });
  }
}

if (regressions.length > 0) {
  failed = true;
  console.error('\n✖ NEW hardcoded referral link(s) — not in the baseline.\n');
  for (const r of regressions) {
    console.error(`  ${r.file}\n    ${r.url}\n    found ${r.count}x, baseline allows ${r.allowed}x\n`);
  }
  console.error(
    "  New affiliate links must go in constants.ts (or SUPPLEMENTARY_LINKS) and be\n" +
      "  referenced via AFFILIATE_LINKS['<slug>']. The baseline is for legacy links only.\n"
  );
}

if (failed) process.exit(1);

const legacyTotal = Object.values(current).reduce((a, b) => a + b, 0);
console.log('✓ check-affiliate-links: no hardcoded impact.com links, no new violations.');
if (legacyTotal > 0) {
  console.log(
    `  (${legacyTotal} legacy ?via=/?fpr= link(s) still baselined — migrate over time, ` +
      'then run --update-baseline.)'
  );
}
