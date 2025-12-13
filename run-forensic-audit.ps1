$ErrorActionPreference = "Continue"

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   EDPSYCH CONNECT: FORENSIC E2E AUDIT (FINAL VERIFICATION)   " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date)"
Write-Host "Target: http://localhost:3000"
Write-Host ""

# Ensure Server is Running
Write-Host "Checking for active server..." -ForegroundColor Yellow
$serverCheck = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet
if (-not $serverCheck) {
    Write-Host "Server not detected. Starting dev server..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Minimized
    Write-Host "Waiting 30s for server warm-up..."
    Start-Sleep -Seconds 30
} else {
    Write-Host "Server is active." -ForegroundColor Green
}

# Define Critical Test Suite
$testSuite = @(
    "cypress/e2e/sanity.cy.ts",
    "cypress/e2e/auth.cy.ts",
    "cypress/e2e/onboarding.cy.ts",
    "cypress/e2e/ehcp.cy.ts",
    "cypress/e2e/la-portal.cy.ts",
    "cypress/e2e/parent-portal.cy.ts",
    "cypress/e2e/safety-net.cy.ts"
)

$reportFile = "FORENSIC_AUDIT_REPORT.md"
"# Forensic E2E Audit Report" | Out-File -FilePath $reportFile -Encoding utf8
"**Date:** $(Get-Date)" | Out-File -FilePath $reportFile -Append -Encoding utf8
"**Status:** Running..." | Out-File -FilePath $reportFile -Append -Encoding utf8
"" | Out-File -FilePath $reportFile -Append -Encoding utf8
"| Module | Status | Duration | Notes |" | Out-File -FilePath $reportFile -Append -Encoding utf8
"|---|---|---|---|" | Out-File -FilePath $reportFile -Append -Encoding utf8

foreach ($spec in $testSuite) {
    Write-Host "Running Forensic Audit on: $spec" -ForegroundColor Magenta
    
    $startTime = Get-Date
    # Run Cypress Headless
    # Use cmd /c npx to avoid "not a valid Win32 application" error
    $process = Start-Process -FilePath "cmd" -ArgumentList "/c npx cypress run --spec $spec" -PassThru -Wait -NoNewWindow
    $endTime = Get-Date
    $duration = New-TimeSpan -Start $startTime -End $endTime
    
    $status = "❌ FAILED"
    if ($process.ExitCode -eq 0) {
        $status = "✅ PASSED"
        Write-Host "  -> PASSED" -ForegroundColor Green
    } else {
        Write-Host "  -> FAILED" -ForegroundColor Red
    }
    
    "| $spec | $status | $($duration.TotalSeconds)s | Exit Code: $($process.ExitCode) |" | Out-File -FilePath $reportFile -Append -Encoding utf8
}

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "   AUDIT COMPLETE. REPORT SAVED TO $reportFile   " -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
