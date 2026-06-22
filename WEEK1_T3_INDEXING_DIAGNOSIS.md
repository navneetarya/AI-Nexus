# Week 1 Task 3: Indexing Diagnosis (Root Cause Analysis)

**Status:** In Progress | **Days:** 2-3 | **Gate:** Identify root cause before submitting URLs

---

## Phase 1: Verify Core Infrastructure

### 1. Robots.txt Check

- [ ] Verify `/public/robots.txt` exists and allows Googlebot
- [ ] Confirm `Allow: /` (no broad disallow)
- [ ] Verify no noindex on main paths

### 2. Sitemap.xml Validation

- [ ] Verify `/public/sitemap.xml` is XML valid
- [ ] Count URLs (expected 135)
- [ ] Check for duplicate entries
- [ ] Verify all blog, tool, and compare pages included
- [ ] Check lastmod dates are recent (2026-06-xx)

### 3. Canonical URL Check

- [ ] Sample 5 pages: verify each has `<link rel="canonical" href="https://ainexustools.online/[path]/">`
- [ ] Ensure no self-referential issues (canonical pointing to different URL)
- [ ] Check category pages (e.g., /best-ai-writing-tools/) have canonical

### 4. Meta Robots Tag Audit

- [ ] Search codebase for `noindex` in HTML output (prerender.mjs)
- [ ] Verify NO pages have `<meta name="robots" content="noindex">`
- [ ] Check if any pages have `nofollow` (should not block indexing, but document if present)

### 5. Mobile & Structured Data

- [ ] Verify mobile viewport tag present: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] Spot-check 3 pages for valid JSON-LD schema (ArticleSchema, BreadcrumbList)
- [ ] Use https://validator.schema.org to confirm no schema errors

---

## Phase 2: Google Search Console Diagnostics

### 1. Coverage Report

**Expected Finding:**
- Pages indexed: ~15 (current)
- Pages excluded: 120 (not submitted or crawlable issue)
- Pages with errors: 0 (hopefully)

**Action:**
- Document current counts from GSC Coverage tab
- Note any "excluded" reasons (e.g., "Discovered but not indexed", "Soft 404")

### 2. Sitemap Status

- Click on `/sitemap.xml`
- Note: Total submitted URLs vs. indexed URLs
- If <10% indexed: **root cause likely = crawl issue or submitted recently**

### 3. URL Inspection Tool

**Test 5 URLs (one from each category):**

1. `/blog/best-ai-chatbot-2026/`
   - Click "Request Indexing"
   - Note: "URL is not on Google" or "Discovered but not indexed"?
   - Look for "Crawl errors" or "Mobile usability issues"

2. `/tools/cursor/`
   - Same inspection as above

3. `/compare/cursor-vs-windsurf/`
4. `/best-ai-writing-tools/` (category)
5. `/` (homepage)

**Document findings:**
- Is Google able to crawl the page?
- Are meta tags visible to Googlebot?
- Is canonical URL correct?
- Any JavaScript rendering issues?

---

## Phase 3: Technical Root Cause Analysis

### Hypothesis Tree

**If crawl successful but not indexed:**
- Pages too new (need 5–7 days to accumulate signals)
- Domain authority too low (<5 = slow indexing)
- Page content quality too similar to existing pages (duplicate content)
- CTR historically 0% = low user intent match (Search treats as low-quality)

**If Googlebot cannot crawl:**
- Robots.txt blocking (unlikely, but check)
- Mobile rendering issues (e.g., CSS/JS not loading on Googlebot crawl)
- Cloudflare Bot Fight Mode blocking Googlebot India datacenter ⚠️ **CRITICAL**
- prerender.mjs generating invalid HTML

**If sitemap not submitted:**
- Sitemap not found by Google (check GSC Sitemap section)
- Sitemap has too many duplicates
- URLs in sitemap but not accessible (404)

---

## Phase 4: Cloudflare Bot Fight Mode Investigation

**Risk:** Cloudflare Bot Fight Mode may be blocking Googlebot's India datacenter (documented in BOT_BLOCKING_FIX.md)

### Steps

1. **Check GSC for Googlebot crawl errors:**
   - "Couldn't fetch": YES? = Cloudflare blocking
   - If YES, verify in [BOT_BLOCKING_FIX.md](BOT_BLOCKING_FIX.md)

2. **If suspected Cloudflare block:**
   - Verify current Cloudflare settings in production
   - Whitelist `66.249.x.x` (Google IP range) if needed
   - Test Googlebot fetch again after 30 min

3. **Alternative diagnosis:**
   - Check GitHub Pages deployment logs (if using GH Pages)
   - Verify dist/ folder was correctly uploaded
   - Test Googlebot fetch in GSC "Test Live URL"

---

## Phase 5: Document Root Cause

**Create issue summary:**

```
Indexing Issue Root Cause: [ROOT_CAUSE_HERE]

Current State:
- Pages indexed: 15/135 (11%)
- Pages submitted via sitemap: 135
- Googlebot able to crawl: YES / NO / UNKNOWN
- Mobile rendering issues: YES / NO / UNKNOWN
- Cloudflare blocking: YES / NO / UNKNOWN

Hypothesis Confidence: [HIGH / MEDIUM / LOW]

Evidence:
- [Finding 1]
- [Finding 2]
- [Finding 3]

Recommended Fix:
1. [Action 1]
2. [Action 2]

Timeline to Resolution: [Estimated days]
```

---

## Expected Outcomes

**Success Scenarios:**

1. **Domain is too new + needs time**
   - Fix: Request indexing in GSC, wait 7 days
   - Confidence: 40%

2. **Duplicate content issue**
   - Fix: Add unique H1, modify intro paragraphs, ensure canonical URLs correct
   - Confidence: 25%

3. **Cloudflare blocking Googlebot**
   - Fix: Whitelist Googlebot IP ranges in Cloudflare
   - Confidence: 20%

4. **Prerender bug generating invalid HTML**
   - Fix: Debug prerender.mjs, regenerate dist/
   - Confidence: 10%

5. **Mobile rendering issue**
   - Fix: Fix CSS/JS loading, test with Googlebot-Chrome mobile user agent
   - Confidence: 5%

---

## Action Items for Days 2-3

- [ ] Day 2 AM: Run robots.txt + sitemap.xml validation
- [ ] Day 2 PM: Spot-check 5 pages for meta/canonical issues
- [ ] Day 3 AM: Test URL inspection in GSC (5 pages)
- [ ] Day 3 PM: Document root cause + create issue summary
- [ ] Day 3 EOD: Gate decision: Root cause identified? YES / NO

---

## Go/No-Go Gate #2 (Day 3 EOD)

**PASS Criteria:**
- Root cause identified (confidence ≥ MEDIUM)
- Recommended fix documented
- Next steps clear for Week 2

**FAIL Criteria:**
- Root cause unknown (too many unknowns)
- Unable to access GSC or GH Pages logs
- Escalate to Navneet for manual investigation

