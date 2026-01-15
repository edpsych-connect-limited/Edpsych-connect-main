param (
    [string]$Spec = "cypress/e2e/safety-net.cy.ts"
)

Write-Host "----------------------------------------------------------------"
Write-Host "🛡️  ROBUST TEST RUNNER: ENTERPRISE GRADE EXECUTION"
Write-Host "----------------------------------------------------------------"

# 1. Environment Cleanup
Write-Host "🧹 STEP 1: Cleaning Environment..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process Cypress -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Server Startup
Write-Host "🚀 STEP 2: Seeding Database & Starting Server..."
$env:SEED_FOUNDER_PASSWORD = "Kanopatrick1@"
$env:SEED_TEST_USERS_PASSWORD = "Kanopatrick1@"
$env:CYPRESS_TEST_PASSWORD = "Kanopatrick1@"

# Run seed explicitly
Write-Host "🌱 Seeding Founder Data..."
npx tsx prisma/seed-founder.ts

# Generate unique dist dir to avoid Windows file locking issues
$uniqueDistDir = ".next_test_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
Write-Host "📂 Using unique build directory: $uniqueDistDir"

$devJob = Start-Job -ScriptBlock { 
    param($distDir)
    $env:SEED_FOUNDER_PASSWORD = "Kanopatrick1@"
    $env:SEED_TEST_USERS_PASSWORD = "Kanopatrick1@"
    $env:NEXT_DIST_DIR = $distDir
    $env:NEXT_WEBPACK_USEPOLLING = "true" # Enable polling for stability on E: drive
    Set-Location "e:\EdpsychConnect"
    # Force Webpack to avoid Turbopack crashes on Windows/WSL
    npm run dev -- --webpack > server.log 2>&1
} -ArgumentList $uniqueDistDir

# 3. Health Check Loop
Write-Host "HEALTH CHECK: Waiting for localhost:3000..."
$serverReady = $false
for ($i = 1; $i -le 60; $i++) {
    try {
        # Increased timeout to 10s because cold start compilation is slow
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -ErrorAction Stop -TimeoutSec 10 -MaximumRedirection 0
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
            $serverReady = $true
            Write-Host "✅ Server is UP! (Status: $($response.StatusCode))"
            break
        }
    } catch {
       # Handle 3xx redirects if they throw web exception due to MaxRedirection 0
       if ($_.Exception.Response.StatusCode -ge 200 -and $_.Exception.Response.StatusCode -lt 500) {
            $serverReady = $true
            Write-Host "✅ Server is UP! (Status: $($_.Exception.Response.StatusCode))"
            break
       }
       # If it's a timeout, log it specifically
       if ($_.Exception.Message -match "The operation has timed out") {
           Write-Host -NoNewline "T" # T for Timeout
       } else {
           Write-Host -NoNewline "."
       }
    }
    Start-Sleep -Seconds 5 # Wait longer between retries to let compilation proceed
}

if (-not $serverReady) {
    Write-Host "`n❌ FATAL: Server failed to start within 300 seconds."
    # ... allow seeing logs
    if (Test-Path server.log) {
        Write-Host "📜 SERVER LOG (Last 100 lines):"
        Get-Content server.log -Tail 100
    }
    Receive-Job $devJob
    Stop-Job $devJob
    exit 1
}

# 3.5 Warmup - DISABLED to avoid contention
# Write-Host "🔥 STEP 3.5: Warming up application routes... (DISABLED)"


# 4. Execute Tests
Write-Host "`n🧪 STEP 4: Executing Cypress Spec: $Spec"
# Using npx inside PowerShell requires attention to argument passing
$testProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "cypress run --spec `"$Spec`"" -PassThru -Wait -NoNewWindow

# 5. Cleanup & Reporting
Write-Host "🛑 STEP 4: Teardown..."
Stop-Job $devJob
Remove-Job $devJob -Force
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

if ($testProcess.ExitCode -eq 0) {
    Write-Host "✨ SUCCESS: Tests Passed."
    exit 0
} else {
    Write-Host "💥 FAILURE: Tests Failed (Exit Code: $($testProcess.ExitCode))"
    if (Test-Path server.log) {
        Write-Host "📜 SERVER LOG (Last 100 lines):"
        Get-Content server.log -Tail 100
    }
    exit $testProcess.ExitCode
}
