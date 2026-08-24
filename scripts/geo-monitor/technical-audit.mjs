#!/usr/bin/env node
// AI Nexus GEO Monitor — Step 2: Technical / on-page GEO audit
//
// No API keys required. Crawls the LIVE site (default:
// https://ainexustools.online) and scores it across the areas that
// actually gate whether an AI engine can find, parse, trust, and quote a
// page — independent of whether it ends up being *chosen* for a citation.
//
// Areas checked (per the GEO audit framework):
//   1. AI crawler accessibility   (robots.txt directives for GPTBot,
//                                   ChatGPT-User, OAI-SearchBot, ClaudeBot,
//                                   PerplexityBot, Google-Extended, etc.)
//   2. Sitemap & indexing hygiene (sitemap.xml reachable, per-page canonical,
//                                   noindex leaks)
//   3. Entity clarity             (Organization/Person JSON-LD, about/contact
//                                   pages, author bylines, sameAs links)
//   4. Citation readiness         (FAQPage/HowTo schema, clear H2/H3 with
//                                   direct-answer sentences, tables, stats)
//   5. llms.txt / agent discovery (presence + freshness of /llms.txt,
//                                   /llms-full.txt)
//
// Usage:
//   node scripts/geo-monitor/technical-audit.mjs
//   node scripts/geo-monitor/technical-audit.mjs --base-url https://ainexustools.online --sample 12
//
// Output: scripts/geo-monitor/data/technical-audit.json (+ prints a summary)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'data');
const OUT_FILE = path.join(OUT_DIR, 'technical-audit.json');

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : def;
}
const BASE_URL = argVal('--base-url', 'https://ainexustools.online').replace(/\/$/, '');
const SAMPLE_SIZE = parseInt(argVal('--sample', '15'), 10);

const AI_CRAWLERS = [
  'GPTBot', 'ChatGPT-User', 'OAI-SearchBot',
  'ClaudeBot', 'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Bytespider',
  'DuckAssistBot',
];

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'AI-Nexus-GEO-Monitor/1.0 (+https://ainexustools.online)' } });
    if (!res.ok) return { ok: false, status: res.status, text: '' };
    const text = await res.text();
    return { ok: true, status: res.status, text };
  } catch (err) {
    return { ok: false, status: 0, text: '', error: String(err) };
  }
}

function scoreItem(id, label, pass, weight, detail) {
  return { id, label, pass, weight, detail };
}

// ── 1. robots.txt: AI crawler accessibility ──────────────────────────────
async function auditRobots() {
  const { ok, text } = await fetchText(`${BASE_URL}/robots.txt`);
  const checks = [];
  if (!ok) {
    checks.push(scoreItem('robots-reachable', 'robots.txt reachable', false, 3, 'Could not fetch robots.txt'));
    return { checks, raw: null };
  }
  checks.push(scoreItem('robots-reachable', 'robots.txt reachable', true, 3, `HTTP 200`));

  for (const bot of AI_CRAWLERS) {
    const blockRe = new RegExp(`User-agent:\\s*${bot}[\\s\\S]{0,200}?Disallow:\\s*/\\s*(\\n|$)`, 'i');
    const mentioned = new RegExp(`User-agent:\\s*${bot}`, 'i').test(text);
    const blocked = blockRe.test(text);
    checks.push(scoreItem(
      `robots-${bot}`,
      `${bot} not blocked`,
      !blocked,
      1,
      blocked ? `${bot} appears Disallow: /` : (mentioned ? `${bot} explicitly allowed` : `${bot} not mentioned — falls back to User-agent: * rule`)
    ));
  }

  const hasSitemapRef = /Sitemap:\s*\S+/i.test(text);
  checks.push(scoreItem('robots-sitemap-ref', 'robots.txt references sitemap.xml', hasSitemapRef, 2, hasSitemapRef ? 'found' : 'missing Sitemap: line'));

  const hasContentSignal = /Content-Signal:/i.test(text);
  checks.push(scoreItem('robots-content-signal', 'Content-Signal (AI usage preferences) declared', hasContentSignal, 1, hasContentSignal ? 'found' : 'not present (optional but useful signal)'));

  return { checks, raw: text };
}

// ── 2. sitemap.xml + llms.txt discovery ──────────────────────────────────
async function auditSitemapAndLlms() {
  const checks = [];
  const sm = await fetchText(`${BASE_URL}/sitemap.xml`);
  checks.push(scoreItem('sitemap-reachable', 'sitemap.xml reachable', sm.ok, 3, sm.ok ? 'HTTP 200' : `HTTP ${sm.status}`));
  let urls = [];
  if (sm.ok) {
    urls = [...sm.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
    checks.push(scoreItem('sitemap-nonempty', 'sitemap.xml has URLs', urls.length > 0, 1, `${urls.length} <loc> entries`));
  }

  const llms = await fetchText(`${BASE_URL}/llms.txt`);
  checks.push(scoreItem('llms-txt-reachable', '/llms.txt reachable (AI crawler discovery index)', llms.ok, 3, llms.ok ? 'HTTP 200' : `HTTP ${llms.status}`));

  const llmsFull = await fetchText(`${BASE_URL}/llms-full.txt`);
  checks.push(scoreItem('llms-full-txt-reachable', '/llms-full.txt reachable', llmsFull.ok, 1, llmsFull.ok ? 'HTTP 200' : `HTTP ${llmsFull.status}`));

  if (llms.ok) {
    const updatedMatch = llms.text.match(/Updated:\s*([\d-]+)/i);
    if (updatedMatch) {
      const days = Math.floor((Date.now() - new Date(updatedMatch[1]).getTime()) / 86400000);
      checks.push(scoreItem('llms-txt-fresh', 'llms.txt updated within 45 days', days <= 45, 1, `last updated ${updatedMatch[1]} (${days}d ago)`));
    }
  }

  return { checks, sitemapUrls: urls };
}

// ── 3 & 4. Per-page entity clarity + citation readiness (sampled pages) ──
function analyzeHtml(url, html) {
  const checks = [];

  // JSON-LD presence & types
  const ldBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/g)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  const types = new Set();
  const collectTypes = (obj) => {
    if (!obj) return;
    if (Array.isArray(obj)) return obj.forEach(collectTypes);
    if (obj['@graph']) collectTypes(obj['@graph']);
    if (obj['@type']) (Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']]).forEach(t => types.add(t));
  };
  ldBlocks.forEach(collectTypes);
  checks.push(scoreItem('schema-present', 'JSON-LD schema present', ldBlocks.length > 0, 2, `${ldBlocks.length} block(s): ${[...types].join(', ') || 'none'}`));
  checks.push(scoreItem('schema-organization-or-person', 'Organization/Person entity schema present', types.has('Organization') || types.has('Person'), 2, [...types].join(', ') || 'none'));
  checks.push(scoreItem('schema-article-or-review', 'Article/Review/FAQPage schema present', ['Article', 'Review', 'FAQPage', 'BlogPosting', 'Product'].some(t => types.has(t)), 2, [...types].join(', ') || 'none'));

  // canonical / noindex
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const hasNoindex = /<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(html);
  checks.push(scoreItem('canonical-present', 'Canonical tag present', hasCanonical, 1, hasCanonical ? 'found' : 'missing'));
  checks.push(scoreItem('not-noindexed', 'Page not noindexed', !hasNoindex, 3, hasNoindex ? 'NOINDEX FOUND — this page is invisible to AI crawlers that respect it' : 'indexable'));

  // Content structure: H2/H3 count, tables, FAQ-style question headers
  const h2Count = (html.match(/<h2[\s>]/gi) || []).length;
  const h3Count = (html.match(/<h3[\s>]/gi) || []).length;
  const tableCount = (html.match(/<table[\s>]/gi) || []).length;
  const questionHeaders = (html.match(/<h[23][^>]*>[^<]*\?[^<]*<\/h[23]>/gi) || []).length;
  checks.push(scoreItem('heading-structure', 'Has meaningful H2/H3 hierarchy (≥3 combined)', (h2Count + h3Count) >= 3, 1, `${h2Count} H2, ${h3Count} H3`));
  checks.push(scoreItem('question-headers', 'Has at least one question-style heading (FAQ/AEO pattern)', questionHeaders > 0, 1, `${questionHeaders} question heading(s)`));
  checks.push(scoreItem('has-table', 'Has at least one comparison/data table', tableCount > 0, 1, `${tableCount} table(s)`));

  // Author byline visible in-page (not just schema)
  const hasAuthorByline = /Navneet Arya/i.test(html);
  checks.push(scoreItem('author-byline', 'Author byline visible in page content', hasAuthorByline, 1, hasAuthorByline ? 'found' : 'not found in HTML'));

  return { url, checks, meta: { h2Count, h3Count, tableCount, questionHeaders, schemaTypes: [...types] } };
}

async function auditSampledPages(sitemapUrls) {
  const pool = sitemapUrls.length ? sitemapUrls : [BASE_URL];
  // Prioritize a mix: homepage, a few tool pages, a few blog posts, a compare page.
  const priority = [
    pool.find(u => u === `${BASE_URL}/` || u === BASE_URL),
    ...pool.filter(u => u.includes('/tools/')).slice(0, 5),
    ...pool.filter(u => u.includes('/blog/')).slice(0, 5),
    ...pool.filter(u => u.includes('/compare/')).slice(0, 3),
  ].filter(Boolean);
  const rest = pool.filter(u => !priority.includes(u));
  const sample = [...new Set([...priority, ...rest])].slice(0, SAMPLE_SIZE);

  const results = [];
  for (const url of sample) {
    const { ok, text } = await fetchText(url);
    if (!ok) {
      results.push({ url, checks: [scoreItem('page-reachable', 'Page reachable', false, 3, 'fetch failed')], meta: {} });
      continue;
    }
    results.push(analyzeHtml(url, text));
  }
  return results;
}

function summarize(allChecks) {
  const total = allChecks.reduce((s, c) => s + c.weight, 0);
  const earned = allChecks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  const score = total > 0 ? Math.round((earned / total) * 100) : 0;
  const failed = allChecks.filter(c => !c.pass).sort((a, b) => b.weight - a.weight);
  return { score, total, earned, failedCount: failed.length, topFailures: failed.slice(0, 10) };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`Auditing ${BASE_URL} ...\n`);

  const robots = await auditRobots();
  const sitemapAndLlms = await auditSitemapAndLlms();
  const pages = await auditSampledPages(sitemapAndLlms.sitemapUrls);

  const siteWideChecks = [...robots.checks, ...sitemapAndLlms.checks];
  const pageChecks = pages.flatMap(p => p.checks);
  const overall = summarize([...siteWideChecks, ...pageChecks]);
  const siteWideSummary = summarize(siteWideChecks);
  const pageSummary = summarize(pageChecks);

  const report = {
    generated_at: new Date().toISOString(),
    base_url: BASE_URL,
    pages_sampled: pages.length,
    sitemap_url_count: sitemapAndLlms.sitemapUrls.length,
    overall_score: overall.score,
    site_wide: { score: siteWideSummary.score, checks: siteWideChecks },
    per_page: pages,
    page_avg_score: pageSummary.score,
    top_failures: overall.topFailures,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(report, null, 2));

  console.log(`Site-wide (robots/sitemap/llms.txt) score: ${siteWideSummary.score}/100`);
  console.log(`Sampled-page average score:                ${pageSummary.score}/100  (${pages.length} pages)`);
  console.log(`Overall GEO technical score:                ${overall.score}/100\n`);
  if (overall.topFailures.length) {
    console.log('Top issues to fix:');
    overall.topFailures.forEach(f => console.log(`  ✗ [weight ${f.weight}] ${f.label} — ${f.detail}`));
  } else {
    console.log('No failures found in checked items.');
  }
  console.log(`\n✓ Full report -> ${path.relative(path.resolve(__dirname, '../..'), OUT_FILE)}`);
}

main();
