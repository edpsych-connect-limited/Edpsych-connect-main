
$path = "src/lib/orchestration/assignment-engine.service.ts"
$content = Get-Content $path -Raw

$content = $content -replace "studentsLessonAssignment", "studentLessonAssignment"

Set-Content -Path $path -Value $content
