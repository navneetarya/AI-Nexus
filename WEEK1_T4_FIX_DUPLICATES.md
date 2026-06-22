# Week 1 Task 4: Fix Duplicate Page Titles

**Status:** Audit in Progress | **Days:** 3-4

---

## Objective

Identify and fix page title duplicates that:
1. Confuse Googlebot (which one should rank?)
2. Split link equity between similar pages
3. Reduce CTR if user sees identical titles in SERP

---

## Duplicate Title Audit

### Current Known Issues

Run grep search across all pages for duplicate seoTitle values:

```
Duplicates Found:

1. "Best AI Tools 2026" (category page)
   - /best-ai-tools/ (CategoryPage)
   - /best-free-ai-tools/ (CategoryPage)
   - /blog/best-ai-tools-in-india-2026/ (BlogPost)
   → Fix: Add differentiator (e.g., "Best AI Tools — India Edition", "Best Free AI Tools")

2. "AI Writing Tools" 
   - /blog/best-ai-writing-tools-2026/ (BlogPost)
   - /best-ai-writing-tools/ (CategoryPage)
   → Fix: Category vs Editorial clarity (category should link to blog)

3. "ChatGPT vs Claude" variations
   - /blog/chatgpt-free-vs-claude-free-vs-gemini-free-2026/
   - /blog/grok-4-vs-chatgpt-vs-claude-content-creators-2026/
   - /compare/chatgpt-vs-claude/
   → Risk: Medium (different angles, but confusing to Google)

4. Tool review pages
   - /tools/cursor/ + /blog/cursor-ai-review-2026/
   → Fix: Tool page title should be "Best [Tool] Review | Pricing | Free Plan"
            Blog should be "[Tool] Review 2026: [Unique Angle]"
```

### Systematic Check

For each category, verify no two pages have identical seoTitle:

- [ ] Writing tools (3 pages)
- [ ] Coding tools (4 pages)
- [ ] Email marketing (2 pages)
- [ ] Chatbots (4 pages)
- [ ] AI agents (2 pages)
- [ ] Image generators (3 pages)

---

## Duplicate Title Fixes

| Page | Current seoTitle | New seoTitle | Type | Priority |
|------|-----------------|-------------|------|----------|
| /best-ai-tools/ | (if exists) | Best AI Tools 2026 — 50+ Reviewed | Category | HIGH |
| /best-free-ai-tools/ | (if exists) | Best Free AI Tools 2026 — No CC Required | Category | HIGH |
| /blog/best-ai-tools-in-india-2026/ | Best AI Tools in India 2026 | Best AI Tools in India (2026) — Ranked by Indian Users | BlogPost | HIGH |
| /tools/cursor/ | (check) | Cursor AI — Pricing, Free Plan, Features Reviewed | ToolPage | MEDIUM |
| /tools/chatgpt/ | (check) | ChatGPT — Features, Pricing, Free Plan Compared | ToolPage | MEDIUM |
| /tools/claude-ai/ | (check) | Claude AI — Pricing, Free Plan, Capabilities | ToolPage | MEDIUM |

---

## Action Items

- [ ] Grep for duplicate seoTitle values in all *.ts files
- [ ] Document conflicts
- [ ] Update seoTitle for ~5-8 pages with duplicates
- [ ] Re-run build to verify no errors
- [ ] Gate: All pages have unique seoTitle? YES / NO

