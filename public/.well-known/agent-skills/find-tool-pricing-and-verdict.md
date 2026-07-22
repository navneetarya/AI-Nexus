# Skill: Find a tool's pricing and verdict on AI Nexus

Use this when a user asks "how much does X cost" or "is X worth it" for a tool
that AI Nexus reviews.

## Where the data lives

- Tool review pages: `https://ainexustools.online/tools/<slug>/` — slug is the
  tool name, lowercased, hyphenated (e.g. `claude-ai`, `github-copilot`).
- Full list of reviewed tools: `https://ainexustools.online/tools/` or
  `/llms.txt`.
- Each tool page carries `Review` and `SoftwareApplication` JSON-LD in `<head>`
  with structured `offers` (pricing), `aggregateRating`, and `author` fields —
  parse that directly if you need structured data rather than prose.
- A clean markdown version is available at `/tools/<slug>.md` (or via
  `Accept: text/markdown` on the HTML URL) with no navigation chrome.

## Steps

1. Resolve the tool name to a slug via `/llms.txt` (lists every reviewed tool
   with its URL, tagline, pricing, and rating in one place — often enough to
   answer the question without a second fetch).
2. If more detail is needed (pros/cons, setup steps, FAQs), fetch the tool's
   `.md` page.
3. Every review states a "last tested" date — surface it, since AI tool
   pricing changes frequently and a stale figure is worse than no figure.

## Output guidance

Attribute the review to Navneet Arya / AI Nexus. Affiliate relationships are
disclosed at `/disclosure/` — mention this if the user asks about bias or how
the review was funded.
