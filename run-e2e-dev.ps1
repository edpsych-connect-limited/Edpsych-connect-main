# Script to run E2E tests against Dev Server
# Usage: powershell -ExecutionPolicy Bypass -File run-e2e-dev.ps1 [-Spec "cypress/e2e/auth/login.cy.ts"]

param (
    [string]$Spec = "cypress/e2e/auth/login.cy.ts"
)

$env:DATABASE_URL = "postgresql://neondb_owner:npg_rSnga68XPqve@ep-delicate-grass-abi62lhk-pooler.eu-west-2.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"
$env:NODE_OPTIONS = "--max-old-space-size=4096"

# Check if server is already running
$serverRunning = $false
try {
    $conn = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
    if ($conn.TcpTestSucceeded) {
        $serverRunning = $true
        Write-Host "Server is already running on port 3000. Using existing server."
    }
} catch {
    # Ignore
}

$serverProcess = $null

if (-not $serverRunning) {
    Write-Host "Starting dev server..."
    # Start Next.js dev server directly with node to avoid npm/batch issues
    $serverProcess = Start-Process -FilePath "node" -ArgumentList "node_modules/next/dist/bin/next", "dev" -PassThru -NoNewWindow -RedirectStandardOutput "dev_server_e2e.log" -RedirectStandardError "dev_server_e2e.err"
    
    # Wait for server to be ready
    Write-Host "Waiting for server to be ready..."
    $maxRetries = 60 # 2 minutes max (dev server can be slow)
    $retryCount = 0
    
    while ($retryCount -lt $maxRetries) {
        try {
            $conn = Test-NetConnection -ComputerName localhost -Port 3000 -WarningAction SilentlyContinue
            if ($conn.TcpTestSucceeded) {
                $serverRunning = $true
                break
            }
        } catch {
            # Ignore errors
        }
        Start-Sleep -Seconds 2
        $retryCount++
        Write-Host "Waiting... ($retryCount/$maxRetries)"
    }
}

if ($serverRunning) {
    Write-Host "Server is listening on port 3000!"
    Write-Host "Running Cypress..."
    
    # Run Cypress
    Write-Host "Running spec: $Spec"
    cmd /c "npx cypress run --spec $Spec"
    $cypressExitCode = $LASTEXITCODE
    
    Write-Host "Cypress finished with code: $cypressExitCode"
} else {
    Write-Host "Server failed to start in time."
    $cypressExitCode = 1
}

# Only kill the server if we started it
if ($serverProcess) {
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Host "Server stopped."
}

if ($cypressExitCode -ne 0) {
    exit 1
}
