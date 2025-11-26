# EdPsych Connect - Migrate to E: Drive Script
# This script moves caches and syncs the project to E: drive to free C: drive space
# Run as Administrator in PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EdPsych Connect - E: Drive Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "WARNING: Some operations require Administrator privileges." -ForegroundColor Yellow
    Write-Host "Consider re-running as Administrator for full functionality." -ForegroundColor Yellow
    Write-Host ""
}

# Show current disk space
Write-Host "Current Disk Space:" -ForegroundColor Green
Get-WmiObject Win32_LogicalDisk | Where-Object { $_.DeviceID -in @("C:", "E:") } | 
    Select-Object DeviceID, 
        @{N='Size (GB)';E={[math]::Round($_.Size/1GB,2)}},
        @{N='Free (GB)';E={[math]::Round($_.FreeSpace/1GB,2)}},
        @{N='Used %';E={[math]::Round(($_.Size - $_.FreeSpace)/$_.Size * 100,1)}} |
    Format-Table -AutoSize
Write-Host ""

# Step 1: Clear build caches on C:
Write-Host "Step 1: Clearing build caches..." -ForegroundColor Yellow
$cachePaths = @(
    "C:\EdpsychConnect\.next",
    "C:\EdpsychConnect\node_modules\.cache",
    "$env:LOCALAPPDATA\npm-cache",
    "$env:LOCALAPPDATA\yarn\Cache"
)

foreach ($path in $cachePaths) {
    if (Test-Path $path) {
        $size = (Get-ChildItem $path -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  Removing $path ($([math]::Round($size,2)) MB)..." -ForegroundColor Gray
        Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "  Cache clearing complete!" -ForegroundColor Green
Write-Host ""

# Step 2: Create E: drive directory structure
Write-Host "Step 2: Setting up E: drive directories..." -ForegroundColor Yellow
$eDirs = @(
    "E:\Caches\npm-cache",
    "E:\Caches\yarn-cache",
    "E:\Caches\nuget",
    "E:\Temp"
)

foreach ($dir in $eDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    }
}
Write-Host "  Directory setup complete!" -ForegroundColor Green
Write-Host ""

# Step 3: Configure npm and yarn to use E: drive
Write-Host "Step 3: Configuring npm/yarn to use E: drive..." -ForegroundColor Yellow
try {
    npm config set cache "E:\Caches\npm-cache" --global 2>$null
    Write-Host "  npm cache set to E:\Caches\npm-cache" -ForegroundColor Gray
} catch {
    Write-Host "  Could not set npm cache (npm may not be installed)" -ForegroundColor Yellow
}

try {
    yarn config set cache-folder "E:\Caches\yarn-cache" 2>$null
    Write-Host "  yarn cache set to E:\Caches\yarn-cache" -ForegroundColor Gray
} catch {
    Write-Host "  Could not set yarn cache (yarn may not be installed)" -ForegroundColor Yellow
}
Write-Host "  Package manager config complete!" -ForegroundColor Green
Write-Host ""

# Step 4: Sync E: drive project with GitHub
Write-Host "Step 4: Syncing E:\EdpsychConnect with GitHub..." -ForegroundColor Yellow
if (Test-Path "E:\EdpsychConnect\.git") {
    Push-Location "E:\EdpsychConnect"
    git fetch origin 2>&1 | Out-Null
    git reset --hard origin/main 2>&1 | Out-Null
    git clean -fd 2>&1 | Out-Null
    $latestCommit = git log --oneline -1
    Write-Host "  Synced to: $latestCommit" -ForegroundColor Gray
    Pop-Location
} else {
    Write-Host "  Cloning fresh copy to E:\EdpsychConnect..." -ForegroundColor Gray
    git clone https://github.com/edpsych-connect-limited/Edpsych-connect-main.git "E:\EdpsychConnect" 2>&1 | Out-Null
}
Write-Host "  Project sync complete!" -ForegroundColor Green
Write-Host ""

# Step 5: Copy .env file if it exists
Write-Host "Step 5: Copying environment files..." -ForegroundColor Yellow
if (Test-Path "C:\EdpsychConnect\.env") {
    Copy-Item "C:\EdpsychConnect\.env" "E:\EdpsychConnect\.env" -Force
    Write-Host "  Copied .env file" -ForegroundColor Gray
}
if (Test-Path "C:\EdpsychConnect\.env.local") {
    Copy-Item "C:\EdpsychConnect\.env.local" "E:\EdpsychConnect\.env.local" -Force
    Write-Host "  Copied .env.local file" -ForegroundColor Gray
}
Write-Host "  Environment files copied!" -ForegroundColor Green
Write-Host ""

# Step 6: Install dependencies on E: drive
Write-Host "Step 6: Installing dependencies on E: drive..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
Push-Location "E:\EdpsychConnect"
npm install 2>&1 | Out-Null
Pop-Location
Write-Host "  Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Final space check
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Updated Disk Space:" -ForegroundColor Green
Get-WmiObject Win32_LogicalDisk | Where-Object { $_.DeviceID -in @("C:", "E:") } | 
    Select-Object DeviceID, 
        @{N='Size (GB)';E={[math]::Round($_.Size/1GB,2)}},
        @{N='Free (GB)';E={[math]::Round($_.FreeSpace/1GB,2)}},
        @{N='Used %';E={[math]::Round(($_.Size - $_.FreeSpace)/$_.Size * 100,1)}} |
    Format-Table -AutoSize

Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Open VS Code and go to File > Open Folder" -ForegroundColor White
Write-Host "2. Navigate to E:\EdpsychConnect" -ForegroundColor White
Write-Host "3. Trust the folder when prompted" -ForegroundColor White
Write-Host "4. Your project is now on the E: drive with 22TB of space!" -ForegroundColor White
Write-Host ""
Write-Host "Optional: Delete C:\EdpsychConnect to free more space" -ForegroundColor Gray
Write-Host "  Command: Remove-Item -Path 'C:\EdpsychConnect' -Recurse -Force" -ForegroundColor Gray
Write-Host ""
