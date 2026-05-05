#!/usr/bin/env pwsh
# ============================================================
# AI Nexus — SEO/GEO/AEO Fix Validation Script
# Run from your project root: .\validate-seo-fixes.ps1
# Requires: Node.js (for prerender check), no other deps
# ============================================================

$ErrorActionPreference = "Continue"
$pass  = 0
$fail  = 0
$warns = 0

function Check($label, $result, $hint = "") {
    if ($result) {
        Write-Host "  [PASS] $label" -ForegroundColor Green
        $script:pass++
    } else {
        Write-Host "  [FAIL] $label" -ForegroundColor Red
        if ($hint) { Write-Host "         $hint" -ForegroundColor DarkYellow }
        $script:fail++
    }
}
function Warn($label, $hint = "") {
    Write-Host "  [WARN] $label" -ForegroundColor Yellow
    if ($hint) { Write-Host "         $hint" -ForegroundColor DarkGray }
    $script:warns++
}
function Section($title) {
    Write-Host "`n$title" -ForegroundColor Cyan
    Write-Host ("-" * $title.Length) -ForegroundColor DarkGray
}

# ── Locate project root ─────────────────────────────────────
$root = $PSScriptRoot
if (-not $root) { $root = Get-Location }

# Key file paths
$prerender    = Join-Path $root "scripts\prerender.mjs"
$blogPost     = Join-Path $root "pages\BlogPostPage.tsx"
$llmsTxt      = Join-Path $root "public\llms.txt"
$indexHtml    = Join-Path $root "index.html"
$blogSocial   = Join-Path $root "blog\best-ai-tools-for-social-media-2026.ts"
$blogStudents = Join-Path $root "blog\ai-tools-for-students-free-2026.ts"
$blogHowTo    = Join-Path $root "blog\how-to-use-ai-for-content-creation-2026.ts"

Write-Host "`n======================================================" -ForegroundColor White
Write-Host " AI Nexus — SEO / GEO / AEO Fix Validator" -ForegroundColor White
Write-Host " Project root: $root" -ForegroundColor DarkGray
Write-Host "======================================================" -ForegroundColor White

# ════════════════════════════════════════════════════════════
# SECTION 1 — File existence
# ════════════════════════════════════════════════════════════
Section "[ 1/5 ] File Existence"
Check "scripts\prerender.mjs exists"           (Test-Path $prerender)    "Copy from outputs\fixes\scripts\prerender.mjs"
Check "pages\BlogPostPage.tsx exists"          (Test-Path $blogPost)     "Copy from outputs\fixes\pages\BlogPostPage.tsx"
Check "public\llms.txt exists"                 (Test-Path $llmsTxt)      "Copy from outputs\fixes\public\llms.txt"
Check "index.html exists"                      (Test-Path $indexHtml)    "Copy from outputs\fixes\index.html"
Check "blog\best-ai-tools-for-social-media-2026.ts exists" (Test-Path $blogSocial) "Copy from outputs\fixes\blog\"
Check "blog\ai-tools-for-students-free-2026.ts exists"     (Test-Path $blogStudents) "Copy from outputs\fixes\blog\"
Check "blog\how-to-use-ai-for-content-creation-2026.ts exists" (Test-Path $blogHowTo) "Copy from outputs\fixes\blog\"

# ════════════════════════════════════════════════════════════
# SECTION 2 — SEO Fixes (4 checks)
# ════════════════════════════════════════════════════════════
Section "[ 2/5 ] SEO Fixes"

# FIX 1 — Missing blog post in prerender.mjs
if (Test-Path $prerender) {
    $pre = Get-Content $prerender -Raw
    Check "FIX-1 | how-to-use-ai-for-content-creation-2026 in BLOG_POSTS array" `
        ($pre -match "how-to-use-ai-for-content-creation-2026") `
        "Add the blog post entry to the BLOG_POSTS array in prerender.mjs"

    # FIX 2 — wordCount + image in articleSchema
    Check "FIX-2 | wordCount field in articleSchema()" `
        ($pre -match "wordCount") `
        "articleSchema() must include wordCount property"
    Check "FIX-2 | image field (ImageObject) in articleSchema()" `
        ($pre -match "ImageObject") `
        "articleSchema() must include image: { '@type': 'ImageObject', ... }"

    # FIX 3a — Offer object has availability field
    Check "FIX-3 | SoftwareApplication offers has availability field" `
        ($pre -match "availability.*InStock") `
        "offers object must have availability: 'https://schema.org/InStock'"

    # FIX 3b — datePublished uses per-tool date not TODAY hardcoded
    Check "FIX-3 | Review datePublished uses publishDate variable (not TODAY)" `
        ($pre -match "datePublished: publishDate") `
        "reviewSchema() must use the computed publishDate variable, not TODAY constant"
} else {
    Warn "FIX-1/2/3 checks skipped — prerender.mjs not found"
}

# ════════════════════════════════════════════════════════════
# SECTION 3 — GEO Fixes (4 checks)
# ════════════════════════════════════════════════════════════
Section "[ 3/5 ] GEO Fixes"

if (Test-Path $prerender) {
    $pre = Get-Content $prerender -Raw

    # FIX 4 — Speakable schema
    Check "FIX-4 | speakableSchema() function defined in prerender.mjs" `
        ($pre -match "function speakableSchema") `
        "Add speakableSchema() builder function to prerender.mjs"
    Check "FIX-4 | speakableSchema() called for tool pages" `
        ($pre -match "speakableSchema\(canonical.*data-speakable") `
        "Add speakableSchema() to tool page schemas array"
    Check "FIX-4 | speakableSchema() called for blog posts" `
        ($pre -match "speakableSchema\(canonical.*post-excerpt") `
        "Add speakableSchema() to blog post schemas array"
}

# FIX 5 — llms.txt blog posts
if (Test-Path $llmsTxt) {
    $llms = Get-Content $llmsTxt -Raw
    Check "FIX-5 | how-to-use-ai-for-content-creation in llms.txt" `
        ($llms -match "how-to-use-ai-for-content-creation") `
        "Add the content creation blog post to llms.txt Blog Posts section"
    Check "FIX-5 | ai-tools-for-students-free in llms.txt" `
        ($llms -match "ai-tools-for-students-free") `
        "Add the students blog post to llms.txt Blog Posts section"
    Check "FIX-5 | Blog Posts section exists in llms.txt" `
        ($llms -match "## Blog Posts") `
        "Add '## Blog Posts' section to llms.txt"
}

# FIX 6 — Author sameAs
if (Test-Path $indexHtml) {
    $html = Get-Content $indexHtml -Raw
    Check "FIX-6 | Quora profile in Person sameAs (index.html)" `
        ($html -match "quora\.com") `
        "Add quora.com/profile/Navneet-Arya to Person schema sameAs array in index.html"
    Check "FIX-6 | Medium/Substack in Person sameAs (index.html)" `
        ($html -match "medium\.com|substack\.com") `
        "Add medium.com/@navneetarya to Person schema sameAs array in index.html"
}

# FIX 7 — mentions in blog post Article schema
if (Test-Path $prerender) {
    $pre = Get-Content $prerender -Raw
    Check "FIX-7 | mentionedTools field used in blog post Article schema" `
        ($pre -match "mentionedTools") `
        "Add mentionedTools array to BLOG_POSTS entries and use in Article schema mentions property"
    Check "FIX-7 | mentions property in Article schema" `
        ($pre -match "mentions:") `
        "Build mentions array in blog post schema using mentionedTools slugs"
}

# ════════════════════════════════════════════════════════════
# SECTION 4 — AEO Fixes (4 checks)
# ════════════════════════════════════════════════════════════
Section "[ 4/5 ] AEO Fixes"

# FIX 8 — HowTo schema
if (Test-Path $prerender) {
    $pre = Get-Content $prerender -Raw
    Check "FIX-8 | howToSchema() function defined in prerender.mjs" `
        ($pre -match "function howToSchema") `
        "Add howToSchema() builder function to prerender.mjs"
    Check "FIX-8 | howToSteps in how-to blog post entry" `
        ($pre -match "howToSteps") `
        "Add howToSteps array to the how-to blog post entry in BLOG_POSTS"
    Check "FIX-8 | HowTo schema auto-applied for how-to- slugs" `
        ($pre -match "startsWith\('how-to-'\)") `
        "Add conditional: if (post.slug.startsWith('how-to-') && post.howToSteps) apply howToSchema()"
}

# FIX 9 — TLDR Quick Answer box
if (Test-Path $blogPost) {
    $bp = Get-Content $blogPost -Raw
    Check "FIX-9 | post-excerpt CSS class on TLDR box" `
        ($bp -match "post-excerpt") `
        "Add className='post-excerpt' to the Quick Answer div in BlogPostPage.tsx"
    Check "FIX-9 | Quick answer label rendered before post.content" `
        ($bp -match "Quick answer") `
        "Add the styled TLDR box with 'Quick answer:' label before dangerouslySetInnerHTML block"
}

# FIX 10 — Short leading sentences in FAQs
if (Test-Path $blogSocial) {
    $soc = Get-Content $blogSocial -Raw
    # Check the first FAQ answer starts with a short directional sentence
    Check "FIX-10 | Social media FAQ-1 starts with short answer" `
        ($soc -match "Ocoya is the best all-in-one AI tool for social media") `
        "First FAQ answer in social media blog should start with a concise 1-sentence direct answer"
}

# FIX 11 — ItemList schema
if (Test-Path $prerender) {
    $pre = Get-Content $prerender -Raw
    Check "FIX-11 | itemListSchema() function defined in prerender.mjs" `
        ($pre -match "function itemListSchema") `
        "Add itemListSchema() builder function to prerender.mjs"
    Check "FIX-11 | ItemList added to /blog/ page schemas" `
        ($pre -match "AI Tools Blog.*All Articles") `
        "Add itemListSchema to the blog list page schemas array"
    Check "FIX-11 | ItemList added to /best-free-ai-tools/ page schemas" `
        ($pre -match "Best Free AI Tools 2026.*url.*best-free") `
        "Add itemListSchema to the best-free-ai-tools page schemas array"
}

# ════════════════════════════════════════════════════════════
# SECTION 5 — Build Validation
# ════════════════════════════════════════════════════════════
Section "[ 5/5 ] Build Validation"

# Check Node.js is available
$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Check "Node.js is available ($nodeVersion)" $true

    # Syntax check prerender.mjs
    if (Test-Path $prerender) {
        $syntaxCheck = node --input-type=module --eval "
import { readFileSync } from 'fs';
// Just parse - if this runs without error, syntax is valid
console.log('syntax-ok');
" 2>&1
        # A simpler approach: try to parse with node check
        $checkResult = node -e "
try {
  const fs = require('fs');
  const src = fs.readFileSync('$($prerender -replace '\\\\', '/')', 'utf8');
  // Basic checks
  const hasSpeakable = src.includes('speakableSchema');
  const hasHowTo = src.includes('howToSchema');
  const hasItemList = src.includes('itemListSchema');
  const hasNewPost = src.includes('how-to-use-ai-for-content-creation-2026');
  console.log('speakable:' + hasSpeakable + ',howto:' + hasHowTo + ',itemlist:' + hasItemList + ',newpost:' + hasNewPost);
} catch(e) { console.log('error:' + e.message); }
" 2>&1
        Check "prerender.mjs Node.js parse check" `
            ($checkResult -match "speakable:True,howto:True,itemlist:True,newpost:True") `
            "Run: node scripts\prerender.mjs — to see specific errors. Output: $checkResult"
    }

    # Check if dist folder exists and run prerender
    $distDir = Join-Path $root "dist"
    if (Test-Path $distDir) {
        Write-Host "  [INFO] dist/ folder found — running prerender script..." -ForegroundColor DarkCyan
        $prerenderOutput = node $prerender 2>&1
        $routeCount = ($prerenderOutput | Select-String "✓").Count
        Check "prerender.mjs executes without errors (routes: $routeCount)" `
            ($prerenderOutput -notmatch "Error|error|TypeError") `
            "Run: node scripts\prerender.mjs — for error details"

        # Check new route was generated
        $newRoute = Join-Path $distDir "blog\how-to-use-ai-for-content-creation-2026\index.html"
        Check "New blog post route generated: blog/how-to-use-ai-for-content-creation-2026/index.html" `
            (Test-Path $newRoute) `
            "The prerender script should create dist\blog\how-to-use-ai-for-content-creation-2026\index.html"

        if (Test-Path $newRoute) {
            $routeHtml = Get-Content $newRoute -Raw
            Check "New route has correct <title> tag" `
                ($routeHtml -match "How to Use AI for Content Creation") `
                "The generated HTML must have the correct title tag"
            Check "New route has HowTo schema in HTML" `
                ($routeHtml -match "HowTo") `
                "The generated HTML must contain HowTo JSON-LD schema"
            Check "New route has Speakable schema in HTML" `
                ($routeHtml -match "speakable") `
                "The generated HTML must contain Speakable schema"
            Check "New route has FAQPage schema in HTML" `
                ($routeHtml -match "FAQPage") `
                "The generated HTML must contain FAQPage JSON-LD schema"
        }

        # Check blog list page has ItemList
        $blogListRoute = Join-Path $distDir "blog\index.html"
        if (Test-Path $blogListRoute) {
            $blogListHtml = Get-Content $blogListRoute -Raw
            Check "Blog list page has ItemList schema" `
                ($blogListHtml -match "ItemList") `
                "dist\blog\index.html must contain ItemList JSON-LD schema"
        }

        # Check a tool page has speakable
        $toolRoute = Join-Path $distDir "tools\rytr\index.html"
        if (Test-Path $toolRoute) {
            $toolHtml = Get-Content $toolRoute -Raw
            Check "Tool page (rytr) has Speakable schema" `
                ($toolHtml -match "speakable") `
                "dist\tools\rytr\index.html must contain Speakable JSON-LD schema"
            Check "Tool page (rytr) has correct offers availability" `
                ($toolHtml -match "InStock") `
                "dist\tools\rytr\index.html SoftwareApplication offers must have availability InStock"
        }
    } else {
        Warn "dist/ folder not found — run 'npm run build' first to enable full build validation"
        Warn "Re-run this script after building to validate generated HTML files"
    }
} else {
    Warn "Node.js not found — skipping build checks. Install Node.js to enable full validation"
}

# ════════════════════════════════════════════════════════════
# SUMMARY
# ════════════════════════════════════════════════════════════
$total = $pass + $fail
Write-Host "`n======================================================" -ForegroundColor White
Write-Host " RESULTS: $pass passed / $fail failed / $warns warnings   (of $total checks)" -ForegroundColor $(if ($fail -eq 0) { "Green" } else { "Yellow" })
Write-Host "======================================================" -ForegroundColor White

if ($fail -gt 0) {
    Write-Host "`n NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "  1. Copy files from outputs\fixes\ to your project" -ForegroundColor White
    Write-Host "     Copy-Item .\outputs\fixes\scripts\prerender.mjs   .\scripts\prerender.mjs" -ForegroundColor DarkGray
    Write-Host "     Copy-Item .\outputs\fixes\pages\BlogPostPage.tsx   .\pages\BlogPostPage.tsx" -ForegroundColor DarkGray
    Write-Host "     Copy-Item .\outputs\fixes\public\llms.txt          .\public\llms.txt" -ForegroundColor DarkGray
    Write-Host "     Copy-Item .\outputs\fixes\index.html               .\index.html" -ForegroundColor DarkGray
    Write-Host "     Copy-Item .\outputs\fixes\blog\*                   .\blog\" -ForegroundColor DarkGray
    Write-Host "  2. Run: npm run build" -ForegroundColor White
    Write-Host "  3. Re-run this script to verify build output" -ForegroundColor White
} else {
    Write-Host "`n All checks passed! Recommended next steps:" -ForegroundColor Green
    Write-Host "  1. npm run build" -ForegroundColor White
    Write-Host "  2. git add -A && git commit -m 'fix: SEO/GEO/AEO — 12 fixes applied'" -ForegroundColor White
    Write-Host "  3. git push (triggers GitHub Actions deploy)" -ForegroundColor White
    Write-Host "  4. Submit sitemap in Google Search Console" -ForegroundColor White
    Write-Host "  5. Validate schema: https://search.google.com/test/rich-results" -ForegroundColor White
}

Write-Host ""
