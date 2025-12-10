# Script to run E2E tests
# Usage: powershell -ExecutionPolicy Bypass -File run-e2e.ps1 [-Spec "cypress/e2e/auth/login.cy.ts"]

param (
    [string]$Spec = "cypress/e2e/auth/login.cy.ts"
)

Write-Host "Starting server..."
$env:NODE_OPTIONS = ""
$env:DATABASE_URL = "postgresql://neondb_owner:npg_rSnga68XPqve@ep-delicate-grass-abi62lhk-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"
$serverProcess = Start-Process -FilePath "cmd" -ArgumentList "/c npm start" -PassThru -NoNewWindow

# Wait for server to be ready
Write-Host "Waiting for server to be ready..."
$maxRetries = 30
$retryCount = 0
$serverReady = $false

while ($retryCount -lt $maxRetries) {
    try {
        $conn = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
        if ($conn.TcpTestSucceeded) {
            $serverReady = $true
            break
        }
    } catch {
        # Ignore errors
    }
    Start-Sleep -Seconds 2
    $retryCount++
    Write-Host "Waiting... ($retryCount/$maxRetries)"
}

if ($serverReady) {
    Write-Host "Server is listening on port 3000!"
    Write-Host "Running Cypress..."
    
    # Run Cypress
    # We use npx cypress run to run headless
    Write-Host "Running spec: $Spec"
    cmd /c "npx cypress run --spec $Spec"
    $cypressExitCode = $LASTEXITCODE
    
    Write-Host "Cypress finished with code: $cypressExitCode"
} else {
    Write-Host "Server failed to start in time."
}

# Kill the server process
Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "Server stopped."

if ($cypressExitCode -ne 0) {
    exit 1
}
