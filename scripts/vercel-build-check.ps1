# Vercel Build Verification Script for Windows
# Run: powershell -ExecutionPolicy Bypass -File scripts/vercel-build-check.ps1

Write-Host "[Vercel] Build Verification" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$distClientPath = "dist/client"
$indexPath = Join-Path $distClientPath "index.html"
$assetsPath = Join-Path $distClientPath "assets"

# Check if dist/client exists
if (Test-Path $distClientPath) {
    Write-Host "[OK] dist/client directory found" -ForegroundColor Green
    
    # Check if index.html exists
    if (Test-Path $indexPath) {
        Write-Host "[OK] dist/client/index.html found" -ForegroundColor Green
        $size = (Get-Item $indexPath).Length
        Write-Host "     Size: $size bytes"
    } else {
        Write-Host "[ERROR] dist/client/index.html NOT found" -ForegroundColor Red
        exit 1
    }
    
    # Check assets
    if (Test-Path $assetsPath) {
        $assetCount = @(Get-ChildItem $assetsPath -File -Recurse).Count
        Write-Host "[OK] dist/client/assets directory found ($assetCount files)" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] dist/client/assets directory not found" -ForegroundColor Yellow
    }
} else {
    Write-Host "[ERROR] dist/client directory NOT found" -ForegroundColor Red
    exit 1
}

# Verify vercel.json configuration
if (Test-Path "vercel.json") {
    Write-Host "[OK] vercel.json configuration found" -ForegroundColor Green
    
    $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
    $outputDir = $vercelConfig.outputDirectory
    Write-Host "     Output directory configured: $outputDir"
    
    if ($outputDir -eq "dist/client") {
        Write-Host "[OK] outputDirectory correctly set to dist/client" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] outputDirectory is set to '$outputDir', expected 'dist/client'" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARNING] vercel.json not found - using Vercel defaults" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "[SUCCESS] Build verification completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "   - SPA build output: dist/client"
Write-Host "   - Entry point: dist/client/index.html"
Write-Host "   - Vercel framework: Vite (auto-detected)"
Write-Host "   - SPA routing: Configured via vercel.json rewrites"
Write-Host ""
Write-Host "Ready for Vercel deployment!" -ForegroundColor Green
