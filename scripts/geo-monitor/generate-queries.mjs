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

  const queries = [];
  let qid = 1;

  for (const [cat, catTools] of Object.entries(toolsByCat)) {
    const humanCat = humanCategory(cat);
    const clusterId = `cluster-${cat.toLowerCase()}`;

    CLUSTER_TEMPLATES.slice(0, PER_CLUSTER).forEach((tpl) => {
      queries.push({
        id: `q${qid++}`,
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
          id: `q${qid++}`,
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
        id: `q${qid++}`,
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
    queries.push({
      id: `q${qid++}`,
      cluster: `blog-${post.slug}`,
      category: post.category,
      query: naturalQuery,
      target_page_hint: `/blog/${post.slug}`,
      source: 'blog-title-template',
    });
  }

  return queries;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const queries = buildQueries();
  fs.writeFileSync(OUT_FILE, JSON.stringify({ generated_at: new Date().toISOString(), count: queries.length, queries }, null, 2));
  console.log(`✓ Generated ${queries.length} GEO test queries -> ${path.relative(ROOT, OUT_FILE)}`);
  console.log(`  Clusters: ${new Set(queries.map(q => q.cluster)).size}`);
  console.log(`  Edit this file by hand to add/remove specific prompts before running citation-test.mjs.`);
}

main();
