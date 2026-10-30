// scripts/check-homepage-sections.mjs  (T6.1)
//
// Guardrail, no browser needed. Run after `npm run build`:
//   node scripts/check-homepage-sections.mjs
//
// Homepage: every <section id="..."> in dist/index.html must have a matching id in
// data/homepage-content.json, or be on the short allow-list below (sections the React homepage builds
// itself). So a section added only in scripts/prerender.mjs fails the build: crawlers would see it,
// readers would not.
// Category pages: every <h2> in dist/<category>/index.html must come from data/category-content.json.
//
// Exit code 1 on any problem.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Sections that exist in React under their own headings (pages/HomePage.tsx), not in the JSON. */
export const HOME_ALLOW_LIST = ['start-here', 'compare-tools', 'ai-blog-guides'];

/** Fixed category headings (scripts/category-content.mjs). Intro h2s come from the JSON. */
export const CATEGORY_FIXED_H2 = [
  'Key takeaways', 'A closer look at each tool', 'Pricing at a glance', 'Common mistakes to avoid', 'Frequently asked questions',
];

const decode = s => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/\s+/g, ' ').trim();

export function staticSectionIds(html) {
  return [...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(m => m[1]);
}

/** Problems for the homepage: ids only in the static HTML, and JSON sections missing from it. */
export function homepageProblems(html, jsonIds, allow = HOME_ALLOW_LIST) {
  const found = staticSectionIds(html);
  const problems = [];
  for (const id of found) {
    if (!jsonIds.includes(id) && !allow.includes(id)) {
      problems.push(`homepage: <section id="${id}"> exists only in the static HTML. Add it to data/homepage-content.json (so React shows it too) or to the allow-list in scripts/check-homepage-sections.mjs.`);
    }
  }
  for (const id of jsonIds) {
    if (!found.includes(id)) problems.push(`homepage: data/homepage-content.json section "${id}" is missing from dist/index.html.`);
  }
  return problems;
}

/** Problems for one category page: <h2>s the JSON does not explain. */
export function categoryProblems(slug, html, categoryJson) {
  const allowed = new Set([...CATEGORY_FIXED_H2, ...categoryJson.intro.filter(b => b.type === 'h2').map(b => decode(b.text.replace(/\]\([^)]*\)/g, '').replace(/\[/g, '')))]);
  const problems = [];
  const seen = [];
  for (const m of html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)) {
    const h = decode(m[1]);
    seen.push(h);
    if (!allowed.has(h)) problems.push(`${slug}: <h2>${h}</h2> exists only in the static HTML. Add it to data/category-content.json.`);
  }
  for (const h of allowed) if (!seen.includes(h)) problems.push(`${slug}: heading "${h}" from data/category-content.json is missing from the static HTML.`);
  return problems;
}

function main() {
  const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const DIST = path.join(ROOT, 'dist');
  const read = p => fs.readFileSync(p, 'utf8');
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    console.error('❌  dist/index.html not found. Run `npm run build` first.');
    process.exit(1);
  }
  const home = JSON.parse(read(path.join(ROOT, 'data', 'homepage-content.json')));
  const cats = JSON.parse(read(path.join(ROOT, 'data', 'category-content.json')));
  const problems = homepageProblems(read(path.join(DIST, 'index.html')), home.sections.map(s => s.id));
  for (const [slug, cat] of Object.entries(cats.categories)) {
    const file = path.join(DIST, slug, 'index.html');
    if (!fs.existsSync(file)) { problems.push(`${slug}: no prerendered page in dist/.`); continue; }
    problems.push(...categoryProblems(slug, read(file), cat));
  }
  console.log(`── Static vs JSON section check: homepage (${home.sections.length} JSON sections + ${HOME_ALLOW_LIST.length} allow-listed), ${Object.keys(cats.categories).length} category pages ──`);
  if (problems.length) {
    console.log('\n❌  Static HTML and shared JSON disagree:');
    for (const p of problems) console.log(`   ${p}`);
    process.exit(1);
  }
  console.log('✅  Every static section has a matching JSON entry.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
