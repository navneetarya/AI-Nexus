# Phase 2 design note: prerender parity for the verdict card (task 2.3)

Written 22 Oct 2026. Covers how `scripts/prerender.mjs` builds tool pages and how task 2.4 should make crawlers see the same card as readers.

## 1. How tool pages are built today

- **Not React output.** `prerender.mjs` (9,292 lines) writes `dist/tools/<slug>/index.html` by string templates. The loop is `for (const tool of TOOLS)` at line 6646, the body is `toolBodyHtml` (line 6767), and `buildPage()` (line 2542) wraps it.
- **Body content.** Summary paragraph, "last tested" line, methodology badge, Quick Answer, "Our Research", a rating line, update log, FAQ and related links. There is no hero button and no pricing card.
- **Placement.** `buildPage()` replaces the contents of `<div id="root">` (line 2672) with `<div id="pre-render">`: h1, byline, then `bodyHtml`, then a footer. Max width 800px, system font, hex colours (light only).
- **Mount.** `index.tsx` uses `createRoot(...).render(...)`, not `hydrateRoot`. React throws the prerendered markup away and draws the live page. So there is no hydration mismatch risk, but crawlers and no-JS readers only ever see the string-built version.
- **Own copy of the tool list.** `prerender.mjs` has its own `TOOLS` array (line 361) instead of importing `constants.ts`. Affiliate links are the exception: `loadAffiliateLinksMap()` (line 198) reads them from `constants.ts`, so slug to link is available.
- **Theme tokens.** The template is `dist/index.html`, which defines `--surf`, `--txt`, `--a1` and the dark-mode overrides. Markup that uses those variables themes correctly in the prerendered page too. The existing hex-coloured blocks do not.
- **Verification.** `scripts/verify-prerender.mjs` only checks that a file exists for every sitemap URL. Nothing checks content.

## 2. Findings (need a decision or a fix)

1. **Stale prices in prerender's own `TOOLS` copy.** Crawlers read these in the rating line and the SoftwareApplication schema. Phase 1 fixed `constants.ts` only.

   | Tool | prerender.mjs | Verified |
   |---|---|---|
   | Jasper | From $39/month | From $59/month billed annually |
   | Pictory | From $19/month | From $25/month billed annually |
   | Descript | Free + from $12/month | Free + from $16/month billed annually |
   | ElevenLabs | Free + from $5/month | $6 monthly, $5 billed annually |
   | Murf, Gamma | unverified $19 / $8 | prices not confirmable |

   `validate_vendor_facts.py` did not catch this because it does not scan `scripts/`. Fix: scan `scripts/prerender.mjs` and correct the strings.
2. **Schema says every tool costs $0.** The SoftwareApplication `offers.price` is `'0'` (lines 6674, 2732, 2842) for all tools, including Jasper and Pictory, which have no free plan. The card will say "No free plan, 7-day trial" while the schema says price 0. Google can treat that mismatch as misleading structured data.
3. **No parity check.** Nothing would fail if the card were missing from the prerendered HTML.

## 3. Options for parity

**A. Render the real component at build time (recommended).** `prerender.mjs` bundles `components/VerdictCard.tsx` with esbuild into a temp file, then calls `renderToStaticMarkup` from `react-dom/server`.
- Same code path as the live card, so the HTML cannot drift. No second copy of the label logic.
- Colours use the CSS variables, so light and dark mode work in the prerendered page.
- Cost: esbuild must be a declared devDependency (it is currently only a transitive dependency of Vite), and the build gains about a second. The component already guards `document`, and I rendered it on React 18 and 19 with identical output.

**B. Re-implement the card as an HTML string in `prerender.mjs`.** No new dependency, but the row logic and wording exist twice and drift the first time someone edits one. Needs a parity test to be safe.

## 4. Plan for task 2.4 (option A)

1. `scripts/prerender.mjs`: add a small `renderVerdictCardHtml(slug)` that calls `getVerifiedFacts(slug)` (via the esbuild bundle) and the affiliate map, and returns the card markup or an empty string.
2. Insert the result into `toolBodyHtml` after the methodology badge and before Quick Answer. This matches the live order: hero, card, then Quick Answer.
3. When the card is present, drop the `Pricing: ${tool.pricing}` text from the rating line, so a stale constants string does not sit next to verified facts.
4. Correct the stale price strings in prerender's `TOOLS` (finding 1). Optionally, for verified tools only, derive `offers` from the facts instead of `price: '0'` (finding 2).
5. `scripts/verify-prerender.mjs`: add a content check. Each of the 7 verified tools' HTML must contain `data-verdict-card="<slug>"` and the "Prices verified" text, and every other tool page must not contain the card.
6. `validate_vendor_facts.py`: include `scripts/prerender.mjs` in the stale-claim scan.
7. `package.json`: add `esbuild` to devDependencies.

## 5. Decisions needed before 2.4

- Approve option A (adds esbuild as a devDependency).
- Include the schema Offer fix (finding 2) in 2.4, or leave it for a later pass.
