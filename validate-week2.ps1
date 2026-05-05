# ============================================================
#  AI Nexus - Week 2 Validation Script
#  Run from: the root of your AI-Nexus-main project folder
#  Usage:    PowerShell -ExecutionPolicy Bypass -File .\validate-week2.ps1
# ============================================================

$pass = 0
$fail = 0
$warn = 0

function Pass($msg)    { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function Fail($msg)    { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function Warn($msg)    { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warn++ }
function Section($t)   { Write-Host "`n--- $t ---" -ForegroundColor Cyan }

# ---- Paths ------------------------------------------------------------------
$toolPage    = ".\pages\ToolPage.tsx"
$comparePage = ".\pages\CompareArticlePage.tsx"
$blogPage    = ".\pages\BlogPostPage.tsx"
$indexHtml   = ".\index.html"

foreach ($f in @($toolPage, $comparePage, $blogPage, $indexHtml)) {
    if (-not (Test-Path $f)) {
        Write-Host "ERROR: File not found: $f" -ForegroundColor Red
        exit 1
    }
}

$toolContent = Get-Content $toolPage    -Raw -Encoding UTF8
$cmpContent  = Get-Content $comparePage -Raw -Encoding UTF8
$blogContent = Get-Content $blogPage    -Raw -Encoding UTF8
$htmlContent = Get-Content $indexHtml   -Raw -Encoding UTF8

# ---- W2-1: FAQ Schema on Compare Articles -----------------------------------
Section "W2-1 - FAQ Schema on Compare Articles"

$prerenderPath = ".\scripts\prerender.mjs"
if (Test-Path $prerenderPath) {
    $prerenderContent = Get-Content $prerenderPath -Raw -Encoding UTF8
    if ($prerenderContent -match "FAQPage") {
        Pass "FAQPage schema found in scripts/prerender.mjs (injected at build time)"
    } else {
        Fail "FAQPage schema NOT found in scripts/prerender.mjs"
    }
} else {
    Warn "scripts/prerender.mjs not found - cannot verify FAQPage injection"
}

if ($cmpContent -match "FAQSection") {
    Pass "FAQSection component referenced - visible FAQ accordion will render"
} else {
    Fail "FAQSection component not found in CompareArticlePage.tsx"
}

$faqArrayCount = ([regex]::Matches($cmpContent, 'faqs:\s*\[')).Count
if ($faqArrayCount -ge 10) {
    Pass "faqs[] arrays found in $faqArrayCount compare articles (need >= 10)"
} else {
    Fail "Only $faqArrayCount faqs[] arrays found - need at least 10"
}

# ---- W2-2: Per-tool datePublished + dateModified ----------------------------
Section "W2-2 - Per-Tool datePublished + dateModified in Review Schema"

$dpDataCount = ([regex]::Matches($toolContent, 'datePublished:\s*"20\d\d-\d\d-\d\d"')).Count
if ($dpDataCount -ge 19) {
    Pass "Per-tool datePublished found in $dpDataCount TOOL_CONTENT entries (need 19)"
} else {
    Fail "Only $dpDataCount per-tool datePublished entries found - expected 19"
}

if ($toolContent -match '"datePublished":\s*content\?\.datePublished') {
    Pass "Review schema uses dynamic content?.datePublished (not hardcoded)"
} else {
    Fail "Review schema does NOT use content?.datePublished"
}

if ($toolContent -match '"dateModified":\s*content\?\.lastTested') {
    Pass "dateModified correctly derived from lastTested field"
} else {
    Fail "dateModified field missing or not using lastTested"
}

if ($toolContent -match '"datePublished":\s*"2026-01-01"') {
    Fail "Hardcoded 2026-01-01 still present in Review schema - not fixed"
} else {
    Pass "No hardcoded 2026-01-01 in Review schema"
}

$spotTools = @("grammarly", "podcastle", "taskade", "rytr", "ocoya")
$foundDates = @()
foreach ($slug in $spotTools) {
    $pattern = "(?s)$slug[\s\S]{0,300}datePublished:\s*`"(20\d\d-\d\d-\d\d)`""
    $m = [regex]::Match($toolContent, $pattern)
    if ($m.Success) { $foundDates += "$slug=" + $m.Groups[1].Value }
}
if ($foundDates.Count -ge 4) {
    Pass "Spot-check: unique datePublished on $($foundDates.Count)/5 tools: $($foundDates -join ', ')"
} else {
    Warn "Spot-check: only $($foundDates.Count)/5 tools confirmed - verify manually"
}

# ---- W2-3: Standalone BreadcrumbList schemas --------------------------------
Section "W2-3 - Standalone BreadcrumbList on Tool + Compare + Blog Pages"

$toolBclCount = ([regex]::Matches($toolContent, 'BreadcrumbList')).Count
if ($toolBclCount -ge 2) {
    Pass "ToolPage.tsx has $toolBclCount BreadcrumbList references (nested + standalone)"
} elseif ($toolBclCount -eq 1) {
    Warn "ToolPage.tsx has only 1 BreadcrumbList - standalone script tag may be missing"
} else {
    Fail "BreadcrumbList NOT found in ToolPage.tsx"
}

if ($toolContent -match 'tool\.slug[\s\S]{0,600}BreadcrumbList|BreadcrumbList[\s\S]{0,600}tool\.slug') {
    Pass "ToolPage standalone BreadcrumbList references tool.slug"
} else {
    Warn "Could not confirm tool.slug in standalone BreadcrumbList - verify manually"
}

$cmpBclCount = ([regex]::Matches($cmpContent, 'BreadcrumbList')).Count
if ($cmpBclCount -ge 1) {
    Pass "CompareArticlePage.tsx has $cmpBclCount BreadcrumbList reference(s)"
} else {
    Fail "BreadcrumbList NOT found in CompareArticlePage.tsx"
}

if ($cmpContent -match "data-compare-breadcrumb") {
    Pass "CompareArticlePage injects BreadcrumbList via data-compare-breadcrumb tag"
} else {
    Fail "CompareArticlePage missing data-compare-breadcrumb injection"
}

if ($blogContent -match 'BreadcrumbList') {
    Pass "BreadcrumbList schema present in BlogPostPage.tsx"
} else {
    Fail "BreadcrumbList schema NOT found in BlogPostPage.tsx"
}

# ---- W2-4: Homepage CTR title + meta description ----------------------------
Section "W2-4 - Homepage Title + Meta Description (CTR Optimised)"

if ($htmlContent -match '<title>Best AI Tools for Creators') {
    Pass "Homepage title updated with creator-focused copy"
} else {
    Fail "Homepage title not updated - still has old generic copy"
}

$titleMatch = [regex]::Match($htmlContent, '<title>([^<]+)</title>')
if ($titleMatch.Success) {
    $titleLen = $titleMatch.Groups[1].Value.Length
    if ($titleLen -ge 50 -and $titleLen -le 65) {
        Pass "Title length is $titleLen chars (ideal 50-65)"
    } elseif ($titleLen -lt 50) {
        Warn "Title is $titleLen chars - slightly short (ideal 50-65)"
    } else {
        Warn "Title is $titleLen chars - may truncate in SERPs (ideal 50-65)"
    }
    Write-Host "         Value: $($titleMatch.Groups[1].Value)" -ForegroundColor DarkGray
}

if ($htmlContent -match 'name="description"[^>]*personally tested') {
    Pass "Meta description contains 'personally tested' (CTR signal)"
} else {
    Fail "Meta description missing 'personally tested'"
}

$descMatch = [regex]::Match($htmlContent, '<meta name="description" content="([^"]+)"')
if ($descMatch.Success) {
    $descLen = $descMatch.Groups[1].Value.Length
    if ($descLen -ge 140 -and $descLen -le 165) {
        Pass "Meta description is $descLen chars (ideal 140-165)"
    } elseif ($descLen -lt 140) {
        Warn "Meta description is $descLen chars - too short (ideal 140-165)"
    } else {
        Warn "Meta description is $descLen chars - may truncate in SERPs (ideal <= 165)"
    }
    Write-Host "         Value: $($descMatch.Groups[1].Value)" -ForegroundColor DarkGray
}

if ($htmlContent -match 'og:title[^>]*Personally Tested') {
    Pass "og:title updated with new copy"
} else {
    Fail "og:title NOT updated"
}

if ($htmlContent -match 'twitter:title[^>]*Personally Tested') {
    Pass "twitter:title updated with new copy"
} else {
    Fail "twitter:title NOT updated"
}

if ($htmlContent -match 'AI Nexus by Navneet Arya</title>') {
    Fail "Old title string still present in index.html"
} else {
    Pass "Old generic title string removed from index.html"
}

# ---- Summary ----------------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  WEEK 2 RESULTS: $pass passed | $fail failed | $warn warnings" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan

if ($fail -eq 0 -and $warn -eq 0) {
    Write-Host "  All checks passed. Ready to commit and push." -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "  No failures. Review $warn warning(s) above." -ForegroundColor Yellow
} else {
    Write-Host "  Fix $fail failing check(s) before committing." -ForegroundColor Red
}
Write-Host ""
