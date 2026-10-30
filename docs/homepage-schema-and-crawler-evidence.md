# Homepage Schema and Crawler Evidence

Audit date: 2026-10-30

## Homepage schema visibility

| JSON-LD type | Source | Visible page evidence | Status |
| --- | --- | --- | --- |
| `FAQPage` | `scripts/prerender.mjs` | `#faq` and its `<details>` questions from `data/homepage-content.json` | Visible |
| `ItemList` | `scripts/prerender.mjs` | Homepage tool review links | Visible |
| `SiteNavigationElement` | `scripts/prerender.mjs` | Header/footer navigation links | Visible |
| `WebPage` | `scripts/prerender.mjs` | Homepage title, description, author and date | Visible |
| `BreadcrumbList` | `scripts/prerender.mjs` | Home breadcrumb | Visible |
| `SpeakableSpecification` | `scripts/prerender.mjs` | `h1`, `data-speakable` elements and `#key-takeaways` | Visible |
| `Article` | `scripts/prerender.mjs` | Homepage article body and headline | Visible |

The homepage build must contain exactly one homepage `FAQPage` block. Its questions are generated from the same FAQ block used for the visible section, and the renderer tests enforce that relationship.

## Crawler policy evidence

The policy in `public/robots.txt` blocks crawlers with verified training-only or dataset-collection behavior and leaves search, retrieval, and unclear cases allowed. The following cases remain deliberately unresolved because the available official pages did not provide an explicit, extractable purpose statement during this audit:

| Crawler | Current policy | Evidence status |
| --- | --- | --- |
| `meta-externalagent` | Allowed | Official purpose not verified in this audit |
| `Diffbot` | Allowed | Official purpose not verified in this audit |
| `cohere-ai` | Allowed | Official purpose not verified in this audit |
| `Timpibot` | Allowed | Official purpose not verified in this audit |

Do not move these groups to `Disallow: /` without a vendor source that explicitly establishes training-only or dataset-collection behavior. The existing comments in `public/robots.txt` intentionally preserve that boundary.