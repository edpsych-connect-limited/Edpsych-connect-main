
$path = "src/app/api/ehcp/provision-costs/route.ts"
$content = Get-Content $path -Raw

$content = $content -replace "provider_name: 'asc'", "provision_name: 'asc'"
$content = $content -replace "const type = cost.provision_type;", "const type = cost.provision_type || 'unknown';"

Set-Content -Path $path -Value $content
