# GEO and AI Search Audit Fix Implementation Plan

**Goal:** Keep every audited route crawlable in static HTML and close the remaining code-level SEO, schema, trust, and crawler-access gaps.

**Architecture:** Use `scripts/prerender.mjs` as the source of truth for route HTML, metadata, canonical URLs, JSON-LD, author identity, trust links, and content blocks. Keep category pages self-canonical so they remain indexable, while retaining a named override registry for explicitly approved legacy aliases. Keep crawler policy explicit in `public/robots.txt`.

**Tech Stack:** React 19, Vite, Node ESM prerender script, JSON-LD, Python validation scripts.

---

### Task 1: Establish the current generated-site baseline

**Files:**
- Test: `validate_audit_fixes.py`
- Test: `scripts/verify-prerender.mjs`

- [x] Run `npm run build`.
- [x] Run `python validate_audit_fixes.py` and record failures.
- [x] Confirm the PDF's client-rendering findings against raw `dist/**/index.html` word counts.

### Task 2: Add explicit category canonical override ownership

**Files:**
- Modify: `scripts/prerender.mjs`
- Test: `validate_audit_fixes.py`

- [x] Add `CATEGORY_CANONICAL_OVERRIDES` beside the category metadata.
- [x] Keep the current category pages self-canonical unless an entry is explicitly selected for a legacy alias.
- [x] Preserve explicit canonical policy in the registry without applying a cross-canonical to the live category route.

### Task 3: Explicitly address all audited AI crawlers

**Files:**
- Modify: `public/robots.txt`

- [x] Add explicit allow blocks for Claude-Web, Perplexity-User, CCBot, Amazonbot, GoogleOther, Diffbot, Timpibot, and YouBot.
- [x] Keep the global allow rule, sitemap URL, and existing query-parameter disallows unchanged.

### Task 4: Validate generated output

**Files:**
- Test: `validate_audit_fixes.py`
- Test: `scripts/verify-prerender.mjs`

- [x] Run `npm run build`.
- [x] Run `python validate_audit_fixes.py` and require zero failed checks.
- [x] Run `node scripts/verify-prerender.mjs` and require every sitemap URL to have static HTML.
- [x] Run `npx tsc --noEmit` and inspect diagnostics.

### Task 5: Review residual external work

- [ ] Report items that cannot be solved in source code: Cloudflare deployment headers, third-party authority mentions, directory profiles, social proof, and real product screenshots.
- [ ] State clearly that generated local output does not update already-deployed production files until the build artifact is deployed.
