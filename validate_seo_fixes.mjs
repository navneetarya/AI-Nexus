#!/usr/bin/env node
import fs from 'fs';

const mjs = fs.readFileSync('scripts/prerender.mjs', 'utf8');
const html = fs.readFileSync('index.html', 'utf8');

let pass = 0, fail = 0;
function check(name, condition) {
  if (condition) { console.log(`  ✓ PASS: ${name}`); pass++; }
  else { console.log(`  ✗ FAIL: ${name}`); fail++; }
}

console.log('\n=== SEO AUDIT FIX VALIDATION ===\n');

// CRITICAL #1: BLOG_CANONICAL_OVERRIDES must be empty
const overridesMatch = mjs.match(/BLOG_CANONICAL_OVERRIDES = \{([^}]*)\}/s);
const overridesContent = overridesMatch ? overridesMatch[1].trim() : 'NOT_FOUND';
check('CRITICAL #1: BLOG_CANONICAL_OVERRIDES is empty', overridesContent === '');

// CRITICAL #2: no compare page canonical pointing to blog
const hasClaudeHijack = mjs.includes("art.slug === 'claude-code-vs-github-copilot-vs-replit'");
check('CRITICAL #2: No compare page canonical hijack to blog', !hasClaudeHijack);

// CRITICAL #3: sitemap has /contact/, /privacy/, /compare/
check('CRITICAL #3a: /contact/ in sitemap', mjs.includes('/contact/'));
check('CRITICAL #3b: /privacy/ in sitemap', mjs.includes('/privacy/'));
check('CRITICAL #3c: /compare/ index in sitemap', mjs.includes('loc: `${SITE}/compare/`'));

// HIGH #4: no hardcoded reviewCount: '1'
check('HIGH #4a: No hardcoded reviewCount: 1', !mjs.includes("reviewCount: '1'"));
check('HIGH #4b: TRUSTPILOT_COUNTS map exists', mjs.includes('TRUSTPILOT_COUNTS'));
check('HIGH #4c: Uses TRUSTPILOT_COUNTS in schema', mjs.includes('TRUSTPILOT_COUNTS[tool.slug]'));

// HIGH #5: font preloads present
check('HIGH #5a: Fraunces 900 preloaded', html.includes('href="/fonts/fraunces-900.woff2"'));
check('HIGH #5b: Fraunces 700 preloaded', html.includes('href="/fonts/fraunces-700.woff2"'));

// HIGH #6: GA4 mobile delay reduced
check('HIGH #6a: Mobile delay is 1500ms', html.includes('? 1500 :'));
check('HIGH #6b: No 4000ms mobile delay', !html.includes('? 4000 :'));

// HIGH #7: og:type per page
check('HIGH #7a: og:type replacement in buildPage', mjs.includes('og:type'));
check('HIGH #7b: ogType param in buildPage signature', mjs.includes("ogType = 'website'"));
check('HIGH #7c: Blog posts use article type', mjs.includes("ogType: 'article'"));
check('HIGH #7d: Tool pages use product type', mjs.includes("ogType: 'product'"));

// MEDIUM: dead aggregateRatingSchema removed
check('MEDIUM: Dead aggregateRatingSchema function removed', !mjs.includes('function aggregateRatingSchema'));

// MEDIUM: static page dates use real dates, not TODAY
check('MEDIUM: Static pages use real dates', mjs.includes("mod: '2026-05-01'"));

console.log(`\n--- Results: ${pass} passed, ${fail} failed ---\n`);
process.exit(fail > 0 ? 1 : 0);
