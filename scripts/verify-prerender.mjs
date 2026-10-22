// scripts/verify-prerender.mjs
// Verifies all URLs in sitemap.xml have corresponding prerendered HTML files in dist/.
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadVerdictSsr } from './verdict-ssr-loader.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const SITEMAP = join(ROOT, 'dist', 'sitemap.xml');
const DIST = join(ROOT, 'dist');
const SITE = 'https://ainexustools.online';

if (!existsSync(SITEMAP)) {
  console.error('❌  sitemap.xml not found in dist/. Run `npm run build` first.');
  process.exit(1);
}

const xml = readFileSync(SITEMAP, 'utf8');
const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1].trim());

if (urls.length === 0) {
  console.error('❌  No <loc> entries found in sitemap.xml.');
  process.exit(1);
}

let pass = 0;
let fail = 0;
const failures = [];

for (const url of urls) {
  const path = url.replace(SITE, '');
  const htmlPath =
    path === '/' || path === ''
      ? join(DIST, 'index.html')
      : join(DIST, path.replace(/^\//, ''), 'index.html');

  if (existsSync(htmlPath)) {
    pass++;
  } else {
    fail++;
    failures.push({ url, htmlPath });
  }
}

console.log(`\n✅  Prerender verification complete`);
console.log(`   Checked : ${urls.length} URLs`);
console.log(`   Passing : ${pass}`);
console.log(`   Missing : ${fail}`);

// ── Phase 2 (task 2.4): verdict card parity ───────────────────────────────────
// Every tool page where the live site shows the verdict card must contain the card
// byte for byte (same component, same data). Every other tool page must not contain it.
// Also: a tool with verified facts must never publish schema price 0 unless a free plan is verified.
const ssr = await loadVerdictSsr();
const expectedSlugs = new Set(ssr.verdictCardSlugs());
const cardProblems = [];
const toolsDir = join(DIST, 'tools');
const toolSlugs = existsSync(toolsDir)
  ? readdirSync(toolsDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
  : [];

for (const slug of toolSlugs) {
  const file = join(toolsDir, slug, 'index.html');
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const hasCard = html.includes(`data-verdict-card="${slug}"`);
  if (expectedSlugs.has(slug)) {
    const expected = ssr.renderVerdictCardHtml(slug);
    if (!hasCard) cardProblems.push(`${slug}: verdict card missing from prerendered HTML`);
    else if (!html.includes(expected)) cardProblems.push(`${slug}: verdict card differs from the live component output`);
    if (!html.includes('Prices verified')) cardProblems.push(`${slug}: "Prices verified" date line missing`);
    const offer = ssr.verifiedOffer(slug);
    if (offer && offer.price !== null && !new RegExp(`"price"\\s*:\\s*"${offer.price}"`).test(html)) {
      cardProblems.push(`${slug}: JSON-LD price is not ${offer.price} (from verified facts)`);
    }
    if (offer && offer.price !== '0' && /"price"\s*:\s*"0"/.test(html)) {
      cardProblems.push(`${slug}: JSON-LD still says price 0 but there is no verified free plan`);
    }
  } else if (hasCard) {
    cardProblems.push(`${slug}: has a verdict card in HTML but the live page would not show one`);
  }
}
for (const slug of expectedSlugs) {
  if (!toolSlugs.includes(slug)) cardProblems.push(`${slug}: no prerendered tool page found`);
}

// ── Phase 3 (task 3.3): compare-page card parity ──────────────────────────────
// Every compare page where the live site shows the compare card must contain it byte for
// byte; every other compare page must not contain one.
const expectedCompare = new Set(ssr.compareCardSlugs());
const compareDir = join(DIST, 'compare');
const compareSlugs = existsSync(compareDir)
  ? readdirSync(compareDir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)
  : [];
for (const slug of compareSlugs) {
  const file = join(compareDir, slug, 'index.html');
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const hasCard = html.includes('data-compare-card="');
  if (expectedCompare.has(slug)) {
    if (!hasCard) cardProblems.push(`compare/${slug}: compare card missing from prerendered HTML`);
    else if (!html.includes(ssr.renderCompareCardHtml(slug))) cardProblems.push(`compare/${slug}: compare card differs from the live component output`);
    if (!html.includes('Prices verified') && !html.includes('date not verified')) cardProblems.push(`compare/${slug}: "Prices verified" date line missing`);
  } else if (hasCard) {
    cardProblems.push(`compare/${slug}: has a compare card in HTML but the live page would not show one`);
  }
}
for (const slug of expectedCompare) {
  if (!compareSlugs.includes(slug)) cardProblems.push(`compare/${slug}: no prerendered compare page found`);
}

// ── Phase 7: blog verdict-token parity ───────────────────────────────────────
const blogTokenProblems = [];
const blogDir = join(DIST, 'blog');
if (existsSync(blogDir)) {
  for (const entry of readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = join(blogDir, entry.name, 'index.html');
    if (!existsSync(file)) continue;
    const html = readFileSync(file, 'utf8');
    if (html.includes('{{verdict:')) blogTokenProblems.push(`${entry.name}: unresolved verdict token`);
  }
}

// ── Phase 4 (task 4.5): pricing tracker parity ────────────────────────────────
{
  const file = join(DIST, 'pricing-tracker', 'index.html');
  if (!existsSync(file)) cardProblems.push('pricing-tracker: no prerendered page found');
  else {
    const html = readFileSync(file, 'utf8');
    if (!html.includes(ssr.renderPricingTrackerHtml())) cardProblems.push('pricing-tracker: table differs from the live component output');
    if (!html.includes(`/pricing-tracker/</loc>`) && !readFileSync(SITEMAP, 'utf8').includes('/pricing-tracker/</loc>')) cardProblems.push('pricing-tracker: missing from sitemap.xml');
  }
}

// ── Phase 5 (task 5.7): voice calculator parity ──────────────────────────────
{
  const file = join(DIST, 'calculators', 'voice-cost', 'index.html');
  if (!existsSync(file)) cardProblems.push('calculators/voice-cost: no prerendered page found');
  else {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('data-voice-calculator')) cardProblems.push('calculators/voice-cost: calculator markup missing from prerendered HTML');
    if (!readFileSync(SITEMAP, 'utf8').includes('/calculators/voice-cost/</loc>')) cardProblems.push('calculators/voice-cost: missing from sitemap.xml');
  }
}

// ── Phase 6 (task 6.9): matcher parity ────────────────────────────────────────
{
  const file = join(DIST, 'find-ai-tool', 'index.html');
  if (!existsSync(file)) cardProblems.push('find-ai-tool: no prerendered page found');
  else {
    const html = readFileSync(file, 'utf8');
    if (!html.includes('data-tool-matcher')) cardProblems.push('find-ai-tool: matcher markup missing from prerendered HTML');
    if (!readFileSync(SITEMAP, 'utf8').includes('/find-ai-tool/</loc>')) cardProblems.push('find-ai-tool: missing from sitemap.xml');
  }
}

console.log(`\n   Verdict cards expected : ${expectedSlugs.size}`);
console.log(`   Compare cards expected : ${expectedCompare.size}`);
console.log(`   Card parity problems   : ${cardProblems.length}`);
console.log(`   Blog token problems     : ${blogTokenProblems.length}`);

if (cardProblems.length > 0) {
  console.log('\n❌  Card parity failures:');
  for (const msg of cardProblems) console.log(`   ${msg}`);
  process.exit(1);
}

if (blogTokenProblems.length > 0) {
  console.log('\n❌  Blog verdict-token failures:');
  for (const msg of blogTokenProblems) console.log(`   ${msg}`);
  process.exit(1);
}

if (failures.length > 0) {
  console.log('\n❌  Missing prerendered files:');
  for (const { url, htmlPath } of failures) {
    console.log(`   ${url}`);
    console.log(`   → expected: ${htmlPath}`);
  }
  process.exit(1);
} else {
  console.log('\n✅  All sitemap URLs have prerendered HTML files.\n');
}
