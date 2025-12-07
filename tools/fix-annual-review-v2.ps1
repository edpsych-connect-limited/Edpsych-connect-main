
$path = "src/lib/reviews/annual-review.service.ts"
$content = Get-Content $path -Raw

# Fix implicit any
$content = $content -replace "filter\(r =>", "filter((r: any) =>"
$content = $content -replace "map\(r =>", "map((r: any) =>"
$content = $content -replace "forEach\(r =>", "forEach((r: any) =>"
$content = $content -replace "reduce\(\(a, b\) =>", "reduce((a: number, b: number) =>"

Set-Content $path $content
