# AI Nexus GEO Monitor

A free, self-hosted system that answers the actual question: **"When someone
asks ChatGPT/Claude/Perplexity/Gemini a question my content should answer,
does AI Nexus get cited — and if not, who does instead?"**

It runs entirely in this repo via GitHub Actions. No paid SaaS tool required.

## What it does

Four scripts, run in sequence:

| Step | Script | What it needs | What it produces |
|---|---|---|---|
| 1 | `generate-queries.mjs` | Nothing — reads `constants.ts` + `blog/metadata.ts` | `data/queries.json` — realistic test prompts per tool/category/blog cluster |
| 2 | `technical-audit.mjs` | Nothing — crawls the **live** site | `data/technical-audit.json` — crawlability, schema, entity, content-structure score |
| 3 | `citation-test.mjs` | At least one AI API key (see below) | `data/citation-results.json` + `.csv` — did each engine actually cite you, per query |
| 4 | `generate-report.mjs` | Output of steps 2 & 3 (either alone still works) | `reports/geo-report-<date>.md` — the opportunity table |

Step 2 (technical audit) works with **zero API keys** — it's pure crawling
and static analysis, same category of thing the free tools in the earlier
research (ToolsPivot, Citeme, Foglift, Juma, CheckGEOScore) do, just scoped
specifically to this repo's content and running for free on your own
schedule instead of a third-party dashboard.

Step 3 (citation testing) is the part that matters most and that generic
GEO-score tools don't really give you: it sends real prompts to real AI
engines and checks the real answer for your domain.

## Quick start

```bash
# 1. Generate test queries from current site content
node scripts/geo-monitor/generate-queries.mjs

# 2. Audit the live site (no keys needed)
node scripts/geo-monitor/technical-audit.mjs

# 3. Test AI citations (needs at least one key — see below)
ANTHROPIC_API_KEY=sk-ant-... node scripts/geo-monitor/citation-test.mjs --limit 30

# 4. Build the report
node scripts/geo-monitor/generate-report.mjs

# Read it:
cat scripts/geo-monitor/reports/latest.md
```

## Getting API keys (free-tier friendly)

You don't need all four — one is enough to start, add more later for
cross-engine comparison:

- **Anthropic (Claude)** — console.anthropic.com → API Keys. Pay-as-you-go;
  a 60-query test run costs a few cents with `claude-sonnet-4-6`.
- **OpenAI (ChatGPT)** — platform.openai.com → API Keys. Uses the
  `web_search` tool on `gpt-4o-mini`, cheap per call.
- **Perplexity** — perplexity.ai/settings/api. Perplexity's `sonar` model is
  natively web-grounded and cheap — arguably the single best-value engine to
  test against since Perplexity citation behavior transfers well as a proxy
  signal for AI-search visibility generally.
- **Google (Gemini)** — aistudio.google.com/apikey. Gemini has a genuinely
  free tier (rate-limited) — good for a no-cost baseline.

Set them as **repository secrets** (Settings → Secrets and variables →
Actions) so the scheduled GitHub Action can use them — see
`.github/workflows/geo-monitor.yml`. Never commit keys to the repo.

## Running it automatically

`.github/workflows/geo-monitor.yml` runs this on the 1st and 15th of each
month, and on demand from the Actions tab. It commits the dated report into
`scripts/geo-monitor/reports/` so you get a history of your citation rate
over time, and also uploads it as a downloadable workflow artifact.

Because the bot commits to `main`, and `deploy.yml` deploys on every push to
`main`, a GEO monitor run will also trigger a redeploy of the site. That's
harmless (same content, just rebuilds), but if you'd rather it didn't, add
`paths-ignore: ['scripts/geo-monitor/**']` to `deploy.yml`'s push trigger.

If no API keys are configured, the workflow still runs the technical audit
and produces a report — it just skips the citation-testing step and says so.

## Reading the report

The report has three parts:

1. **Technical GEO score** — crawlability (AI bot access in `robots.txt`),
   sitemap/llms.txt discovery, and per-page checks (schema, canonical tags,
   noindex leaks, heading structure, tables, author bylines). This is the
   "can an AI engine even parse and trust this page" layer.
2. **Opportunity table** — one row per test query: whether AI Nexus was
   cited, by which engine(s), which competitor domains got cited instead,
   and which of your pages should be the one winning that query. Sorted
   "Very High" (zero engines cite you) first.
3. **Recurring competitor domains** — who keeps showing up instead of you
   across many queries. That's your actual competitive set for GEO, which
   may be different from your SEO competitive set (expect to see G2, Zapier,
   TechRadar, PCMag-style aggregators and Reddit threads a lot — AI engines
   like sources with explicit comparisons and clear sourcing).

## Extending / editing queries by hand

`generate-queries.mjs` overwrites `data/queries.json` every time it runs.
If you've hand-tuned queries (e.g. added competitor comparison prompts you
know matter), either:

- keep a `data/queries.custom.json` with your additions and merge before
  running `citation-test.mjs`, or
- skip re-running `generate-queries.mjs` and edit `queries.json` directly —
  `citation-test.mjs` just reads whatever's there.

## Why not just use a GEO SaaS tool?

Third-party GEO checkers (ToolsPivot, Citeme, Foglift, Juma, CheckGEOScore,
etc.) are a fine second opinion, and worth running occasionally for
cross-validation. But they don't know your site's actual content graph
(which tool pages exist, which blog clusters you have), so their query sets
are generic. This system generates queries directly from `constants.ts` and
`blog/metadata.ts`, so as you publish new posts or add new tools, the next
run automatically tests queries relevant to that new content — no manual
query-list maintenance.
