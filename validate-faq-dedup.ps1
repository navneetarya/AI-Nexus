# ============================================================
#  AI Nexus - FAQ Deduplication Validation Script
#  Checks that ToolPage.tsx does NOT emit a second FAQPage schema
#  Run from: root of your AI-Nexus-main project folder
#  Usage: PowerShell -ExecutionPolicy Bypass -File .\validate-faq-dedup.ps1
# ============================================================

$pass = 0
$fail = 0

function Pass($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green; $global:pass++ }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red;   $global:fail++ }
function Section($t){ Write-Host "`n--- $t ---" -ForegroundColor Cyan }

$toolPage    = ".\pages\ToolPage.tsx"
$comparePage = ".\pages\CompareArticlePage.tsx"
$prerender   = ".\scripts\prerender.mjs"

foreach ($f in @($toolPage, $comparePage, $prerender)) {
    if (-not (Test-Path $f)) {
        Write-Host "ERROR: File not found: $f" -ForegroundColor Red; exit 1
    }
}

$toolContent = Get-Content $toolPage    -Raw -Encoding UTF8
$cmpContent  = Get-Content $comparePage -Raw -Encoding UTF8
$prerenderC  = Get-Content $prerender   -Raw -Encoding UTF8

# ---- ToolPage.tsx -----------------------------------------------------------
Section "ToolPage.tsx - Duplicate FAQPage check"

if ($toolContent -match 'const faqSchema\s*=') {
    Fail "faqSchema const still exists in ToolPage.tsx - duplicate WILL occur"
} else {
    Pass "faqSchema const removed from ToolPage.tsx"
}

if ($toolContent -match 'JSON\.stringify\(faqSchema\)') {
    Fail "faqSchema is still being rendered as a script tag in ToolPage.tsx JSX"
} else {
    Pass "No faqSchema script tag in ToolPage.tsx JSX"
}

$faqPageCount = ([regex]::Matches($toolContent, '"@type":\s*"FAQPage"')).Count
if ($faqPageCount -eq 0) {
    Pass "Zero FAQPage schema definitions in ToolPage.tsx (correct - prerender handles it)"
} else {
    Fail "Found $faqPageCount FAQPage definition(s) in ToolPage.tsx - should be 0"
}

if ($toolContent -match 'prerender') {
    Pass "ToolPage.tsx has a comment explaining prerender.mjs handles FAQPage"
} else {
    Warn "Consider adding a comment explaining why FAQPage is not rendered here"
}

# Review + BreadcrumbList schemas should still be there
$ldJsonCount = ([regex]::Matches($toolContent, 'application/ld\+json')).Count
if ($ldJsonCount -eq 2) {
    Pass "ToolPage.tsx still emits exactly 2 schema scripts (Review + BreadcrumbList)"
} else {
    Fail "ToolPage.tsx emits $ldJsonCount schema scripts - expected exactly 2"
}

# ---- CompareArticlePage.tsx - should also be clean --------------------------
Section "CompareArticlePage.tsx - Duplicate FAQPage check"

$cmpFaqInJsx = ([regex]::Matches($cmpContent, 'JSON\.stringify.*faqSchema|faqSchema.*JSON\.stringify')).Count
if ($cmpFaqInJsx -eq 0) {
    Pass "CompareArticlePage.tsx does not emit a faqSchema script tag"
} else {
    Fail "CompareArticlePage.tsx is emitting faqSchema directly - possible duplicate"
}

if ($cmpContent -match 'prerender|already injected|Do NOT add') {
    Pass "CompareArticlePage.tsx has a guard comment about prerender injection"
} else {
    Pass "CompareArticlePage.tsx does not inline FAQPage schema (correct)"
}

# ---- prerender.mjs - must be the single source of truth ---------------------
Section "prerender.mjs - Single source of truth for FAQPage"

if ($prerenderC -match "FAQPage") {
    Pass "prerender.mjs contains FAQPage injection (source of truth)"
} else {
    Fail "prerender.mjs does NOT contain FAQPage - schema will be missing entirely"
}

$prerenderToolFAQ = ([regex]::Matches($prerenderC, "TOOL_FAQS\[tool\.slug\]")).Count
if ($prerenderToolFAQ -ge 1) {
    Pass "prerender.mjs uses TOOL_FAQS[tool.slug] to inject per-tool FAQ schema"
} else {
    Fail "prerender.mjs does not reference TOOL_FAQS[tool.slug]"
}

# ---- Summary ----------------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  FAQ DEDUP RESULTS: $pass passed | $fail failed" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan

if ($fail -eq 0) {
    Write-Host "  No duplicates. FAQPage is injected only by prerender.mjs." -ForegroundColor Green
    Write-Host "  After deploying, re-request indexing in Google Search Console." -ForegroundColor DarkGray
} else {
    Write-Host "  Fix $fail issue(s) above before pushing." -ForegroundColor Red
}
Write-Host ""
