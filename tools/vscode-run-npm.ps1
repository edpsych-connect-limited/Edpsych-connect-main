[CmdletBinding()]
param(
  [Parameter()]
  [string]$RepoRoot = "e:\\EdpsychConnect",

  [Parameter(Mandatory = $true)]
  [string]$Script,

  [Parameter()]
  [string]$LogPath,

  [Parameter()]
  [switch]$PrintExitCode,

  [Parameter()]
  [switch]$TailLog,

  [Parameter()]
  [int]$TailLines = 80
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

Set-Location $RepoRoot

# Ensure Node from nvm-windows is resolvable in non-interactive task shells.
$candidateNodeDirs = @()

# Prefer nvm-windows symlink if present.
if (-not [string]::IsNullOrWhiteSpace($env:NVM_SYMLINK)) {
  $candidateNodeDirs += $env:NVM_SYMLINK
}

# Common nvm-windows default.
$candidateNodeDirs += 'C:\\nvm4w\\nodejs'

# Common system-wide Node install locations.
$candidateNodeDirs += 'C:\\Program Files\\nodejs'
$candidateNodeDirs += 'C:\\Program Files (x86)\\nodejs'

$resolvedNodeDir = $null
foreach ($dir in $candidateNodeDirs) {
  if ([string]::IsNullOrWhiteSpace($dir)) { continue }
  $nodeExe = Join-Path -Path $dir -ChildPath 'node.exe'
  if (Test-Path -LiteralPath $nodeExe) {
    $resolvedNodeDir = $dir
    break
  }
}

if ($resolvedNodeDir) {
  # Prepend the resolved directory so `node`/`npm` resolve deterministically.
  $env:Path = "$resolvedNodeDir;$($env:Path)"
} else {
  # Helpful error for CI/task shells where Node isn't discoverable.
  throw "Node.js was not found on PATH and could not be resolved from candidates: $($candidateNodeDirs -join ', '). Install Node 20.x or set NVM_SYMLINK to your nvm-windows nodejs symlink directory."
}

if ($LogPath) {
  $logDir = Split-Path -Parent $LogPath
  if ($logDir) {
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
  }
  Remove-Item -Force $LogPath -ErrorAction SilentlyContinue

  # NOTE: Native tools sometimes write non-fatal diagnostics to stderr (e.g. Babel notes).
  # PowerShell can surface those as non-terminating errors; do not fail the wrapper unless
  # the underlying process returns a non-zero exit code.
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  npm run $Script *> $LogPath
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prevEap

  if ($TailLog -and (Test-Path -LiteralPath $LogPath)) {
    Get-Content -LiteralPath $LogPath | Select-Object -Last $TailLines
  }
} else {
  $prevEap = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  npm run $Script
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prevEap
}

if ($PrintExitCode) {
  Write-Host ("EXIT_CODE=" + $code)
}

exit $code
