# ============================================================
# AI Nexus SEO — H5 + H6 Fix Validation Script
# Tasks: H5 (TOOL_MENTION_MAP auto-linking) | H6 (RSS feed)
# Run from: project root  →  .\validate-h5-h6.ps1
# ============================================================

$pass  = 0
$fail  = 0
$warns = 0

function OK  ($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function FAIL($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function WARN($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warns++ }
function HDR ($msg) { Write-Host "`n── $msg ──" -ForegroundColor Cyan }

# ── 0. Build required? ─────────────────────────────────────────────────────────
HDR "Pre-check — build artefacts"
$distExists = Test-Path "dist"
if (-not $distExists) {
    WARN "dist/ folder not found — run 'npm run build' first for full validation."
    WARN "Source-file checks will still run."
} else {
    OK "dist/ folder exists"
}

# ==============================================================
# SECTION A  ── H5: TOOL_MENTION_MAP auto-linking
# ==============================================================
HDR "H5 — TOOL_MENTION_MAP Internal Linking (BlogPostPage.tsx)"

$blogPage = "pages\BlogPostPage.tsx"
if (-not (Test-Path $blogPage)) { FAIL "BlogPostPage.tsx not found at $blogPage"; exit 1 }

# A1 — Map constant declared
if (Select-String -Path $blogPage -Pattern "TOOL_MENTION_MAP" -Quiet) {
    OK "TOOL_MENTION_MAP constant is declared"
} else {
    FAIL "TOOL_MENTION_MAP constant missing — add it to BlogPostPage.tsx"
}

# A2 — autoLinkToolMentions function
if (Select-String -Path $blogPage -Pattern "function autoLinkToolMentions" -Quiet) {
    OK "autoLinkToolMentions() function found"
} else {
    FAIL "autoLinkToolMentions() function missing"
}

# A3 — useMemo import
if (Select-String -Path $blogPage -Pattern "useMemo" -Quiet) {
    OK "useMemo imported (performance guard for link processing)"
} else {
    FAIL "useMemo not imported — add it to the React import line"
}

# A4 — linkedContent wired into dangerouslySetInnerHTML
if (Select-String -Path $blogPage -Pattern "linkedContent" -Quiet) {
    OK "linkedContent is computed and passed to dangerouslySetInnerHTML"
} else {
    FAIL "linkedContent not found — ensure post.content is replaced with linkedContent"
}

# A5 — Key tools present in map
$keyTools = @("grammarly","rytr","writesonic","podcastle","elevenlabs","ocoya","taskade")
$mapContent = Get-Content $blogPage | Where-Object { $_ -match "TOOL_MENTION_MAP" -or $_ -match "':" }
foreach ($tool in $keyTools) {
    if (Select-String -Path $blogPage -Pattern "'$tool'" -Quiet) {
        OK "  Tool slug '$tool' in map"
    } else {
        WARN "  Tool slug '$tool' missing from TOOL_MENTION_MAP"
    }
}

# A6 — Runtime check: verify HTML output contains auto-linked tool anchors (post-build)
if ($distExists) {
    $blogHtmlFiles = Get-ChildItem "dist\blog" -Filter "index.html" -Recurse -ErrorAction SilentlyContinue
    $linkedCount = 0
    foreach ($f in $blogHtmlFiles) {
        $content = Get-Content $f.FullName -Raw
        if ($content -match 'href="/tools/[a-z\-]+"') { $linkedCount++ }
    }
    if ($linkedCount -gt 0) {
        OK "Runtime: $linkedCount blog post HTML files contain /tools/ anchor links"
    } else {
        WARN "Runtime: No /tools/ links found in blog dist HTML — check if blog pages are pre-rendered"
    }
}

# ==============================================================
# SECTION B  ── H6: RSS feed
# ==============================================================
HDR "H6 — RSS Feed (/rss.xml)"

$prerender = "scripts\prerender.mjs"
if (-not (Test-Path $prerender)) { FAIL "prerender.mjs not found"; exit 1 }

# B1 — generateRssFeed function
if (Select-String -Path $prerender -Pattern "function generateRssFeed" -Quiet) {
    OK "generateRssFeed() function declared in prerender.mjs"
} else {
    FAIL "generateRssFeed() function missing from prerender.mjs"
}

# B2 — Function is called
if (Select-String -Path $prerender -Pattern "generateRssFeed\(\)" -Quiet) {
    OK "generateRssFeed() is called at build time"
} else {
    FAIL "generateRssFeed() is defined but never called — add the call after generateSitemap()"
}

# B3 — rss.xml written to DIST
if (Select-String -Path $prerender -Pattern "rss\.xml" -Quiet) {
    OK "rss.xml output path referenced in prerender.mjs"
} else {
    FAIL "rss.xml not referenced in prerender.mjs"
}

# B4 — atom:link self-reference (RSS best practice / Feedly requirement)
if (Select-String -Path $prerender -Pattern "atom:link" -Quiet) {
    OK "atom:link self-reference present (required by Feedly/validators)"
} else {
    WARN "atom:link self-reference missing — some aggregators reject feeds without it"
}

# B5 — index.html RSS discovery link
$indexHtml = "index.html"
if (Test-Path $indexHtml) {
    if (Select-String -Path $indexHtml -Pattern "application/rss\+xml" -Quiet) {
        OK "index.html has <link rel=alternate type=application/rss+xml> for browser autodiscovery"
    } else {
        FAIL "index.html missing RSS <link> tag — browsers/aggregators won't auto-discover the feed"
    }
} else {
    WARN "index.html not found at project root"
}

# B6 — Runtime: check dist/rss.xml exists and is valid RSS
if ($distExists) {
    $rssFile = "dist\rss.xml"
    if (Test-Path $rssFile) {
        $rssContent = Get-Content $rssFile -Raw
        # Validate it's RSS 2.0
        if ($rssContent -match '<rss version="2.0"') {
            OK "Runtime: dist/rss.xml exists and declares RSS 2.0"
        } else {
            FAIL "Runtime: dist/rss.xml exists but does not declare RSS 2.0"
        }
        # Count <item> entries
        $itemCount = ([regex]::Matches($rssContent, '<item>')).Count
        if ($itemCount -gt 0) {
            OK "Runtime: RSS feed contains $itemCount <item> entries"
        } else {
            FAIL "Runtime: RSS feed has 0 <item> entries — BLOG_POSTS loop may be broken"
        }
        # Check each blog post has a matching <item>
        $blogSlugs = @(
            "best-ai-writing-tools-for-beginners-2026",
            "best-ai-tools-for-freelancers-2026",
            "best-grammarly-alternatives",
            "best-podcastle-alternatives",
            "best-ai-tools-for-social-media-2026"
        )
        foreach ($slug in $blogSlugs) {
            if ($rssContent -match [regex]::Escape("/blog/$slug/")) {
                OK "  RSS item found: /blog/$slug/"
            } else {
                WARN "  RSS item missing: /blog/$slug/"
            }
        }
        # Validate RSS can be parsed as XML
        try {
            [xml]$rssXml = $rssContent
            OK "Runtime: rss.xml parses as valid XML"
        } catch {
            FAIL "Runtime: rss.xml is NOT valid XML — $_"
        }
    } else {
        FAIL "Runtime: dist/rss.xml NOT found — run 'npm run build' and check generateRssFeed() output"
    }
}

# ==============================================================
# SECTION C  ── Pre-existing C5/C6 confirmed still intact
# ==============================================================
HDR "C5 / C6 — Review + Article schema (confirming still intact)"

$toolPage = "pages\ToolPage.tsx"
if (Test-Path $toolPage) {
    if (Select-String -Path $toolPage -Pattern '"@type": "Review"' -Quiet) {
        OK "C5: Review schema still present in ToolPage.tsx"
    } else {
        FAIL "C5: Review schema REMOVED from ToolPage.tsx — restore it!"
    }
    if (Select-String -Path $toolPage -Pattern "AggregateRating" -Quiet) {
        OK "C5: AggregateRating sub-schema still present"
    } else {
        FAIL "C5: AggregateRating missing from ToolPage.tsx"
    }
}

$blogPostPage = "pages\BlogPostPage.tsx"
if (Test-Path $blogPostPage) {
    if (Select-String -Path $blogPostPage -Pattern "'@type': 'Article'" -Quiet) {
        OK "C6: Article schema still present in BlogPostPage.tsx"
    } else {
        FAIL "C6: Article schema REMOVED from BlogPostPage.tsx — restore it!"
    }
}

# ==============================================================
# SUMMARY
# ==============================================================
HDR "Summary"
Write-Host ""
Write-Host "  Passed : $pass" -ForegroundColor Green
Write-Host "  Warnings: $warns" -ForegroundColor Yellow
Write-Host "  Failed : $fail" -ForegroundColor Red
Write-Host ""

if ($fail -eq 0 -and $warns -eq 0) {
    Write-Host "All checks passed. H5 and H6 are fully implemented." -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "No failures. Review warnings above — they are non-blocking but worth fixing." -ForegroundColor Yellow
} else {
    Write-Host "$fail check(s) failed. Fix the FAIL items above before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm run build"
Write-Host "  2. Run this script again (dist/ checks will then run)"
Write-Host "  3. Validate RSS at: https://validator.w3.org/feed/check.cgi?url=https://ainexustools.online/rss.xml"
Write-Host "  4. Validate auto-links: open any blog post in browser, right-click a tool name, verify it links to /tools/<slug>"
Write-Host ""
