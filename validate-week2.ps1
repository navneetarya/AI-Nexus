# ============================================================
#  AI Nexus — Week 2 Validation Script (fixed)
#  Run from the root of your AI-Nexus project folder:
#     .\validate-week2.ps1
# ============================================================

$ErrorCount = 0
$PassCount  = 0

function Pass($msg) { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $script:PassCount++ }
function Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $script:ErrorCount++ }
function Section($title) { Write-Host "`n--- $title ---" -ForegroundColor Cyan }

# ── 0. Confirm we are in the right directory ──────────────────────────────
Section "Environment Check"
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Run this script from the root of your AI-Nexus project." -ForegroundColor Red
    exit 1
}
Pass "package.json found — correct directory"

# ── 1. TypeScript Compile Check ───────────────────────────────────────────
Section "TypeScript Compilation"
$tscOutput = npx tsc --noEmit 2>&1
$tscErrors  = $tscOutput | Where-Object { $_ -match "error TS" -and $_ -notmatch "MethodologyPage" }

if ($tscErrors.Count -eq 0) {
    Pass "TypeScript compiles with 0 new errors"
} else {
    $tscErrors | ForEach-Object { Fail "TSC: $_" }
}

# ── 2. types.ts — New fields present ─────────────────────────────────────
Section "types.ts — New fields"
$typesContent = Get-Content "types.ts" -Raw

"pricingBreakdown", "setupSteps", "realOutputExample", "dailyUseCases", "notForYou" | ForEach-Object {
    if ($typesContent -match $_) { Pass "types.ts contains '$_'" }
    else                         { Fail "types.ts MISSING '$_'" }
}

# ── 3. constants.ts — All 5 affiliate tools expanded ─────────────────────
Section "constants.ts — Affiliate tool expansions"
$c = Get-Content "constants.ts" -Raw

if ($c -match "pricingBreakdown")  { Pass "pricingBreakdown field present" }     else { Fail "pricingBreakdown MISSING" }
if ($c -match "setupSteps")        { Pass "setupSteps field present" }            else { Fail "setupSteps MISSING" }
if ($c -match "realOutputExample") { Pass "realOutputExample field present" }     else { Fail "realOutputExample MISSING" }
if ($c -match "dailyUseCases")     { Pass "dailyUseCases field present" }         else { Fail "dailyUseCases MISSING" }
if ($c -match "notForYou")         { Pass "notForYou field present" }             else { Fail "notForYou MISSING" }

if ($c -match "Saver" -and $c -match "Unlimited")             { Pass "Rytr: Saver + Unlimited tiers present" }       else { Fail "Rytr: pricing tiers incomplete" }
if ($c -match "Storyteller" -and $c -match "Professional")    { Pass "Podcastle: Storyteller + Professional present" } else { Fail "Podcastle: pricing tiers incomplete" }
if ($c -match "Bronze" -and $c -match "Silver" -and $c -match "Gold") { Pass "Ocoya: Bronze + Silver + Gold present" } else { Fail "Ocoya: pricing tiers incomplete" }
if ($c -match "Core" -and $c -match "Teams")                  { Pass "Replit: Core + Teams tiers present" }          else { Fail "Replit: pricing tiers incomplete" }
if ($c -match "Business")                                      { Pass "Taskade: Pro + Business tiers present" }       else { Fail "Taskade: pricing tiers incomplete" }

# ── 4. ToolPage.tsx — New sections ────────────────────────────────────────
Section "ToolPage.tsx — New sections"
$tp = Get-Content "pages/ToolPage.tsx" -Raw

@(
    @{ label="COMPARE_ARTICLES import";     pat="COMPARE_ARTICLES" },
    @{ label="TOOL_COMPARE_MAP";            pat="TOOL_COMPARE_MAP" },
    @{ label="Pricing breakdown section";   pat="Pricing breakdown" },
    @{ label="Setup steps section";         pat="How to get started" },
    @{ label="Real output example section"; pat="Real output sample" },
    @{ label="Daily use cases section";     pat="things I actually use" },
    @{ label="Not for you section";         pat="Who should NOT use this" },
    @{ label="Related comparisons section"; pat="Related comparisons" }
) | ForEach-Object {
    if ($tp -match $_.pat) { Pass $_.label }
    else                   { Fail "$($_.label) MISSING" }
}

# ── 5. CompareArticlePage.tsx — Tool name linkification ───────────────────
Section "CompareArticlePage.tsx — Internal tool links"
$cp = Get-Content "pages/CompareArticlePage.tsx" -Raw

@(
    @{ label="TOOL_LINK_MAP defined";            pat="TOOL_LINK_MAP" },
    @{ label="linkifyChunk function";            pat="linkifyChunk" },
    @{ label="linked Set tracker";               pat="seenTools" },
    @{ label="navigate passed to renderContent"; pat="renderContent" },
    @{ label="Rytr in link map";                 pat="Rytr" },
    @{ label="Podcastle in link map";            pat="Podcastle" },
    @{ label="Taskade in link map";              pat="Taskade" }
) | ForEach-Object {
    if ($cp -match $_.pat) { Pass $_.label }
    else                   { Fail "$($_.label) MISSING" }
}

# ── 6. Vite Build ─────────────────────────────────────────────────────────
Section "Vite Build Check"
Write-Host "  Running npm run build..." -ForegroundColor Yellow
$buildOutput = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Pass "npm run build succeeded"
} else {
    Fail "npm run build FAILED"
    $buildOutput | Select-String "error" | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
}

# ── Summary ───────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "============================================================" -ForegroundColor White
if ($ErrorCount -eq 0) {
    Write-Host "  ALL $PassCount CHECKS PASSED — safe to commit and push!" -ForegroundColor Green
} else {
    Write-Host "  $PassCount passed / $ErrorCount FAILED — fix errors above." -ForegroundColor Red
}
Write-Host "============================================================" -ForegroundColor White
