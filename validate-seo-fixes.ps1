# validate-seo-fixes.ps1
# Run from the root of the AI-Nexus repo:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\validate-seo-fixes.ps1
#
# Checks C1 robots.txt, C2 sitemap, C4 meta injection, C3 pre-render output
# Part A = source files, Part B = dist/ after build, Part C = live site

$pass = 0
$fail = 0
$warn = 0

function Ok($msg)   { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warn++ }
function Head($msg) { Write-Host "`n$msg" -ForegroundColor Cyan }

# ============================================================
Head "=== PART A : SOURCE FILE CHECKS (before build) ==="
# ============================================================

Head "C1 - robots.txt"
if (Test-Path "public\robots.txt") {
    $robots = Get-Content "public\robots.txt" -Raw
    if ($robots -match "User-agent: \*")         { Ok "robots.txt - wildcard User-agent present" }
    else                                         { Fail "robots.txt - missing User-agent: *" }
    if ($robots -match "Allow: /")               { Ok "robots.txt - Allow: / present" }
    else                                         { Fail "robots.txt - missing Allow: /" }
    if ($robots -match "Sitemap:.*sitemap\.xml") { Ok "robots.txt - Sitemap reference present" }
    else                                         { Fail "robots.txt - Sitemap line missing" }
    if ($robots -match "Googlebot")              { Ok "robots.txt - Googlebot entry found" }
    else                                         { Warn "robots.txt - no Googlebot-specific block" }
} else {
    Fail "C1 - public\robots.txt DOES NOT EXIST"
}

Head "C2 - Sitemap link tag in index.html"
if (Test-Path "index.html") {
    $idx = Get-Content "index.html" -Raw
    if ($idx -match 'rel="sitemap"')             { Ok "index.html - rel=sitemap link tag present" }
    else                                         { Fail "index.html - MISSING link rel=sitemap tag in head" }
    if ($idx -match 'href="/sitemap\.xml"')      { Ok "index.html - sitemap href points to /sitemap.xml" }
    else                                         { Warn "index.html - sitemap href may not be /sitemap.xml" }
} else {
    Fail "C2 - index.html not found in current directory"
}

Head "C2 - Sitemap generation in prerender.mjs"
if (Test-Path "scripts\prerender.mjs") {
    $pre = Get-Content "scripts\prerender.mjs" -Raw
    if ($pre -match "generateSitemap")           { Ok "prerender.mjs - generateSitemap() function exists" }
    else                                         { Fail "prerender.mjs - generateSitemap() function MISSING" }
    if ($pre -match "xmlns:image")               { Ok "prerender.mjs - image namespace in sitemap output" }
    else                                         { Fail "prerender.mjs - image namespace MISSING from sitemap" }
    if ($pre -match "image:image")               { Ok "prerender.mjs - image:image tags generated per tool" }
    else                                         { Fail "prerender.mjs - image:image tags MISSING" }
    if ($pre -match "BLOG_POSTS")                { Ok "prerender.mjs - BLOG_POSTS referenced in sitemap" }
    else                                         { Warn "prerender.mjs - check blog posts in generateSitemap" }
    if ($pre -match "COMPARE_ARTICLES")          { Ok "prerender.mjs - COMPARE_ARTICLES referenced in sitemap" }
    else                                         { Warn "prerender.mjs - check compare articles in generateSitemap" }
} else {
    Fail "C2 - scripts\prerender.mjs not found"
}

Head "C4 - Per-page meta injection (buildPage function)"
if (Test-Path "scripts\prerender.mjs") {
    $pre = Get-Content "scripts\prerender.mjs" -Raw
    if ($pre -match "function buildPage")        { Ok "prerender.mjs - buildPage() function exists" }
    else                                         { Fail "prerender.mjs - buildPage() MISSING" }
    if ($pre -match 'rel="canonical"')           { Ok "prerender.mjs - canonical replacement present" }
    else                                         { Fail "prerender.mjs - canonical tag replacement MISSING" }
    if ($pre -match "og:title")                  { Ok "prerender.mjs - OG title replacement present" }
    else                                         { Fail "prerender.mjs - OG title replacement MISSING" }
    if ($pre -match "og:description")            { Ok "prerender.mjs - OG description replacement present" }
    else                                         { Fail "prerender.mjs - OG description replacement MISSING" }
    if ($pre -match "reviewSchema")              { Ok "prerender.mjs - Review schema builder present" }
    else                                         { Fail "prerender.mjs - Review schema MISSING" }
    if ($pre -match "articleSchema")             { Ok "prerender.mjs - Article schema builder present" }
    else                                         { Fail "prerender.mjs - Article schema MISSING" }
    if ($pre -match "faqSchema")                 { Ok "prerender.mjs - FAQPage schema builder present" }
    else                                         { Fail "prerender.mjs - FAQPage schema MISSING" }
    if ($pre -match "breadcrumbs|BreadcrumbList") { Ok "prerender.mjs - BreadcrumbList schema present" }
    else                                         { Fail "prerender.mjs - BreadcrumbList schema MISSING" }
}

Head "C3 - GitHub Actions deploy pipeline"
$deployPath = ".github\workflows\deploy.yml"
if (Test-Path $deployPath) {
    $deploy = Get-Content $deployPath -Raw
    if ($deploy -match "npm run build")          { Ok "deploy.yml - runs npm run build (triggers prerender)" }
    else                                         { Fail "deploy.yml - does NOT call npm run build" }
    if ($deploy -match "upload-pages-artifact")  { Ok "deploy.yml - uploads dist/ to GitHub Pages" }
    else                                         { Warn "deploy.yml - check artifact upload step" }
    if ($deploy -match "www.google.com/ping")    { Ok "deploy.yml - pings Google sitemap after deploy" }
    else                                         { Warn "deploy.yml - no Google sitemap ping step" }
} else {
    Warn "C3 - .github\workflows\deploy.yml not found"
}

if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" -Raw
    if ($pkg -match '"build".*prerender')        { Ok "package.json - build script includes prerender.mjs" }
    elseif ($pkg -match '"build".*vite build')   { Warn "package.json - check prerender.mjs is chained to vite build" }
    else                                         { Fail "package.json - build script missing" }
}

# ============================================================
Head "=== PART B : DIST OUTPUT CHECKS (run npm run build first) ==="
# ============================================================

if (-not (Test-Path "dist")) {
    Warn "dist\ folder not found - run:  npm run build  then re-run this script"
} else {

    Head "C2 - dist/sitemap.xml"
    if (Test-Path "dist\sitemap.xml") {
        $sitemap  = Get-Content "dist\sitemap.xml" -Raw
        $urlCount = ([regex]::Matches($sitemap, "<loc>")).Count
        Ok "dist\sitemap.xml exists - $urlCount URLs found"
        if ($urlCount -lt 30)              { Warn "Only $urlCount URLs - expected 45+" }
        if ($urlCount -ge 40)              { Ok "Sitemap URL count looks complete ($urlCount URLs)" }
        if ($sitemap -match "xmlns:image") { Ok "Sitemap - image namespace present" }
        else                               { Fail "Sitemap - image namespace MISSING" }
        if ($sitemap -match "image:image") { Ok "Sitemap - image:image tags present" }
        else                               { Fail "Sitemap - image:image tags MISSING" }
        if ($sitemap -match "/tools/rytr/") { Ok "Sitemap - tool pages present" }
        else                               { Fail "Sitemap - /tools/rytr/ missing" }
        if ($sitemap -match "/blog/")      { Ok "Sitemap - blog URLs present" }
        else                               { Fail "Sitemap - blog URLs missing" }
        if ($sitemap -match "/compare/")   { Ok "Sitemap - compare URLs present" }
        else                               { Fail "Sitemap - compare URLs missing" }
    } else {
        Fail "dist\sitemap.xml NOT FOUND - generateSitemap() may have failed"
    }

    Head "C3 - Pre-rendered static HTML files"
    $spotCheck = @(
        @{ path = "dist\tools\rytr\index.html";                              label = "/tools/rytr/" }
        @{ path = "dist\tools\grammarly\index.html";                         label = "/tools/grammarly/" }
        @{ path = "dist\tools\podcastle\index.html";                         label = "/tools/podcastle/" }
        @{ path = "dist\tools\murf-ai\index.html";                           label = "/tools/murf-ai/" }
        @{ path = "dist\blog\best-grammarly-alternatives\index.html";        label = "/blog/best-grammarly-alternatives/" }
        @{ path = "dist\blog\ai-tools-for-students-free-2026\index.html";    label = "/blog/ai-tools-for-students-free-2026/" }
        @{ path = "dist\compare\grammarly-vs-quillbot\index.html";           label = "/compare/grammarly-vs-quillbot/" }
        @{ path = "dist\compare\rytr-vs-writesonic\index.html";              label = "/compare/rytr-vs-writesonic/" }
        @{ path = "dist\about\index.html";                                   label = "/about/" }
        @{ path = "dist\best-free-ai-tools\index.html";                      label = "/best-free-ai-tools/" }
    )
    foreach ($c in $spotCheck) {
        if (Test-Path $c.path) { Ok "$($c.label) - static file exists" }
        else                   { Fail "$($c.label) - FILE MISSING (Googlebot gets 404)" }
    }

    Head "C4 - Per-page meta in pre-rendered HTML"
    if (Test-Path "dist\tools\rytr\index.html") {
        $rytr = Get-Content "dist\tools\rytr\index.html" -Raw
        if ($rytr -match "<title>Rytr")                   { Ok "Rytr page - title contains Rytr" }
        else                                              { Fail "Rytr page - title WRONG (homepage showing)" }
        if ($rytr -match "canonical.*tools/rytr")         { Ok "Rytr page - canonical is /tools/rytr/" }
        else                                              { Fail "Rytr page - canonical still points to homepage" }
        if ($rytr -match '"@type":\s*"Review"')           { Ok "Rytr page - Review schema present" }
        else                                              { Fail "Rytr page - Review schema MISSING" }
        if ($rytr -match '"@type":\s*"FAQPage"')          { Ok "Rytr page - FAQPage schema present" }
        else                                              { Fail "Rytr page - FAQPage schema MISSING" }
        if ($rytr -match '"@type":\s*"BreadcrumbList"')   { Ok "Rytr page - BreadcrumbList schema present" }
        else                                              { Fail "Rytr page - BreadcrumbList schema MISSING" }
    }

    if (Test-Path "dist\blog\best-grammarly-alternatives\index.html") {
        $blog = Get-Content "dist\blog\best-grammarly-alternatives\index.html" -Raw
        if ($blog -match "<title>Best Grammarly")          { Ok "Blog page - title is page-specific" }
        else                                               { Fail "Blog page - title WRONG (homepage showing)" }
        if ($blog -match "canonical.*blog/best-grammarly") { Ok "Blog page - canonical URL correct" }
        else                                               { Fail "Blog page - canonical URL WRONG" }
        if ($blog -match '"@type":\s*"Article"')           { Ok "Blog page - Article schema present" }
        else                                               { Fail "Blog page - Article schema MISSING" }
    }

    if (Test-Path "dist\compare\grammarly-vs-quillbot\index.html") {
        $cmp = Get-Content "dist\compare\grammarly-vs-quillbot\index.html" -Raw
        if ($cmp -match "<title>Grammarly vs QuillBot")    { Ok "Compare page - title is page-specific" }
        else                                               { Fail "Compare page - title WRONG" }
        if ($cmp -match "canonical.*compare/grammarly")    { Ok "Compare page - canonical URL correct" }
        else                                               { Fail "Compare page - canonical URL WRONG" }
    }

    Head "C4 - Duplicate title guard"
    $titles   = @{}
    $dupFound = $false
    Get-ChildItem -Path "dist" -Filter "index.html" -Recurse | ForEach-Object {
        $content    = Get-Content $_.FullName -Raw
        $titleMatch = [regex]::Match($content, '<title>(.+?)</title>')
        if ($titleMatch.Success) {
            $t   = $titleMatch.Groups[1].Value
            $rel = $_.FullName.Replace((Get-Location).Path + "\dist\", "")
            if ($titles.ContainsKey($t)) {
                Fail "Duplicate title: $t"
                Fail "  Found in: $rel AND $($titles[$t])"
                $dupFound = $true
            } else {
                $titles[$t] = $rel
            }
        }
    }
    if (-not $dupFound -and $titles.Count -gt 0) {
        Ok "No duplicate titles across $($titles.Count) pre-rendered pages"
    }
}

# ============================================================
Head "=== PART C : LIVE SITE CHECKS (requires internet) ==="
# ============================================================

$SITE = "https://ainexustools.online"

Head "C1/C2/C3 - HTTP 200 spot checks"
$liveUrls = @(
    @{ url = "$SITE/robots.txt";                        label = "C1 - robots.txt" }
    @{ url = "$SITE/sitemap.xml";                       label = "C2 - sitemap.xml" }
    @{ url = "$SITE/tools/rytr/";                       label = "C3 - /tools/rytr/" }
    @{ url = "$SITE/tools/grammarly/";                  label = "C3 - /tools/grammarly/" }
    @{ url = "$SITE/blog/best-grammarly-alternatives/"; label = "C3 - blog post page" }
    @{ url = "$SITE/compare/rytr-vs-writesonic/";       label = "C3 - compare page" }
    @{ url = "$SITE/about/";                            label = "C3 - /about/" }
    @{ url = "$SITE/best-free-ai-tools/";               label = "C3 - /best-free-ai-tools/" }
)
foreach ($c in $liveUrls) {
    try {
        $r = Invoke-WebRequest -Uri $c.url -UseBasicParsing -TimeoutSec 12 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { Ok "$($c.label) - HTTP 200" }
        else                       { Fail "$($c.label) - HTTP $($r.StatusCode)" }
    } catch {
        Fail "$($c.label) - failed: $($_.Exception.Message)"
    }
}

Head "C4 - Live page-specific title and canonical checks"
$metaChecks = @(
    @{ url = "$SITE/tools/rytr/";                       titlePat = "Rytr";                  canPat = "tools/rytr" }
    @{ url = "$SITE/tools/grammarly/";                  titlePat = "Grammarly";              canPat = "tools/grammarly" }
    @{ url = "$SITE/blog/best-grammarly-alternatives/"; titlePat = "Grammarly Alternatives"; canPat = "blog/best-grammarly" }
    @{ url = "$SITE/compare/rytr-vs-writesonic/";       titlePat = "Rytr vs Writesonic";     canPat = "compare/rytr-vs-writesonic" }
)
foreach ($c in $metaChecks) {
    try {
        $r    = Invoke-WebRequest -Uri $c.url -UseBasicParsing -TimeoutSec 12 -ErrorAction Stop
        $html = $r.Content
        if ($html -match "<title>$($c.titlePat)") { Ok "$($c.url) - title contains $($c.titlePat)" }
        else                                      { Fail "$($c.url) - title WRONG - Google sees homepage title" }
        if ($html -match "canonical.*$($c.canPat)") { Ok "$($c.url) - canonical URL correct" }
        else                                        { Fail "$($c.url) - canonical URL WRONG" }
    } catch {
        Warn "$($c.url) - could not fetch: $($_.Exception.Message)"
    }
}

Head "C2 - Live sitemap.xml content"
try {
    $sm  = Invoke-WebRequest -Uri "$SITE/sitemap.xml" -UseBasicParsing -TimeoutSec 15 -ErrorAction Stop
    $smc = $sm.Content
    $cnt = ([regex]::Matches($smc, "<loc>")).Count
    Ok "Live sitemap.xml - $cnt URLs found"
    if ($cnt -lt 30)                 { Warn "Only $cnt URLs in live sitemap - expected 45+" }
    if ($smc -match "xmlns:image")   { Ok "Live sitemap - image namespace present" }
    else                             { Warn "Live sitemap - image namespace absent (push and deploy first)" }
    if ($smc -match "/tools/rytr/")  { Ok "Live sitemap - tool pages present" }
    else                             { Fail "Live sitemap - tool pages MISSING" }
    if ($smc -match "/blog/")        { Ok "Live sitemap - blog pages present" }
    else                             { Fail "Live sitemap - blog pages MISSING" }
} catch {
    Warn "Could not fetch live sitemap: $($_.Exception.Message)"
}

Head "C1 - Live robots.txt content"
try {
    $rb  = Invoke-WebRequest -Uri "$SITE/robots.txt" -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $rbc = $rb.Content
    if ($rbc -match "Allow: /")    { Ok "Live robots.txt - Allow: / present" }
    else                           { Fail "Live robots.txt - Allow: / MISSING" }
    if ($rbc -match "sitemap.xml") { Ok "Live robots.txt - Sitemap reference present" }
    else                           { Fail "Live robots.txt - Sitemap reference MISSING" }
} catch {
    Warn "Could not fetch live robots.txt: $($_.Exception.Message)"
}

# ============================================================
Head "=== SUMMARY ==="
# ============================================================
$total = $pass + $fail + $warn
Write-Host ""
Write-Host "  PASS : $pass / $total" -ForegroundColor Green
Write-Host "  FAIL : $fail / $total" -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Gray" })
Write-Host "  WARN : $warn / $total" -ForegroundColor $(if ($warn -gt 0) { "Yellow" } else { "Gray" })
Write-Host ""
if ($fail -eq 0 -and $warn -eq 0) {
    Write-Host "  All checks passed. C1 -> C2 -> C3 -> C4 fully implemented." -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "  No failures. Review $warn warning(s) above." -ForegroundColor Yellow
} else {
    Write-Host "  $fail check(s) failed. Fix items marked [FAIL] above." -ForegroundColor Red
    Write-Host "  If dist checks fail, run:  npm run build  then re-run." -ForegroundColor Red
}
Write-Host ""
