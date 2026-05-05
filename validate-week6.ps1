# ============================================================
#  AI Nexus — Week 6 Task Validation Script
#  Run from your repo root:  .\validate-week6.ps1
#  PowerShell 5.1+ / PowerShell 7+ compatible
# ============================================================

$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$Pass  = 0
$Fail  = 0
$Warns = 0

function Check($label, $condition, [string]$hint = "") {
    if ($condition) {
        Write-Host "  [PASS] $label" -ForegroundColor Green
        $script:Pass++
    } else {
        Write-Host "  [FAIL] $label" -ForegroundColor Red
        if ($hint) { Write-Host "         HINT: $hint" -ForegroundColor DarkYellow }
        $script:Fail++
    }
}

function Warn($label, $msg) {
    Write-Host "  [WARN] $label — $msg" -ForegroundColor Yellow
    $script:Warns++
}

Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  AI Nexus · Week 6 Validation" -ForegroundColor Cyan
Write-Host "  Repo: $RepoRoot" -ForegroundColor DarkGray
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# ─── File existence checks ───────────────────────────────────
$indexHtml   = Join-Path $RepoRoot "index.html"
$sitemapXml  = Join-Path $RepoRoot "public\sitemap.xml"
$aboutPage   = Join-Path $RepoRoot "pages\AboutPage.tsx"
$toolPage    = Join-Path $RepoRoot "pages\ToolPage.tsx"

foreach ($f in @($indexHtml, $sitemapXml, $aboutPage, $toolPage)) {
    if (-not (Test-Path $f)) {
        Write-Host "[ERROR] Required file not found: $f" -ForegroundColor Red
        Write-Host "        Make sure you are running this script from your repo root." -ForegroundColor DarkYellow
        exit 1
    }
}

$indexContent  = Get-Content $indexHtml  -Raw
$sitemapContent= Get-Content $sitemapXml -Raw
$aboutContent  = Get-Content $aboutPage  -Raw
$toolContent   = Get-Content $toolPage   -Raw

# =============================================================
# TASK 3 — Remove Redundant Google Fonts CDN
# =============================================================
Write-Host "TASK 3 · Remove Redundant Google Fonts CDN (index.html)" -ForegroundColor White
Write-Host "---------------------------------------------------------"

Check "No fonts.googleapis.com preconnect tag" `
    (-not ($indexContent -match '<link[^>]+fonts\.googleapis\.com[^>]+rel=["\']preconnect')) `
    "Remove: <link rel='preconnect' href='https://fonts.googleapis.com' />"

Check "No fonts.gstatic.com preconnect tag" `
    (-not ($indexContent -match '<link[^>]+fonts\.gstatic\.com')) `
    "Remove: <link rel='preconnect' href='https://fonts.gstatic.com' crossorigin />"

Check "No Google Fonts CDN stylesheet link (media=print)" `
    (-not ($indexContent -match 'fonts\.googleapis\.com/css2.*media=["\']print')) `
    "Remove the <link rel='stylesheet' href='https://fonts.googleapis.com...' media='print' .../> line"

Check "No noscript Google Fonts fallback" `
    (-not ($indexContent -match '<noscript>.*fonts\.googleapis')) `
    "Remove the <noscript><link ... fonts.googleapis.com ... /></noscript> block"

Check "Self-hosted @font-face rules still present (Syne)" `
    ($indexContent -match "@font-face") `
    "The local @font-face rules inside <style> should remain — do not delete them"

Check "Self-hosted woff2 font paths present" `
    ($indexContent -match "/fonts/syne-v24-latin") `
    "Ensure the @font-face src: url('/fonts/...') blocks are still in index.html"

Write-Host ""

# =============================================================
# TASK 2 — Image Sitemap Entries
# =============================================================
Write-Host "TASK 2 · Add Image Sitemap Entries (public/sitemap.xml)" -ForegroundColor White
Write-Host "---------------------------------------------------------"

Check "Image sitemap XML namespace declared" `
    ($sitemapContent -match 'xmlns:image="https://www\.google\.com/schemas/sitemap-image/1\.1"') `
    "Add xmlns:image='https://www.google.com/schemas/sitemap-image/1.1' to the <urlset> tag"

# Check image entries for all 19 logos
$logos = @("rytr","podcastle","ocoya","replit","taskade","grammarly","writesonic",
           "quillbot","frase","leonardo-ai","photoroom","looka","pictory",
           "opus-clip","invideo","murf-ai","gamma","beautiful-ai","notion-ai")

foreach ($logo in $logos) {
    Check "image:image entry for /logos/$logo.png" `
        ($sitemapContent -match [regex]::Escape("/logos/$logo.png")) `
        "Add <image:image><image:loc>https://ainexustools.online/logos/$logo.png</image:loc></image:image> inside the <url> block for /tools/$logo/"
}

Check "OG image entry on blog/ URL" `
    ($sitemapContent -match 'og-image\.png') `
    "Blog post <url> entries should include <image:image><image:loc>.../og-image.png</image:loc></image:image>"

# Validate XML is well-formed
try {
    [xml]$xml = $sitemapContent
    Check "sitemap.xml is well-formed XML (no syntax errors)" $true
} catch {
    Check "sitemap.xml is well-formed XML (no syntax errors)" $false `
        "XML parse error: $($_.Exception.Message) — check for unclosed tags or special characters"
}

Write-Host ""

# =============================================================
# TASK 4 — Author Image Alt Text
# =============================================================
Write-Host "TASK 4 · Update Author Image Alt Text (pages/AboutPage.tsx)" -ForegroundColor White
Write-Host "-------------------------------------------------------------"

Check "Alt text contains 'Navneet Arya'" `
    ($aboutContent -match 'alt="[^"]*Navneet Arya') `
    "The img alt attribute should include 'Navneet Arya'"

Check "Alt text mentions 'AI tools reviewer'" `
    ($aboutContent -match 'AI tools reviewer') `
    "Add 'AI tools reviewer' to the alt text for the author image"

Check "Alt text mentions 'AI Nexus'" `
    ($aboutContent -match 'alt="[^"]*AI Nexus') `
    "Alt text should reference 'AI Nexus' as the site name"

Check "Alt text mentions '20+' tools tested" `
    ($aboutContent -match '20\+') `
    "Include '20+ AI' tools tested in the alt text"

Check "Alt text mentions year (2022 or 2026)" `
    ($aboutContent -match 'since 2022|since 2026') `
    "Include 'since 2022' or similar experience duration in the alt text"

$oldAlt = 'alt="Navneet Arya — founder of AI Nexus"'
Check "Old short alt text removed" `
    (-not ($aboutContent -match [regex]::Escape($oldAlt))) `
    "Remove or replace the old short alt: $oldAlt"

Write-Host ""

# =============================================================
# TASK 1 — Expand 5 Tool Pages to 700+ Words
# =============================================================
Write-Host "TASK 1 · Expand 5 Tool Pages to 700+ Words (pages/ToolPage.tsx)" -ForegroundColor White
Write-Host "-----------------------------------------------------------------"

$toolsToCheck = @{
    "grammarly"  = @{ faq="Is Grammarly free"; pricing="Free vs Premium"; minChars=2000 }
    "writesonic" = @{ faq="Writesonic vs Rytr|good for SEO"; pricing="\\\$19"; minChars=1800 }
    "quillbot"   = @{ faq="Is Quillbot free"; pricing="125-word limit|\\\\$10"; minChars=2000 }
    "frase"      = @{ faq="Frase.*SEO|Frase vs Surfer"; pricing="\\\$15|\\\$45"; minChars=1800 }
    "murf-ai"    = @{ faq="Is Murf AI free|Murf.*ElevenLabs"; pricing="\\\$19"; minChars=1800 }
}

foreach ($tool in $toolsToCheck.Keys) {
    $cfg = $toolsToCheck[$tool]

    # Extract character count for this tool's data block
    $pattern = "(?s)$tool['\s]*:\s*\{(.+?)(?=\n  [a-z'\`"]+:|\n  \})"
    $matches = [regex]::Match($toolContent, $pattern)
    $blockLen = if ($matches.Success) { $matches.Value.Length } else { 0 }

    Check "$tool — content block expanded (min ~$($cfg.minChars) chars)" `
        ($blockLen -ge $cfg.minChars) `
        "Current block is only $blockLen chars. Add whoIsItFor detail, myTake expansion, useCases, pricingSection, and faqs array."

    Check "$tool — FAQ content present" `
        ($toolContent -match $cfg.faq) `
        "Add a 'faqs' array to the $tool data block with questions like '$($cfg.faq)'"

    Check "$tool — pricing information present" `
        ($toolContent -match $cfg.pricing) `
        "Add pricing details matching pattern '$($cfg.pricing)' to the $tool data block"

    Check "$tool — lastTestedISO field added" `
        ($toolContent -match "lastTestedISO.*202[56]") `
        "Add lastTestedISO: '2026-XX-XX' field to the $tool data block for structured data"
}

Write-Host ""

# =============================================================
# BONUS — Live URL checks (optional, requires internet)
# =============================================================
Write-Host "BONUS · Live Site Checks (requires internet + deployed build)" -ForegroundColor White
Write-Host "---------------------------------------------------------------"

$checkLive = Read-Host "Run live URL checks against ainexustools.online? [y/N]"
if ($checkLive -match "^[yY]") {

    function FetchUrl($url) {
        try {
            $r = Invoke-WebRequest -Uri $url -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            return $r
        } catch { return $null }
    }

    $sitemap = FetchUrl "https://ainexustools.online/sitemap.xml"
    Check "Live sitemap.xml is accessible" ($null -ne $sitemap)

    if ($null -ne $sitemap) {
        Check "Live sitemap has image namespace" `
            ($sitemap.Content -match 'xmlns:image') `
            "Deploy and resubmit sitemap — live version doesn't have image namespace yet"
        Check "Live sitemap has image:image tags" `
            ($sitemap.Content -match 'image:image') `
            "Deploy updated sitemap.xml to GitHub Pages"
    }

    $homepage = FetchUrl "https://ainexustools.online/"
    Check "Live homepage is accessible" ($null -ne $homepage)

    if ($null -ne $homepage) {
        Check "Live homepage has NO Google Fonts CDN link" `
            (-not ($homepage.Content -match 'fonts\.googleapis\.com/css2')) `
            "Deploy updated index.html — live site still loading Google Fonts CDN"
        Check "Live homepage loads self-hosted fonts (@font-face)" `
            ($homepage.Content -match '@font-face') `
            "Self-hosted @font-face rules missing from live index.html"
    }

    $grammarly = FetchUrl "https://ainexustools.online/tools/grammarly/"
    Check "Live Grammarly tool page accessible" ($null -ne $grammarly)

} else {
    Warn "Live checks skipped" "Re-run with [y] after deploying to GitHub Pages"
}

Write-Host ""

# =============================================================
# SUMMARY
# =============================================================
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  RESULTS" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "  Passed : $Pass" -ForegroundColor Green
Write-Host "  Failed : $Fail" -ForegroundColor $(if ($Fail -eq 0) { "Green" } else { "Red" })
Write-Host "  Warned : $Warns" -ForegroundColor Yellow
Write-Host ""

if ($Fail -eq 0) {
    Write-Host "  ALL CHECKS PASSED. Safe to commit and push." -ForegroundColor Green
} else {
    Write-Host "  FIX $Fail FAILING CHECK(S) BEFORE COMMITTING." -ForegroundColor Red
}

Write-Host ""
Write-Host "  Next step — commit and push:" -ForegroundColor DarkGray
Write-Host "  git add index.html public/sitemap.xml pages/AboutPage.tsx pages/ToolPage.tsx" -ForegroundColor DarkGray
Write-Host "  git commit -m 'Week 6: remove CDN fonts, image sitemap, author alt, expand 5 tool pages'" -ForegroundColor DarkGray
Write-Host "  git push origin main" -ForegroundColor DarkGray
Write-Host ""
