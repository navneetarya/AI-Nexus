// scripts/pricing-diff.mjs  (Phase 4, task 4.2)
//
// Compares two pricing snapshots (data/pricing/snapshots/*.json) and DRAFTS change-log
// entries in the format documented in data/pricing/README.md. A human reviews the drafts
// before anything reaches data/pricing/history.json: nothing is published automatically.
//
// Usage:
//   node scripts/pricing-diff.mjs                         # two newest snapshots, drafts to stdout
//   node scripts/pricing-diff.mjs --from 2026-10-22 --to 2026-11-05
//   node scripts/pricing-diff.mjs --out drafts.json       # also write the drafts to a file
//   node scripts/pricing-diff.mjs --merge                 # add reviewed-safe drafts to history.json
//
// Matching: tools by slug, plans by id. Only differences in price, allowance, commercial use,
// custom pricing, free access / trial length, and added/removed plans or tools are reported.
// A change of verifiedISO alone is not a pricing change and is ignored.
//
// A change to or from null means "not verified", not a real price change, so those drafts get
// needsReview: true and are NEVER merged by --merge (add them by hand after checking the vendor).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SNAP_DIR = path.join(ROOT, 'data', 'pricing', 'snapshots');
const HISTORY = path.join(ROOT, 'data', 'pricing', 'history.json');

const args = process.argv.slice(2);
const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);

const dates = fs.existsSync(SNAP_DIR)
  ? fs.readdirSync(SNAP_DIR).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).map((f) => f.slice(0, 10)).sort()
  : [];
const toISO = opt('--to') || dates[dates.length - 1];
const fromISO = opt('--from') || (opt('--to') ? dates.filter((d) => d < toISO).pop() : dates[dates.length - 2]);
if (!fromISO || !toISO) {
  console.error('Need two snapshots. Found: ' + (dates.join(', ') || 'none'));
  process.exit(1);
}
const load = (iso) => {
  const file = path.join(SNAP_DIR, `${iso}.json`);
  if (!fs.existsSync(file)) { console.error(`Missing snapshot ${path.relative(ROOT, file)}`); process.exit(1); }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
};
const A = load(fromISO);
const B = load(toISO);

const money = (n, cur) =>
  new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US', {
    style: 'currency', currency: cur,
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2,
  }).format(n);

const FIELD_LABEL = {
  priceMonthly: 'monthly price',
  priceMonthlyBilledAnnually: 'price per month on annual billing',
  oneTimePrice: 'one-time price',
};

const drafts = [];
function add(tool, kind, planId, field, from, to, summary, needsReview = false) {
  drafts.push({
    id: `${toISO}-${tool.slug}-${planId ?? 'tool'}-${field ?? kind}`,
    dateISO: toISO,
    slug: tool.slug,
    tool: tool.name,
    kind,
    planId,
    field,
    from,
    to,
    currency: tool.currency,
    sourceUrl: tool.pricingPageUrl,
    summary,
    fromSnapshot: fromISO,
    toSnapshot: toISO,
    ...(needsReview ? { needsReview: true } : {}),
  });
}

const byKey = (arr, key) => new Map(arr.map((x) => [x[key], x]));
const fromTools = byKey(A.tools, 'slug');
const toTools = byKey(B.tools, 'slug');

for (const [slug, t] of toTools) {
  if (!fromTools.has(slug)) add(t, 'tool-added', null, null, null, null, `${t.name} added to the tracker.`);
}
for (const [slug, t] of fromTools) {
  if (!toTools.has(slug)) add(t, 'tool-removed', null, null, null, null, `${t.name} removed from the tracker.`);
}

for (const [slug, a] of fromTools) {
  const b = toTools.get(slug);
  if (!b) continue;
  const cur = b.currency;

  if (a.freeAccess !== b.freeAccess) {
    add(b, 'free-access-change', null, 'freeAccess', a.freeAccess, b.freeAccess,
      `${b.name} free access changed from "${a.freeAccess}" to "${b.freeAccess}".`);
  } else if (a.trialDays !== b.trialDays) {
    const nul = a.trialDays === null || b.trialDays === null;
    add(b, 'free-access-change', null, 'trialDays', a.trialDays, b.trialDays,
      nul ? `${b.name} trial length: verification status changed (${a.trialDays ?? 'not verified'} to ${b.trialDays ?? 'not verified'}).`
          : `${b.name} free trial changed from ${a.trialDays} to ${b.trialDays} days.`, nul);
  }

  const fromPlans = byKey(a.plans, 'id');
  const toPlans = byKey(b.plans, 'id');
  for (const [id, p] of toPlans) {
    if (!fromPlans.has(id)) add(b, 'plan-added', id, null, null, p.name, `${b.name} added the ${p.name} plan.`);
  }
  for (const [id, p] of fromPlans) {
    if (!toPlans.has(id)) add(b, 'plan-removed', id, null, p.name, null, `${b.name} removed the ${p.name} plan.`);
  }

  for (const [id, pb] of toPlans) {
    const pa = fromPlans.get(id);
    if (!pa) continue;
    const name = pb.name;

    for (const field of ['priceMonthly', 'priceMonthlyBilledAnnually', 'oneTimePrice']) {
      if (pa[field] === pb[field]) continue;
      const nul = pa[field] === null || pb[field] === null;
      const summary = nul
        ? `${b.name} ${name}: ${FIELD_LABEL[field]} ${pb[field] === null ? 'is no longer verified' : `is now verified at ${money(pb[field], cur)}`}.`
        : `${b.name} ${name}: ${FIELD_LABEL[field]} went from ${money(pa[field], cur)} to ${money(pb[field], cur)}.`;
      add(b, 'price-change', id, field, pa[field], pb[field], summary, nul);
    }
    if (pa.customPricing !== pb.customPricing) {
      add(b, 'price-change', id, 'customPricing', pa.customPricing, pb.customPricing,
        `${b.name} ${name}: ${pb.customPricing ? 'now custom pricing (contact sales)' : 'no longer custom pricing'}.`);
    }
    if (pa.allowance !== pb.allowance) {
      const nul = pa.allowance === null || pb.allowance === null;
      add(b, 'allowance-change', id, 'allowance', pa.allowance, pb.allowance,
        nul ? `${b.name} ${name}: allowance ${pb.allowance === null ? 'is no longer verified' : `is now verified: ${pb.allowance}`}.`
            : `${b.name} ${name}: allowance changed from "${pa.allowance}" to "${pb.allowance}".`, nul);
    }
    if (pa.commercialUse !== pb.commercialUse) {
      const nul = pa.commercialUse === null || pb.commercialUse === null;
      const word = (v) => (v === true ? 'allowed' : v === false ? 'not allowed' : 'not verified');
      add(b, 'commercial-use-change', id, 'commercialUse', pa.commercialUse, pb.commercialUse,
        `${b.name} ${name}: commercial use changed from ${word(pa.commercialUse)} to ${word(pb.commercialUse)}.`, nul);
    }
  }
}

// ── Output ────────────────────────────────────────────────────────────────────
const review = drafts.filter((d) => d.needsReview);
console.error(`Comparing ${fromISO} → ${toISO}: ${drafts.length} draft(s), ${review.length} need manual review.`);
console.log(JSON.stringify(drafts, null, 2));

if (opt('--out')) fs.writeFileSync(opt('--out'), JSON.stringify(drafts, null, 2) + '\n', 'utf8');

if (args.includes('--merge')) {
  const history = JSON.parse(fs.readFileSync(HISTORY, 'utf8'));
  const have = new Set(history.entries.map((e) => e.id));
  const fresh = drafts.filter((d) => !d.needsReview && !have.has(d.id));
  history.entries = [...fresh, ...history.entries].sort((x, y) => (x.dateISO < y.dateISO ? 1 : x.dateISO > y.dateISO ? -1 : 0));
  fs.writeFileSync(HISTORY, JSON.stringify(history, null, 2) + '\n', 'utf8');
  console.error(`Merged ${fresh.length} entr${fresh.length === 1 ? 'y' : 'ies'} into data/pricing/history.json. ${review.length} left for manual review.`);
}
