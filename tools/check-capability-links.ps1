# Checks that landing-page feature cards in CoreCapabilitiesGrid link to real App Router pages.
# Intended for quick dev sanity checks.

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $root

$file = 'src/components/landing/CoreCapabilitiesGrid.tsx'
if (-not (Test-Path $file)) {
  Write-Error "Missing source file: $file"
  exit 2
}

$text = Get-Content -Raw $file
$hrefs = [regex]::Matches($text, 'href:\s*"([^"]+)"') |
  ForEach-Object { $_.Groups[1].Value } |
  Sort-Object -Unique

$missing = @()
foreach ($h in $hrefs) {
  $rel = $h.TrimStart('/')
  $p1 = Join-Path 'src/app/[locale]' (Join-Path $rel 'page.tsx')
  $p2 = Join-Path 'src/app/[locale]' (Join-Path $rel 'page.ts')

  if (-not (Test-Path $p1) -and -not (Test-Path $p2)) {
    $missing += $h
  }
}

if ($missing.Count -eq 0) {
  Write-Output 'ALL_PRESENT'
  exit 0
}

$missing | ForEach-Object { Write-Output ("MISSING_PAGE " + $_) }
exit 1
