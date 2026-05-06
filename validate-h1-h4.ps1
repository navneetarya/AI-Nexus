# ============================================================
# AI Nexus SEO - H1 to H4 Validation Script
# Run from project root: .\validate-h1-h4.ps1
# ============================================================

$pass  = 0
$fail  = 0
$warns = 0

function OK   { param($msg) Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function FAIL { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function WARN { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warns++ }
function HDR  { param($msg) Write-Host "`n-- $msg --" -ForegroundColor Cyan }

$distExists = Test-Path "dist"
if (-not $distExists) {
    Write-Host "`n[INFO] dist/ not found - run 'npm run build' for full validation. Source checks still run.`n" -ForegroundColor Yellow
}

# ===============================================================
# H1 - og-image.png (1200x630 social share image)
# ===============================================================
HDR "H1 - OG Image (public/og-image.png)"

$ogFile = "public\og-image.png"
if (Test-Path $ogFile) {
    OK "public/og-image.png exists"

    # Check file size (must be > 5KB to not be a placeholder)
    $size = (Get-Item $ogFile).Length
    if ($size -gt 5000) {
        OK "File size is $([math]::Round($size/1024))KB (not a placeholder)"
    } else {
        WARN "File is very small ($size bytes) - may be a placeholder image"
    }

    # Read PNG dimensions from binary header (bytes 16-23)
    try {
        $bytes = [System.IO.File]::ReadAllBytes((Resolve-Path $ogFile))
        $w = ($bytes[16] -shl 24) -bor ($bytes[17] -shl 16) -bor ($bytes[18] -shl 8) -bor $bytes[19]
        $h = ($bytes[20] -shl 24) -bor ($bytes[21] -shl 16) -bor ($bytes[22] -shl 8) -bor $bytes[23]
        if ($w -eq 1200 -and $h -eq 630) {
            OK "Dimensions are exactly 1200x630px (Facebook/Twitter optimal)"
        } else {
            WARN "Dimensions are ${w}x${h}px - recommended 1200x630px for best social previews"
        }
    } catch {
        WARN "Could not read PNG dimensions: $_"
    }
} else {
    FAIL "public/og-image.png is MISSING - every social share will show a blank preview"
}

# index.html references
if (Test-Path "index.html") {
    $idx = Get-Content "index.html" -Raw
    if ($idx -match 'og:image') {
        OK "index.html has og:image meta tag"
    } else {
        FAIL "index.html missing og:image meta tag"
    }
    if ($idx -match 'twitter:image') {
        OK "index.html has twitter:image meta tag"
    } else {
        WARN "index.html missing twitter:image meta tag"
    }
    if ($idx -match 'og-image\.png') {
        OK "og-image.png filename is referenced in index.html meta tags"
    } else {
        FAIL "og-image.png not referenced in index.html - check og:image content attribute"
    }
}

# Runtime: check dist has image
if ($distExists -and (Test-Path "dist\og-image.png")) {
    OK "Runtime: og-image.png present in dist/ output"
} elseif ($distExists) {
    FAIL "Runtime: og-image.png NOT copied to dist/ - check Vite publicDir config"
}

# ===============================================================
# H2 - FAQPage schema on tool pages
# ===============================================================
HDR "H2 - FAQPage Schema (tool pages)"

$prerender = "scripts\prerender.mjs"
$constFile = "constants.ts"
$toolPage  = "pages\ToolPage.tsx"

if (Test-Path $prerender) {
    if (Select-String -Path $prerender -Pattern "function faqSchema" -Quiet) {
        OK "faqSchema() helper function present in prerender.mjs"
    } else {
        FAIL "faqSchema() function missing from prerender.mjs"
    }
    if (Select-String -Path $prerender -Pattern "TOOL_FAQS\[tool\.slug\]" -Quiet) {
        OK "TOOL_FAQS injected per tool slug in prerender.mjs"
    } else {
        FAIL "TOOL_FAQS not wired to faqSchema() in prerender.mjs tool loop"
    }
    if (Select-String -Path $prerender -Pattern "'@type': 'FAQPage'" -Quiet) {
        OK "FAQPage @type declared in schema output"
    } else {
        FAIL "FAQPage @type missing from faqSchema output"
    }
}

if (Test-Path $constFile) {
    if (Select-String -Path $constFile -Pattern "TOOL_FAQS" -Quiet) {
        OK "TOOL_FAQS data object present in constants.ts"
    } else {
        FAIL "TOOL_FAQS missing from constants.ts"
    }
}

if (Test-Path $toolPage) {
    if (Select-String -Path $toolPage -Pattern "faqs\.map\|faqs\.length" -Quiet) {
        OK "Visible FAQ section rendered in ToolPage.tsx UI"
    } else {
        WARN "FAQ visible section not detected in ToolPage.tsx - check FAQ rendering"
    }
}

# Runtime: check a sample tool page has FAQPage JSON-LD
if ($distExists) {
    $sampleTool = "dist\tools\rytr\index.html"
    if (Test-Path $sampleTool) {
        $html = Get-Content $sampleTool -Raw
        if ($html -match '"@type":\s*"FAQPage"') {
            OK "Runtime: FAQPage JSON-LD found in dist/tools/rytr/index.html"
        } else {
            FAIL "Runtime: FAQPage JSON-LD NOT in dist/tools/rytr/index.html"
        }
        $qCount = ([regex]::Matches($html, '"@type":\s*"Question"')).Count
        if ($qCount -gt 0) {
            OK "Runtime: $qCount FAQ Question items found in rytr tool page"
        } else {
            WARN "Runtime: No Question items found in rytr FAQ schema"
        }
    } else {
        WARN "Runtime: dist/tools/rytr/index.html not found - run npm run build"
    }
}

# ===============================================================
# H3 - Breadcrumb nav + BreadcrumbList schema
# ===============================================================
HDR "H3 - Breadcrumb Navigation + BreadcrumbList Schema"

# Schema checks
if (Test-Path $prerender) {
    if (Select-String -Path $prerender -Pattern "function breadcrumbs" -Quiet) {
        OK "breadcrumbs() schema helper present in prerender.mjs"
    } else {
        FAIL "breadcrumbs() schema helper missing from prerender.mjs"
    }
    if (Select-String -Path $prerender -Pattern "'@type': 'BreadcrumbList'" -Quiet) {
        OK "BreadcrumbList @type declared in schema output"
    } else {
        FAIL "BreadcrumbList @type missing from schema output"
    }
}

# UI semantic quality checks
if (Test-Path $toolPage) {
    if (Select-String -Path $toolPage -Pattern 'aria-label="Breadcrumb"' -Quiet) {
        OK "ToolPage.tsx breadcrumb uses aria-label=Breadcrumb"
    } else {
        FAIL "ToolPage.tsx breadcrumb missing aria-label=Breadcrumb - upgrade div to nav tag"
    }
    if (Select-String -Path $toolPage -Pattern 'aria-current="page"' -Quiet) {
        OK "ToolPage.tsx breadcrumb has aria-current=page on active item"
    } else {
        FAIL "ToolPage.tsx breadcrumb missing aria-current=page"
    }
    if (Select-String -Path $toolPage -Pattern '<ol ' -Quiet) {
        OK "ToolPage.tsx breadcrumb uses ordered list (ol/li) structure"
    } else {
        WARN "ToolPage.tsx breadcrumb should use ol/li for accessibility compliance"
    }
}

$comparePage = "pages\CompareArticlePage.tsx"
if (Test-Path $comparePage) {
    if (Select-String -Path $comparePage -Pattern 'aria-label="Breadcrumb"' -Quiet) {
        OK "CompareArticlePage.tsx breadcrumb uses aria-label=Breadcrumb"
    } else {
        FAIL "CompareArticlePage.tsx breadcrumb missing aria-label=Breadcrumb"
    }
    if (Select-String -Path $comparePage -Pattern 'aria-current="page"' -Quiet) {
        OK "CompareArticlePage.tsx breadcrumb has aria-current=page on active item"
    } else {
        FAIL "CompareArticlePage.tsx breadcrumb missing aria-current=page"
    }
    if (Select-String -Path $comparePage -Pattern '<ol ' -Quiet) {
        OK "CompareArticlePage.tsx breadcrumb uses ordered list (ol/li) structure"
    } else {
        WARN "CompareArticlePage.tsx breadcrumb should use ol/li for accessibility compliance"
    }
}

$blogPage = "pages\BlogPostPage.tsx"
if (Test-Path $blogPage) {
    if (Select-String -Path $blogPage -Pattern '<nav ' -Quiet) {
        OK "BlogPostPage.tsx breadcrumb uses semantic nav element"
    } else {
        WARN "BlogPostPage.tsx breadcrumb should use a nav element"
    }
}

# Runtime check: BreadcrumbList in dist
if ($distExists) {
    $sampleTool = "dist\tools\grammarly\index.html"
    if (Test-Path $sampleTool) {
        $html = Get-Content $sampleTool -Raw
        if ($html -match '"@type":\s*"BreadcrumbList"') {
            OK "Runtime: BreadcrumbList JSON-LD in dist/tools/grammarly/index.html"
        } else {
            FAIL "Runtime: BreadcrumbList JSON-LD NOT in dist/tools/grammarly/index.html"
        }
    }
    $sampleBlog = "dist\blog\best-grammarly-alternatives\index.html"
    if (Test-Path $sampleBlog) {
        $html = Get-Content $sampleBlog -Raw
        if ($html -match '"@type":\s*"BreadcrumbList"') {
            OK "Runtime: BreadcrumbList JSON-LD in blog post dist HTML"
        } else {
            FAIL "Runtime: BreadcrumbList JSON-LD NOT in blog post dist HTML"
        }
    }
}

# ===============================================================
# H4 - Per-route canonical injection
# ===============================================================
HDR "H4 - Per-route Canonical Tags"

if (Test-Path $prerender) {
    if (Select-String -Path $prerender -Pattern 'rel=\\"canonical\\"' -Quiet) {
        OK "prerender.mjs has regex to replace canonical URL per route"
    } elseif (Select-String -Path $prerender -Pattern "canonical" -Quiet) {
        OK "prerender.mjs references canonical in buildPage() function"
    } else {
        FAIL "prerender.mjs does not handle canonical URL injection"
    }

    if (Select-String -Path $prerender -Pattern 'function buildPage' -Quiet) {
        OK "buildPage() function exists to inject meta per route"
    } else {
        FAIL "buildPage() function missing from prerender.mjs"
    }
}

# Runtime: verify each page has its own canonical (not the homepage one)
if ($distExists) {
    $checks = @(
        @{ path="dist\tools\rytr\index.html";     expected="ainexustools.online/tools/rytr/" },
        @{ path="dist\tools\grammarly\index.html"; expected="ainexustools.online/tools/grammarly/" },
        @{ path="dist\blog\best-grammarly-alternatives\index.html"; expected="ainexustools.online/blog/best-grammarly-alternatives/" },
        @{ path="dist\about\index.html";           expected="ainexustools.online/about/" }
    )
    foreach ($c in $checks) {
        if (Test-Path $c.path) {
            $html = Get-Content $c.path -Raw
            if ($html -match [regex]::Escape($c.expected)) {
                OK "Runtime: $($c.path) has correct canonical ($($c.expected))"
            } else {
                FAIL "Runtime: $($c.path) does NOT have canonical '$($c.expected)' - possible homepage bleed-through"
            }
        } else {
            WARN "Runtime: $($c.path) not found"
        }
    }

    # Confirm homepage canonical is still correct
    if (Test-Path "dist\index.html") {
        $home = Get-Content "dist\index.html" -Raw
        if ($home -match 'rel="canonical"\s+href="https://ainexustools\.online/"') {
            OK "Runtime: Homepage dist/index.html canonical is correctly /"
        } else {
            WARN "Runtime: Could not confirm homepage canonical - check manually"
        }
    }
}

# ===============================================================
# SUMMARY
# ===============================================================
HDR "Summary"
Write-Host ""
Write-Host "  Passed  : $pass"  -ForegroundColor Green
Write-Host "  Warnings: $warns" -ForegroundColor Yellow
Write-Host "  Failed  : $fail"  -ForegroundColor Red
Write-Host ""

if ($fail -eq 0 -and $warns -eq 0) {
    Write-Host "All H1-H4 checks passed." -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "No failures - warnings are non-blocking but worth reviewing." -ForegroundColor Yellow
} else {
    Write-Host "$fail check(s) failed. Fix FAIL items before deploying." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm run build"
Write-Host "  2. Run this script again for full runtime checks"
Write-Host "  3. Test OG image: https://www.opengraph.xyz/url/https://ainexustools.online"
Write-Host "  4. Test rich results: https://search.google.com/test/rich-results"
Write-Host "  5. Test canonical: view-source on any tool page, verify link rel=canonical"
Write-Host ""
