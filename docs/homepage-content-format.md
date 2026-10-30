# Homepage content format (`data/homepage-content.json`)

One JSON file feeds two renderers, so the static (prerendered) homepage and the live (React)
homepage cannot drift apart:

- Static HTML: `scripts/homepage-content.mjs`, called from `scripts/prerender.mjs`
- React: `components/ContentBlocks.tsx`
- Both use the same inline parser, `lib/content-inline.mjs`. `tests/content-blocks.test.tsx` fails if the two renderers ever show different text or links.

Existing wording and claims are **moved, not edited**.

## File shape

```json
{
  "version": 1,
  "sections": [
    {
      "id": "key-takeaways",
      "ariaLabel": "Key Takeaways",
      "variant": "callout",
      "heading": { "text": "Key Takeaways", "speakable": "key-takeaways" },
      "blocks": [ { "type": "list", "items": ["..."] } ]
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `id` | The `<section id>`. Must match the id in the current static HTML (the homepage Table of Contents links to it). Unique. |
| `ariaLabel` | Optional. `aria-label` of the section. |
| `variant` | Named look: `callout` (tinted box), `plain`, or `faq` (plain, with a larger gap under the heading). Variants map to inline CSS in the static renderer and to the palette (`C`, `isDark`) in React. **No CSS in the JSON.** A new variant needs an entry in both renderers; an unknown variant fails the build. |
| `heading.text` | The `<h2>` text, plain text (write `&` not `&amp;`). |
| `heading.speakable` | Optional. Becomes `data-speakable` on the h2. |
| `blocks` | Ordered list of blocks (below). |

## Block types

Every block may also have `showIf: "<variable>"`: the block is left out when that variable is 0 or empty
(used for the pricing-tracker note, which only shows when the pricing snapshot has tools).

| `type` | Fields | Renders as |
|---|---|---|
| `paragraph` | `text`, `variant`, optional `speakable`, optional `linkWeight` | `<p>`. Variants: `lead` (bold answer line), `body`, `bodyTight`, `bodyEnd`, `note`, `fineprint`, `follow`, `followLg` |
| `list` / `orderedList` | `items: string[]` | `<ul>` / `<ol>`; look comes from the section variant |
| `toolList` | `count` | Links to the first `count` tools (`Name — tagline`), taken from the tool list at build/render time, not stored in JSON |
| `table` | `caption?`, `columns: string[]`, `rows: string[][]`, `linkWeight?` | `<table>` with striped rows. React wraps it in an `overflow-x:auto` box (the static HTML does too) |
| `definitionList` | `items: [{ term, text, more?: { label, href } }]` | `<dl><dt><dd>`; `more` is the small "See all …" link under the text |
| `faq` | `items: [{ q, a }]` | `<details><summary>` (expandable is allowed) |

The FAQPage JSON-LD is built from the `faq` block's items (`faqItemsPlain()`), so the markup lists exactly the
visible questions. FAQ text must be plain: no dates.

Using a block type or variant a renderer lacks fails the build (or the React render) with a clear message.

## Inline markup

Only these two, no nesting:

- `**bold**` → `<strong>`
- `[label](/path/)` → internal link, the site origin is added automatically
- `[label](https://example.com/)` → external link, gets `target="_blank" rel="noopener noreferrer"`

Everything else is plain text and is HTML-escaped by the renderer. A link target must start with `/` or `http`.

## Variables

Written `{{name}}`, replaced at build time (static) and render time (React). An unknown name fails the build.

| Variable | Value | Source |
|---|---|---|
| `{{toolCount}}` | number of tools | `TOOLS.length` |
| `{{pricingToolCount}}` | tools in the verified pricing snapshot | `data/pricing/latest.json` |
| `{{year}}` | current year | build date |
| `{{site}}` | `https://ainexustools.online` | `SITE` |
| `{{homeDate}}` | homepage "last updated" date | `PAGE_LAST_UPDATED.home` |
| `{{pricingDate}}` | pricing snapshot date | `data/pricing/latest.json` |

`{{homeDate}}` and `{{pricingDate}}` are date variables: they render as `<time datetime="2026-10-22">October 22, 2026</time>`.

## Section ids to preserve

These ids already exist in the static homepage. Keep them unchanged.

- In JSON now: `key-takeaways`, `what-are-best-ai-tools-2026`, `answer-context-example`, `ai-tools-comparison`, `ai-tool-by-use-case`, `faq`
- Still to move (Phase 2): `how-to-choose-ai-tool` (plus its inner anchors `step-1` to `step-3`, `decision-framework`,
  `framework-1` to `framework-4`), `when-not-to-use-ai-tools`, `verdict`, `free-vs-paid-perspectives`, `common-mistakes`, `about-research`
- Already in React under other headings, so **not** migrated: `start-here`, `compare-tools`, `ai-blog-guides`

## Adding or changing content

1. Edit `data/homepage-content.json` only.
2. `npm run build`, then `python3 scripts/check_static_vs_rendered.py / --allow start-here,compare-tools,ai-blog-guides`.
3. Never edit the same wording in `prerender.mjs` or in a React file.

## Table of Contents (`toc`)

Top-level `toc` key: `{ "heading": "Table of Contents", "items": [{ "id", "label", "reactHref"? }] }`.
One list feeds both renderers: `renderHomeTocHtml()` (static, scripts/homepage-content.mjs) and `HomeTableOfContents` (React, components/HomeEditorialSections.tsx).

- `id` is the section id the link jumps to. Most ids are sections in this file. `start-here` and `compare-tools` are ids on the React sections in pages/HomePage.tsx; the static HTML still has its own sections with those ids.
- `reactHref` (optional): in React, link to this page via `navigate()` instead of a hash. Used for `ai-blog-guides`, which has no React section.
- Labels are plain text (no inline markup); `&` is escaped by the renderer.

## Block types and variants added after the first draft

`heading` (level 3), `quote`, `toolList`, `table`, `definitionList`, `faq`, list items with `id`, and the `showIf` / `linkWeight` flags are all implemented in both renderers (see the `Block` type in components/ContentBlocks.tsx). Variants such as `spaced` and `compact` exist only to reproduce the old spacing exactly. A variant that either renderer does not know fails the build or the render with a clear message.
