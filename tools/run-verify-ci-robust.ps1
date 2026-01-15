
$steps = @(
    "npm run lint",
    "npm run type-check",
    "npm run test:ai-governance",
    "npm run test:ai-nontraining",
    "npm run test:security-by-design",
    "npm run test:intervention-validation-scale",
    "npm run test:video-registry",
    "npm run test:video-assets",
    "npm run test:video-claims",
    "npm run test:video-script-coverage",
    "npm run test:video-script-provenance",
    "npm run smoke:ci",
    "npm run security:scan"
)

foreach ($step in $steps) {
    Write-Host "Running: $step" -ForegroundColor Cyan
    Invoke-Expression $step
    if ($LASTEXITCODE -ne 0) {
        Write-Host "FAILED: $step" -ForegroundColor Red
        exit 1
    }
    Write-Host "PASSED: $step" -ForegroundColor Green
}

Write-Host "VERIFY:CI COMPLETE - ALL TESTS PASSED" -ForegroundColor Green
exit 0
