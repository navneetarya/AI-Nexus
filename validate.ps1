# AI Nexus -- Week 1 Validation Script (v3 corrected)
# Run from your repo root:  cd D:\AI-Nexus\AI-Nexus  &&  .\validate-week1.ps1

param([string]$RepoRoot = $PSScriptRoot)
$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Nexus -- Week 1 Validation Checks  " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Check($label, $passed) {
    if ($passed) { Write-Host "  PASS  $label" -ForegroundColor Green }
    else         { Write-Host "  FAIL  $label" -ForegroundColor Red   }
}

# ============================================================
# PART A -- Live site checks (GitHub Pages static HTML)
# ============================================================
Write-Host "Fetching live pages..." -ForegroundColor Gray
$toolHtml   = (Invoke-WebRequest "https://ainexustools.online/tools/grammarly" -UseBasicParsing).Content
$sitemapXml = (Invoke-WebRequest "https://ainexustools.online/sitemap.xml"     -UseBasicParsing).Content
$indexPage  = (Invoke-WebRequest "https://ainexustools.online"                 -UseBasicParsing).Content
$rytrStatus = (Invoke-WebRequest "https://ainexustools.online/tools/rytr" -UseBasicParsing -Method Head).StatusCode
Write-Host "Done.`n" -ForegroundColor Gray

# -- Task 1: Prerendering --------------------------------------------------
Write-Host "[ Task 1 ] Prerendering" -ForegroundColor Yellow
Check "Tool page has real meta content (not bare React shell)"  ($toolHtml  -match "AI writing assistant")
Check "/tools/rytr returns HTTP 200"                            ($rytrStatus -eq 200)
Check "Tool page has JSON-LD script injected by prerender"      ($toolHtml  -match 'application/ld\+json')
Write-Host ""

# -- Task 2: Canonical tags ------------------------------------------------
# FIX: index.html has a trailing slash -- regex now allows it with /?
Write-Host "[ Task 2 ] Canonical Tags" -ForegroundColor Yellow
Check "Grammarly canonical points to /tools/grammarly"          ($toolHtml  -match 'rel="canonical" href="https://ainexustools\.online/tools/grammarly"')
Check "Homepage canonical is root URL (trailing slash OK)"      ($indexPage -match 'rel="canonical" href="https://ainexustools\.online/?')
Write-Host ""

# -- Task 3: Review schema -------------------------------------------------
Write-Host "[ Task 3 ] Review Schema (JSON-LD)" -ForegroundColor Yellow
Check "Review @type present on tool page"                       ($toolHtml -match '"@type":\s*"Review"')
Check "reviewRating block present"                              ($toolHtml -match '"reviewRating"')
Check "itemReviewed block present"                              ($toolHtml -match '"itemReviewed"')
Check "author block present"                                    ($toolHtml -match '"author"')
Write-Host ""

# -- Task 4 LIVE: Title template (needs redeployed prerender.mjs) ----------
Write-Host "[ Task 4 ] Title Template -- LIVE (needs deploy to pass)" -ForegroundColor Yellow
Check "Title has new format 'Grammarly Review 2026: ...'"       ($toolHtml -match '<title>Grammarly Review 2026:')
Check "Title includes tagline text"                             ($toolHtml -match 'AI writing assistant.*AI Nexus')
Check "Old generic copy removed from title"                     ($toolHtml -notmatch 'Honest Take, Pricing')
Check "Meta description mentions Navneet Arya"                  ($toolHtml -match 'Honest Grammarly review by Navneet Arya')
Write-Host ""

# -- Task 5: Sitemap -------------------------------------------------------
Write-Host "[ Task 5 ] Auto-Generated Sitemap" -ForegroundColor Yellow
Check "sitemap.xml is accessible"                               ($sitemapXml -match "<urlset")
Check "Sitemap contains tool page URLs"                         ($sitemapXml -match "/tools/grammarly")
Check "Sitemap contains compare page URLs"                      ($sitemapXml -match "/compare/")
Check "Sitemap contains homepage URL"                           ($sitemapXml -match "<loc>https://ainexustools\.online/")
Write-Host ""

# -- Task 6: Breadcrumb schema ---------------------------------------------
# FIX: prerender.mjs uses "AI Nexus" (pos 1) and "AI Tools" (pos 2) -- not "Home"/"Writing"
Write-Host "[ Task 6 ] Breadcrumb Schema (JSON-LD)" -ForegroundColor Yellow
Check "BreadcrumbList @type present on tool page"               ($toolHtml -match '"@type":\s*"BreadcrumbList"')
Check "Breadcrumb root item is 'AI Nexus'"                      ($toolHtml -match '"AI Nexus"')
Check "Breadcrumb has tool-level item (Grammarly)"              ($toolHtml -match '"Grammarly')
Write-Host ""

# -- Task 7 LIVE: Homepage title -------------------------------------------
# Title lives in index.html so no deploy needed -- already correct
# H1 is React-rendered (not in static HTML) -- checked in Part B below
Write-Host "[ Task 7 ] Homepage Title -- LIVE" -ForegroundColor Yellow
Check "Homepage title is keyword-first ('Best AI Tools Reviewed')" ($indexPage -match '<title>Best AI Tools Reviewed')
Check "Homepage title does NOT start with 'AI Nexus'"              ($indexPage -notmatch '<title>AI Nexus')
Write-Host ""

# ============================================================
# PART B -- Local source file checks
# Verifies your saved files are correct BEFORE you push/deploy.
# H1 is React-rendered so it can only be checked here, not via HTTP.
# ============================================================
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host "  PART B -- Local source file checks (no deploy needed)    " -ForegroundColor DarkCyan
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host ""

$prerenderSrc = ""
$homePageSrc  = ""
$appSrc       = ""

$prerenderPath = Join-Path $RepoRoot "scripts\prerender.mjs"
$homePagePath  = Join-Path $RepoRoot "pages\HomePage.tsx"
$appPath       = Join-Path $RepoRoot "App.tsx"

if (Test-Path $prerenderPath) { $prerenderSrc = Get-Content $prerenderPath -Raw }
else { Write-Host "  WARN  scripts\prerender.mjs not found at $prerenderPath" -ForegroundColor DarkYellow }

if (Test-Path $homePagePath)  { $homePageSrc  = Get-Content $homePagePath  -Raw }
else { Write-Host "  WARN  pages\HomePage.tsx not found at $homePagePath" -ForegroundColor DarkYellow }

if (Test-Path $appPath)       { $appSrc       = Get-Content $appPath       -Raw }
else { Write-Host "  WARN  App.tsx not found at $appPath" -ForegroundColor DarkYellow }

# -- Task 4 LOCAL: prerender.mjs and App.tsx title template ----------------
Write-Host "[ Task 4 ] Title Template -- LOCAL files" -ForegroundColor Yellow
Check "prerender.mjs: new title uses tool.tagline"              ($prerenderSrc -match 'tool\.tagline.*AI Nexus')
Check "prerender.mjs: old generic copy removed"                 ($prerenderSrc -notmatch 'Honest Take, Pricing')
Check "App.tsx: tool title template uses tool.tagline"          ($appSrc -match 'tool\.tagline.*\| AI Nexus')
Check "App.tsx: meta description updated"                       ($appSrc -match 'Honest \$\{tool\.name\} review by')
Write-Host ""

# -- Task 7 LOCAL: H1 in HomePage.tsx (React-rendered, invisible to HTTP) --
Write-Host "[ Task 7 ] Homepage H1 -- LOCAL file (React-rendered)" -ForegroundColor Yellow
Check "HomePage.tsx: H1 has target keyword phrase"              ($homePageSrc -match 'Best AI Tools for Creators')
Check "HomePage.tsx: old brand tagline H1 removed"              ($homePageSrc -notmatch 'The best AI tools,')
Check "App.tsx: homepage title is keyword-first"                ($appSrc -match 'Best AI Tools Reviewed.*AI Nexus by')
Write-Host ""

Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host "  All Part A 'Task 4 LIVE' checks show FAIL until your     " -ForegroundColor DarkCyan
Write-Host "  updated prerender.mjs is pushed and GitHub Actions        " -ForegroundColor DarkCyan
Write-Host "  finishes deploying (~2 min after git push).               " -ForegroundColor DarkCyan
Write-Host "  Part B checks confirm your local files are correct NOW.   " -ForegroundColor DarkCyan
Write-Host "============================================================" -ForegroundColor DarkCyan
Write-Host ""