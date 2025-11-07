Param(
  [Parameter(Mandatory=$true)][string]$Unpack
)

$ErrorActionPreference = 'Stop'
$repo = "C:\EdPsychConnect"
$destImages = Join-Path $repo 'apps\web\public\images\legacy'
$destContent = Join-Path $repo 'content\legacy'
$destSite    = Join-Path $repo 'site'
$logCsv      = Join-Path $repo 'docs\ops\legacy_mapping.csv'
$logMd       = Join-Path $repo 'docs\ops\legacy_code_audit.md'

# Ensure folders
$null = New-Item -ItemType Directory -Force -Path $destImages, $destContent, $destSite
$map = @()

function Copy-WithMap {
  param([string]$src, [string]$dst)
  $dstDir = Split-Path $dst -Parent
  $null = New-Item -ItemType Directory -Force -Path $dstDir
  Copy-Item -Path $src -Destination $dst -Force
  $map += [pscustomobject]@{ Source=$src; Destination=$dst }
}

# Images (png|jpg|jpeg|svg|gif|webp)
Get-ChildItem -Path $Unpack -Recurse -Include *.png,*.jpg,*.jpeg,*.svg,*.gif,*.webp |
  ForEach-Object {
    $rel = $_.FullName.Substring($Unpack.Length).TrimStart('\','/')
    $dst = Join-Path $destImages $rel
    Copy-WithMap -src $_.FullName -dst $dst
  }

# Markdown (bio.md + other md)
Get-ChildItem -Path $Unpack -Recurse -Include bio.md,*.md |
  ForEach-Object {
    $name = $_.Name
    $target = if ($name -ieq 'bio.md') { 'bio.md' } else { "md\$_" }
    Copy-WithMap -src $_.FullName -dst (Join-Path $destContent $target)
  }

# Legacy landing HTML
Get-ChildItem -Path $Unpack -Recurse -Include landing-legacy.html, index-legacy.html |
  Select-Object -First 1 | ForEach-Object {
    Copy-WithMap -src $_.FullName -dst (Join-Path $destSite 'landing-legacy.html')
  }

# Logs
$map | Export-Csv -NoTypeInformation -Encoding UTF8 $logCsv
"# Legacy Mapping Report`n`n$(Get-Date -Format s)`n`n" +
("| Source | Destination |`n|---|---|`n" + ($map | ForEach-Object { "| $($_.Source) | $($_.Destination) |" }) -join "`n") |
  Out-File -Encoding UTF8 $logMd

Write-Host "Mapped $($map.Count) items." -ForegroundColor Green
