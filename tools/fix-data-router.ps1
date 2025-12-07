
$path = "src/lib/orchestration/data-router.service.ts"
$content = Get-Content $path -Raw

# Fix Prisma model names
$content = $content -replace "studentsLessonAssignment", "studentLessonAssignment"
$content = $content -replace "studentsProgressSnapshot", "studentProgressSnapshot"

# Fix implicit any in reduce/filter/map
$content = $content -replace "reduce\(\(sum, a\) =>", "reduce((sum: number, a: any) =>"
$content = $content -replace "filter\(\(a\) =>", "filter((a: any) =>"
$content = $content -replace "map\(\(assignment\) =>", "map((assignment: any) =>"

Set-Content $path $content
