# ============================================================
# Validate-GEO-Fixes.ps1
# GEO Section 05 — Validation for G2, G4, G5 fixes
# Run from your project root: .\Validate-GEO-Fixes.ps1
# ============================================================

$ErrorCount = 0
$PassCount  = 0

function Pass  { param($msg) Write-Host "  [PASS] $msg" -ForegroundColor Green;  $script:PassCount++ }
function Fail  { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $script:ErrorCount++ }
function Warn  { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Head  { param($msg) Write-Host "`n$msg" -ForegroundColor Cyan }

# ──────────────────────────────────────────────────────────────
# PRE-CHECK: Confirm we are in the project root
# ──────────────────────────────────────────────────────────────
Head "=== PRE-CHECK: Project Root ==="
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Run this script from your project root (where package.json lives)." -ForegroundColor Red
    exit 1
}
Pass "package.json found — correct directory"


# ──────────────────────────────────────────────────────────────
# FIX G2: llms-full.txt
# ──────────────────────────────────────────────────────────────
Head "=== G2: llms-full.txt ==="

$llmsFullPath = "public\llms-full.txt"

if (Test-Path $llmsFullPath) {
    Pass "File exists: $llmsFullPath"

    $content = Get-Content $llmsFullPath -Raw
    $sizeKB   = [math]::Round((Get-Item $llmsFullPath).Length / 1024, 1)

    # Size check (should be > 5KB, < 100KB)
    if ($sizeKB -gt 5 -and $sizeKB -lt 100) {
        Pass "File size ${sizeKB}KB — within 5–100KB target"
    } elseif ($sizeKB -le 5) {
        Fail "File too small (${sizeKB}KB) — content may be missing"
    } else {
        Warn "File is ${sizeKB}KB — approaching 100KB LLM context limit"
    }

    # Check key structural markers
    if ($content -match "## TOOL REVIEW:")         { Pass "Contains TOOL REVIEW sections" }         else { Fail "Missing '## TOOL REVIEW:' markers" }
    if ($content -match "Quick Verdict")            { Pass "Contains 'Quick Verdict' headings" }      else { Fail "Missing 'Quick Verdict' headings" }
    if ($content -match "Who Should Use")           { Pass "Contains 'Who Should Use' headings" }     else { Fail "Missing 'Who Should Use' headings" }
    if ($content -match "Who Should NOT Use")       { Pass "Contains 'Who Should NOT Use' headings" } else { Fail "Missing 'Who Should NOT Use' headings" }
    if ($content -match "Pricing 2026")             { Pass "Contains 'Pricing 2026' headings" }       else { Fail "Missing 'Pricing 2026' headings" }
    if ($content -match "SECTION: BLOG POSTS|SECTION: GUIDES") { Pass "Contains blog/guides section" } else { Fail "Missing blog posts section" }
    if ($content -match "Navneet Arya")             { Pass "Author attribution present" }             else { Fail "Missing author attribution" }

    # Check tool count
    $toolCount = ([regex]::Matches($content, "## TOOL REVIEW:")).Count
    if ($toolCount -ge 5) { Pass "Contains $toolCount tool reviews (minimum 5)" }
    else                  { Fail "Only $toolCount tool reviews found — add more" }

} else {
    Fail "MISSING: $llmsFullPath — run: node scripts/generate-llms-full.mjs"
}

# Check the generate script exists
if (Test-Path "scripts\generate-llms-full.mjs") {
    Pass "Generator script exists: scripts\generate-llms-full.mjs"
} else {
    Fail "MISSING generator script: scripts\generate-llms-full.mjs"
}

# Check package.json has the generate:llms script
$pkgJson = Get-Content "package.json" -Raw
if ($pkgJson -match "generate:llms") {
    Pass "package.json has 'generate:llms' npm script"
} else {
    Fail "package.json missing 'generate:llms' script — add it"
}

# Check build script includes llms-full generation
if ($pkgJson -match "generate-llms-full") {
    Pass "Build pipeline includes llms-full generation"
} else {
    Warn "Build script does not call generate-llms-full.mjs — update 'build' in package.json"
}


# ──────────────────────────────────────────────────────────────
# FIX G4: @graph Organization+Person schema in index.html
# ──────────────────────────────────────────────────────────────
Head "=== G4: @graph Organization + Person Schema in index.html ==="

$indexPath = "index.html"

if (Test-Path $indexPath) {
    Pass "index.html found"
    $html = Get-Content $indexPath -Raw

    # Must have @graph
    if ($html -match '"@graph"')               { Pass "@graph array present" }
    else                                        { Fail "MISSING @graph — Organization and Person must be linked via @graph" }

    # Organization node with @id
    if ($html -match '"@type":\s*"Organization"') { Pass "Organization type present" } else { Fail "Missing Organization @type" }
    if ($html -match '"@id":\s*"https://ainexustools\.online/#organization"') {
        Pass "Organization @id correctly set"
    } else {
        Fail "Missing or wrong Organization @id (expected https://ainexustools.online/#organization)"
    }

    # foundingDate on Organization
    if ($html -match '"foundingDate"')          { Pass "foundingDate present on Organization" }
    else                                        { Fail "MISSING foundingDate on Organization" }

    # founder linking back via @id
    if ($html -match '"founder"')               { Pass "founder property present" }
    else                                        { Fail "MISSING founder property on Organization" }

    # Person node with @id
    if ($html -match '"@type":\s*"Person"')     { Pass "Person type present" } else { Fail "Missing Person @type" }
    if ($html -match '"@id":\s*"https://ainexustools\.online/about#author"') {
        Pass "Person @id correctly set"
    } else {
        Fail "Missing or wrong Person @id (expected https://ainexustools.online/about#author)"
    }

    # Cross-link — Person.worksFor references Organization @id
    if ($html -match '"worksFor".*"@id"' -or $html -match '"@id".*organization') {
        Pass "Person.worksFor references Organization @id (cross-link present)"
    } else {
        Warn "Person.worksFor may not be referencing Organization via @id — verify cross-linking"
    }

    # Organization.knowsAbout
    if ($html -match '"knowsAbout"')            { Pass "knowsAbout present (entity context for AI)" }
    else                                        { Fail "MISSING knowsAbout — needed for AI entity recognition" }

    # Old disconnected schema should be gone
    if ($html -notmatch '<!-- Schema: Person \(EEAT') {
        Pass "Old disconnected Person-only schema comment removed"
    } else {
        Warn "Old schema comment still present — confirm it was replaced, not duplicated"
    }

} else {
    Fail "MISSING index.html at project root"
}


# ──────────────────────────────────────────────────────────────
# FIX G5: Semantic section elements in ToolPage.tsx
# ──────────────────────────────────────────────────────────────
Head "=== G5: Semantic <section> Elements in ToolPage.tsx ==="

$toolPagePath = "pages\ToolPage.tsx"

if (Test-Path $toolPagePath) {
    Pass "ToolPage.tsx found"
    $tsx = Get-Content $toolPagePath -Raw

    # geoSection helper
    if ($tsx -match 'geoSection')              { Pass "geoSection() helper function present" }
    else                                       { Fail "MISSING geoSection() helper — required for semantic <section> rendering" }

    # Quick Verdict: must be a <section> with aria-label, not a <div>
    if ($tsx -match 'aria-label="Quick Verdict"') {
        Pass "Quick Verdict has aria-label='Quick Verdict'"
    } else {
        Fail "MISSING aria-label='Quick Verdict' on verdict block — still a plain <div>"
    }

    # Quick Verdict: h2 with "Worth It?" pattern
    if ($tsx -match "Is \{tool\.name\} Worth It\? — Quick Verdict") {
        Pass "Quick Verdict h2 uses 'Is [Tool] Worth It?' pattern"
    } else {
        Fail "Quick Verdict h2 missing correct text — AI uses this to match 'is [tool] worth it?' queries"
    }

    # Who Should Use This section
    if ($tsx -match 'aria-label="Who Should Use This"') {
        Pass "aria-label='Who Should Use This' present"
    } else {
        Fail "MISSING aria-label='Who Should Use This' on positive use-case section"
    }

    # Who Should NOT Use This section
    if ($tsx -match 'aria-label="Who Should NOT Use This"') {
        Pass "aria-label='Who Should NOT Use This' present"
    } else {
        Fail "MISSING aria-label='Who Should NOT Use This' on skip-section"
    }

    # Who Should Use heading
    if ($tsx -match 'Who Should Use \$\{tool\.name\}') {
        Pass "Who Should Use heading uses dynamic tool name"
    } else {
        Fail "Who Should Use heading not using dynamic tool name"
    }

    # Pricing section with aria-label
    if ($tsx -match 'aria-label="Pricing"') {
        Pass "Pricing section has aria-label='Pricing'"
    } else {
        Fail "MISSING aria-label='Pricing' on pricing section"
    }

    # Pricing h2 uses tool name + year
    if ($tsx -match '\{tool\.name\} Pricing 2026') {
        Pass "Pricing h2 uses '[Tool] Pricing 2026' pattern"
    } else {
        Fail "Pricing h2 missing '[Tool] Pricing 2026' pattern — AI uses this for pricing queries"
    }

    # No remaining old plain-div verdict label
    if ($tsx -notmatch ">Quick verdict</div>") {
        Pass "Old plain-div verdict label removed (no '>Quick verdict</div>')"
    } else {
        Fail "Old plain <div>Quick verdict</div> still present — verdict section not fully updated"
    }

} else {
    Fail "MISSING pages\ToolPage.tsx — check file path"
}


# ──────────────────────────────────────────────────────────────
# BONUS: Live URL checks (requires internet access)
# ──────────────────────────────────────────────────────────────
Head "=== BONUS: Live URL Checks (post-deploy) ==="
Write-Host "  These checks only pass AFTER you push and GitHub Pages rebuilds (~2 min)" -ForegroundColor DarkGray

$BaseUrl = "https://ainexustools.online"
$UrlsToCheck = @(
    "$BaseUrl/llms.txt",
    "$BaseUrl/llms-full.txt",
    "$BaseUrl/robots.txt"
)

foreach ($url in $UrlsToCheck) {
    try {
        $resp = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) { Pass "Live: $url → HTTP $($resp.StatusCode)" }
        else                          { Warn "Live: $url → HTTP $($resp.StatusCode)" }
    } catch {
        Warn "Skipped (not deployed yet or no internet): $url"
    }
}

# Live schema check via Google's Rich Results API
Head "=== BONUS: Google Rich Results Test URL ==="
Write-Host "  Open this URL to validate your @graph schema in Google's tester:" -ForegroundColor DarkGray
Write-Host "  https://search.google.com/test/rich-results?url=https://ainexustools.online" -ForegroundColor Blue


# ──────────────────────────────────────────────────────────────
# SUMMARY
# ──────────────────────────────────────────────────────────────
Head "=== SUMMARY ==="
$Total = $PassCount + $ErrorCount
Write-Host ""
if ($ErrorCount -eq 0) {
    Write-Host "  ALL CHECKS PASSED ($PassCount/$Total)" -ForegroundColor Green
    Write-Host "  Next step: git add . && git commit -m 'fix: GEO G2+G4+G5 — llms-full.txt, @graph schema, semantic sections' && git push" -ForegroundColor Green
} else {
    Write-Host "  $PassCount passed, $ErrorCount failed (of $Total checks)" -ForegroundColor Yellow
    Write-Host "  Fix the FAIL items above, then re-run this script." -ForegroundColor Yellow
}
Write-Host ""
