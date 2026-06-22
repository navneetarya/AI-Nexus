# Week 1 Task 5: Fix 404 Errors & Broken Links

**Status:** Audit in Progress | **Days:** 4-5

---

## Objective

Reduce 404 pageviews from current ~15 to <5 by:
1. Fixing internal links pointing to nonexistent routes
2. Adding redirects for old URL patterns (if any)
3. Documenting 404s in error logs for improvement

---

## 404 Detection

### Current Known Issues (from GA4)

**404s generating pageviews:**
- Users are reaching these URLs somehow (likely from external links or bookmarks)
- Each 404 = negative signal to Google (broken content)
- Each 404 = poor UX (user goes to nonexistent page)

### Likely Sources

1. **Typo in internal links**
   - Blog posts linking to `/tools/[slug]/` but slug doesn't exist
   - Compare pages linking to tools that were removed

2. **Old URL patterns**
   - Pre-2026 URLs with different slug formats
   - Old domain URLs being linked externally

3. **Incomplete content**
   - Tool page exists but no compare page created yet
   - Blog post references tool that doesn't have its own page

---

## 404 Audit Strategy

### Phase 1: Find 404 Handlers

- [ ] Check dist/404.html exists
- [ ] Verify 404.html redirects to homepage with helpful message
- [ ] Test: Navigate to `/nonexistent-page/` → should show 404.html

### Phase 2: Audit Internal Links

- [ ] Scan all .tsx files for `/tools/` links → verify tool exists in constants.ts
- [ ] Scan all .tsx files for `/compare/` links → verify slug exists in compare-data.ts
- [ ] Scan all blog files for internal links → verify all slugs are correct

### Phase 3: Check External Link Sources

- If available, check:
  - Backlinks report (if using SEO tool)
  - Referer logs (which external sites link to 404s?)
  - GA4 Behavior report (which 404s get the most traffic?)

### Phase 4: Create Fixes

**Example Fix:**
```
If /tools/old-tool-name/ gets 10 pageviews/month:
1. Check if tool was renamed: /tools/new-name/
2. If renamed: Add redirect in prerender.mjs
3. If removed: Add /old-tool-name/index.html with 301 redirect to /
```

---

## Implementation

### Fix 1: Add Custom 404 Page

```typescript
// In prerender.mjs, after all pages are written:
writeRoute('404', dist/index.html, {
  title: '404 — Page Not Found',
  content: '<h1>This page doesn\\'t exist</h1><p><a href="/">Return to home</a></p>'
});
```

### Fix 2: Add Redirect Handling

If a tool/page was removed, add redirect:

```typescript
// Redirect old URL to new URL
writeRoute('tools/old-slug', dist/index.html, {
  headers: { 'X-Redirect': '/tools/new-slug/' }
});
```

### Fix 3: Update Internal Links

Find and fix all broken links:

```bash
# Find all /tools/ links
grep -r "href=\"/tools/" src/ blog/ pages/

# Find all /compare/ links
grep -r "href=\"/compare/" src/ blog/ pages/
```

---

## Current 404 Pages

**To be filled in after audit:**

| URL | Current Pageviews | Issue | Status |
|-----|------------------|-------|--------|
| (TBD) | (TBD) | (TBD) | Pending |

---

## Actions for Day 4-5

- [ ] List all 404 URLs from GA4 (if available)
- [ ] Check each for broken internal links
- [ ] Fix link targets in source files
- [ ] Add custom 404 redirect page if needed
- [ ] Re-build and verify dist/404.html
- [ ] Gate: 404 pageviews reduced to <5? YES / NO / PARTIAL

---

## Post-Deployment

- [ ] Monitor GA4 for new 404s
- [ ] Add GA4 custom event: \"404_error\" with {page_path, referrer}
- [ ] Weekly review: Any new 404 patterns?

