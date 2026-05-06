#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validates all C1→C2→C4→C3 SEO fixes for ainexustools.online
.DESCRIPTION
    Run this script from the root of the AI-Nexus repo.
    Part A  — checks the SOURCE files (index.html, prerender.mjs) before build.
    Part B  — checks the DIST output after `npm run build`.
    Part C  — checks the LIVE SITE at ainexustools.online (requires internet).
.USAGE
    cd path\to\AI-Nexus-main
    .\validate-seo-fixes.ps1
#>

$ErrorActionPreference = 'Continue'
$pass  = 0
$fail  = 0
$warn  = 0

function Ok($msg)   { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warn++ }
function Head($msg) { Write-Host "`n$msg" -ForegroundColor Cyan }

# ─────────────────────────────────────────────────────────────────────────────
Head "═══ PART A — SOURCE FILE CHECKS (before build) ═══"
# ─────────────────────────────────────────────────────────────────────────────

# C1 — robots.txt
Head "C1 · robots.txt"
if (Test-Path "public\robots.txt") {
    $robots = Get-Content "public\robots.txt" -Raw
    if ($robots -match "User-agent: \*")           { Ok "robots.txt — User-agent wildcard present" }
    else                                           { Fail "robots.txt — missing User-agent: *" }
    if ($robots -match "Allow: /")                 { Ok "robots.txt — Allow: / present" }
    else                                           { Fail "robots.txt — missing Allow: /" }
    if ($robots -match "Sitemap:.*sitemap\.xml")   { Ok "robots.txt — Sitemap reference present" }
    else                                           { Fail "robots.txt — missing Sitemap: line" }
    if ($robots -match "Googlebot")                { Ok "robots.txt — Googlebot entry present" }
    else                                           { Warn "robots.txt — no Googlebot-specific entry" }
} else {
    Fail "C1 — public\robots.txt DOES NOT EXIST"
}

# C2 — index.html sitemap link tag
Head "C2 · Sitemap <link> tag in index.html"
if (Test-Path "index.html") {
    $indexHtml = Get-Content "index.html" -Raw
    if ($indexHtml -match 'rel="sitemap"') {
        Ok "index.html — <link rel=`"sitemap`"> tag present"
    } else {
        Fail "index.html — MISSING <link rel=`"sitemap`" type=`"application/xml`" href=`"/sitemap.xml`"> in <head>"
    }
    if ($indexHtml -match 'href="/sitemap\.xml"') {
        Ok "index.html — sitemap href points to /sitemap.xml"
    } else {
        Warn "index.html — sitemap link href may not point to /sitemap.xml"
    }
} else {
    Fail "C2 — index.html not found in current directory"
}

# C2 — prerender.mjs sitemap generation
Head "C2 · Sitemap generation in prerender.mjs"
if (Test-Path "scripts\prerender.mjs") {
    $pre = Get-Content "scripts\prerender.mjs" -Raw
    if ($pre -match "generateSitemap")             { Ok "prerender.mjs — generateSitemap() function exists" }
    else                                           { Fail "prerender.mjs — generateSitemap() function missing" }
    if ($pre -match "xmlns:image")                 { Ok "prerender.mjs — image: namespace present in sitemap output" }
    else                                           { Fail "prerender.mjs — image: namespace MISSING (sitemap won't index logos)" }
    if ($pre -match "image:image")                 { Ok "prerender.mjs — <image:image> tags generated per tool" }
    else                                           { Fail "prerender.mjs — <image:image> tags missing" }
    if ($pre -match "BLOG_POSTS.*slug\|blog/.*slug" -or $pre -match 'blog/\$\{post\.slug\}') {
        Ok "prerender.mjs — blog posts included in sitemap"
    } else                                         { Warn "prerender.mjs — verify blog posts are mapped in generateSitemap()" }
    if ($pre -match "compare/.*slug\|COMPARE_ARTICLES") {
        Ok "prerender.mjs — compare articles included in sitemap"
    } else                                         { Warn "prerender.mjs — verify compare articles are mapped in generateSitemap()" }
} else {
    Fail "C2 — scripts\prerender.mjs not found"
}

# C4 — per-page meta injection in prerender.mjs
Head "C4 · Per-page meta injection (buildPage function)"
if (Test-Path "scripts\prerender.mjs") {
    $pre = Get-Content "scripts\prerender.mjs" -Raw
    if ($pre -match "function buildPage")          { Ok "prerender.mjs — buildPage() function exists" }
    else                                           { Fail "prerender.mjs — buildPage() function MISSING — meta injection broken" }
    if ($pre -match '<title>.*<\/title>')          { Ok "prerender.mjs — title tag replacement present" }
    else                                           { Warn "prerender.mjs — title replacement regex may be missing" }
    if ($pre -match 'rel="canonical".*href')       { Ok "prerender.mjs — canonical replacement present" }
    else                                           { Fail "prerender.mjs — canonical tag replacement MISSING" }
    if ($pre -match 'og:title|og:description')     { Ok "prerender.mjs — OG tag replacement present" }
    else                                           { Fail "prerender.mjs — OG tag replacement MISSING" }
    if ($pre -match 'reviewSchema|Review')         { Ok "prerender.mjs — Review schema builder present (for tool pages)" }
    else                                           { Fail "prerender.mjs — Review schema MISSING" }
    if ($pre -match 'articleSchema|Article')       { Ok "prerender.mjs — Article schema builder present (for blog posts)" }
    else                                           { Fail "prerender.mjs — Article schema MISSING" }
    if ($pre -match 'faqSchema|FAQPage')           { Ok "prerender.mjs — FAQPage schema builder present" }
    else                                           { Fail "prerender.mjs — FAQPage schema MISSING" }
    if ($pre -match 'BreadcrumbList|breadcrumbs')  { Ok "prerender.mjs — BreadcrumbList schema builder present" }
    else                                           { Fail "prerender.mjs — BreadcrumbList schema MISSING" }
}

# C3 — deploy workflow
Head "C3 · GitHub Actions deploy pipeline"
$deployPath = ".github\workflows\deploy.yml"
if (Test-Path $deployPath) {
    $deploy = Get-Content $deployPath -Raw
    if ($deploy -match "npm run build")            { Ok "deploy.yml — runs npm run build (triggers prerender)" }
    else                                           { Fail "deploy.yml — does NOT call npm run build — prerender will not run on deploy!" }
    if ($deploy -match "prerender")                { Ok "deploy.yml — references prerender step" }
    else                                           { Warn "deploy.yml — no explicit prerender reference (check npm run build includes it)" }
    if ($deploy -match "upload-pages-artifact")    { Ok "deploy.yml — uploads dist/ artifact to GitHub Pages" }
    else                                           { Warn "deploy.yml — verify artifact upload step" }
    if ($deploy -match "ping.*google|google.*ping"){ Ok "deploy.yml — pings Google sitemap after deploy" }
    else                                           { Warn "deploy.yml — no Google sitemap ping (optional but helpful)" }
} else {
    Warn "C3 — .github\workflows\deploy.yml not found (ensure it exists in your repo)"
}

# package.json build script
if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw
    if ($pkg -match '"build".*vite build.*prerender') {
        Ok "package.json — build script chains vite build + prerender.mjs"
    } elseif ($pkg -match '"build".*prerender') {
        Ok "package.json — build script includes prerender step"
    } else {
        Fail "package.json — build script does NOT include prerender.mjs — routes won't have static HTML"
    }
}

# ─────────────────────────────────────────────────────────────────────────────
Head "═══ PART B — DIST OUTPUT CHECKS (run `npm run build` first) ═══"
# ─────────────────────────────────────────────────────────────────────────────

if (-not (Test-Path "dist")) {
    Warn "dist\ folder not found — run: npm run build  then re-run this script for Part B checks"
} else {
    # C2 — sitemap.xml in dist
    Head "C2 · dist/sitemap.xml"
    if (Test-Path "dist\sitemap.xml") {
        $sitemap = Get-Content "dist\sitemap.xml" -Raw
        $urlCount = ([regex]::Matches($sitemap, "<loc>")).Count
        Ok "dist\sitemap.xml exists — $urlCount <loc> entries found"
        if ($urlCount -lt 30)  { Warn "Fewer than 30 URLs in sitemap — expected 45+. Check TOOLS and BLOG_POSTS arrays" }
        if ($urlCount -ge 40)  { Ok "Sitemap URL count looks complete ($urlCount URLs)" }
        if ($sitemap -match "xmlns:image") { Ok "Sitemap — image: namespace present" }
        else                              { Fail "Sitemap — image: namespace MISSING" }
        if ($sitemap -match "image:image") { Ok "Sitemap — <image:image> tags present" }
        else                              { Fail "Sitemap — <image:image> tags MISSING" }
        if ($sitemap -match "/tools/rytr/")  { Ok "Sitemap — tool page URLs present (/tools/rytr/ found)" }
        else                                { Fail "Sitemap — /tools/rytr/ missing from sitemap" }
        if ($sitemap -match "/blog/")        { Ok "Sitemap — blog URLs present" }
        else                                { Fail "Sitemap — blog URLs missing" }
        if ($sitemap -match "/compare/")     { Ok "Sitemap — compare article URLs present" }
        else                                { Fail "Sitemap — compare URLs missing" }
    } else {
        Fail "dist\sitemap.xml NOT FOUND — sitemap generation in prerender.mjs may have failed"
    }

    # C3 — static HTML pre-rendering
    Head "C3 · Pre-rendered static HTML files"
    $spotCheck = @(
        @{ path = "dist\tools\rytr\index.html";                          label = "Tool page: /tools/rytr/" }
        @{ path = "dist\tools\grammarly\index.html";                     label = "Tool page: /tools/grammarly/" }
        @{ path = "dist\tools\podcastle\index.html";                     label = "Tool page: /tools/podcastle/" }
        @{ path = "dist\blog\best-grammarly-alternatives\index.html";    label = "Blog: /blog/best-grammarly-alternatives/" }
        @{ path = "dist\blog\ai-tools-for-students-free-2026\index.html";label = "Blog: /blog/ai-tools-for-students-free-2026/" }
        @{ path = "dist\compare\grammarly-vs-quillbot\index.html";       label = "Compare: /compare/grammarly-vs-quillbot/" }
        @{ path = "dist\compare\rytr-vs-writesonic\index.html";          label = "Compare: /compare/rytr-vs-writesonic/" }
        @{ path = "dist\about\index.html";                               label = "Static: /about/" }
        @{ path = "dist\best-free-ai-tools\index.html";                  label = "Landing: /best-free-ai-tools/" }
    )
    foreach ($check in $spotCheck) {
        if (Test-Path $check.path) { Ok "$($check.label) — static file exists" }
        else                      { Fail "$($check.label) — FILE MISSING (Googlebot gets 404)" }
    }

    # C4 — per-page meta correctness in pre-rendered HTML
    Head "C4 · Per-page meta correctness in pre-rendered HTML"

    # Rytr tool page
    if (Test-Path "dist\tools\rytr\index.html") {
        $rytr = Get-Content "dist\tools\rytr\index.html" -Raw
        if ($rytr -match "<title>Rytr") { Ok "Rytr page — title contains 'Rytr' (not homepage title)" }
        else                            { Fail "Rytr page — title is WRONG (still shows homepage title)" }
        if ($rytr -match 'canonical.*tools/rytr') { Ok "Rytr page — canonical URL is /tools/rytr/" }
        else                                      { Fail "Rytr page — canonical still points to homepage!" }
        if ($rytr -match '"@type":\s*"Review"') { Ok "Rytr page — Review schema present" }
        else                                    { Fail "Rytr page — Review schema MISSING" }
        if ($rytr -match '"@type":\s*"FAQPage"') { Ok "Rytr page — FAQPage schema present" }
        else                                     { Fail "Rytr page — FAQPage schema MISSING" }
        if ($rytr -match '"@type":\s*"BreadcrumbList"') { Ok "Rytr page — BreadcrumbList schema present" }
        else                                            { Fail "Rytr page — BreadcrumbList schema MISSING" }
    }

    # Blog post check
    if (Test-Path "dist\blog\best-grammarly-alternatives\index.html") {
        $blog = Get-Content "dist\blog\best-grammarly-alternatives\index.html" -Raw
        if ($blog -match "<title>Best Grammarly") { Ok "Blog post — title is page-specific (not homepage)" }
        else                                      { Fail "Blog post — title is WRONG (homepage title showing)" }
        if ($blog -match 'canonical.*blog/best-grammarly') { Ok "Blog post — canonical URL is correct" }
        else                                               { Fail "Blog post — canonical URL is WRONG" }
        if ($blog -match '"@type":\s*"Article"') { Ok "Blog post — Article schema present" }
        else                                     { Fail "Blog post — Article schema MISSING" }
    }

    # Compare page check
    if (Test-Path "dist\compare\grammarly-vs-quillbot\index.html") {
        $cmp = Get-Content "dist\compare\grammarly-vs-quillbot\index.html" -Raw
        if ($cmp -match "<title>Grammarly vs QuillBot") { Ok "Compare page — title is page-specific" }
        else                                            { Fail "Compare page — title is WRONG" }
        if ($cmp -match 'canonical.*compare/grammarly-vs-quillbot') { Ok "Compare page — canonical URL is correct" }
        else                                                         { Fail "Compare page — canonical URL is WRONG" }
    }

    # Duplicate title check — every rendered index.html should have a DIFFERENT title
    Head "C4 · Duplicate title guard — all pre-rendered pages must have unique titles"
    $titles = @{}
    $dupFound = $false
    Get-ChildItem -Path "dist" -Filter "index.html" -Recurse | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        if ($content -match "<title>(.*?)</title>") {
            $title = $Matches[1]
            $rel   = $_.FullName.Replace((Get-Location).Path + "\dist\", "")
            if ($titles.ContainsKey($title)) {
                Fail "Duplicate title '$title' found in: $rel  AND  $($titles[$title])"
                $dupFound = $true
            } else {
                $titles[$title] = $rel
            }
        }
    }
    if (-not $dupFound) { Ok "No duplicate titles found across $($titles.Count) pre-rendered pages" }
}

# ─────────────────────────────────────────────────────────────────────────────
Head "═══ PART C — LIVE SITE CHECKS (requires internet) ═══"
# ─────────────────────────────────────────────────────────────────────────────

$SITE = "https://ainexustools.online"
$checkUrls = @(
    @{ url = "$SITE/robots.txt";         label = "C1 · robots.txt" }
    @{ url = "$SITE/sitemap.xml";        label = "C2 · sitemap.xml" }
    @{ url = "$SITE/tools/rytr/";        label = "C3 · Tool page /tools/rytr/" }
    @{ url = "$SITE/blog/best-grammarly-alternatives/"; label = "C3 · Blog post page" }
    @{ url = "$SITE/compare/rytr-vs-writesonic/"; label = "C3 · Compare page" }
)

Head "C1/C2/C3 · HTTP 200 checks on live URLs"
foreach ($check in $checkUrls) {
    try {
        $resp = Invoke-WebRequest -Uri $check.url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) { Ok "$($check.label) → HTTP 200" }
        else                         { Fail "$($check.label) → HTTP $($resp.StatusCode)" }
    } catch {
        Fail "$($check.label) → Request failed: $_"
    }
}

Head "C4 · Live meta tag checks — page-specific titles and canonicals"
$liveMetaChecks = @(
    @{ url = "$SITE/tools/rytr/";    titlePattern = "Rytr";           canonPattern = "tools/rytr" }
    @{ url = "$SITE/tools/grammarly/"; titlePattern = "Grammarly";    canonPattern = "tools/grammarly" }
    @{ url = "$SITE/blog/best-grammarly-alternatives/"; titlePattern = "Grammarly Alternatives"; canonPattern = "blog/best-grammarly" }
)
foreach ($check in $liveMetaChecks) {
    try {
        $resp = Invoke-WebRequest -Uri $check.url -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $html = $resp.Content

        if ($html -match "<title>$($check.titlePattern)") {
            Ok "$($check.url) — title contains '$($check.titlePattern)'"
        } else {
            Fail "$($check.url) — title WRONG (missing '$($check.titlePattern)'). Google may see homepage title."
        }

        if ($html -match "canonical.*$($check.canonPattern)") {
            Ok "$($check.url) — canonical URL correct"
        } else {
            Fail "$($check.url) — canonical URL WRONG (may still point to homepage)"
        }
    } catch {
        Warn "$($check.url) — could not fetch live page: $_"
    }
}

Head "C2 · Live sitemap.xml content check"
try {
    $sitemapResp = Invoke-WebRequest -Uri "$SITE/sitemap.xml" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    $sitemapContent = $sitemapResp.Content
    $liveUrlCount = ([regex]::Matches($sitemapContent, "<loc>")).Count
    Ok "Live sitemap.xml — $liveUrlCount URLs found"
    if ($liveUrlCount -lt 30) { Warn "Only $liveUrlCount URLs in live sitemap — expected 45+" }
    if ($sitemapContent -match "xmlns:image") { Ok "Live sitemap — image: namespace present" }
    else { Warn "Live sitemap — image: namespace not detected (may not be deployed yet)" }
    if ($sitemapContent -match "/tools/rytr/") { Ok "Live sitemap — tool pages present" }
    else { Fail "Live sitemap — tool pages MISSING from live sitemap" }
} catch {
    Warn "Could not fetch live sitemap: $_"
}

Head "C1 · Live robots.txt content check"
try {
    $robotsResp = Invoke-WebRequest -Uri "$SITE/robots.txt" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $robotsContent = $robotsResp.Content
    if ($robotsContent -match "Allow: /")           { Ok "Live robots.txt — Allow: / present" }
    else                                            { Fail "Live robots.txt — Allow: / MISSING" }
    if ($robotsContent -match "sitemap.xml")        { Ok "Live robots.txt — Sitemap reference present" }
    else                                            { Fail "Live robots.txt — Sitemap reference MISSING" }
} catch {
    Warn "Could not fetch live robots.txt: $_"
}

# ─────────────────────────────────────────────────────────────────────────────
Head "═══ SUMMARY ═══"
# ─────────────────────────────────────────────────────────────────────────────
$total = $pass + $fail + $warn
Write-Host ""
Write-Host "  PASS: $pass / $total" -ForegroundColor Green
Write-Host "  FAIL: $fail / $total" -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Gray" })
Write-Host "  WARN: $warn / $total" -ForegroundColor $(if ($warn -gt 0) { "Yellow" } else { "Gray" })
Write-Host ""

if ($fail -eq 0 -and $warn -eq 0) {
    Write-Host "  ✅  All checks passed. C1→C2→C3→C4 fully implemented." -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "  ✅  No failures. Review $warn warning(s) above." -ForegroundColor Yellow
} else {
    Write-Host "  ❌  $fail check(s) failed. Fix the items marked [FAIL] above." -ForegroundColor Red
    Write-Host "      Re-run after fixes. If dist\ checks fail, run: npm run build" -ForegroundColor Red
}
Write-Host ""
