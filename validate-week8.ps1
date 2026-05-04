# =============================================================================
#  AI Nexus - Week 8 Validation Script
#  Run from repo root:  .\validate-week8.ps1
# =============================================================================

$global:pass = 0
$global:fail = 0
$global:warn = 0
$WORKER_URL = "https://ai-nexus-leads.navneetarya1989.workers.dev"

function Pass($msg)  { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function Fail($msg)  { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function Warn($msg)  { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warn++ }
function Head($msg)  { Write-Host "" ; Write-Host $msg -ForegroundColor Cyan }

# --- 1. NEW TOOLS IN constants.ts --------------------------------------------
Head "1/4  Checking 5 new tools in constants.ts ..."

$constantsPath = "constants.ts"
if (-not (Test-Path $constantsPath)) {
    Fail "constants.ts not found. Run this script from the repo root."
    exit 1
}

$constants = Get-Content $constantsPath -Raw

$requiredSlugs = @(
    "elevenlabs",
    "jasper",
    "descript",
    "perplexity",
    "canva-ai"
)

foreach ($slug in $requiredSlugs) {
    if ($constants -match "slug: '$slug'") {
        Pass "Tool slug '$slug' found"
    } else {
        Fail "Tool slug '$slug' MISSING from constants.ts"
    }
}

$toolCount = ([regex]::Matches($constants, "id: '[a-z]\d+'")).Count
if ($toolCount -ge 24) {
    Pass "Tool count is $toolCount (target: 24+)"
} else {
    Fail "Tool count is $toolCount - expected 24 or more after adding 5 tools"
}

# --- 2. FAQs FOR NEW TOOLS ---------------------------------------------------
Head "2/4  Checking FAQs for new tools ..."

$faqSlugs = @("elevenlabs", "jasper", "descript", "perplexity", "canva-ai")
foreach ($slug in $faqSlugs) {
    $pattern = $slug.Replace("-", "[-.]")
    if ($constants -match $pattern) {
        Pass "FAQs found for '$slug'"
    } else {
        Warn "FAQs not confirmed for '$slug' - check TOOL_FAQS section manually"
    }
}

# --- 3. CLOUDFLARE WORKER - Status field -------------------------------------
Head "3/4  Checking cloudflare-worker.js for Status: New ..."

$workerPath = "cloudflare-worker.js"
if (-not (Test-Path $workerPath)) {
    Fail "cloudflare-worker.js not found in repo root. Copy the file here first."
} else {
    $worker = Get-Content $workerPath -Raw

    if ($worker -match "Status") {
        Pass "Worker contains Status property"
    } else {
        Fail "Worker is MISSING Status property - subscribers will not get Status: New"
    }

    if ($worker -match "name: 'New'") {
        Pass "Worker sets Status value to New"
    } else {
        Fail "Worker does NOT set value to New"
    }

    if ($worker -match "NOTION_TOKEN" -and $worker -match "NOTION_DATABASE_ID") {
        Pass "Worker references NOTION_TOKEN and NOTION_DATABASE_ID env vars"
    } else {
        Fail "Worker is missing env var references - check environment variable names"
    }
}

# --- 4. LIVE WORKER ENDPOINT TEST --------------------------------------------
Head "4/4  Testing live Cloudflare Worker endpoint ..."

Write-Host "  Sending test subscription to $WORKER_URL ..." -ForegroundColor DarkGray

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$testBody = "{`"name`":`"Week8 Test`",`"email`":`"week8-validate-$timestamp@test.com`"}"

try {
    $response = Invoke-RestMethod `
        -Uri $WORKER_URL `
        -Method POST `
        -ContentType "application/json" `
        -Body $testBody `
        -TimeoutSec 15 `
        -ErrorAction Stop

    if ($response.success -eq $true) {
        Pass "Worker responded with success:true"
        Write-Host "      >> Check Notion database - new row should have Status = New" -ForegroundColor DarkGreen
    } else {
        Fail "Worker returned unexpected response"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode) {
        Fail "Worker returned HTTP $statusCode - check Cloudflare Worker logs"
    } else {
        Fail "Could not reach Worker: $($_.Exception.Message)"
    }
}

# --- SUMMARY -----------------------------------------------------------------
Write-Host ""
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host "  Week 8 Validation Summary" -ForegroundColor White
Write-Host "  PASSED : $global:pass" -ForegroundColor Green
if ($global:warn -gt 0) { Write-Host "  WARNED : $global:warn" -ForegroundColor Yellow }
if ($global:fail -gt 0) { Write-Host "  FAILED : $global:fail" -ForegroundColor Red }
Write-Host "============================================" -ForegroundColor DarkGray
Write-Host ""

if ($global:fail -eq 0) {
    Write-Host "  PASSED - All Week 8 checks passed. You are good to commit and push." -ForegroundColor Green
} else {
    Write-Host "  FAILED - Fix the failing checks above before pushing." -ForegroundColor Red
    exit 1
}
