# Script to run E2E tests
# Usage: powershell -ExecutionPolicy Bypass -File run-e2e.ps1 [-Spec "cypress/e2e/auth/login.cy.ts"]

param (
    # Supports comma-separated spec list (Cypress accepts "a,b,c")
    [string]$Spec = "cypress/e2e/sanity.cy.ts,cypress/e2e/auth.cy.ts,cypress/e2e/parent-portal.cy.ts"
)

Write-Host "Starting server..."
$env:NODE_OPTIONS = ""

function Import-DotEnv {
    param(
        [string[]]$Paths
    )

    foreach ($path in $Paths) {
        if (-not (Test-Path $path)) {
            continue
        }

        Get-Content $path | ForEach-Object {
            $line = $_.Trim()
            if (-not $line -or $line.StartsWith('#')) { return }

            if ($line.StartsWith('export ')) {
                $line = $line.Substring(7).Trim()
            }

            $idx = $line.IndexOf('=')
            if ($idx -lt 1) { return }

            $key = $line.Substring(0, $idx).Trim()
            $val = $line.Substring($idx + 1).Trim()

            if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
                $val = $val.Substring(1, $val.Length - 2)
            }

            if ($key) {
                $env:$key = $val
            }
        }
    }
}

Import-DotEnv -Paths @('.env', '.env.local', '.env.development.local')

if (-not $env:DATABASE_URL) {
    Write-Host "DATABASE_URL is not set. Configure it in .env/.env.local or in your shell environment." -ForegroundColor Red
    exit 1
}

$cypressExitCode = 1
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
