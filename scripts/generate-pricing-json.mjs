// scripts/generate-pricing-json.mjs  (Phase 4, task 4.7)
//
// Publishes the verified pricing snapshot as a public, machine-readable file:
//   https://ainexustools.online/data/ai-tool-pricing.json
//
// Source data (never edited here):
//   data/pricing/latest.json    newest snapshot (written by scripts/pricing-snapshot.mjs)
//   data/pricing/history.json   reader-facing change log and corrections
//
// Output:
//   dist/data/ai-tool-pricing.json     what the site serves (the build runs this AFTER prerender)
//   public/data/ai-tool-pricing.json   only with --public (for `vite dev`; not needed in CI)
//
// Rules, the same as the tracker page:
//  - Values are copied, never computed. null means "not verified", never "no" or "free".
//  - The file has no build timestamp, so the same data always produces the same bytes.
//  - The build fails if the snapshot is malformed, so bad data cannot ship.
//
// Usage:
//   node scripts/generate-pricing-json.mjs
//   node scripts/generate-pricing-json.mjs --public

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://ainexustools.online';
const args = process.argv.slice(2);
const alsoPublic = args.includes('--public');

const readJson = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));

const fail = (msg) => {
  console.error(`❌  generate-pricing-json: ${msg}`);
  process.exit(1);
};

let snapshot;
let history;
try {
  snapshot = readJson('data/pricing/latest.json');
  history = readJson('data/pricing/history.json');
} catch (err) {
  fail(`could not read pricing data (${err.message})`);
}

// ── Validate ────────────────────────────────────────────────────────────────
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const isNumOrNull = (v) => v === null || (typeof v === 'number' && Number.isFinite(v) && v >= 0);

if (!ISO.test(snapshot.snapshotISO ?? '')) fail('snapshotISO is missing or not YYYY-MM-DD');
if (!Array.isArray(snapshot.tools) || snapshot.tools.length === 0) fail('snapshot has no tools');
if (snapshot.toolCount !== snapshot.tools.length) fail(`toolCount (${snapshot.toolCount}) does not match tools.length (${snapshot.tools.length})`);
if (!Array.isArray(history.entries)) fail('history.json has no entries array');

const slugs = new Set();
for (const t of snapshot.tools) {
  const where = `tool "${t.slug ?? '?'}"`;
  if (!t.slug || !t.name) fail(`${where}: slug or name missing`);
  if (slugs.has(t.slug)) fail(`${where}: duplicate slug`);
  slugs.add(t.slug);
  if (!/^https:\/\//.test(t.pricingPageUrl ?? '')) fail(`${where}: pricingPageUrl must be an https URL`);
  if (!ISO.test(t.verifiedISO ?? '')) fail(`${where}: verifiedISO missing or not YYYY-MM-DD`);
  if (!['free-plan', 'trial-only', 'none'].includes(t.freeAccess)) fail(`${where}: bad freeAccess "${t.freeAccess}"`);
  if (!isNumOrNull(t.startsAtMonthly) || !isNumOrNull(t.startsAtMonthlyBilledAnnually)) fail(`${where}: starting prices must be a number or null`);
  if (!Array.isArray(t.plans) || t.plans.length === 0) fail(`${where}: no plans`);
  const planIds = new Set();
  for (const p of t.plans) {
    if (!p.id || planIds.has(p.id)) fail(`${where}: plan id missing or duplicated ("${p.id ?? ''}")`);
    planIds.add(p.id);
    for (const f of ['priceMonthly', 'priceMonthlyBilledAnnually', 'oneTimePrice']) {
      if (!isNumOrNull(p[f])) fail(`${where}, plan "${p.id}": ${f} must be a number or null`);
    }
  }
}

// ── Build the public document ───────────────────────────────────────────────
const entryOut = (e) => ({
  id: e.id,
  date: e.dateISO,
  tool: e.tool,
  slug: e.slug,
  kind: e.kind,
  planId: e.planId ?? null,
  field: e.field ?? null,
  from: e.from ?? null,
  to: e.to ?? null,
  currency: e.currency,
  summary: e.summary,
  sourceUrl: e.sourceUrl,
});

const byDateDesc = (a, b) => (a.dateISO < b.dateISO ? 1 : a.dateISO > b.dateISO ? -1 : 0);
const changes = history.entries.filter((e) => e.kind !== 'correction').sort(byDateDesc).map(entryOut);
const corrections = history.entries.filter((e) => e.kind === 'correction').sort(byDateDesc).map(entryOut);

const doc = {
  schemaVersion: 1,
  name: 'AI Nexus AI Tool Pricing Tracker',
  description:
    "Verified prices for AI tools. Every tool was checked against the vendor's own pricing page on the date shown. null means a value is not verified, never that it does not exist.",
  publisher: 'AI Nexus',
  author: 'Navneet Arya',
  page: `${SITE}/pricing-tracker/`,
  methodology: `${SITE}/methodology/`,
  attribution: 'If you use this data, please link to https://ainexustools.online/pricing-tracker/.',
  snapshotDate: snapshot.snapshotISO,
  toolCount: snapshot.tools.length,
  tools: snapshot.tools.map((t) => ({
    slug: t.slug,
    name: t.name,
    category: t.category,
    currency: t.currency,
    reviewUrl: `${SITE}/tools/${t.slug}/`,
    pricingPageUrl: t.pricingPageUrl,
    verifiedDate: t.verifiedISO,
    freeAccess: t.freeAccess,
    trialDays: t.trialDays,
    startsAtMonthly: t.startsAtMonthly,
    startsAtMonthlyBilledAnnually: t.startsAtMonthlyBilledAnnually,
    plans: t.plans.map((p) => ({
      id: p.id,
      name: p.name,
      isFree: p.isFree,
      priceMonthly: p.priceMonthly,
      priceMonthlyBilledAnnually: p.priceMonthlyBilledAnnually,
      oneTimePrice: p.oneTimePrice,
      customPricing: p.customPricing,
      allowance: p.allowance,
      commercialUse: p.commercialUse,
    })),
  })),
  changes,
  corrections,
};

// ── Write ───────────────────────────────────────────────────────────────────
const body = `${JSON.stringify(doc, null, 2)}\n`;
const targets = [];
const dist = path.join(ROOT, 'dist');
if (fs.existsSync(dist)) targets.push(path.join(dist, 'data', 'ai-tool-pricing.json'));
if (alsoPublic) targets.push(path.join(ROOT, 'public', 'data', 'ai-tool-pricing.json'));
if (targets.length === 0) fail('dist/ does not exist. Run this after `vite build` and prerender, or pass --public.');

for (const file of targets) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, body, 'utf8');
  // Read it back and parse it, so a truncated write fails the build instead of shipping.
  JSON.parse(fs.readFileSync(file, 'utf8'));
  console.log(`✅  ${path.relative(ROOT, file)}  (${snapshot.tools.length} tools, snapshot ${snapshot.snapshotISO}, ${(Buffer.byteLength(body) / 1024).toFixed(1)} KB)`);
}
