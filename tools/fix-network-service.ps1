
$path = "src/lib/network/professional-network.service.ts"
$content = Get-Content $path -Raw

# Fix implicit any
$content = $content -replace "forEach\(conn =>", "forEach((conn: any) =>"
$content = $content -replace "map\(m =>", "map((m: any) =>"

Set-Content $path $content
