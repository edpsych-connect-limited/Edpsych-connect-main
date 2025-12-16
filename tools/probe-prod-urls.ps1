[CmdletBinding()]
param(
  [Parameter(Mandatory = $false)]
  [string]$RunId = $("RUN-" + (Get-Date).ToUniversalTime().ToString('yyyy-MM-dd') + "-01"),

  [Parameter(Mandatory = $false)]
  [string]$OutRoot = "docs/AUDIT/runs",

  [Parameter(Mandatory = $false)]
  [int]$MaxHops = 5,

  [Parameter(Mandatory = $false)]
  [string[]]$Urls = @(
    "https://www.edpsychconnect.com/robots.txt",
    "https://www.edpsychconnect.com/sitemap.xml",
    "https://www.edpsychconnect.com/en/training/courses"
  )
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Resolve-Location {
  param(
    [Parameter(Mandatory = $true)][string]$BaseUrl,
    [Parameter(Mandatory = $true)][string]$Location
  )

  try {
    $base = [Uri]$BaseUrl
    $loc = $Location.Trim()

    # Absolute URL
    if ($loc -match '^https?://') {
      return $loc
    }

    # Root-relative
    if ($loc.StartsWith('/')) {
      return (New-Object System.Uri($base, $loc)).AbsoluteUri
    }

    # Relative
    return (New-Object System.Uri($base, $loc)).AbsoluteUri
  } catch {
    return $null
  }
}

function Get-HeadRaw {
  param([Parameter(Mandatory = $true)][string]$Url)

  # Use curl.exe because it is consistent across Windows images and gives raw headers.
  # -s: silent; -I: HEAD; --max-time: hard timeout.
  $raw = & curl.exe -s -I --max-time 20 $Url
  # PowerShell may return a string[] (one element per line). Normalize to a single string.
  if ($null -eq $raw) { return "" }
  if ($raw -is [System.Array]) { return ($raw -join "`n") }
  return [string]$raw
}

function Parse-Head {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [Parameter(Mandatory = $true)][string]$Raw
  )

  $lines = $Raw -split "`r?`n" | Where-Object { $_ -ne $null }
  $statusLine = $lines | Where-Object { $_ -match '^HTTP/' } | Select-Object -First 1

  $statusCode = $null
  if ($statusLine) {
    $parts = $statusLine -split ' '
    if ($parts.Length -ge 2) {
      [int]$tmp = 0
      if ([int]::TryParse($parts[1], [ref]$tmp)) { $statusCode = $tmp }
    }
  }

  $headers = @{}
  foreach ($line in $lines) {
    if ($line -match '^[^:]+:\s*.*$') {
      $idx = $line.IndexOf(':')
      if ($idx -gt 0) {
        $name = $line.Substring(0, $idx).Trim()
        $value = $line.Substring($idx + 1).Trim()
        # Keep first occurrence only for stability.
        if (-not $headers.ContainsKey($name)) { $headers[$name] = $value }
      }
    }
  }

  $location = $null
  foreach ($k in @('Location','location')) {
    if ($headers.ContainsKey($k)) { $location = $headers[$k]; break }
  }

  return [pscustomobject]@{
    url = $Url
    statusCode = $statusCode
    location = $location
    headers = [pscustomobject]@{
      location = $location
      contentType = ($headers['Content-Type'] ?? $headers['content-type'])
      cacheControl = ($headers['Cache-Control'] ?? $headers['cache-control'])
      server = ($headers['Server'] ?? $headers['server'])
      date = ($headers['Date'] ?? $headers['date'])
    }
  }
}

$captureUtc = (Get-Date).ToUniversalTime().ToString('o')
$runDir = Join-Path $OutRoot $RunId
New-Item -ItemType Directory -Path $runDir -Force | Out-Null

$results = @()
foreach ($startUrl in $Urls) {
  $chain = @()
  $current = $startUrl

  for ($hop = 0; $hop -lt $MaxHops; $hop++) {
    $raw = Get-HeadRaw -Url $current
    $parsed = Parse-Head -Url $current -Raw $raw
    $chain += $parsed

    $sc = $parsed.statusCode
    if ($sc -ge 300 -and $sc -lt 400 -and $parsed.location) {
      $next = Resolve-Location -BaseUrl $current -Location $parsed.location
      if (-not $next) { break }
      if ($next -eq $current) { break }
      $current = $next
      continue
    }

    break
  }

  $results += [pscustomobject]@{
    initialUrl = $startUrl
    chain = $chain
  }
}

$stamp = (Get-Date).ToUniversalTime().ToString('yyyyMMdd_HHmmss') + 'Z'
$outFile = Join-Path $runDir ("prod-public-urls-" + $stamp + ".json")

$payload = [pscustomobject]@{
  runId = $RunId
  capturedAtUtc = $captureUtc
  urls = $results
}

$payload | ConvertTo-Json -Depth 10 | Set-Content -Path $outFile -Encoding UTF8
Write-Host ("WROTE " + $outFile)
