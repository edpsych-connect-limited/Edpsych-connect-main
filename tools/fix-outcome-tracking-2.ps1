
$path = "src/lib/outcomes/outcome-tracking.service.ts"
$content = Get-Content $path -Raw

$content = $content -replace "where: \{ id: studentId \}", "where: { id: parseInt(studentId) }"
$content = $content -replace "Prisma.OutcomeTemplateWhereInput", "any"

Set-Content -Path $path -Value $content
