# =============================================================================
# Validate-AINextFixes.ps1
# Validates all Bing Webmaster warning fixes applied to the AI Nexus codebase.
# Usage: .\Validate-AINextFixes.ps1 -RepoPath "C:\path\to\AI-Nexus-main"
# =============================================================================

param(
    [Parameter(Mandatory = $false)]
    [string]$RepoPath = "."
)

# ── Helpers ──────────────────────────────────────────────────────────────────

$pass = 0
$fail = 0
$warnings = 0

function Write-Pass($msg) {
    Write-Host "  [PASS] $msg" -ForegroundColor Green
    $script:pass++
}
function Write-Fail($msg) {
    Write-Host "  [FAIL] $msg" -ForegroundColor Red
    $script:fail++
}
function Write-Warn($msg) {
    Write-Host "  [WARN] $msg" -ForegroundColor Yellow
    $script:warnings++
}
function Write-Section($title) {
    Write-Host ""
    Write-Host "── $title ──" -ForegroundColor Cyan
}

# ── Resolve paths ─────────────────────────────────────────────────────────────

$RepoPath = Resolve-Path $RepoPath -ErrorAction SilentlyContinue
if (-not $RepoPath) {
    Write-Host "ERROR: Repo not found at '$RepoPath'. Pass -RepoPath to the correct folder." -ForegroundColor Red
    exit 1
}

$indexHtml          = Join-Path $RepoPath "index.html"
$appTsx             = Join-Path $RepoPath "App.tsx"
$blogTypesTs        = Join-Path $RepoPath "blog\types.ts"
$comparePageTsx     = Join-Path $RepoPath "pages\CompareArticlePage.tsx"
$blogDir            = Join-Path $RepoPath "blog"

foreach ($f in @($indexHtml, $appTsx, $blogTypesTs, $comparePageTsx)) {
    if (-not (Test-Path $f)) {
        Write-Host "ERROR: Required file not found: $f" -ForegroundColor Red
        exit 1
    }
}

# =============================================================================
# FIX 1 -- index.html: No duplicate H1, correct schema, fallback p tag
# =============================================================================
Write-Section "FIX 1 -- index.html (Duplicate H1 + Schema)"

$htmlContent = Get-Content $indexHtml -Raw

# 1a. Count actual <h1> opening tags (exclude HTML comments)
$htmlNoComments = [regex]::Replace($htmlContent, '<!--.*?-->', '', [System.Text.RegularExpressions.RegexOptions]::Singleline)
$h1Matches = [regex]::Matches($htmlNoComments, '<h1[\s>]', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
if ($h1Matches.Count -eq 0) {
    Write-Pass "No <h1> elements in index.html (duplicate H1 eliminated)"
} else {
    Write-Fail "Found $($h1Matches.Count) <h1> element(s) in index.html -- should be 0"
}

# 1b. Fallback <p role="heading"> present
if ($htmlContent -match '<p\s+role="heading"') {
    Write-Pass 'Fallback <p role="heading"> present for non-JS crawlers'
} else {
    Write-Fail 'Fallback <p role="heading"> NOT found -- crawler fallback missing'
}

# 1c. Schema uses PropertyValueSpecification object (not deprecated string)
if ($htmlContent -match 'PropertyValueSpecification') {
    Write-Pass 'SearchAction query-input uses PropertyValueSpecification object'
} else {
    Write-Fail 'SearchAction query-input missing PropertyValueSpecification -- schema validation issue remains'
}

# 1d. Old deprecated string format is gone
if ($htmlContent -match '"query-input"\s*:\s*"required name=') {
    Write-Fail 'Old deprecated query-input string format still present'
} else {
    Write-Pass 'Deprecated query-input string format removed'
}

# =============================================================================
# FIX 2 -- blog/types.ts: seoTitle field added
# =============================================================================
Write-Section "FIX 2 -- blog/types.ts (seoTitle field)"

$typesContent = Get-Content $blogTypesTs -Raw
if ($typesContent -match 'seoTitle\??\s*:\s*string') {
    Write-Pass 'seoTitle field exists in BlogPost interface'
} else {
    Write-Fail 'seoTitle field NOT found in BlogPost interface'
}

# =============================================================================
# FIX 3 -- App.tsx: Title templates + meta descriptions
# =============================================================================
Write-Section "FIX 3 -- App.tsx (Title templates & meta descriptions)"

$appContent = Get-Content $appTsx -Raw

# 3a. Tool title template uses short format (not long tagline-in-title format)
if ($appContent -match 'Personally Tested \| AI Nexus') {
    Write-Pass 'Tool page title template uses short format (Personally Tested | AI Nexus)'
} else {
    Write-Fail 'Tool page title template NOT updated -- long tagline-based title may still be active'
}

# 3b. Tool title template does NOT still embed full tagline
if ($appContent -match '\$\{tool\.tagline\}.*AI Nexus' -or $appContent -match 'AI Nexus.*\$\{tool\.tagline\}') {
    Write-Fail 'Tool title template still contains ${tool.tagline} -- title will be too long'
} else {
    Write-Pass 'Tool title template does not embed full tagline'
}

# 3c. Blog route uses seoTitle fallback
if ($appContent -match 'post\.seoTitle\s*\?\?') {
    Write-Pass 'Blog route uses post.seoTitle ?? post.title for <title> tag'
} else {
    Write-Fail 'Blog route does NOT use seoTitle -- blog page titles will be too long'
}

# 3d. Homepage title <=60 chars -- extract the literal string
$homeTitleMatch = [regex]::Match($appContent, "Best AI Tools[^'`"]+\| AI Nexus")
if ($homeTitleMatch.Success) {
    $homeTitle = $homeTitleMatch.Value
    if ($homeTitle.Length -le 60) {
        Write-Pass "Homepage title is $($homeTitle.Length) chars: '$homeTitle'"
    } else {
        Write-Fail "Homepage title is $($homeTitle.Length) chars (>60): '$homeTitle'"
    }
} else {
    Write-Warn "Could not extract homepage title from App.tsx for length check"
}

# 3e. Best Free Tools meta <=155 chars
$bftMetaMatch = [regex]::Match($appContent, '13 AI tools with permanent free plans[^''`"]+')
if ($bftMetaMatch.Success) {
    $bftMeta = $bftMetaMatch.Value.TrimEnd("'", '"', ',')
    if ($bftMeta.Length -le 155) {
        Write-Pass "Best Free Tools meta is $($bftMeta.Length) chars"
    } else {
        Write-Fail "Best Free Tools meta is $($bftMeta.Length) chars (>155)"
    }
} else {
    Write-Warn "Could not extract Best Free Tools meta from App.tsx"
}

# =============================================================================
# FIX 4 -- Blog post TS files: seoTitle + metaDescription length
# =============================================================================
Write-Section "FIX 4 -- Blog post files (seoTitle added, meta <=155 chars)"

$blogFiles = Get-ChildItem -Path $blogDir -Filter "*.ts" |
    Where-Object { $_.Name -notin @('types.ts', 'index.ts', 'blog-index.ts') }

if ($blogFiles.Count -eq 0) {
    Write-Warn "No blog post .ts files found in $blogDir"
} else {
    foreach ($file in ($blogFiles | Sort-Object Name)) {
        $content = Get-Content $file.FullName -Raw

        # seoTitle present
        $seoMatch = [regex]::Match($content, 'seoTitle\s*:\s*[''"]([^''"]+)[''"]')
        if (-not $seoMatch.Success) {
            Write-Fail "$($file.Name): seoTitle field MISSING"
            continue
        }
        $seoValue  = $seoMatch.Groups[1].Value
        $fullTitle = "$seoValue | AI Nexus"

        if ($fullTitle.Length -le 60) {
            Write-Pass "$($file.Name): seoTitle OK ($($fullTitle.Length) chars) -- '$fullTitle'"
        } else {
            Write-Fail "$($file.Name): seoTitle TOO LONG ($($fullTitle.Length) chars) -- '$fullTitle'"
        }

        # metaDescription length (handle multi-line values)
        $metaMatch = [regex]::Match($content, "metaDescription\s*:\s*`n?\s*['`"]([^'`"]+)['`"]",
            [System.Text.RegularExpressions.RegexOptions]::Singleline)
        if ($metaMatch.Success) {
            $metaValue = $metaMatch.Groups[1].Value -replace "\\'" , "'"
            if ($metaValue.Length -le 155) {
                Write-Pass "$($file.Name): metaDescription OK ($($metaValue.Length) chars)"
            } else {
                Write-Fail "$($file.Name): metaDescription TOO LONG ($($metaValue.Length) chars)"
            }
        } else {
            Write-Warn "$($file.Name): Could not extract metaDescription for length check"
        }
    }
}

# =============================================================================
# FIX 5 -- CompareArticlePage.tsx: seoTitle <=49 chars, meta <=155 chars
# =============================================================================
Write-Section "FIX 5 -- CompareArticlePage.tsx (seoTitles <=49 chars, metas <=155 chars)"

$compareContent = Get-Content $comparePageTsx -Raw

$slugMatches  = [regex]::Matches($compareContent, 'slug\s*:\s*[''"]([\w-]+)[''"]')
$seoMatches   = [regex]::Matches($compareContent, 'seoTitle\s*:\s*[''"]([^''"]+)[''"]')
$metaMatches  = [regex]::Matches($compareContent, 'metaDescription\s*:\s*[''"]([^''"]+)[''"]')

if ($seoMatches.Count -eq 0) {
    Write-Fail "No seoTitle entries found in CompareArticlePage.tsx"
} elseif ($seoMatches.Count -ne $metaMatches.Count) {
    Write-Warn "seoTitle count ($($seoMatches.Count)) != metaDescription count ($($metaMatches.Count)) -- check file manually"
} else {
    for ($i = 0; $i -lt $seoMatches.Count; $i++) {
        $slug      = if ($i -lt $slugMatches.Count) { $slugMatches[$i].Groups[1].Value } else { "article-$i" }
        $seo       = $seoMatches[$i].Groups[1].Value
        $meta      = $metaMatches[$i].Groups[1].Value -replace "\\'" , "'"
        $fullTitle = "$seo | AI Nexus"

        if ($fullTitle.Length -le 60) {
            Write-Pass "$slug -- title OK ($($fullTitle.Length) chars)"
        } else {
            Write-Fail "$slug -- title TOO LONG ($($fullTitle.Length) chars): '$fullTitle'"
        }

        if ($meta.Length -le 155) {
            Write-Pass "$slug -- meta OK ($($meta.Length) chars)"
        } else {
            Write-Fail "$slug -- meta TOO LONG ($($meta.Length) chars)"
        }
    }
}

# =============================================================================
# SUMMARY
# =============================================================================
Write-Host ""
Write-Host "══════════════════════════════════════════════" -ForegroundColor White
Write-Host "  RESULTS: $pass passed   $fail failed   $warnings warnings" -ForegroundColor White
Write-Host "══════════════════════════════════════════════" -ForegroundColor White

if ($fail -eq 0 -and $warnings -eq 0) {
    Write-Host "  All fixes verified successfully. Ready to push to GitHub." -ForegroundColor Green
} elseif ($fail -eq 0) {
    Write-Host "  Fixes look good but review the warnings above." -ForegroundColor Yellow
} else {
    Write-Host "  $fail check(s) failed. Review the [FAIL] items above before pushing." -ForegroundColor Red
    exit 1
}
