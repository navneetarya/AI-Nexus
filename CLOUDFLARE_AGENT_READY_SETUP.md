# Agent-Ready — Cloudflare Transform Rules (Phase 2)

Companion to the Phase 1 code changes (prerender.mjs markdown generation,
`.well-known/api-catalog`, `.well-known/agent-skills/`, robots.txt
Content-Signal, WebMCP tools). These four rules run entirely at the Cloudflare
edge — **no Worker, no code deploy, no origin change.** GitHub Pages keeps
serving exactly what it serves today; Cloudflare just rewrites the request
before it reaches the origin, or adds headers to the response on the way back.
This is the same mechanism already used for the four security headers
referenced in `index.html` (HSTS, X-Content-Type-Options, X-Frame-Options,
Permissions-Policy) — you're extending an existing setup, not creating a new
category of infrastructure.

Dashboard path: **ainexustools.online → Rules → Transform Rules**

---

## Rule 1 — Markdown negotiation, all pages except root

**Rule type:** URL Rewrite (Path)

**When incoming requests match:**
```
http.request.headers["accept"][0] contains "text/markdown"
and ends_with(http.request.uri.path, "/")
and http.request.uri.path ne "/"
```

**Then rewrite path to (Dynamic):**
```
wildcard_replace(http.request.uri.path, "*/", "${1}.md")
```

This turns `/tools/chatgpt/` into `/tools/chatgpt.md`, `/compare/chatgpt-vs-claude/`
into `/compare/chatgpt-vs-claude.md`, `/blog/<slug>/` into `/blog/<slug>.md`,
etc. — matching what `scripts/prerender.mjs` now writes to `dist/` at build
time (a `.md` sibling next to every `index.html`).

## Rule 2 — Markdown negotiation, homepage

**Rule type:** URL Rewrite (Path)

**When incoming requests match:**
```
http.request.headers["accept"][0] contains "text/markdown"
and http.request.uri.path eq "/"
```

**Then rewrite path to (Static):**
```
/index.md
```

## Rule 3 — Sitewide Link header

**Rule type:** HTTP Response Header Modification

**When incoming requests match:** all incoming requests (or scope to `http.request.uri.path ne ""` / leave unfiltered — same pattern you likely already used for the security headers rule)

**Then add response header:**
```
Link: <https://ainexustools.online/llms.txt>; rel="llms-index",
      <https://ainexustools.online/.well-known/api-catalog>; rel="api-catalog",
      <https://ainexustools.online/.well-known/agent-skills/index.json>; rel="agent-skills",
      <https://ainexustools.online/sitemap.xml>; rel="sitemap"
```
(single line, no actual line breaks — wrapped above for readability)

This lets an agent that only reads response headers — never touching HTML —
discover your machine-readable resources without a page load.

## Rule 4 — Correct Content-Type on `.well-known` JSON files

GitHub Pages doesn't know the extension-less `/.well-known/api-catalog` file
is JSON, and will likely serve it as `application/octet-stream`. Add:

**Rule type:** HTTP Response Header Modification

**When incoming requests match:**
```
http.request.uri.path eq "/.well-known/api-catalog"
```

**Then set response header:**
```
Content-Type: application/linkset+json
```

(`/.well-known/agent-skills/index.json` already gets the correct
`application/json` type from its `.json` extension — no rule needed there.)

---

## Verifying afterward

```bash
curl -sI https://ainexustools.online/ | grep -i link
curl -s -H "Accept: text/markdown" https://ainexustools.online/tools/chatgpt/
curl -s -H "Accept: text/markdown" https://ainexustools.online/ | head -5
curl -sI https://ainexustools.online/.well-known/api-catalog | grep -i content-type
```

Then re-run the scan at isitagentready.com.

## What's deliberately not in this doc

- **OAuth/OIDC discovery, OAuth Protected Resource metadata** — AI Nexus has
  no protected API for agents to authenticate against. Publishing OAuth
  discovery metadata for an API that has nothing to protect actively misleads
  agent clients into attempting token acquisition against nothing. Leave these
  checks failing; it's the honest answer, not a gap.
- **DNS-AID** — this standard exists to make a *live agent endpoint*
  discoverable via DNS (SVCB/TXT records under `_agents.ainexustools.online`).
  There's nothing to point it at yet. Worth revisiting once/if Phase 3 (a real
  MCP server) ships — otherwise it's a DNS record pointing at nothing.
- **x402 / MPP / UCP / ACP (Commerce)** — not applicable; AI Nexus doesn't
  sell anything directly. isitagentready.com's own report marks these
  informational-only for non-commerce sites.
