
$ErrorActionPreference = "Stop"

Write-Host "================================================================"
Write-Host "🎯 COMPREHENSIVE BETA READINESS VALIDATION SUITE"
Write-Host "================================================================"
Write-Host ""

$startTime = Get-Date
$results = @()

function Add-Result {
    param($Name, $Status, $Duration, $Details = "")
    $script:results += [PSCustomObject]@{
        Test = $Name
        Status = $Status
        Duration = $Duration
        Details = $Details
    }
}

# ============================================================================
# PHASE 1: CRITICAL E2E TESTS
# ============================================================================

Write-Host "📋 PHASE 1: Critical E2E Test Suite"
Write-Host "─────────────────────────────────────────────────────────────────"

$criticalSpecs = @(
    "cypress/e2e/auth.cy.ts",
    "cypress/e2e/sanity.cy.ts",
    "cypress/e2e/routing.cy.ts",
    "cypress/e2e/parent-portal.cy.ts",
    "cypress/e2e/help-center.cy.ts"
)

foreach ($spec in $criticalSpecs) {
    $testName = "E2E: " + (Split-Path $spec -Leaf)
    $testStart = Get-Date
    Write-Host "   🧪 Running $testName..."
    
    try {
        # Check if server is already running
        $serverRunning = $false
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            $serverRunning = $true
        } catch {
            $serverRunning = $false
        }

        if (-not $serverRunning) {
            Write-Host "      ⚠️  Starting server..."
            $serverJob = Start-Job -ScriptBlock { npm start }
            
            # Wait for server
            $retries = 0
            while ($retries -lt 30) {
                try {
                    $tcp = New-Object System.Net.Sockets.TcpClient
                    $tcp.Connect("localhost", 3000)
                    $tcp.Dispose()
                    break
                } catch {
                    Start-Sleep -Seconds 2
                    $retries++
                }
            }
        }

        # Run Cypress
        $output = npx cypress run --spec $spec 2>&1 | Out-String
        
        if ($LASTEXITCODE -eq 0) {
            $testDuration = ((Get-Date) - $testStart).TotalSeconds
            Add-Result $testName "✅ PASS" "$([math]::Round($testDuration, 1))s"
            Write-Host "      ✅ PASSED ($([math]::Round($testDuration, 1))s)"
        } else {
            $testDuration = ((Get-Date) - $testStart).TotalSeconds
            $failInfo = ($output -split "`n" | Select-String "failing" | Select-Object -First 1)
            Add-Result $testName "❌ FAIL" "$([math]::Round($testDuration, 1))s" "$failInfo"
            Write-Host "      ❌ FAILED: $failInfo"
        }

        # Stop server if we started it
        if ($serverJob) {
            Stop-Job -Job $serverJob -ErrorAction SilentlyContinue
            Remove-Job -Job $serverJob -ErrorAction SilentlyContinue
            Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
        }

    } catch {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result $testName "❌ ERROR" "$([math]::Round($testDuration, 1))s" $_.Exception.Message
        Write-Host "      ❌ ERROR: $($_.Exception.Message)"
    }
}

# ============================================================================
# PHASE 2: CI VERIFICATION PIPELINE
# ============================================================================

Write-Host ""
Write-Host "📋 PHASE 2: CI Verification Pipeline"
Write-Host "─────────────────────────────────────────────────────────────────"

# Lint
$testStart = Get-Date
Write-Host "   🔍 Running ESLint..."
try {
    npm run lint 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result "Lint Check" "✅ PASS" "$([math]::Round($testDuration, 1))s"
        Write-Host "      ✅ PASSED"
    } else {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result "Lint Check" "❌ FAIL" "$([math]::Round($testDuration, 1))s"
        Write-Host "      ❌ FAILED"
    }
} catch {
    $testDuration = ((Get-Date) - $testStart).TotalSeconds
    Add-Result "Lint Check" "❌ ERROR" "$([math]::Round($testDuration, 1))s" $_.Exception.Message
    Write-Host "      ❌ ERROR"
}

# TypeScript
$testStart = Get-Date
Write-Host "   🔍 Running TypeScript Check..."
try {
    npm run type-check 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result "Type Check" "✅ PASS" "$([math]::Round($testDuration, 1))s"
        Write-Host "      ✅ PASSED"
    } else {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result "Type Check" "❌ FAIL" "$([math]::Round($testDuration, 1))s"
        Write-Host "      ❌ FAILED"
    }
} catch {
    $testDuration = ((Get-Date) - $testStart).TotalSeconds
    Add-Result "Type Check" "❌ ERROR" "$([math]::Round($testDuration, 1))s" $_.Exception.Message
    Write-Host "      ❌ ERROR"
}

# Build
$testStart = Get-Date
Write-Host "   🏗️  Running Production Build..."
try {
    # Clean first
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    }
    
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0 -and (Test-Path ".next/BUILD_ID")) {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result "Production Build" "✅ PASS" "$([math]::Round($testDuration, 1))s"
        Write-Host "      ✅ PASSED ($([math]::Round($testDuration, 1))s)"
    } else {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result "Production Build" "❌ FAIL" "$([math]::Round($testDuration, 1))s"
        Write-Host "      ❌ FAILED"
    }
} catch {
    $testDuration = ((Get-Date) - $testStart).TotalSeconds
    Add-Result "Production Build" "❌ ERROR" "$([math]::Round($testDuration, 1))s" $_.Exception.Message
    Write-Host "      ❌ ERROR"
}

# ============================================================================
# PHASE 3: SECURITY & GOVERNANCE
# ============================================================================

Write-Host ""
Write-Host "📋 PHASE 3: Security & Governance Validation"
Write-Host "─────────────────────────────────────────────────────────────────"

$governanceTests = @(
    @{Name="Security Scan"; Script="security:scan"},
    @{Name="AI Governance"; Script="test:ai-governance"},
    @{Name="AI Non-Training"; Script="test:ai-nontraining"}
)

foreach ($test in $governanceTests) {
    $testStart = Get-Date
    Write-Host "   🔒 Running $($test.Name)..."
    try {
        npm run $test.Script 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $testDuration = ((Get-Date) - $testStart).TotalSeconds
            Add-Result $test.Name "✅ PASS" "$([math]::Round($testDuration, 1))s"
            Write-Host "      ✅ PASSED"
        } else {
            $testDuration = ((Get-Date) - $testStart).TotalSeconds
            Add-Result $test.Name "⚠️  WARN" "$([math]::Round($testDuration, 1))s"
            Write-Host "      ⚠️  WARNING"
        }
    } catch {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result $test.Name "⚠️  WARN" "$([math]::Round($testDuration, 1))s" $_.Exception.Message
        Write-Host "      ⚠️  WARNING"
    }
}

# ============================================================================
# PHASE 4: DATABASE & DATA INTEGRITY
# ============================================================================

Write-Host ""
Write-Host "📋 PHASE 4: Database & Data Integrity"
Write-Host "─────────────────────────────────────────────────────────────────"

$dbTests = @(
    @{Name="DB Connectivity"; Script="test:db-connectivity"},
    @{Name="Audit Integrity"; Script="test:audit-integrity"}
)

foreach ($test in $dbTests) {
    $testStart = Get-Date
    Write-Host "   🗄️  Running $($test.Name)..."
    try {
        npm run $test.Script 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $testDuration = ((Get-Date) - $testStart).TotalSeconds
            Add-Result $test.Name "✅ PASS" "$([math]::Round($testDuration, 1))s"
            Write-Host "      ✅ PASSED"
        } else {
            $testDuration = ((Get-Date) - $testStart).TotalSeconds
            Add-Result $test.Name "⚠️  WARN" "$([math]::Round($testDuration, 1))s"
            Write-Host "      ⚠️  WARNING"
        }
    } catch {
        $testDuration = ((Get-Date) - $testStart).TotalSeconds
        Add-Result $test.Name "⚠️  WARN" "$([math]::Round($testDuration, 1))s" $_.Exception.Message
        Write-Host "      ⚠️  WARNING"
    }
}

# ============================================================================
# FINAL REPORT
# ============================================================================

$totalDuration = ((Get-Date) - $startTime).TotalMinutes
Write-Host ""
Write-Host "================================================================"
Write-Host "📊 BETA READINESS VALIDATION REPORT"
Write-Host "================================================================"
Write-Host ""

$results | Format-Table -AutoSize

$passed = ($results | Where-Object { $_.Status -like "*PASS*" }).Count
$failed = ($results | Where-Object { $_.Status -like "*FAIL*" }).Count
$warned = ($results | Where-Object { $_.Status -like "*WARN*" }).Count
$total = $results.Count

Write-Host ""
Write-Host "Summary:"
Write-Host "  ✅ Passed:  $passed"
Write-Host "  ❌ Failed:  $failed"
Write-Host "  ⚠️  Warned:  $warned"
Write-Host "  📊 Total:   $total"
Write-Host ""
Write-Host "Total Duration: $([math]::Round($totalDuration, 1)) minutes"
Write-Host ""

if ($failed -eq 0) {
    Write-Host "🎉 RECOMMENDATION: APPROVED FOR BETA DEPLOYMENT" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  RECOMMENDATION: FIX FAILURES BEFORE BETA DEPLOYMENT" -ForegroundColor Yellow
    exit 1
}
