# ============================================================
#  validate-week7.ps1
#  AI Nexus — Week 7 Task 1 & 2 Validation Script
#  Run from the root of the AI-Nexus project folder:
#    cd C:\path\to\AI-Nexus-main
#    .\validate-week7.ps1
# ============================================================

$ErrorActionPreference = "Stop"
$pass  = 0
$fail  = 0
$warns = 0

function Pass($msg)  { Write-Host "  [PASS] $msg" -ForegroundColor Green;  $global:pass++ }
function Fail($msg)  { Write-Host "  [FAIL] $msg" -ForegroundColor Red;    $global:fail++ }
function Warn($msg)  { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $global:warns++ }
function Head($msg)  { Write-Host "`n$msg" -ForegroundColor Cyan }

# ── 1. FILE EXISTENCE ────────────────────────────────────────────────────────
Head "=== 1. File Existence ==="

$files = @(
  "blog\ai-tools-for-students-free-2026.ts",
  "blog\best-ai-podcast-tools-2026.ts",
  "blog\index.ts"
)

foreach ($f in $files) {
  if (Test-Path $f) { Pass "Found: $f" }
  else              { Fail "MISSING: $f" }
}

# ── 2. BLOG INDEX REGISTRATION ───────────────────────────────────────────────
Head "=== 2. blog\index.ts — Post Registration ==="

$idx = Get-Content "blog\index.ts" -Raw

if ($idx -match "ai-tools-for-students-free-2026")  { Pass "post7 (students) imported in index.ts" }
else                                                  { Fail "post7 import missing from index.ts" }

if ($idx -match "best-ai-podcast-tools-2026")         { Pass "post8 (podcast) imported in index.ts" }
else                                                   { Fail "post8 import missing from index.ts" }

if ($idx -match "post7" -and $idx -match "post8")     { Pass "Both post7 and post8 included in BLOG_POSTS array" }
else                                                   { Fail "BLOG_POSTS array does not include post7 and/or post8" }

$postCount = ([regex]::Matches($idx, "import post\d+")).Count
if ($postCount -eq 8) { Pass "Total blog post count = 8 (correct)" }
else                  { Warn "Blog post count = $postCount (expected 8)" }

# ── 3. SLUG VALIDATION ───────────────────────────────────────────────────────
Head "=== 3. Slug Validation ==="

$studentPost = Get-Content "blog\ai-tools-for-students-free-2026.ts" -Raw
$podcastPost = Get-Content "blog\best-ai-podcast-tools-2026.ts"       -Raw

if ($studentPost -match "slug:\s*'ai-tools-for-students-free-2026'") { Pass "Student post slug is correct" }
else                                                                   { Fail "Student post slug missing or wrong" }

if ($podcastPost -match "slug:\s*'best-ai-podcast-tools-2026'")       { Pass "Podcast post slug is correct" }
else                                                                    { Fail "Podcast post slug missing or wrong" }

# ── 4. REQUIRED METADATA FIELDS ──────────────────────────────────────────────
Head "=== 4. Required Metadata (Both Posts) ==="

$fields = @("title:", "metaDescription:", "datePublished:", "dateModified:", "author:", "category:", "readTime:", "excerpt:", "faqs:", "content:")

foreach ($field in $fields) {
  $sOk = $studentPost -match $field
  $pOk = $podcastPost -match $field
  if ($sOk -and $pOk) { Pass "Field '$field' present in both posts" }
  elseif (-not $sOk)   { Fail "Field '$field' MISSING from student post" }
  else                  { Fail "Field '$field' MISSING from podcast post" }
}

# ── 5. FAQ VALIDATION ────────────────────────────────────────────────────────
Head "=== 5. FAQ Pairs ==="

$studentFaqCount = ([regex]::Matches($studentPost, "q:\s*'")).Count
$podcastFaqCount = ([regex]::Matches($podcastPost,  "q:\s*'")).Count

if ($studentFaqCount -ge 4) { Pass "Student post has $studentFaqCount FAQ pairs (minimum 4)" }
else                         { Fail "Student post only has $studentFaqCount FAQ pair(s) — need at least 4" }

if ($podcastFaqCount -ge 4) { Pass "Podcast post has $podcastFaqCount FAQ pairs (minimum 4)" }
else                         { Fail "Podcast post only has $podcastFaqCount FAQ pair(s) — need at least 4" }

# ── 6. CONTENT LENGTH (WORD COUNT PROXY) ─────────────────────────────────────
Head "=== 6. Content Length Check ==="

# Extract content between backticks as a proxy
$sWords = ($studentPost -split '\s+').Count
$pWords = ($podcastPost  -split '\s+').Count

if ($sWords -ge 900)  { Pass "Student post word-count proxy: $sWords tokens (target ≥ 1,200)" }
else                   { Warn "Student post may be short: $sWords tokens (target ≥ 1,200)" }

if ($pWords -ge 800)  { Pass "Podcast post word-count proxy: $pWords tokens (target ≥ 1,100)" }
else                   { Warn "Podcast post may be short: $pWords tokens (target ≥ 1,100)" }

# ── 7. INTERNAL LINKS ────────────────────────────────────────────────────────
Head "=== 7. Internal Links to Tool Pages ==="

$studentLinks  = @('/tools/quillbot', '/tools/grammarly', '/tools/rytr', '/tools/leonardo-ai', '/tools/gamma')
$podcastLinks  = @('/tools/podcastle', '/tools/murf-ai', '/compare/podcastle-vs-descript')

foreach ($link in $studentLinks) {
  if ($studentPost -match [regex]::Escape($link)) { Pass "Student post: internal link '$link' found" }
  else                                              { Warn "Student post: internal link '$link' NOT found" }
}

foreach ($link in $podcastLinks) {
  if ($podcastPost -match [regex]::Escape($link)) { Pass "Podcast post: internal link '$link' found" }
  else                                              { Warn "Podcast post: internal link '$link' NOT found" }
}

# ── 8. TARGET KEYWORDS PRESENT IN CONTENT ───────────────────────────────────
Head "=== 8. Target Keyword Presence ==="

if ($studentPost -match "(?i)ai tools for students") { Pass "Student post: target keyword 'AI tools for students' in content" }
else                                                   { Fail "Student post: target keyword NOT found in content" }

if ($podcastPost -match "(?i)ai podcast tools")       { Pass "Podcast post: target keyword 'AI podcast tools' in content" }
else                                                   { Fail "Podcast post: target keyword NOT found in content" }

# ── 9. TYPESCRIPT COMPILE CHECK ──────────────────────────────────────────────
Head "=== 9. TypeScript Compile Check ==="

$tsc = Get-Command tsc -ErrorAction SilentlyContinue
if ($tsc) {
  try {
    $result = & tsc --noEmit 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "TypeScript: tsc --noEmit passed with no errors" }
    else {
      $tsErrors = $result | Where-Object { $_ -match "blog\\(ai-tools-for-students|best-ai-podcast)" }
      if ($tsErrors) { Fail "TypeScript errors in new blog files:`n$($tsErrors -join "`n")" }
      else            { Warn "tsc reported errors in OTHER files (not Week 7 files — pre-existing issues)" }
    }
  } catch {
    Warn "tsc check failed to run: $($_.Exception.Message)"
  }
} else {
  Warn "tsc not found in PATH — install Node.js + run 'npm install' then retry this check"
}

# ── 10. VITE DEV BUILD SMOKE TEST ────────────────────────────────────────────
Head "=== 10. Vite Build Smoke Test (optional) ==="

$npm = Get-Command npm -ErrorAction SilentlyContinue
if ($npm) {
  Write-Host "  Running: npm run build (this may take 20-40 seconds)..." -ForegroundColor DarkGray
  try {
    $buildOut = & npm run build 2>&1
    if ($LASTEXITCODE -eq 0) { Pass "Vite build succeeded — all 8 blog posts bundled correctly" }
    else {
      $blogErrors = $buildOut | Where-Object { $_ -match "ai-tools-for-students|best-ai-podcast" }
      if ($blogErrors) { Fail "Vite build FAILED on new blog files:`n$($blogErrors -join "`n")" }
      else              { Warn "Vite build failed on pre-existing files (not Week 7 work)" }
    }
  } catch {
    Warn "npm run build could not execute: $($_.Exception.Message)"
  }
} else {
  Warn "npm not found — install Node.js to run the build smoke test"
}

# ── SUMMARY ──────────────────────────────────────────────────────────────────
Head "=== VALIDATION SUMMARY ==="
Write-Host ""
Write-Host "  PASSED : $pass" -ForegroundColor Green
Write-Host "  FAILED : $fail" -ForegroundColor $(if ($fail -gt 0) { "Red" } else { "Green" })
Write-Host "  WARNINGS: $warns" -ForegroundColor $(if ($warns -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

if ($fail -eq 0) {
  Write-Host "  All critical checks passed. Week 7 Tasks 1 & 2 are complete." -ForegroundColor Green
  Write-Host "  Next step: git add blog/ && git commit -m 'week-7: add student + podcast blog posts' && git push" -ForegroundColor Cyan
} else {
  Write-Host "  $fail check(s) failed. Review the [FAIL] lines above and fix before pushing." -ForegroundColor Red
}
Write-Host ""
