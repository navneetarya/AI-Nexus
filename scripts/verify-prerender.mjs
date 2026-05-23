// scripts/verify-prerender.mjs
// Verifies all URLs in sitemap.xml have corresponding prerendered HTML files in dist/.
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
