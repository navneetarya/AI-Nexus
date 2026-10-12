#!/usr/bin/env node
// AI Nexus GEO Monitor — Step 1: Query generator
//
// Reads the site's own content graph (constants.ts TOOLS + blog/metadata.ts)
// and produces a realistic set of "would an AI engine cite us for this?"
// prompts — the kind of thing a real user types into ChatGPT/Perplexity/
// Gemini/Claude, not generic head-term keywords.
//
// Usage:
//   node scripts/geo-monitor/generate-queries.mjs
//   node scripts/geo-monitor/generate-queries.mjs --per-cluster 8
//   node scripts/geo-monitor/generate-queries.mjs --priority-only   # only the GA-priority posts
//
// ORDER MATTERS: citation-test.mjs --limit N tests the FIRST N queries. The old order put
// every /category/* and /compare/* query first, so a --limit 60 run never reached a blog post
// (0/60 citations, all against category/compare pages). Blog-post queries now come first,
// GA-priority posts at the very top, so a small --limit run tests the pages that matter.
//
// Output: scripts/geo-monitor/data/queries.json
//
// You can also hand-edit queries.json afterwards — the citation tester just
// reads whatever is in that file. Re-running this script overwrites it, so
// copy out any hand-added queries you want to keep first (or keep a
// queries.custom.json alongside it — see README).

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = path.join(__dirname, 'data');
const OUT_FILE = path.join(OUT_DIR, 'queries.json');

const args = process.argv.slice(2);
const perClusterFlag = args.indexOf('--per-cluster');
const PER_CLUSTER = perClusterFlag !== -1 ? parseInt(args[perClusterFlag + 1], 10) : 6;
const PRIORITY_ONLY = args.includes('--priority-only');
const CUSTOM_FILE = path.join(OUT_DIR, 'queries.custom.json');

// Posts that GA shows AI assistants already send traffic to, plus the posts being reworked in
// the Oct 2026 conversion plan. Queries are phrased the way a person asks an AI assistant;
// each one maps to a question the post actually answers. Edit freely: these are test prompts,
// not claims. Slugs must exist in blog/metadata.ts (checked at run time).
const PRIORITY_POSTS = {
  'best-ai-presentation-tools-2026': [
    'What are the best AI presentation makers in 2026?',
    'Gamma vs other AI presentation tools: which one should I use?',
    'Is there a free AI tool that makes PowerPoint slides from a prompt?',
    'Which AI presentation tool is best for a business pitch deck?',
  ],
  'best-ai-headshot-tools-linkedin-2026': [
    'What is the best AI headshot generator for LinkedIn?',
    'Are AI headshots good enough for a professional LinkedIn profile?',
    'HeadshotPro vs Aragon vs BetterPic: which AI headshot tool is best?',
    'Which AI headshot generators have a refund policy?',
  ],
  'best-ai-agents-for-small-business-2026': [
    'What are the best AI agents for a small business in 2026?',
    'Which AI agent platform is easiest for a non-technical small business owner?',
    'Can a small business automate customer support and lead follow-up with AI agents?',
  ],
  'relevance-ai-vs-lindy-vs-gumloop-2026': [
    'Relevance AI vs Lindy vs Gumloop: which is better?',
    'Lindy vs Gumloop for no-code AI workflows',
    'Is Relevance AI worth it for building AI agents without code?',
  ],
  'best-ai-music-generator-tools-2026': [
    'What is the best AI music generator in 2026?',
    'Can I use Suno or Udio music commercially?',
    'Which AI music generator is safe to use for YouTube videos?',
  ],
  'best-ai-voice-generators-2026': [
    'What is the best AI voice generator in 2026?',
    'ElevenLabs vs Murf: which AI voice generator should I choose?',
    'Do free AI voice generators allow commercial use?',
  ],
  'ai-tools-for-solopreneurs-2026': [
    'What AI tools should a solopreneur use in 2026?',
  ],
};

function readText(p) {
  return fs.readFileSync(p, 'utf-8');
}

// ── Extract TOOLS array from constants.ts (regex, not a TS parser — this repo's
//    convention is stable single-quoted/double-quoted string literals) ──
function extractTools() {
  const src = readText(path.join(ROOT, 'constants.ts'));
  const tools = [];
  // Matches each tool object's key fields loosely — good enough for query gen.
  const blockRe = /slug:\s*'([^']+)'[\s\S]{0,20}?\n?\s*name:\s*'([^']+)',\s*tagline:\s*'([^']+)'[\s\S]{0,400}?category:\s*Category\.(\w+)/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    tools.push({ slug: m[1], name: m[2], tagline: m[3], category: m[4] });
  }
  return tools;
}

function extractBlogPosts() {
  const src = readText(path.join(ROOT, 'blog', 'metadata.ts'));
  const posts = [];
  const objRe = /\{\s*"slug":\s*"([^"]+)",\s*"title":\s*"([^"]+)"[\s\S]*?"category":\s*"([^"]+)"/g;
  let m;
  while ((m = objRe.exec(src)) !== null) {
    posts.push({ slug: m[1], title: m[2], category: m[3] });
  }
  return posts;
}

function groupByCategory(items) {
  const map = {};
  for (const it of items) {
    map[it.category] = map[it.category] || [];
    map[it.category].push(it);
  }
  return map;
}

// Natural-language query templates. Filled per cluster/tool. Mirrors the
// kind of prompt a real user types into an AI answer engine — not SEO
// keyword-stuffing.
const CLUSTER_TEMPLATES = [
  (c) => `What are the best AI ${c} tools in 2026?`,
  (c) => `Best AI ${c} tool for beginners?`,
  (c) => `Which AI ${c} tool is worth paying for?`,
  (c) => `Cheapest AI ${c} tool with a free plan?`,
  (c) => `What AI ${c} tool should a small business use?`,
  (c) => `Best AI ${c} tool for solopreneurs and freelancers?`,
];

const TOOL_TEMPLATES = [
  (name) => `Is ${name} worth it in 2026?`,
  (name) => `${name} pricing and features — is it good?`,
  (name) => `What are alternatives to ${name}?`,
  (name) => `${name} review — pros and cons?`,
];

function humanCategory(catKey) {
  // Category enum values are usually UPPER_SNAKE or Title-ish; keep it simple.
  return catKey
    .toLowerCase()
    .replace(/_/g, ' ');
}

function buildQueries() {
  const tools = extractTools();
  const posts = extractBlogPosts();
  const toolsByCat = groupByCategory(tools);

  const priorityQs = [];
  const blogQs = [];
  const queries = []; // cluster / tool / comparison queries (appended last)
  const knownSlugs = new Set(posts.map((p) => p.slug));

  // 1) GA-priority posts: hand-phrased queries, tested first.
  for (const [slug, qs] of Object.entries(PRIORITY_POSTS)) {
    if (!knownSlugs.has(slug)) {
      console.warn(`  ! priority slug not found in blog/metadata.ts, skipped: ${slug}`);
      continue;
    }
    const post = posts.find((p) => p.slug === slug);
    qs.forEach((q) =>
      priorityQs.push({
        cluster: `blog-${slug}`,
        category: post.category,
        query: q,
        target_page_hint: `/blog/${slug}`,
        source: 'priority-post',
        priority: true,
      })
    );
  }

  for (const [cat, catTools] of Object.entries(toolsByCat)) {
    const humanCat = humanCategory(cat);
    const clusterId = `cluster-${cat.toLowerCase()}`;

    CLUSTER_TEMPLATES.slice(0, PER_CLUSTER).forEach((tpl) => {
      queries.push({
        cluster: clusterId,
        category: humanCat,
        query: tpl(humanCat),
        target_page_hint: `/category/${cat.toLowerCase()}`,
        source: 'cluster-template',
      });
    });

    // Add 1-2 tool-specific queries per top tool in the cluster (first 2 tools).
    catTools.slice(0, 2).forEach((tool) => {
      TOOL_TEMPLATES.slice(0, 2).forEach((tpl) => {
        queries.push({
            cluster: clusterId,
          category: humanCat,
          query: tpl(tool.name),
          target_page_hint: `/tools/${tool.slug}`,
          source: 'tool-template',
        });
      });
    });

    // "X vs Y" comparison queries for the top 2 tools in a cluster.
    if (catTools.length >= 2) {
      queries.push({
        cluster: clusterId,
        category: humanCat,
        query: `${catTools[0].name} vs ${catTools[1].name} — which is better?`,
        target_page_hint: `/compare/${catTools[0].slug}-vs-${catTools[1].slug}`,
        source: 'comparison-template',
      });
    }
  }

  // Blog-post-derived queries: turn the title into a natural question when
  // it already reads like one ("Best AI Voice Generators for Podcasts 2026"
  // -> "What are the best AI voice generators for podcasts?").
  for (const post of posts) {
    // Strip trailing year/colon subtitle noise: "Best AI Voice Generators for
    // Podcasts 2026: Intros, Fixes & Dubbing" -> "Best AI Voice Generators for Podcasts"
    const cleanTitle = post.title.split(':')[0].replace(/\s*20\d{2}\s*$/, '').trim();
    const naturalQuery = /^best\s/i.test(cleanTitle)
      ? `What are the ${cleanTitle}?`
      : `What is the ${cleanTitle}?`;
    blogQs.push({
      cluster: `blog-${post.slug}`,
      category: post.category,
      query: naturalQuery,
      target_page_hint: `/blog/${post.slug}`,
      source: 'blog-title-template',
    });
  }

  // Optional hand-kept additions (see README): data/queries.custom.json = { "queries": [ {query, target_page_hint, ...} ] }
  let customQs = [];
  if (fs.existsSync(CUSTOM_FILE)) {
    try {
      const raw = JSON.parse(readText(CUSTOM_FILE));
      customQs = (Array.isArray(raw) ? raw : raw.queries || []).map((q) => ({
        cluster: q.cluster || 'custom',
        category: q.category || 'custom',
        source: 'custom',
        ...q,
      }));
    } catch (e) {
      console.warn(`  ! could not read queries.custom.json: ${e.message}`);
    }
  }

  // Order: priority posts -> custom -> other blog posts -> cluster/tool/comparison.
  // Drop exact-duplicate query text (a priority query can match a title-derived one).
  const seen = new Set();
  const ordered = (PRIORITY_ONLY ? [...priorityQs] : [...priorityQs, ...customQs, ...blogQs, ...queries]).filter((q) => {
    const k = q.query.trim().toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  return ordered.map((q, i) => ({ id: `q${i + 1}`, ...q }));
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const queries = buildQueries();
  fs.writeFileSync(OUT_FILE, JSON.stringify({ generated_at: new Date().toISOString(), count: queries.length, queries }, null, 2));
  console.log(`✓ Generated ${queries.length} GEO test queries -> ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`  Priority-post queries (tested first): ${queries.filter((q) => q.priority).length}`);
  console.log(`  Clusters: ${new Set(queries.map(q => q.cluster)).size}`);
  console.log(`  Edit this file by hand to add/remove specific prompts before running citation-test.mjs.`);
}

main();
