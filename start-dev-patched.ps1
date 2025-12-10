$env:PATH = "$PSScriptRoot\tools\node20\node-v20.18.0-win-x64;$env:PATH"
$env:NODE_OPTIONS = "--max-old-space-size=4096"
Write-Host "Using local Node.js version:" -ForegroundColor Green
node -v

Write-Host "Starting development server on port 3002 (Patched Wrapper)..." -ForegroundColor Green
# Run the wrapper script
node tools/run-dev-patched.js dev -p 3002
