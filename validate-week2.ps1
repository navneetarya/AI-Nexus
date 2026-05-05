# ============================================================
#  AI Nexus — Week 2 Validation Script
#  Run from: the root of your AI-Nexus-main project folder
#  Usage:    .\validate-week2.ps1
# ============================================================

$pass = 0
$fail = 0
$warn = 0

function Pass($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warn++ }
function Section($title) { Write-Host "`n── $title ─────────────────────────────" -ForegroundColor Cyan }

# ── Paths ────────────────────────────────────────────────────────────────────
$toolPage    = ".\pages\ToolPage.tsx"
$comparePage = ".\pages\CompareArticlePage.tsx"
$blogPage    = ".\pages\BlogPostPage.tsx"
$indexHtml   = ".\index.html"

foreach ($f in @($toolPage, $comparePage, $blogPage, $indexHtml)) {
    if (-not (Test-Path $f)) { Write-Host "ERROR: File not found: $f" -ForegroundColor Red; exit 1 }
}

# ── W2-1: FAQ Schema on Compare Articles ─────────────────────────────────────
Section "W2-1 · FAQ Schema on Compare Articles"

$cmpContent = Get-Content $comparePage -Raw

# FAQPage is injected by prerender.mjs (not duplicated in the React component by design)
$prerenderContent = if (Test-Path ".\scripts\prerender.mjs") { Get-Content ".\scripts\prerender.mjs" -Raw } else { "" }
if ($prerenderContent -match "FAQPage" -or $cmpContent -match "'@type':\s*'FAQPage'") {
    Pass "FAQPage schema present (in prerender.mjs or CompareArticlePage)"
} else {
    Warn "FAQPage schema not found in prerender.mjs — check scripts/prerender.mjs"
}

if ($cmpContent -match "FAQSection") {
    Pass "FAQSection component referenced (visible accordion renders)"
} else {
    Fail "FAQSection component not found — FAQ UI will not render"
}

# Count articles with faqs[] arrays
$faqArrayCount = ([regex]::Matches($cmpContent, 'faqs:\s*\[') | Where-Object { $_.Value -ne '' }).Count
if ($faqArrayCount -ge 10) {
    Pass "faqs[] arrays found in $faqArrayCount compare articles (>= 10 required)"
} else {
    Fail "Only $faqArrayCount faqs[] arrays found — need at least 10"
}

# ── W2-2: datePublished + dateModified per tool ──────────────────────────────
Section "W2-2 · Per-Tool datePublished + dateModified in Review Schema"

$toolContent = Get-Content $toolPage -Raw

# Count per-tool datePublished fields in TOOL_CONTENT data
$dpDataCount = ([regex]::Matches($toolContent, 'datePublished:\s*"20\d\d-\d\d-\d\d"')).Count
if ($dpDataCount -ge 19) {
    Pass "Per-tool datePublished found in $dpDataCount TOOL_CONTENT entries (need 19)"
} else {
    Fail "Only $dpDataCount per-tool datePublished entries found — expected 19"
}

# Schema uses dynamic content?.datePublished (not hardcoded)
if ($toolContent -match '"datePublished":\s*content\?\.datePublished') {
    Pass "Review schema uses dynamic content?.datePublished (not hardcoded)"
} else {
    Fail "Review schema does NOT use content?.datePublished — still hardcoded"
}

# dateModified still uses lastTested conversion
if ($toolContent -match '"dateModified":\s*content\?\.lastTested') {
    Pass "dateModified correctly uses lastTested field"
} else {
    Fail "dateModified field missing or not using lastTested"
}

# Verify no tool still has hardcoded 2026-01-01 in schema
if ($toolContent -match '"datePublished":\s*"2026-01-01"') {
    Fail "Hardcoded '2026-01-01' still present in Review schema — not fixed"
} else {
    Pass "No hardcoded '2026-01-01' in Review schema"
}

# ── W2-3: Standalone BreadcrumbList schemas ──────────────────────────────────
Section "W2-3 · Standalone BreadcrumbList Schema on Tool + Compare + Blog Pages"

# ToolPage — standalone BreadcrumbList script tag
if ($toolContent -match 'BreadcrumbList') {
    Pass "BreadcrumbList schema present in ToolPage.tsx"
} else {
    Fail "BreadcrumbList schema NOT found in ToolPage.tsx"
}

# ToolPage — should have BOTH nested (inside Review) and standalone
$bclCount = ([regex]::Matches($toolContent, 'BreadcrumbList')).Count
if ($bclCount -ge 2) {
    Pass "ToolPage has $bclCount BreadcrumbList references (nested + standalone)"
} else {
    Warn "ToolPage has only $bclCount BreadcrumbList reference — expected 2 (nested + standalone)"
}

# ToolPage — standalone script block check
if ($toolContent -match "data-compare-breadcrumb|itemListElement.*tool\.category|tool\.slug.*BreadcrumbList|BreadcrumbList[\s\S]{0,400}tool\.slug") {
    Pass "ToolPage standalone BreadcrumbList includes tool.slug"
} else {
    Warn "Could not confirm ToolPage standalone BreadcrumbList includes tool.slug — verify manually"
}

# CompareArticlePage — BreadcrumbList in useEffect
if ($cmpContent -match 'BreadcrumbList') {
    Pass "BreadcrumbList schema present in CompareArticlePage.tsx"
} else {
    Fail "BreadcrumbList schema NOT found in CompareArticlePage.tsx"
}

if ($cmpContent -match "data-compare-breadcrumb") {
    Pass "CompareArticlePage injects BreadcrumbList via data-compare-breadcrumb script tag"
} else {
    Fail "CompareArticlePage missing data-compare-breadcrumb injection"
}

# BlogPostPage — BreadcrumbList (should already exist)
$blogContent = Get-Content $blogPage -Raw
if ($blogContent -match 'BreadcrumbList') {
    Pass "BreadcrumbList schema present in BlogPostPage.tsx"
} else {
    Fail "BreadcrumbList schema NOT found in BlogPostPage.tsx"
}

# ── W2-4: Homepage CTR title + meta ──────────────────────────────────────────
Section "W2-4 · Homepage Title + Meta Description (CTR Optimised)"

$htmlContent = Get-Content $indexHtml -Raw

# Title check — must contain creator-focused keywords
if ($htmlContent -match '<title>Best AI Tools for Creators') {
    Pass "Homepage <title> updated with creator-focused copy"
} else {
    Fail "Homepage <title> not updated — still generic"
}

# Title length check
$titleMatch = [regex]::Match($htmlContent, '<title>([^<]+)</title>')
if ($titleMatch.Success) {
    $titleLen = $titleMatch.Groups[1].Value.Length
    if ($titleLen -ge 50 -and $titleLen -le 65) {
        Pass "Title length is $titleLen chars (ideal 50-65)"
    } elseif ($titleLen -lt 50) {
        Warn "Title length $titleLen chars — slightly short (ideal 50-65)"
    } else {
        Warn "Title length $titleLen chars — slightly long (ideal 50-65)"
    }
}

# Meta description check — must contain "personally tested"
if ($htmlContent -match 'content="Honest.*personally tested') {
    Pass "Meta description contains 'personally tested' (CTR-optimised)"
} else {
    Fail "Meta description does not contain 'personally tested'"
}

# Meta description length check
$descMatch = [regex]::Match($htmlContent, '<meta name="description" content="([^"]+)"')
if ($descMatch.Success) {
    $descLen = $descMatch.Groups[1].Value.Length
    if ($descLen -ge 140 -and $descLen -le 165) {
        Pass "Meta description length is $descLen chars (ideal 140-165)"
    } elseif ($descLen -lt 140) {
        Warn "Meta description $descLen chars — too short (ideal 140-165)"
    } else {
        Warn "Meta description $descLen chars — may get truncated in SERPs (ideal 140-165)"
    }
}

# OG title updated
if ($htmlContent -match 'og:title.*Personally Tested') {
    Pass "og:title updated with new copy"
} else {
    Fail "og:title NOT updated"
}

# Twitter title updated
if ($htmlContent -match 'twitter:title.*Personally Tested') {
    Pass "twitter:title updated with new copy"
} else {
    Fail "twitter:title NOT updated"
}

# Old generic title must be gone
if ($htmlContent -match 'Best AI Tools Reviewed 2026 — AI Nexus by Navneet Arya') {
    Fail "Old title string still present in index.html — not fully replaced"
} else {
    Pass "Old generic title string has been removed"
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host "`n════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  WEEK 2 RESULTS: $pass passed  |  $fail failed  |  $warn warnings" -ForegroundColor White
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan

if ($fail -eq 0) {
    Write-Host "  All Week 2 checks passed. Ready to commit." -ForegroundColor Green
} else {
    Write-Host "  Fix the $fail failing checks before committing." -ForegroundColor Red
}
Write-Host ""
