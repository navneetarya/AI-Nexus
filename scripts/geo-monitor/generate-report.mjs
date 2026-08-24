#!/usr/bin/env node
// AI Nexus GEO Monitor — Step 4: Combine everything into one report
//
// Reads technical-audit.json + citation-results.json (whichever exist) and
// produces a single markdown report: overall scores, top technical fixes,
// and the opportunity table (query -> cited? -> competitors -> best page ->
// priority) that's the actual point of this whole system.
//
// Usage:
//   node scripts/geo-monitor/generate-report.mjs
//
// Output: scripts/geo-monitor/reports/geo-report-<date>.md

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const REPORTS_DIR = path.join(__dirname, 'reports');

function loadJson(p) {
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf-8')) : null;
}

function priorityFor(citedCount, engineCount) {
  const rate = engineCount ? citedCount / engineCount : 0;
  if (rate === 0) return 'Very High';
  if (rate < 0.5) return 'High';
  if (rate < 1) return 'Medium';
  return 'Covered';
}

function buildOpportunityTable(citation) {
  if (!citation) return null;
  // Group by query_id
  const byQuery = {};
  for (const r of citation.results) {
    byQuery[r.query_id] = byQuery[r.query_id] || { query: r.query, cluster: r.cluster, target_page_hint: r.target_page_hint, rows: [] };
    byQuery[r.query_id].rows.push(r);
  }
  const engineCount = citation.engines.length;
  const table = Object.values(byQuery).map(q => {
    const citedCount = q.rows.filter(r => r.cited).length;
    const competitors = [...new Set(q.rows.flatMap(r => (r.competitor_domains || '').split(' | ').filter(Boolean)))].slice(0, 5);
    return {
      query: q.query,
      target_page_hint: q.target_page_hint,
      cited_engines: q.rows.filter(r => r.cited).map(r => r.engine_name).join(', ') || '—',
      cited_rate: `${citedCount}/${engineCount}`,
      competitors: competitors.join(', ') || '—',
      priority: priorityFor(citedCount, engineCount),
    };
  });
  // Sort: Very High / High priority first
  const order = { 'Very High': 0, High: 1, Medium: 2, Covered: 3 };
  table.sort((a, b) => order[a.priority] - order[b.priority]);
  return table;
}

function mdEscape(s) {
  return String(s || '').replace(/\|/g, '\\|');
}

function main() {
  const technical = loadJson(path.join(DATA_DIR, 'technical-audit.json'));
  const citation = loadJson(path.join(DATA_DIR, 'citation-results.json'));

  if (!technical && !citation) {
    console.error('✗ No audit data found. Run technical-audit.mjs and/or citation-test.mjs first.');
    process.exit(1);
  }

  const dateStr = new Date().toISOString().slice(0, 10);
  let md = `# AI Nexus GEO Report — ${dateStr}\n\n`;

  if (technical) {
    md += `## Technical GEO score: ${technical.overall_score}/100\n\n`;
    md += `- Site-wide (robots.txt / sitemap / llms.txt): **${technical.site_wide.score}/100**\n`;
    md += `- Sampled pages average (${technical.pages_sampled} pages checked): **${technical.page_avg_score}/100**\n`;
    md += `- Sitemap URL count: ${technical.sitemap_url_count}\n\n`;

    if (technical.top_failures?.length) {
      md += `### Top technical issues to fix\n\n`;
      md += `| Issue | Weight | Detail |\n|---|---|---|\n`;
      technical.top_failures.forEach(f => {
        md += `| ${mdEscape(f.label)} | ${f.weight} | ${mdEscape(f.detail)} |\n`;
      });
      md += `\n`;
    } else {
      md += `No technical issues found in the checked areas — crawlability, schema, and llms.txt discovery all look solid.\n\n`;
    }
  } else {
    md += `## Technical GEO score\n\n_Not run this cycle. Run \`node scripts/geo-monitor/technical-audit.mjs\`._\n\n`;
  }

  if (citation) {
    const totalTests = citation.results.length;
    const citedTests = citation.results.filter(r => r.cited).length;
    md += `## AI citation test results\n\n`;
    md += `Tested against: **${citation.engines.join(', ')}**\n\n`;
    md += `- Overall citation rate: **${citedTests}/${totalTests}** (${Math.round(100 * citedTests / totalTests)}%) of query × engine tests cited AI Nexus\n\n`;

    const table = buildOpportunityTable(citation);
    const veryHigh = table.filter(t => t.priority === 'Very High').length;
    const high = table.filter(t => t.priority === 'High').length;
    md += `- ${veryHigh} queries: **zero engines** cite AI Nexus (Very High opportunity)\n`;
    md += `- ${high} queries: cited by **less than half** the tested engines (High opportunity)\n\n`;

    md += `### Opportunity table\n\n`;
    md += `| Query | AI Nexus cited by | Rate | Competitors cited | Target page | Opportunity |\n`;
    md += `|---|---|---|---|---|---|\n`;
    table.slice(0, 60).forEach(t => {
      md += `| ${mdEscape(t.query)} | ${mdEscape(t.cited_engines)} | ${t.cited_rate} | ${mdEscape(t.competitors)} | \`${t.target_page_hint}\` | ${t.priority} |\n`;
    });
    if (table.length > 60) md += `\n_(${table.length - 60} more rows in citation-results.csv)_\n`;
    md += `\n`;

    // Recurring competitor domains across all queries — tells you who to benchmark against.
    const domainCounts = {};
    citation.results.forEach(r => (r.competitor_domains || '').split(' | ').filter(Boolean).forEach(d => {
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    }));
    const topCompetitors = Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (topCompetitors.length) {
      md += `### Domains AI engines cite instead of you (most frequent first)\n\n`;
      md += `| Domain | Times cited across test queries |\n|---|---|\n`;
      topCompetitors.forEach(([d, c]) => { md += `| ${d} | ${c} |\n`; });
      md += `\n`;
    }
  } else {
    md += `## AI citation test results\n\n_Not run this cycle — no API keys configured, or \`citation-test.mjs\` hasn't been run. See scripts/geo-monitor/README.md._\n\n`;
  }

  md += `## Recommended next actions\n\n`;
  const actions = [];
  if (technical?.top_failures?.length) {
    actions.push(`Fix the ${technical.top_failures.length} technical issues listed above, highest weight first.`);
  }
  if (citation) {
    const table = buildOpportunityTable(citation);
    const veryHighQueries = table.filter(t => t.priority === 'Very High').slice(0, 5);
    if (veryHighQueries.length) {
      actions.push(`Rework/expand the pages behind these zero-citation queries first: ${veryHighQueries.map(t => `\`${t.target_page_hint}\``).join(', ')}. Add a direct-answer paragraph near the top, a comparison table, and clearly stated stats/pricing — that's what these engines are extracting from competitor pages.`);
    }
  }
  if (!actions.length) actions.push('Re-run this monitor after publishing new content to track score changes over time.');
  actions.forEach((a, i) => { md += `${i + 1}. ${a}\n`; });

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const outFile = path.join(REPORTS_DIR, `geo-report-${dateStr}.md`);
  fs.writeFileSync(outFile, md);
  // Also keep a stable "latest" pointer.
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.md'), md);

  console.log(`✓ Report written -> ${path.relative(path.resolve(__dirname, '../..'), outFile)}`);
  console.log(`✓ Also updated  -> scripts/geo-monitor/reports/latest.md`);
}

main();
