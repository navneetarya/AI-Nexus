# validate-week5.ps1
# Week 5 — Validation script for all 4 tasks
# Run from your project root: .\scripts\validate-week5.ps1
# Checks file presence, content correctness, and route registration

$ErrorActionPreference = "Continue"
$Root    = $PSScriptRoot   # project root (same folder as this script)
$Pass    = 0
$Fail    = 0
$Warn    = 0

function Check($Label, $Result, [string]$Detail = "") {
    if ($Result) {
        Write-Host "  [PASS]  $Label" -ForegroundColor Green
        $script:Pass++
    } else {
        Write-Host "  [FAIL]  $Label$(if ($Detail) { ' — ' + $Detail })" -ForegroundColor Red
        $script:Fail++
    }
}
function Warn($Label, $Detail = "") {
    Write-Host "  [WARN]  $Label$(if ($Detail) { ' — ' + $Detail })" -ForegroundColor Yellow
    $script:Warn++
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  AI Nexus — Week 5 Task Validation" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[TASK 1] /best-free-ai-tools Landing Page" -ForegroundColor White
# ─────────────────────────────────────────────────────────────────────────────

$PageFile = Join-Path $Root "pages\BestFreeAIToolsPage.tsx"
Check "BestFreeAIToolsPage.tsx exists" (Test-Path $PageFile)

if (Test-Path $PageFile) {
    $PageContent = Get-Content $PageFile -Raw
    Check "Page exports BestFreeAIToolsPage function"   ($PageContent -match "export function BestFreeAIToolsPage")
    Check "Page has BreadcrumbList JSON-LD schema"       ($PageContent -match "BreadcrumbList")
    Check "Page has FAQPage JSON-LD schema"              ($PageContent -match "FAQPage")
    Check "Page filters free tools (FREE_PLAN_SLUGS)"   ($PageContent -match "FREE_PLAN_SLUGS")
    Check "Page has comparison table"                   ($PageContent -match "Quick Comparison")
    Check "Page has editorial intro section"            ($PageContent -match "How I chose these tools")
    Check "Page has local-first ToolLogo"               ($PageContent -match "/logos/\`$\{slug\}")
    Check "Category filter tabs present"                ($PageContent -match "activeCategory")
}

$AppFile = Join-Path $Root "App.tsx"
$AppContent = Get-Content $AppFile -Raw
Check "App.tsx imports BestFreeAIToolsPage"             ($AppContent -match "BestFreeAIToolsPage")
Check "App.tsx has /best-free-ai-tools route"           ($AppContent -match "best-free-ai-tools")
Check "App.tsx updateMeta called for the new route"     ($AppContent -match "Best Free AI Tools 2026")

$SitemapFile = Join-Path $Root "public\sitemap.xml"
$SitemapContent = Get-Content $SitemapFile -Raw
Check "sitemap.xml includes /best-free-ai-tools"        ($SitemapContent -match "best-free-ai-tools")
Check "sitemap.xml priority 0.9 for landing page"       ($SitemapContent -match "best-free-ai-tools.*priority>0\.9|priority>0\.9.*best-free-ai-tools")

# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[TASK 2] Blog Post #3 — Best AI Tools for Social Media 2026" -ForegroundColor White
# ─────────────────────────────────────────────────────────────────────────────

$Post5File = Join-Path $Root "blog\best-ai-tools-for-social-media-2026.ts"
Check "blog/best-ai-tools-for-social-media-2026.ts exists" (Test-Path $Post5File)

if (Test-Path $Post5File) {
    $Post5Content = Get-Content $Post5File -Raw
    Check "Post has correct slug"                       ($Post5Content -match "'best-ai-tools-for-social-media-2026'")
    Check "Post has metaDescription"                    ($Post5Content -match "metaDescription:")
    Check "Post has faqs array (FAQPage schema)"        ($Post5Content -match "faqs:")
    Check "Post covers Ocoya"                           ($Post5Content -match "Ocoya")
    Check "Post covers Opus Clip"                       ($Post5Content -match "Opus Clip")
    Check "Post covers Leonardo"                        ($Post5Content -match "Leonardo")
    Check "Post links to ocoya review page"             ($Post5Content -match "/tools/ocoya")
    Check "Post links to compare article"               ($Post5Content -match "/compare/ocoya-vs-buffer")
    $WordCount = ($Post5Content -split '\s+').Count
    if ($WordCount -lt 1000) {
        Warn "Post word count looks low ($WordCount tokens in file; target 1400+ words in content)"
    } else {
        Check "Post has substantial content (file size)" ($WordCount -ge 1000)
    }
}

$IndexFile = Join-Path $Root "blog\index.ts"
$IndexContent = Get-Content $IndexFile -Raw
Check "blog/index.ts imports social media post"        ($IndexContent -match "best-ai-tools-for-social-media-2026")
Check "BLOG_POSTS array includes post5"                ($IndexContent -match "post5")

Check "sitemap.xml includes social media blog post"    ($SitemapContent -match "best-ai-tools-for-social-media-2026")

# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[TASK 3] Blog Post #4 — How to Use Rytr to Write Blog Posts" -ForegroundColor White
# ─────────────────────────────────────────────────────────────────────────────

$Post6File = Join-Path $Root "blog\how-to-use-rytr-to-write-blog-posts.ts"
Check "blog/how-to-use-rytr-to-write-blog-posts.ts exists" (Test-Path $Post6File)

if (Test-Path $Post6File) {
    $Post6Content = Get-Content $Post6File -Raw
    Check "Post has correct slug"                       ($Post6Content -match "'how-to-use-rytr-to-write-blog-posts'")
    Check "Post has metaDescription"                    ($Post6Content -match "metaDescription:")
    Check "Post has faqs array (FAQPage schema)"        ($Post6Content -match "faqs:")
    Check "Post is tutorial format (Step-by-step)"      ($Post6Content -match "Step [0-9]+:")
    Check "Post links to Rytr affiliate link"           ($Post6Content -match "rytr\.me")
    Check "Post links to Rytr review page"              ($Post6Content -match "/tools/rytr")
    $WordCount6 = ($Post6Content -split '\s+').Count
    if ($WordCount6 -lt 800) {
        Warn "Post word count looks low ($WordCount6 tokens; target 1200+ words in content)"
    } else {
        Check "Post has substantial content"            ($WordCount6 -ge 800)
    }
}

Check "blog/index.ts imports Rytr tutorial post"       ($IndexContent -match "how-to-use-rytr-to-write-blog-posts")
Check "BLOG_POSTS array includes post6"                ($IndexContent -match "post6")
Check "sitemap.xml includes Rytr tutorial post"        ($SitemapContent -match "how-to-use-rytr-to-write-blog-posts")

# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[TASK 4] Local Logo Support in ToolLogo Component" -ForegroundColor White
# ─────────────────────────────────────────────────────────────────────────────

$HomeFile = Join-Path $Root "pages\HomePage.tsx"
$HomeContent = Get-Content $HomeFile -Raw
Check "HomePage.tsx has local-first logo logic"         ($HomeContent -match "/logos/\`$\{slug\}")
Check "HomePage.tsx has localErr state"                 ($HomeContent -match "localErr")
Check "HomePage.tsx still has Clearbit fallback"        ($HomeContent -match "clearbit.com")
Check "HomePage.tsx has clearbitErr state"              ($HomeContent -match "clearbitErr")
Check "Clearbit is now fallback (not primary)"          ($HomeContent -match "localErr.*clearbitErr|clearbitErr.*localErr")

$ScriptFile = Join-Path $Root "scripts\download-logos.ps1"
Check "scripts/download-logos.ps1 exists"               (Test-Path $ScriptFile)

$LogosDir = Join-Path $Root "public\logos"
if (Test-Path $LogosDir) {
    $LogoCount = (Get-ChildItem $LogosDir -Filter "*.png").Count
    if ($LogoCount -eq 0) {
        Warn "public/logos/ exists but is empty — run .\scripts\download-logos.ps1 to download logos"
    } else {
        Check "public/logos/ has PNG files — $LogoCount found" ($LogoCount -gt 0)
        $Expected = @("grammarly","writesonic","rytr","quillbot","frase","leonardo-ai","photoroom",
                      "looka","pictory","opus-clip","invideo","murf-ai","podcastle","gamma",
                      "beautiful-ai","ocoya","replit","notion-ai","taskade")
        $Missing = $Expected | Where-Object { -not (Test-Path (Join-Path $LogosDir "$_.png")) }
        if ($Missing.Count -gt 0) {
            $MissingList = $Missing -join ", "
            Warn "Missing logos: $MissingList"
        } else {
            Check "All 19 tool logos present" $true
        }
    }
} else {
    Warn "public/logos/ directory not found — run .\scripts\download-logos.ps1 first"
}

# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n[SITEMAP] Overall sitemap health check" -ForegroundColor White
# ─────────────────────────────────────────────────────────────────────────────

$UrlCount = ([regex]::Matches($SitemapContent, "<loc>")).Count
Check "Sitemap has 30+ URLs (was 25)"                  ($UrlCount -ge 30)
Check "Sitemap includes /blog index page"              ($SitemapContent -match "ainexustools\.online/blog<")
Check "Sitemap updated lastmod to 2026-05-04"          ($SitemapContent -match "2026-05-04")

# ─────────────────────────────────────────────────────────────────────────────
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  RESULTS:  $Pass passed   $Fail failed   $Warn warnings" -ForegroundColor $(if ($Fail -gt 0) { "Red" } elseif ($Warn -gt 0) { "Yellow" } else { "Green" })
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if ($Fail -eq 0 -and $Warn -eq 0) {
    Write-Host "`n  All Week 5 tasks verified! Ready to commit and deploy." -ForegroundColor Green
} elseif ($Fail -eq 0) {
    Write-Host "`n  All checks passed. Warnings are non-blocking (run logo download script to resolve)." -ForegroundColor Yellow
} else {
    Write-Host "`n  Fix the FAIL items above, then re-run this script." -ForegroundColor Red
}

Write-Host "`n  Suggested git commands:" -ForegroundColor DarkGray
Write-Host "  git add -A" -ForegroundColor DarkGray
Write-Host "  git commit -m 'feat(week5): best-free-ai-tools page + 2 blog posts + local logo support'" -ForegroundColor DarkGray
Write-Host "  git push origin main" -ForegroundColor DarkGray
Write-Host ""
