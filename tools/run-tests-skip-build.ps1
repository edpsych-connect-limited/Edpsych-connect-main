
$ErrorActionPreference = "Stop"
Write-Host "🚀 Starting Production Test Run (Skipping Build)..."

# 1. Start Production Server in Background
Write-Host "   Starting 'npm start' in background..."
$p = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow
$serverPid = $p.Id

# Wait for port 3000
Write-Host "   Waiting for port 3000..."
$retries = 0
$maxRetries = 30
$connected = $false
while (-not $connected -and $retries -lt $maxRetries) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("localhost", 3000)
        $connected = $true
        $tcp.Dispose()
    } catch {
        Start-Sleep -Seconds 2
        $retries++
        Write-Host "   ...waiting ($retries/$maxRetries)"
    }
}

if (-not $connected) {
    Write-Host "❌ Server failed to start on port 3000"
    Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "✅ Server is UP!"

# 2. Run Cypress
Write-Host "🚀 Running Cypress..."
try {
    # Run specifically the auth spec
    npx cypress run --spec "cypress/e2e/auth.cy.ts"
} catch {
    Write-Host "❌ Cypress failed"
} finally {
    Write-Host "🛑 Stopping server..."
    Stop-Process -Id $serverPid -Force -ErrorAction SilentlyContinue
    
    # Ensure all node processes spawned by npm start are killed
    Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -gt $p.StartTime } | Stop-Process -Force -ErrorAction SilentlyContinue
}
