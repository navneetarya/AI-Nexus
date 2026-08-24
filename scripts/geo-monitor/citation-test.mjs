#!/usr/bin/env node
// AI Nexus GEO Monitor — Step 3: Real AI citation testing
//
// This is the part that actually answers "am I getting cited?" — it sends
// the generated queries to real AI engines and checks whether
// ainexustools.online shows up in the answer / citation list, and which
// competitors do instead.
//
// Engines supported (each is skipped gracefully if its API key env var is
// not set — you don't need all four to get value from this):
//   - OpenAI (ChatGPT web-search-enabled model)  -> OPENAI_API_KEY
//   - Anthropic (Claude, with web search tool)    -> ANTHROPIC_API_KEY
//   - Google (Gemini, with Google Search grounding)-> GOOGLE_API_KEY
//   - Perplexity (sonar, native web-grounded)      -> PERPLEXITY_API_KEY
//
// All four of these have a free/low-cost tier sufficient for a few hundred
// test queries a month. See README.md in this folder for how to get keys.
//
// Usage:
//   OPENAI_API_KEY=... ANTHROPIC_API_KEY=... node scripts/geo-monitor/citation-test.mjs
//   node scripts/geo-monitor/citation-test.mjs --limit 20     # test first 20 queries only
//   node scripts/geo-monitor/citation-test.mjs --engines openai,anthropic
//
// Output: scripts/geo-monitor/data/citation-results.json (+ .csv)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const QUERIES_FILE = path.join(DATA_DIR, 'queries.json');
const OUT_JSON = path.join(DATA_DIR, 'citation-results.json');
const OUT_CSV = path.join(DATA_DIR, 'citation-results.csv');

const DOMAIN = 'ainexustools.online';

const args = process.argv.slice(2);
function argVal(flag, def) {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : def;
}
const LIMIT = parseInt(argVal('--limit', '0'), 10) || Infinity;
const ENGINES_FLAG = argVal('--engines', null);
const DELAY_MS = parseInt(argVal('--delay-ms', '400'), 10);

const AVAILABLE_ENGINES = {
  openai: {
    name: 'ChatGPT (OpenAI)',
    keyEnv: 'OPENAI_API_KEY',
    async run(query, key) {
      const res = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          tools: [{ type: 'web_search' }],
          input: query,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const text = extractOpenAiText(data);
      const citedUrls = extractOpenAiCitations(data);
      return { text, citedUrls };
    },
  },
  anthropic: {
    name: 'Claude (Anthropic)',
    keyEnv: 'ANTHROPIC_API_KEY',
    async run(query, key) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          tools: [{ type: 'web_search_20250305', name: 'web_search' }],
          messages: [{ role: 'user', content: query }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n');
      const citedUrls = (data.content || [])
        .flatMap(b => b.citations || [])
        .concat((data.content || []).filter(b => b.type === 'text').flatMap(b => b.citations || []))
        .map(c => c.url).filter(Boolean);
      return { text, citedUrls };
    },
  },
  perplexity: {
    name: 'Perplexity (sonar)',
    keyEnv: 'PERPLEXITY_API_KEY',
    async run(query, key) {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar',
          messages: [{ role: 'user', content: query }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const text = data.choices?.[0]?.message?.content || '';
      const citedUrls = data.citations || [];
      return { text, citedUrls };
    },
  },
  gemini: {
    name: 'Gemini (Google)',
    keyEnv: 'GOOGLE_API_KEY',
    async run(query, key) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          tools: [{ google_search: {} }],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
      const text = (data.candidates?.[0]?.content?.parts || []).map(p => p.text).join('\n');
      const chunks = data.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const citedUrls = chunks.map(c => c.web?.uri).filter(Boolean);
      return { text, citedUrls };
    },
  },
};

function extractOpenAiText(data) {
  if (data.output_text) return data.output_text;
  return (data.output || [])
    .flatMap(o => o.content || [])
    .filter(c => c.type === 'output_text')
    .map(c => c.text)
    .join('\n');
}
function extractOpenAiCitations(data) {
  return (data.output || [])
    .flatMap(o => o.content || [])
    .flatMap(c => c.annotations || [])
    .map(a => a.url)
    .filter(Boolean);
}

function domainMentioned(text, citedUrls) {
  const inText = text.toLowerCase().includes(DOMAIN) || text.toLowerCase().includes('ai nexus');
  const inCitations = citedUrls.some(u => u && u.toLowerCase().includes(DOMAIN));
  return { inText, inCitations, cited: inText || inCitations };
}

function extractCompetitorDomains(citedUrls) {
  const domains = citedUrls
    .map(u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return null; } })
    .filter(d => d && d !== DOMAIN);
  return [...new Set(domains)];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  if (!fs.existsSync(QUERIES_FILE)) {
    console.error(`✗ ${path.relative(process.cwd(), QUERIES_FILE)} not found. Run generate-queries.mjs first.`);
    process.exit(1);
  }
  const { queries } = JSON.parse(fs.readFileSync(QUERIES_FILE, 'utf-8'));
  const testSet = queries.slice(0, LIMIT);

  const requestedEngines = ENGINES_FLAG ? ENGINES_FLAG.split(',').map(s => s.trim()) : Object.keys(AVAILABLE_ENGINES);
  const activeEngines = requestedEngines
    .filter(e => AVAILABLE_ENGINES[e])
    .map(e => ({ id: e, ...AVAILABLE_ENGINES[e], key: process.env[AVAILABLE_ENGINES[e].keyEnv] }))
    .filter(e => {
      if (!e.key) {
        console.log(`⚠ Skipping ${e.name} — ${e.keyEnv} not set`);
        return false;
      }
      return true;
    });

  if (!activeEngines.length) {
    console.error('\n✗ No engine API keys found in the environment. Set at least one of:');
    Object.values(AVAILABLE_ENGINES).forEach(e => console.error(`    ${e.keyEnv}`));
    console.error('\nSee scripts/geo-monitor/README.md for how to get free-tier keys.');
    process.exit(1);
  }

  console.log(`Testing ${testSet.length} queries across ${activeEngines.length} engine(s): ${activeEngines.map(e => e.name).join(', ')}\n`);

  const results = [];
  let doneCount = 0;
  for (const q of testSet) {
    for (const engine of activeEngines) {
      try {
        const { text, citedUrls } = await engine.run(q.query, engine.key);
        const mention = domainMentioned(text, citedUrls);
        results.push({
          query_id: q.id,
          query: q.query,
          cluster: q.cluster,
          category: q.category,
          target_page_hint: q.target_page_hint,
          engine: engine.id,
          engine_name: engine.name,
          cited: mention.cited,
          cited_in_text: mention.inText,
          cited_in_sources: mention.inCitations,
          competitor_domains: extractCompetitorDomains(citedUrls).join(' | '),
          answer_excerpt: text.slice(0, 220).replace(/\n/g, ' '),
        });
      } catch (err) {
        results.push({
          query_id: q.id, query: q.query, cluster: q.cluster, category: q.category,
          target_page_hint: q.target_page_hint, engine: engine.id, engine_name: engine.name,
          cited: false, cited_in_text: false, cited_in_sources: false,
          competitor_domains: '', answer_excerpt: '', error: String(err.message || err),
        });
      }
      await sleep(DELAY_MS);
    }
    doneCount++;
    if (doneCount % 10 === 0) console.log(`  ...${doneCount}/${testSet.length} queries done`);
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify({ generated_at: new Date().toISOString(), engines: activeEngines.map(e => e.id), results }, null, 2));

  const csvHeader = 'query_id,query,cluster,category,engine,cited,competitor_domains,target_page_hint\n';
  const csvRows = results.map(r => [
    r.query_id, `"${(r.query || '').replace(/"/g, '""')}"`, r.cluster, r.category, r.engine,
    r.cited, `"${(r.competitor_domains || '').replace(/"/g, '""')}"`, r.target_page_hint,
  ].join(','));
  fs.writeFileSync(OUT_CSV, csvHeader + csvRows.join('\n'));

  const citedCount = results.filter(r => r.cited).length;
  console.log(`\n✓ Done. Cited in ${citedCount}/${results.length} (query × engine) tests (${Math.round(100 * citedCount / results.length)}%).`);
  console.log(`✓ JSON -> ${path.relative(process.cwd(), OUT_JSON)}`);
  console.log(`✓ CSV  -> ${path.relative(process.cwd(), OUT_CSV)}`);
}

main();
