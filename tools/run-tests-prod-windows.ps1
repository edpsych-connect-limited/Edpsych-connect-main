param (
    [string]$Spec = "cypress/e2e/auth.cy.ts"
)

Write-Host "----------------------------------------------------------------"
Write-Host "🏭 PRODUCTION TEST RUNNER: HIGH FIDELITY WINDOWS EXECUTION"
Write-Host "----------------------------------------------------------------"

# 1. Environment Cleanup
Write-Host "🧹 STEP 1: Cleaning Environment..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process Cypress -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Database Seeding
Write-Host "🌱 STEP 2: Seeding Database..."
$env:SEED_FOUNDER_PASSWORD = "Kanopatrick1@"
$env:SEED_TEST_USERS_PASSWORD = "Kanopatrick1@"
$env:CYPRESS_TEST_PASSWORD = "Kanopatrick1@"
$env:NODE_OPTIONS = "--max-old-space-size=8192"

npx tsx prisma/seed-founder.ts

# 3. Build Application (The only way to escape Webpack dev server hell on Windows)
Write-Host "🏗️  STEP 3: Building Next.js Application (Clean Build)..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
}

# Run build synchronously
# We use npx next build instead of npm run build to avoid extra shell wrapping issues,
# but using npm run build ensures we use the patched scripts if any.
# Let's use the package.json script "build" by invoking it via npm.
try {
    Write-Host "   (This may take several minutes - please wait)..."
    $buildProcess = Start-Process -FilePath "npm.cmd" -ArgumentList "run build" -PassThru -Wait -NoNewWindow
    if ($buildProcess.ExitCode -ne 0) {
        Write-Error "Build failed with exit code $($buildProcess.ExitCode)"
        exit 1
    }
} catch {
    Write-Error "Build failed execution: $_"
    exit 1
}

# 4. Start Production Server
Write-Host "🚀 STEP 4: Starting Production Server..."
$serverJob = Start-Job -ScriptBlock { 
    $env:SEED_FOUNDER_PASSWORD = "Kanopatrick1@"
    $env:SEED_TEST_USERS_PASSWORD = "Kanopatrick1@"
    $env:NODE_ENV = "production"
    Set-Location "e:\EdpsychConnect"
    
    # Use 'npm start' which runs 'next start'
    npm start > server-prod.log 2>&1
}

# 5. Health Check Loop
Write-Host "HEALTH CHECK: Waiting for localhost:3000..."
$serverReady = $false
for ($i = 1; $i -le 60; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -ErrorAction Stop -TimeoutSec 5 -MaximumRedirection 0
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
            $serverReady = $true
            Write-Host "✅ Production Server is UP! (Status: $($response.StatusCode))"
            break
        }
    } catch {
       if ($_.Exception.Response.StatusCode -ge 200 -and $_.Exception.Response.StatusCode -lt 500) {
            $serverReady = $true
            Write-Host "✅ Production Server is UP! (Status: $($_.Exception.Response.StatusCode))"
            break
       }
       Write-Host -NoNewline "."
    }
    Start-Sleep -Seconds 2
}

if (-not $serverReady) {
    Write-Host "`n❌ FATAL: Production Server failed to start."
    if (Test-Path server-prod.log) {
        Write-Host "📜 SERVER LOG (Last 50 lines):"
        Get-Content server-prod.log -Tail 50
    }
    Receive-Job $serverJob
    Stop-Job $serverJob
    exit 1
}

# 6. Execute Tests
Write-Host "`n🧪 STEP 5: Executing Cypress Spec: $Spec"
$testProcess = Start-Process -FilePath "npx.cmd" -ArgumentList "cypress run --spec `"$Spec`"" -PassThru -Wait -NoNewWindow

# 7. Teardown
Write-Host "🛑 STEP 6: Teardown..."
Stop-Job $serverJob
Remove-Job $serverJob -Force
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

if ($testProcess.ExitCode -eq 0) {
    Write-Host "✨ SUCCESS: Tests Passed."
    exit 0
} else {
    Write-Host "💥 FAILURE: Tests Failed (Exit Code: $($testProcess.ExitCode))"
    exit $testProcess.ExitCode
}
