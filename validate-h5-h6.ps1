# ============================================================
# AI Nexus SEO - H5 + H6 Fix Validation Script
# Tasks: H5 (TOOL_MENTION_MAP auto-linking) | H6 (RSS feed)
# Run from project root: .\validate-h5-h6.ps1
# ============================================================

$pass  = 0
$fail  = 0
$warns = 0

function OK   { param($msg) Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function FAIL { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function WARN { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warns++ }
function HDR  { param($msg) Write-Host "`n-- $msg --" -ForegroundColor Cyan }

# ---------------------------------------------------------------
# 0. Build check
# ---------------------------------------------------------------
HDR "Pre-check: build artefacts"
$distExists = Test-Path "dist"
if (-not $distExists) {
    WARN "dist/ not found. Run 'npm run build' first for full validation."
    WARN "Source-file checks will still run."
} else {
    OK "dist/ folder exists"
}

# ===============================================================
# SECTION A - H5: TOOL_MENTION_MAP auto-linking
# ===============================================================
HDR "H5 - TOOL_MENTION_MAP Internal Linking (BlogPostPage.tsx)"

$blogPage = "pages\BlogPostPage.tsx"
if (-not (Test-Path $blogPage)) {
    FAIL "BlogPostPage.tsx not found at $blogPage"
    exit 1
}

if (Select-String -Path $blogPage -Pattern "TOOL_MENTION_MAP" -Quiet) {
    OK "TOOL_MENTION_MAP constant is declared"
} else {
    FAIL "TOOL_MENTION_MAP constant missing - add it to BlogPostPage.tsx"
}

if (Select-String -Path $blogPage -Pattern "function autoLinkToolMentions" -Quiet) {
    OK "autoLinkToolMentions() function found"
} else {
    FAIL "autoLinkToolMentions() function missing"
}

if (Select-String -Path $blogPage -Pattern "useMemo" -Quiet) {
    OK "useMemo imported (performance guard)"
} else {
    FAIL "useMemo not imported - add it to the React import line"
}

if (Select-String -Path $blogPage -Pattern "linkedContent" -Quiet) {
    OK "linkedContent wired into dangerouslySetInnerHTML"
} else {
    FAIL "linkedContent not found - replace post.content with linkedContent in the render"
}

$keyTools = @("grammarly","rytr","writesonic","podcastle","elevenlabs","ocoya","taskade")
foreach ($tool in $keyTools) {
    if (Select-String -Path $blogPage -Pattern "'$tool'" -Quiet) {
        OK "  Tool slug '$tool' present in map"
    } else {
        WARN "  Tool slug '$tool' missing from TOOL_MENTION_MAP"
    }
}

if ($distExists) {
    $blogHtmlFiles = Get-ChildItem "dist\blog" -Filter "index.html" -Recurse -ErrorAction SilentlyContinue
    $linkedCount = 0
    foreach ($f in $blogHtmlFiles) {
        $content = Get-Content $f.FullName -Raw
        if ($content -match 'href="/tools/[a-z\-]+"') {
            $linkedCount++
        }
    }
    if ($linkedCount -gt 0) {
        OK "Runtime: $linkedCount blog post HTML files contain /tools/ anchor links"
    } else {
        WARN "Runtime: No /tools/ links found in blog dist HTML - check pre-render output"
    }
}

# ===============================================================
# SECTION B - H6: RSS feed
# ===============================================================
HDR "H6 - RSS Feed (/rss.xml)"

$prerender = "scripts\prerender.mjs"
if (-not (Test-Path $prerender)) {
    FAIL "prerender.mjs not found at $prerender"
    exit 1
}

if (Select-String -Path $prerender -Pattern "function generateRssFeed" -Quiet) {
    OK "generateRssFeed() function declared in prerender.mjs"
} else {
    FAIL "generateRssFeed() function missing from prerender.mjs"
}

if (Select-String -Path $prerender -Pattern "generateRssFeed\(\)" -Quiet) {
    OK "generateRssFeed() is called at build time"
} else {
    FAIL "generateRssFeed() defined but never called - add the call after generateSitemap()"
}

if (Select-String -Path $prerender -Pattern "rss\.xml" -Quiet) {
    OK "rss.xml output path referenced in prerender.mjs"
} else {
    FAIL "rss.xml not referenced in prerender.mjs"
}

if (Select-String -Path $prerender -Pattern "atom:link" -Quiet) {
    OK "atom:link self-reference present (required by Feedly and W3C validators)"
} else {
    WARN "atom:link self-reference missing - some aggregators reject feeds without it"
}

$indexHtml = "index.html"
if (Test-Path $indexHtml) {
    if (Select-String -Path $indexHtml -Pattern "application/rss" -Quiet) {
        OK "index.html has RSS autodiscovery link tag"
    } else {
        FAIL "index.html missing RSS link tag"
    }
} else {
    WARN "index.html not found at project root"
}

if ($distExists) {
    $rssFile = "dist\rss.xml"
    if (Test-Path $rssFile) {
        $rssContent = Get-Content $rssFile -Raw

        if ($rssContent -match '<rss version="2.0"') {
            OK "Runtime: dist/rss.xml exists and declares RSS 2.0"
        } else {
            FAIL "Runtime: dist/rss.xml exists but does not declare RSS 2.0"
        }

        $itemCount = ([regex]::Matches($rssContent, '<item>')).Count
        if ($itemCount -gt 0) {
            OK "Runtime: RSS feed contains $itemCount blog post items"
        } else {
            FAIL "Runtime: RSS feed has 0 items - BLOG_POSTS loop may be broken"
        }

        $blogSlugs = @(
            "best-ai-writing-tools-for-beginners-2026",
            "best-ai-tools-for-freelancers-2026",
            "best-grammarly-alternatives",
            "best-podcastle-alternatives",
            "best-ai-tools-for-social-media-2026"
        )
        foreach ($slug in $blogSlugs) {
            $escaped = [regex]::Escape("/blog/$slug/")
            if ($rssContent -match $escaped) {
                OK "  RSS item found: /blog/$slug/"
            } else {
                WARN "  RSS item missing: /blog/$slug/"
            }
        }

        try {
            [xml]$null = $rssContent
            OK "Runtime: rss.xml is valid XML"
        } catch {
            FAIL "Runtime: rss.xml is NOT valid XML. Error: $_"
        }
    } else {
        FAIL "Runtime: dist/rss.xml not found - run 'npm run build' first"
    }
}

# ===============================================================
# SECTION C - C5/C6 schema integrity check
# ===============================================================
HDR "C5 / C6 - Review + Article schema (confirming still intact)"

$toolPage = "pages\ToolPage.tsx"
if (Test-Path $toolPage) {
    if (Select-String -Path $toolPage -Pattern '"@type": "Review"' -Quiet) {
        OK "C5: Review schema still present in ToolPage.tsx"
    } else {
        FAIL "C5: Review schema REMOVED from ToolPage.tsx - restore it!"
    }
    if (Select-String -Path $toolPage -Pattern "AggregateRating" -Quiet) {
        OK "C5: AggregateRating sub-schema still present"
    } else {
        FAIL "C5: AggregateRating missing from ToolPage.tsx"
    }
}

if (Test-Path $blogPage) {
    if (Select-String -Path $blogPage -Pattern "'@type': 'Article'" -Quiet) {
        OK "C6: Article schema still present in BlogPostPage.tsx"
    } else {
        FAIL "C6: Article schema REMOVED from BlogPostPage.tsx - restore it!"
    }
}

# ===============================================================
# SUMMARY
# ===============================================================
HDR "Summary"
Write-Host ""
Write-Host "  Passed  : $pass"  -ForegroundColor Green
Write-Host "  Warnings: $warns" -ForegroundColor Yellow
Write-Host "  Failed  : $fail"  -ForegroundColor Red
Write-Host ""

if ($fail -eq 0 -and $warns -eq 0) {
    Write-Host "All checks passed. H5 and H6 are fully implemented." -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "No failures. Warnings above are non-blocking but worth fixing." -ForegroundColor Yellow
} else {
    Write-Host "$fail check(s) failed. Fix the FAIL items before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm run build"
Write-Host "  2. Run this script again (dist/ checks will then execute)"
Write-Host "  3. RSS validator: https://validator.w3.org/feed/"
Write-Host "  4. Open a blog post in browser and inspect a tool name - it should link to /tools/slug"
Write-Host ""
