$env:PATH = "$PSScriptRoot\tools\node20\node-v20.18.0-win-x64;$env:PATH"
Write-Host "Using local Node.js version:" -ForegroundColor Green
node -v

Write-Host "Starting development server on port 3002 (NO PATCH)..." -ForegroundColor Green

# Set memory limit directly in PowerShell
$env:NODE_OPTIONS = "--max-old-space-size=4096"
$env:WATCHPACK_POLLING = "true"
$env:CHOKIDAR_USEPOLLING = "true"

# Run Next.js directly, bypassing the package.json script that includes the potentially conflicting patch
node node_modules/next/dist/bin/next dev -p 3002
