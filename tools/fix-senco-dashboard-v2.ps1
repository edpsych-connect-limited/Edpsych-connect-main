
$path = "src/lib/senco/senco-dashboard.service.ts"
$content = Get-Content $path -Raw

# Fix 'as never' to 'as any'
$content = $content -replace "as never", "as any"

Set-Content $path $content
