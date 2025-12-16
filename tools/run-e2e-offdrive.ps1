param(
  [int]$Port = 3000,
  [string]$DestRoot = "",
  [switch]$SkipInstall,
  [switch]$SkipBuild,
  [switch]$SkipCypress,
  [string]$CypressSpec = "",
  [switch]$AllowUnsupportedNode
)

$ErrorActionPreference = 'Stop'

# PowerShell 7+ can treat native STDERR output as errors when $ErrorActionPreference = 'Stop',
# which causes harmless npm warnings (e.g., EBADENGINE) to abort this script.
# We explicitly disable that behavior and rely on process exit codes instead.
$PSNativeCommandUseErrorActionPreference = $false

function Invoke-LoggedCmd {
  param(
    [Parameter(Mandatory = $true)][string]$Command,
    [Parameter(Mandatory = $true)][string]$LogPath,
    [Parameter(Mandatory = $true)][string]$FailureMessage
  )

  # Some tools (notably npm) write warnings to STDERR. In Windows PowerShell,
  # that can surface as non-terminating errors which become terminating when
  # $ErrorActionPreference = 'Stop'. We temporarily relax error handling,
  # capture all output to the log, then enforce correctness via exit code.
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    # PowerShell 7+ surfaces native STDERR as error-stream output. Redirect *all* streams
    # to the success stream so warnings don't appear as NativeCommandError records.
    cmd /c $Command *>&1 | Tee-Object -FilePath $LogPath | Out-Null
  }
  finally {
    $ErrorActionPreference = $prev
  }

  if ($LASTEXITCODE -ne 0) {
    throw "$FailureMessage (exit code $LASTEXITCODE). See $LogPath"
  }
}

$source = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path

if ([string]::IsNullOrWhiteSpace($DestRoot)) {
  $DestRoot = Join-Path $env:LOCALAPPDATA 'EdpsychConnect-Offdrive'
}

$dest = Join-Path $DestRoot 'repo'
$logs = Join-Path $DestRoot 'logs'

New-Item -ItemType Directory -Force -Path $dest | Out-Null
New-Item -ItemType Directory -Force -Path $logs | Out-Null

Write-Host "Source: $source"
Write-Host "Dest:   $dest"
Write-Host "Logs:   $logs"

# Fast mirror copy to a local NTFS folder (external drives like exFAT can break Next.js builds).
# Exclude heavyweight and ephemeral folders.
$excludeDirs = @(
  '.git',
  'node_modules',
  '.next',
  '.next_temp',
  '.next_build',
  '.next_cache',
  '.turbo',
  'cypress\videos',
  'cypress\screenshots'
)

# Exclude large media assets that are not required for the E2E suite.
$excludeFiles = @(
  '*.mp4',
  '*.mov',
  '*.avi'
)

$robocopyLog = Join-Path $logs 'robocopy.log'

$xdArgs = @()
if ($excludeDirs.Count -gt 0) {
  # Pass directory names/relative paths so exclusions also protect destination-only folders
  # (e.g., node_modules created in $dest after npm ci) from being purged by /MIR.
  $xdArgs = @('/XD') + $excludeDirs
}

$xfArgs = @()
foreach ($f in $excludeFiles) { $xfArgs += @('/XF', $f) }

Write-Host "Copying workspace to local disk..."
$rcArgs = @(
  $source,
  $dest,
  '/MIR',
  '/NFL', '/NDL',
  '/NJH', '/NJS',
  '/NP',
  '/R:1', '/W:1',
  '/MT:8'
) + $xdArgs + $xfArgs

# Robocopy exit codes 0-7 are success (including extra files removed, mismatches fixed, etc).
& robocopy @rcArgs | Tee-Object -FilePath $robocopyLog | Out-Null
if ($LASTEXITCODE -gt 7) {
  throw "Robocopy failed with exit code $LASTEXITCODE. See $robocopyLog"
}

Push-Location $dest

try {
  $nodeVersion = (& node -v 2>$null)
  if (-not $nodeVersion) {
    throw "Node.js not found on PATH. This project requires Node 20.x (see package.json engines)."
  }

  $nodeMajor = 0
  if ($nodeVersion -match '^v(\d+)') {
    $nodeMajor = [int]$Matches[1]
  }

  if ($nodeMajor -ne 20 -and -not $AllowUnsupportedNode) {
    throw "Unsupported Node version $nodeVersion detected. This repo requires Node 20.x. Re-run with -AllowUnsupportedNode to bypass engine checks locally (not recommended for CI/production)."
  }

  if (-not $SkipInstall) {
    Write-Host "Installing dependencies (npm ci)..."
    $installLog = Join-Path $logs 'npm-ci.log'
    if ($nodeMajor -ne 20 -and $AllowUnsupportedNode) {
      Invoke-LoggedCmd -Command "set npm_config_engine_strict=false&& npm ci" -LogPath $installLog -FailureMessage "npm ci failed"
    } else {
      Invoke-LoggedCmd -Command "npm ci" -LogPath $installLog -FailureMessage "npm ci failed"
    }
  }

  if (-not $SkipBuild) {
    Write-Host "Building (npm run build)..."
    $buildLog = Join-Path $logs 'build.log'
    Invoke-LoggedCmd -Command "npm run build" -LogPath $buildLog -FailureMessage "npm run build failed"
  }

  Write-Host "Starting server on port $Port..."
  $serverLog = Join-Path $logs 'server.log'
  $serverErr = Join-Path $logs 'server.err.log'

  $server = Start-Process -FilePath "node" -ArgumentList @(
    "node_modules/next/dist/bin/next",
    "start",
    "-p",
    "$Port"
  ) -PassThru -RedirectStandardOutput $serverLog -RedirectStandardError $serverErr

  try {
    Write-Host "Waiting for http://localhost:$Port ..."
    $waitLog = Join-Path $logs 'wait-on.log'
    Invoke-LoggedCmd -Command "npx wait-on -t 180000 http://localhost:$Port" -LogPath $waitLog -FailureMessage "wait-on failed (also check server logs: $serverLog / $serverErr)"

    if (-not $SkipCypress) {
      Write-Host "Running Cypress..."
      $cypressLog = Join-Path $logs 'cypress.log'
      $specArg = ""
      if (-not [string]::IsNullOrWhiteSpace($CypressSpec)) {
        Write-Host "Using Cypress spec: $CypressSpec"
        $specArg = " --spec `"$CypressSpec`""
      }
      Invoke-LoggedCmd -Command ("npx cypress run --config baseUrl=http://localhost:$Port" + $specArg) -LogPath $cypressLog -FailureMessage "Cypress failed"
    }
  }
  finally {
    if ($server -and -not $server.HasExited) {
      Write-Host "Stopping server (PID $($server.Id))..."
      Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue
    }
  }
}
finally {
  Pop-Location
}

Write-Host "Done. Logs are in: $logs";
