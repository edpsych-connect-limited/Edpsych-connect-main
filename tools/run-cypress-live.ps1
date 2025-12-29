param(
  [string]$BaseUrl = 'https://edpsychconnect.com',
  [string]$Spec = 'cypress/e2e/**/*.cy.ts',
  [string]$SeedPassword = 'Test123!'
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $repoRoot

$ts = Get-Date -Format 'yyyyMMdd_HHmmss'
New-Item -ItemType Directory -Force -Path 'logs' | Out-Null
$log = Join-Path 'logs' ("cypress_live_full_${ts}.log")

$env:CYPRESS_BASE_URL = $BaseUrl
$env:SEED_TEST_USERS_PASSWORD = $SeedPassword

Write-Host "CYPRESS_BASE_URL=$($env:CYPRESS_BASE_URL)"
Write-Host "Spec=$Spec"
Write-Host "Log=$log"

# Run Cypress and capture all streams to log while also streaming to console.
& npx cypress run --spec $Spec *>&1 | Tee-Object -FilePath $log

$code = $LASTEXITCODE
Add-Content -Path $log -Value ("`nEXIT_CODE=$code")

Write-Host "EXIT_CODE=$code"
Write-Host "Saved log: $log"

exit $code
