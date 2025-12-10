$env:PATH = "$PSScriptRoot\tools\node20\node-v20.18.0-win-x64;$env:PATH"
Write-Host "Using local Node.js version:" -ForegroundColor Green
node -v

Write-Host "Starting development server on port 3002..." -ForegroundColor Green
# We use port 3002 to avoid conflicts with any hung processes on 3000
npm run dev -- -p 3002
