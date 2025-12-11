param (
    [string]$Spec = "cypress/e2e/sanity.cy.ts"
)

$env:PORT = 3004
$env:NODE_OPTIONS = "--max-old-space-size=4096"
# Ensure we don't use the system env var if it still exists in this session
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue

# Check if server is already running
$serverRunning = $false
try {
    $conn = Get-NetTCPConnection -LocalPort 3004 -ErrorAction Stop
    if ($conn.State -eq 'Listen') {
        $serverRunning = $true
        Write-Host "Server already running on port 3004."
    }
} catch {
    Write-Host "Server not running on port 3004. Starting..."
}

$serverProcess = $null

if (-not $serverRunning) {
    # Start server
    $serverProcess = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm start" -PassThru -RedirectStandardOutput "server_e2e.log" -RedirectStandardError "server_e2e_err.log" -WindowStyle Hidden
    
    Write-Host "Waiting for server to start (20s)..."
    Start-Sleep -Seconds 20
    
    # Verify
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3004" -Method Head -ErrorAction Stop
        Write-Host "Server started successfully."
    } catch {
        Write-Host "Server failed to start or is unreachable."
        Write-Host "Error: $_"
        if (Test-Path server_e2e.log) { Get-Content server_e2e.log -Tail 20 }
        if (Test-Path server_e2e_err.log) { Get-Content server_e2e_err.log -Tail 20 }
        exit 1
    }
}

Write-Host "Running Cypress Spec: $Spec"
# Use cmd /c to run npx to avoid PowerShell parsing issues with some args if needed, but direct usually works.
# Using npx directly.
npx cypress run --spec "$Spec" --config baseUrl=http://localhost:3004

# We leave the server running if we started it, or if it was already running. 
# If you want to kill it, uncomment below.
# if ($serverProcess) { Stop-Process -Id $serverProcess.Id -Force }
