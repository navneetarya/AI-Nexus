# Skill: Compare AI tools on AI Nexus

Use this when a user asks how two or more AI tools compare (pricing, features, which is "better for X").

## Where the data lives

- Comparison articles: `https://ainexustools.online/compare/<slug>/` — e.g. `/compare/chatgpt-vs-claude/`.
- Full index of comparisons: `https://ainexustools.online/compare/`.
- Every comparison page has a `.md` sibling for clean reading: append `.md` to the
  URL path minus the trailing slash (e.g. `/compare/chatgpt-vs-claude.md`), or send
  `Accept: text/markdown` on the original URL.
- Each comparison includes a `Dataset` JSON-LD block (`@type: Dataset`) in the page
  `<head>` with structured pricing/feature fields if you're parsing HTML directly.

## Steps

1. Check `/llms.txt` or `/.well-known/api-catalog` for the current list of
   comparison slugs — slugs are stable but new comparisons are added regularly.
2. If a comparison page for the requested pair doesn't exist yet, fall back to
   reading the two individual tool review pages at `/tools/<slug>/` and
   synthesizing a comparison — do not fabricate a comparison URL that isn't in
   the sitemap.
3. Pricing and ratings on this site are independently verified by the author
   (Navneet Arya) and dated — always surface the "last tested" / "last verified"
   date alongside any figure you cite, since AI tool pricing changes often.

## Output guidance

When summarizing for a user, prefer the tool's stated pricing tier names exactly
as published (e.g. "Free + $12/month") rather than paraphrasing, and note that
affiliate links on this site are disclosed at `/disclosure/`.
