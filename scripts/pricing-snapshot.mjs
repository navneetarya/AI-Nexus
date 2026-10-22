// scripts/pricing-snapshot.mjs  (Phase 4, task 4.1)
//
// Freezes the CURRENT verified facts in lib/vendor-facts.data.json into a dated, flat
// snapshot: data/pricing/snapshots/<YYYY-MM-DD>.json. The pricing tracker (4.3), the
// diff script (4.2) and the public JSON (4.7) all read snapshots, never the live facts.
//
// Usage:
//   node scripts/pricing-snapshot.mjs                 # snapshot dated today (UTC)
//   node scripts/pricing-snapshot.mjs --date 2026-10-22
//   node scripts/pricing-snapshot.mjs --force         # overwrite an existing snapshot (avoid)
//
// Rules (see data/pricing/README.md):
//  - Only entries with status "verified" are included. Pending entries never appear.
//  - null means "not verified", never "no". Values are copied, never computed or estimated.
//  - A snapshot file is immutable once committed: history is the series of files.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build } from 'esbuild';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAP_DIR = path.join(ROOT, 'data', 'pricing', 'snapshots');
const args = process.argv.slice(2);
const force = args.includes('--force');
const dateArg = args.includes('--date') ? args[args.indexOf('--date') + 1] : null;
const snapshotISO = dateArg || new Date().toISOString().slice(0, 10);
if (!/^\d{4}-\d{2}-\d{2}$/.test(snapshotISO)) {
  console.error(`Bad --date "${snapshotISO}". Use YYYY-MM-DD.`);
  process.exit(1);
}

// Categories come from constants.ts (the site's own tool list), bundled the same way
// scripts/verdict-ssr-loader.mjs does it.
async function loadCategories() {
  const outDir = path.join(ROOT, 'node_modules', '.cache', 'ai-nexus-prerender');
  fs.mkdirSync(outDir, { recursive: true });
  const outfile = path.join(outDir, `snapshot-constants-${process.pid}.mjs`);
  await build({
    entryPoints: [path.join(ROOT, 'constants.ts')],
    outfile, bundle: true, platform: 'node', format: 'esm', target: 'node20',
    packages: 'external', jsx: 'automatic', logLevel: 'silent',
  });
  try {
    const mod = await import(pathToFileURL(outfile).href);
    return Object.fromEntries(mod.TOOLS.map((t) => [t.slug, String(t.category)]));
  } finally {
    fs.rmSync(outfile, { force: true });
  }
}

const facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'lib', 'vendor-facts.data.json'), 'utf8'));
const categories = await loadCategories();

const lowest = (nums) => { const n = nums.filter((x) => typeof x === 'number'); return n.length ? Math.min(...n) : null; };

const tools = facts.tools
  .filter((t) => t.status === 'verified')
  .map((t) => {
    const paid = t.plans.filter((p) => !p.isFree);
    return {
      slug: t.slug,
      name: t.name,
      category: categories[t.slug] ?? null,
      currency: t.currency,
      pricingPageUrl: t.pricingPageUrl,
      verifiedISO: t.verifiedISO,
      freeAccess: t.freeAccess,                     // "free-plan" | "trial-only" | "none"
      trialDays: t.trial ? t.trial.days : null,
      // Cheapest published paid price, copied from plans. null = no paid price verified.
      startsAtMonthly: lowest(paid.map((p) => p.priceMonthly)),
      startsAtMonthlyBilledAnnually: lowest(paid.map((p) => p.priceMonthlyBilledAnnually)),
      plans: t.plans.map((p) => ({
        id: p.id,
        name: p.name,
        isFree: p.isFree,
        priceMonthly: p.priceMonthly,
        priceMonthlyBilledAnnually: p.priceMonthlyBilledAnnually,
        oneTimePrice: p.oneTimePrice,
        customPricing: p.customPricing,
        allowance: p.allowance ? p.allowance.label : null,
        commercialUse: p.commercialUse,
      })),
    };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

const snapshot = {
  schemaVersion: 1,
  snapshotISO,
  source: 'lib/vendor-facts.data.json',
  toolCount: tools.length,
  tools,
};

const file = path.join(SNAP_DIR, `${snapshotISO}.json`);
if (fs.existsSync(file) && !force) {
  console.error(`Snapshot ${path.relative(ROOT, file)} already exists. Snapshots are immutable; use a new --date, or --force to overwrite.`);
  process.exit(1);
}
fs.mkdirSync(SNAP_DIR, { recursive: true });
fs.writeFileSync(file, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
console.log(`✓ ${path.relative(ROOT, file)}  (${tools.length} verified tools)`);

// data/pricing/latest.json is a copy of the newest snapshot. The site imports this one
// fixed path (lib/pricing-data.ts), so a new snapshot needs no code change.
const latestFile = path.join(ROOT, 'data', 'pricing', 'latest.json');
let latestISO = '';
try { latestISO = JSON.parse(fs.readFileSync(latestFile, 'utf8')).snapshotISO || ''; } catch { /* none yet */ }
if (snapshotISO >= latestISO) {
  fs.writeFileSync(latestFile, JSON.stringify(snapshot, null, 2) + '\n', 'utf8');
  console.log(`✓ ${path.relative(ROOT, latestFile)}  (copy of ${snapshotISO})`);
}
