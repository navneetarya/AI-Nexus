# Fix: HTTP 403 Blocking Bots (Googlebot, GPTBot, ClaudeBot)

## Issue
The SEO audit reported that the live site returns HTTP 403 when crawled by bots, likely blocking Googlebot from indexing your content.

## Root Cause
**Cloudflare Bot Fight Mode** or a similar security rule is intercepting bot requests before they reach your prerendered HTML pages on GitHub Pages.

## Solution: Configure Cloudflare to Allow Search Bots

### Option 1: Disable Bot Fight Mode (Simplest)
1. Log into **Cloudflare Dashboard** → Your Domain
2. Go to **Security** → **Bot Fight Mode**
3. Set to **OFF**
4. Wait 5 minutes for settings to propagate

**Result:** All bots including Googlebot, GPTBot, ClaudeBot can now crawl your site and receive HTTP 200 responses.

### Option 2: Create Bot Exception Rules (Recommended for Production)
If you want Bot Fight Mode enabled for DDoS protection but allow legitimate crawlers:

1. **Cloudflare Dashboard** → **Security** → **WAF** → **Create rule** (or **Custom Rules**)
2. Create a rule with these conditions:
   ```
   (cf.bot_management.score < 50) AND (cf.verified_bot_category in {search_engine, ai})
   ```
3. Set action to **Allow**
4. Save and deploy

This allows verified bots (Google, Bing, OpenAI, Anthropic) while blocking malicious traffic.

### Option 3: Add User-Agent Exceptions
If using a different security product, whitelist these User-Agents:
- `Googlebot`
- `Googlebot-Image`
- `Google-Extended`
- `Bingbot`
- `GPTBot`
- `ClaudeBot`
- `PerplexityBot`
- `AppleBot`

## Verification

After making changes:

1. **Test with curl** (simulate bot):
   ```bash
   curl -I -A "Googlebot/2.1" https://ainexustools.online/
   # Should return: HTTP/1.1 200 OK
   ```

2. **Check Google Search Console**:
   - Go to **Coverage** report
   - Look for "Blocked by robots.txt" or "Server error (5xx)" — should show **0** after fix
   - Click **Request Indexing** for /sitemap.xml to re-crawl

3. **Check Cloudflare Analytics**:
   - Go to **Analytics** → **Bots**
   - Verify that bot traffic is not being blocked (look for HTTP 403 counts)

## Expected Results
After fix:
- Googlebot receives HTTP 200 for all pages
- sitemap.xml is crawlable
- Google Search Console shows pages as "Indexed"
- AI crawlers (GPTBot, ClaudeBot, PerplexityBot) can index your content

## Priority
**HIGH** — This is blocking your content from Google Search and AI engines. Fix immediately after deployment to enable indexing.

## Related Files
- `public/robots.txt` — Allows all bots (properly configured ✓)
- `scripts/prerender.mjs` — Generates sitemap.xml with all 120 URLs ✓
- `.github/workflows/deploy.yml` — Validates sitemap URL count ✓
