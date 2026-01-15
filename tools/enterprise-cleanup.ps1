
# Enterprise Grade Cleanup Script
# Removes all temporary build artifacts and ensures clean state

Write-Host "Starting Enterprise Cleanup..." -ForegroundColor Cyan

# 1. Remove Next.js temporary build directories
$buildDirs = Get-ChildItem -Path . -Directory -Filter ".next*"
foreach ($dir in $buildDirs) {
    Write-Host "Removing $($dir.Name)..." -ForegroundColor Yellow
    Remove-Item -Path $dir.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

# 2. Remove specific temporary tools/scripts identified as debris
$tempFiles = @(
    "tools/check_files.cjs",
    "tools/audit-pages-quick.js",
    "server.pid",
    "server_err.txt",
    "server_log.txt",
    "login.json",
    "cypress_task_log.txt"
)

foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Write-Host "Removing $file..." -ForegroundColor Yellow
        Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
    }
}

# 3. Ensure middleware.ts is correct
if (Test-Path "src/middleware.ts.legacy") {
    Write-Host "Restoring stuck middleware.ts..." -ForegroundColor Red
    Move-Item -Path "src/middleware.ts.legacy" -Destination "src/middleware.ts" -Force
}

Write-Host "Cleanup Complete." -ForegroundColor Green
