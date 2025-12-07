
$path = "src/lib/outcomes/outcome-tracking.service.ts"
$content = Get-Content $path -Raw

# Fix implicit any
$content = $content -replace "filter\(o =>", "filter((o: any) =>"
$content = $content -replace "forEach\(outcome =>", "forEach((outcome: any) =>"
$content = $content -replace "map\(outcome =>", "map((outcome: any) =>"
$content = $content -replace "reduce\(\(sum, o\) =>", "reduce((sum: number, o: any) =>"

Set-Content $path $content
