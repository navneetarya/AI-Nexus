# AI Nexus — ainexustools.online

Independent AI tool reviews for creators, freelancers, and small teams.
Built with React + Vite + GitHub Pages. Prerendered with `scripts/prerender.mjs`.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 18 + TypeScript |
| Bundler | Vite |
| Hosting | GitHub Pages |
| Prerender | Node.js (`scripts/prerender.mjs`) |
| Forms | Beehiiv embed |

---

## Local Development

```bash
npm install
npm run dev          # starts Vite dev server at localhost:5173
npm run build        # production build → dist/
node scripts/prerender.mjs  # generates prerendered HTML into dist/
```

---

## Deployment

Pushes to `main` automatically deploy via GitHub Actions to GitHub Pages.

After every deploy that adds or significantly updates pages, run the **Post-Deploy Indexing Checklist** below.

---

## ✅ Post-Deploy Indexing Checklist

Run this after every deploy that adds new pages, fixes 404s, or updates existing content.
Skipping this adds 4–8 weeks to Google's re-crawl time. With it: indexed within 72 hours.

### 1. Google Search Console — URL Inspection

Open [Google Search Console → URL Inspection](https://search.google.com/search-console).

For each newly added or significantly updated URL:
1. Paste the full URL (e.g. `https://ainexustools.online/tools/frase/`)
2. Confirm it returns **HTTP 200**
3. Check "Rendered HTML" shows real content (not a skeleton)
4. Click **Request Indexing**

**Priority URLs to submit after each deploy:**

| URL | Reason |
|---|---|
| `/tools/frase/` | Thin page now complete — Review schema + reviewBody added |
| `/tools/leonardo-ai/` | Thin page now complete — Review schema + reviewBody added |
| `/tools/elevenlabs/` | W1 completion |
| `/tools/murf-ai/` | W1 completion |
| `/tools/descript/` | W1 completion |
| `/tools/canva-ai/` | W2 completion |
| `/tools/notion-ai/` | W2 completion |
| `/tools/perplexity/` | W2 completion |
| `/tools/opus-clip/` | W3 completion |
| `/tools/photoroom/` | W3 completion |
| `/tools/beautiful-ai/` | W3 completion |
| `/blog/best-free-ai-tools-for-students-in-india-2026/` | Previously 404 — now fixed |
| `/blog/best-ai-tools-for-content-creators-free-2026/` | Previously 404 — now fixed |
| `/blog/best-ai-tools-for-freelancers-india-2026/` | Previously 404 — now fixed |
| `/blog/ai-tools-for-teachers-2026/` | seoTitle updated — re-index for CTR |
| `/best-ai-tools-india/` | New India landing page |
| `/about/` | Last-verified badge added — freshness signal |
| `/methodology/` | Last-verified badge added — freshness signal |

### 2. Submit Updated Sitemap

In GSC: **Sitemaps → Submit a sitemap** → enter `sitemap.xml`

Do this even if the sitemap hasn't changed — it triggers a fresh crawl queue.

### 3. Bing Webmaster Tools

Bing captures 8–12% of search volume in India. Don't skip this.

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Submit sitemap: `https://ainexustools.online/sitemap.xml`
3. Use **URL Inspection** for the same priority URLs listed above

### 4. After Every New Blog Post or Tool Page

For any new content published after the Week 4 deployment, repeat steps 1 and 3 for the new URL immediately after deploying. Do not wait for Google to discover it organically.

---

## File Map — Key Files to Know

| File | Purpose |
|---|---|
| `scripts/prerender.mjs` | Generates all static HTML, schemas (Review, FAQ, Article, BreadcrumbList), sitemaps, and OG tags. **Edit this when adding tools, blog posts, compare articles, or updating seoTitles.** |
| `pages/ToolPage.tsx` | Contains `TOOL_CONTENT` — the full review content (whatIs, myTake, faqs, verdict) for all 24 tools. Edit this to add or update review content. |
| `constants.ts` | Site-wide config, tool list, ratings, `lastTested` dates, INR pricing. |
| `pages/BlogPostPage.tsx` | Blog post renderer. Content lives in `/blog/*.ts` files. |
| `pages/CompareArticlePage.tsx` | Compare article renderer. Data lives in `compare-data.ts` and `prerender.mjs COMPARE_ARTICLES`. |
| `pages/BestAIToolsIndiaPage.tsx` | India landing page — high-priority for India keyword cluster. |
| `App.tsx` | Route definitions. Add new routes here + matching prerender entry. |

---

## Adding a New Tool Review

1. Add tool entry to `TOOLS` array in `prerender.mjs` (slug, name, category, tagline, description, reviewBody, pricing, bestFor, rating, lastTested)
2. Add `TOOL_CONTENT['your-slug']` entry in `pages/ToolPage.tsx` (whatIs, whoIsItFor, whoShouldSkip, myTake, useCases, pricingSection, faqs, verdict)
3. Add `TOOL_FAQS['your-slug']` entry in `prerender.mjs` for FAQ rich results
4. Add logo to `public/logos/your-slug.png`
5. Run `npm run build && node scripts/prerender.mjs`
6. Deploy and run the Post-Deploy Indexing Checklist above

## Adding a New Blog Post

1. Create `/blog/your-slug.ts` with content (follow existing files as template)
2. Add entry to `BLOG_POSTS` array in `prerender.mjs` (slug, title, seoTitle, metaDescription, datePublished, dateModified, readTimeMinutes, faqs)
3. Add import to `/blog/index.ts`
4. Run `npm run build && node scripts/prerender.mjs`
5. Deploy and request indexing via GSC immediately

---

## EEAT Maintenance

| Signal | Where it lives | Frequency |
|---|---|---|
| Author byline | `ToolPage.tsx` — author row component | Permanent |
| Per-page affiliate notice | `ToolPage.tsx` — near CTA buttons | Permanent |
| `lastTested` date on tool cards | `constants.ts` — `lastTested` field per tool | Update when tool changes |
| `reviewBody` in Review schema | `prerender.mjs` — TOOLS array | Update when tool changes pricing/features |
| About page "last verified" badge | `AboutPage.tsx` — badge text | Update monthly |
| Methodology "last verified" badge | `MethodologyPage.tsx` — badge text | Update monthly |

---

*Last updated: May 2026*
