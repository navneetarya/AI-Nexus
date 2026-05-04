# download-logos.ps1
# Week 5 Task 4 — Download all tool logos to /public/logos/
# Run from your project root: .\scripts\download-logos.ps1
# Requires: PowerShell 5.1+ (built into Windows 10/11)

$ErrorActionPreference = "Continue"

# Create logos directory inside public/ if it doesn't exist
$LogosDir = Join-Path $PSScriptRoot "..\public\logos"
if (-not (Test-Path $LogosDir)) {
    New-Item -ItemType Directory -Path $LogosDir -Force | Out-Null
    Write-Host "Created directory: $LogosDir" -ForegroundColor Cyan
}

# Tool slug → official logo URL mapping
# Using Clearbit as primary source (128px PNGs, reliable CDN)
# Replace any URL with a direct brand kit URL if you have it
$Tools = @(
    @{ Slug = "grammarly";     Url = "https://logo.clearbit.com/grammarly.com" },
    @{ Slug = "writesonic";    Url = "https://logo.clearbit.com/writesonic.com" },
    @{ Slug = "rytr";          Url = "https://logo.clearbit.com/rytr.me" },
    @{ Slug = "quillbot";      Url = "https://logo.clearbit.com/quillbot.com" },
    @{ Slug = "frase";         Url = "https://logo.clearbit.com/frase.io" },
    @{ Slug = "leonardo-ai";   Url = "https://logo.clearbit.com/leonardo.ai" },
    @{ Slug = "photoroom";     Url = "https://logo.clearbit.com/photoroom.com" },
    @{ Slug = "looka";         Url = "https://logo.clearbit.com/looka.com" },
    @{ Slug = "pictory";       Url = "https://logo.clearbit.com/pictory.ai" },
    @{ Slug = "opus-clip";     Url = "https://logo.clearbit.com/opus.pro" },
    @{ Slug = "invideo";       Url = "https://logo.clearbit.com/invideo.io" },
    @{ Slug = "murf-ai";       Url = "https://logo.clearbit.com/murf.ai" },
    @{ Slug = "podcastle";     Url = "https://logo.clearbit.com/podcastle.ai" },
    @{ Slug = "gamma";         Url = "https://logo.clearbit.com/gamma.app" },
    @{ Slug = "beautiful-ai";  Url = "https://logo.clearbit.com/beautiful.ai" },
    @{ Slug = "ocoya";         Url = "https://logo.clearbit.com/ocoya.com" },
    @{ Slug = "replit";        Url = "https://logo.clearbit.com/replit.com" },
    @{ Slug = "notion-ai";     Url = "https://logo.clearbit.com/notion.so" },
    @{ Slug = "taskade";       Url = "https://logo.clearbit.com/taskade.com" }
)

$Success = 0
$Failed  = 0

foreach ($Tool in $Tools) {
    $OutFile = Join-Path $LogosDir "$($Tool.Slug).png"

    # Skip if already downloaded
    if (Test-Path $OutFile) {
        Write-Host "  [SKIP]  $($Tool.Slug).png already exists" -ForegroundColor DarkGray
        $Success++
        continue
    }

    try {
        $Response = Invoke-WebRequest -Uri $Tool.Url -OutFile $OutFile -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
        $Size = (Get-Item $OutFile).Length
        if ($Size -lt 500) {
            # File too small — likely a 404 HTML page, not an image
            Remove-Item $OutFile -Force
            throw "Response too small ($Size bytes) — likely not a valid PNG"
        }
        Write-Host "  [OK]    $($Tool.Slug).png  ($Size bytes)" -ForegroundColor Green
        $Success++
    }
    catch {
        Write-Host "  [FAIL]  $($Tool.Slug) — $($_.Exception.Message)" -ForegroundColor Red
        $Failed++
    }

    # Brief pause to avoid rate limiting Clearbit
    Start-Sleep -Milliseconds 300
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "  Downloaded: $Success / $($Tools.Count) logos" -ForegroundColor Cyan
if ($Failed -gt 0) {
    Write-Host "  Failed:     $Failed (check URLs above and replace manually)" -ForegroundColor Yellow
}
Write-Host "  Output dir: $LogosDir" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: git add public/logos/ && git commit -m 'feat: add local tool logos'" -ForegroundColor White
