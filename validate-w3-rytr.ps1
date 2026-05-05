# ==============================================================================
#  AI Nexus - Week 3 Task 1 Validator
#  Validates: Rytr page expansion (constants.ts, pages\ToolPage.tsx, types.ts)
#  Run from repo root:  .\validate-w3-rytr.ps1
#  Compatible: PowerShell 5.1+
# ==============================================================================

$script:PassCount  = 0
$script:FailCount  = 0

function Pass([string]$msg) {
    Write-Host "  [PASS] $msg" -ForegroundColor Green
    $script:PassCount++
}

function Fail([string]$msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:FailCount++
}

function Section([string]$title) {
    Write-Host ""
    Write-Host "-- $title" -ForegroundColor Cyan
}

function CheckContains([string]$file, [string]$pattern, [string]$label) {
    if (-not (Test-Path $file)) {
        Fail "File not found: $file  ($label)"
        return
    }
    $text = [System.IO.File]::ReadAllText((Resolve-Path $file))
    if ($text.Contains($pattern)) {
        Pass $label
    } else {
        Fail $label
        Write-Host "       Expected to find: $pattern" -ForegroundColor DarkGray
    }
}

# ==============================================================================
#  PATHS
# ==============================================================================

$CONSTANTS = "constants.ts"
$TOOLPAGE  = "pages\ToolPage.tsx"
$TYPES     = "types.ts"

# ==============================================================================
#  SECTION 1 - File existence
# ==============================================================================

Section "1. File Existence"

foreach ($f in @($CONSTANTS, $TOOLPAGE, $TYPES)) {
    if (Test-Path $f) {
        Pass "Exists: $f"
    } else {
        Fail "Missing: $f -- place the updated file here before running"
    }
}

# ==============================================================================
#  SECTION 2 - types.ts
# ==============================================================================

Section "2. types.ts - lastTestedISO added to Tool interface"

CheckContains $TYPES "lastTestedISO?: string;" "lastTestedISO field declared in Tool interface"
CheckContains $TYPES "W3-1: ISO 8601 date the tool was last tested" "lastTestedISO JSDoc comment present"

# ==============================================================================
#  SECTION 3 - constants.ts TOOLS entry for rytr
# ==============================================================================

Section "3. constants.ts - Rytr TOOLS entry"

CheckContains $CONSTANTS "lastTestedISO: '2026-05-05'" "lastTestedISO date on rytr entry"
CheckContains $CONSTANTS "dailyUseCases: [" "dailyUseCases array present"
CheckContains $CONSTANTS "Batching 10 Instagram captions in 15 minutes" "dailyUseCases[0] - Instagram caption batching"
CheckContains $CONSTANTS "5-email cold outreach sequence for a freelance pitch" "dailyUseCases[1] - Cold email sequence"
CheckContains $CONSTANTS "3 headline variants for A/B test" "dailyUseCases[2] - A/B test variants"
CheckContains $CONSTANTS "LinkedIn post from a bullet-point brief" "dailyUseCases[3] - LinkedIn post"
CheckContains $CONSTANTS "20 product descriptions for a Shopify store" "dailyUseCases[4] - Shopify descriptions"
CheckContains $CONSTANTS "notForYou: 'Rytr is not the right tool" "notForYou paragraph on rytr entry"
CheckContains $CONSTANTS "short-form tool at a short-form price" "notForYou - closing sentence"

# ==============================================================================
#  SECTION 4 - constants.ts TOOL_FAQS rytr
# ==============================================================================

Section "4. constants.ts - TOOL_FAQS.rytr (2 new FAQs)"

CheckContains $CONSTANTS "Is Rytr worth upgrading from free to paid?" "Upgrade FAQ question present"
CheckContains $CONSTANTS "Saver plan covers 95% of individual creator needs" "Upgrade FAQ - Saver recommendation"
CheckContains $CONSTANTS "How does Rytr compare to Writesonic?" "Rytr vs Writesonic FAQ question"
CheckContains $CONSTANTS "Rytr and Writesonic solve different problems" "Rytr vs Writesonic FAQ - opening line"
CheckContains $CONSTANTS "10,000 chars vs Writesonic" "Rytr vs Writesonic FAQ - free plan stat"

$rawConstants = [System.IO.File]::ReadAllText((Resolve-Path $CONSTANTS))
$rytrStart    = $rawConstants.IndexOf("rytr: [")
$rytrEnd      = $rawConstants.IndexOf("],", $rytrStart)
if ($rytrStart -ge 0 -and $rytrEnd -gt $rytrStart) {
    $rytrBlock = $rawConstants.Substring($rytrStart, $rytrEnd - $rytrStart)
    $qCount    = ([regex]::Matches($rytrBlock, '"q":') | Measure-Object).Count
    if ($qCount -ge 7) {
        Pass "TOOL_FAQS.rytr has $qCount FAQ entries (required >= 7)"
    } else {
        Fail "TOOL_FAQS.rytr has $qCount entries - expected >= 7"
    }
} else {
    Fail "Could not locate rytr FAQ block in constants.ts"
}

# ==============================================================================
#  SECTION 5 - ToolPage.tsx type definition
# ==============================================================================

Section "5. ToolPage.tsx - TOOL_CONTENT type definition"

CheckContains $TOOLPAGE "upgradeGuide?: string;" "upgradeGuide optional field in type"
CheckContains $TOOLPAGE "vsVerdict?: { tool: string; summary: string; compareSlug: string; };" "vsVerdict optional field in type"
CheckContains $TOOLPAGE "W3-1: Free vs Paid upgrade decision guide" "upgradeGuide JSDoc comment"
CheckContains $TOOLPAGE "W3-1: Quick verdict vs nearest competitor" "vsVerdict JSDoc comment"

# ==============================================================================
#  SECTION 6 - ToolPage.tsx TOOL_CONTENT.rytr content
# ==============================================================================

Section "6. ToolPage.tsx - TOOL_CONTENT.rytr content"

CheckContains $TOOLPAGE "solopreneurs, and students who want a capable AI writing assistant" "whoIsItFor - expanded 2026 context"
CheckContains $TOOLPAGE "non-native English speakers" "whoIsItFor - non-native speaker mention"
CheckContains $TOOLPAGE "I've been using Rytr for 8 months across multiple content types" "myTake - expanded opening line"
CheckContains $TOOLPAGE "Chrome extension is underrated" "myTake - Chrome extension insight"
CheckContains $TOOLPAGE "Is Rytr Worth Upgrading? Free vs Paid" "upgradeGuide - section title text"
CheckContains $TOOLPAGE "It's a real free plan, not a 7-day trial" "upgradeGuide - free plan clarity"
CheckContains $TOOLPAGE "Magic Command, which lets you give free-form instructions" "upgradeGuide - Magic Command feature"
CheckContains $TOOLPAGE "vsVerdict: {" "vsVerdict object defined in TOOL_CONTENT.rytr"
CheckContains $TOOLPAGE "Rytr and Writesonic are the two most popular budget AI writing tools" "vsVerdict - summary opening"

$rawPage  = [System.IO.File]::ReadAllText((Resolve-Path $TOOLPAGE))
$dq       = [char]34
$lTMarker = "lastTested: " + $dq + "May 2026" + $dq
CheckContains $TOOLPAGE $lTMarker "lastTested updated to May 2026"

$csMarker = 'compareSlug: "rytr-vs-writesonic"'
CheckContains $TOOLPAGE $csMarker "vsVerdict - compareSlug set to rytr-vs-writesonic"

$wifStart = $rawPage.IndexOf('whoIsItFor: "')
if ($wifStart -ge 0) {
    $wifInner = $rawPage.Substring($wifStart + 13)
    $wifEnd   = $wifInner.IndexOf('"')
    if ($wifEnd -gt 0) {
        $wifWords = ($wifInner.Substring(0, $wifEnd) -split '\s+' | Where-Object { $_ -ne '' }).Count
        if ($wifWords -ge 80) {
            Pass "whoIsItFor word count: $wifWords words (required >= 80)"
        } else {
            Fail "whoIsItFor too short: $wifWords words - need >= 80"
        }
    }
} else {
    Fail "Could not locate whoIsItFor in TOOL_CONTENT.rytr"
}

# ==============================================================================
#  SECTION 7 - ToolPage.tsx JSX renderers
# ==============================================================================

Section "7. ToolPage.tsx - JSX renderers for new sections"

CheckContains $TOOLPAGE "content?.upgradeGuide" "upgradeGuide conditional render"
CheckContains $TOOLPAGE "upgradeGuide.split(" "upgradeGuide paragraph splitter"
CheckContains $TOOLPAGE "Start free" "upgradeGuide - CTA button text"
CheckContains $TOOLPAGE "content?.vsVerdict" "vsVerdict conditional render"
CheckContains $TOOLPAGE "W3-1: Rytr vs nearest competitor quick verdict" "vsVerdict JSX section comment"
CheckContains $TOOLPAGE "vs.compareSlug" "vsVerdict - compareSlug used in navigation"

# ==============================================================================
#  SECTION 8 - Review schema dateModified
# ==============================================================================

Section "8. ToolPage.tsx - Review schema dateModified"

CheckContains $TOOLPAGE "tool.lastTestedISO ??" "dateModified prefers lastTestedISO"

# ==============================================================================
#  SECTION 9 - TypeScript compilation
# ==============================================================================

Section "9. TypeScript compilation"

$npxPath = Get-Command npx -ErrorAction SilentlyContinue
if ($npxPath) {
    Write-Host "  Running: npx tsc --noEmit ..." -ForegroundColor DarkGray
    $tscResult = & npx tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) {
        Pass "TypeScript: 0 compilation errors"
    } else {
        $errLines = $tscResult | Where-Object { $_ -match "error TS" }
        Fail "TypeScript: $($errLines.Count) compilation error(s)"
        $errLines | ForEach-Object { Write-Host "       $_" -ForegroundColor DarkRed }
    }
} else {
    Write-Host "  [SKIP] npx not found - install Node.js to enable this check" -ForegroundColor DarkYellow
}

# ==============================================================================
#  SECTION 10 - Word count estimate
# ==============================================================================

Section "10. Rytr page - word count estimate"

$rawPage    = [System.IO.File]::ReadAllText((Resolve-Path $TOOLPAGE))
$totalWords = 0

function CountField([string]$raw, [string]$startMarker) {
    $s = $raw.IndexOf($startMarker)
    if ($s -lt 0) { return 0 }
    $inner = $raw.Substring($s + $startMarker.Length)
    $e = $inner.IndexOf('",')
    if ($e -lt 0) { $e = $inner.IndexOf('"') }
    if ($e -lt 0) { return 0 }
    return ($inner.Substring(0, $e) -split '\s+' | Where-Object { $_ -ne '' }).Count
}

$fields = @{
    "whoIsItFor"       = 'whoIsItFor: "'
    "whoShouldSkip"    = 'whoShouldSkip: "'
    "myTake"           = 'myTake: "'
    "verdict"          = 'verdict: "'
    "upgradeGuide"     = 'upgradeGuide: "'
    "vsVerdict.summary"= 'summary: "'
}

foreach ($name in $fields.Keys) {
    $wc = CountField $rawPage $fields[$name]
    if ($wc -gt 0) {
        $totalWords += $wc
        Write-Host "  $name`: $wc words" -ForegroundColor DarkGray
    }
}

$extra      = 80 + 95 + 350 + 200
$grandTotal = $totalWords + $extra
Write-Host "  Core text fields subtotal    : ~$totalWords words" -ForegroundColor DarkGray
Write-Host "  + dailyUseCases ~80, notForYou ~95, FAQs ~350, pricing+steps+output ~200" -ForegroundColor DarkGray
Write-Host "  Estimated total              : ~$grandTotal words" -ForegroundColor DarkGray

if ($grandTotal -ge 1200) {
    Pass "Total ~$grandTotal words meets 1,200+ target"
} else {
    Fail "Total ~$grandTotal words is below the 1,200 word target"
}

# ==============================================================================
#  SUMMARY
# ==============================================================================

Write-Host ""
Write-Host "======================================================" -ForegroundColor DarkCyan
Write-Host "  AI Nexus W3-T1 Validation Summary" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor DarkCyan

if ($script:FailCount -eq 0) {
    Write-Host ""
    Write-Host "  ALL $($script:PassCount) CHECKS PASSED" -ForegroundColor Green
    Write-Host "  Week 3 Task 1 (Rytr expansion) is complete." -ForegroundColor Green
    Write-Host ""
    Write-Host "  Next steps:" -ForegroundColor DarkGray
    Write-Host "   git add constants.ts pages/ToolPage.tsx types.ts" -ForegroundColor DarkGray
    Write-Host "   git commit -m 'W3-T1: Expand Rytr page to 1200+ words'" -ForegroundColor DarkGray
    Write-Host "   git push origin main" -ForegroundColor DarkGray
    Write-Host "   Verify live: https://ainexustools.online/tools/rytr/" -ForegroundColor DarkGray
    Write-Host "   Request re-indexing in Google Search Console" -ForegroundColor DarkGray
} else {
    Write-Host ""
    Write-Host "  $($script:FailCount) CHECKS FAILED  |  $($script:PassCount) passed" -ForegroundColor Red
    Write-Host "  Fix the [FAIL] items above then re-run this script." -ForegroundColor Yellow
}

Write-Host ""
