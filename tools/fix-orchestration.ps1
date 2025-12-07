
$files = @(
    "src/lib/orchestration/profile-builder.service.ts",
    "src/lib/orchestration/voice-command.service.ts"
)

foreach ($path in $files) {
    $content = Get-Content $path -Raw

    # Fix Prisma model names
    $content = $content -replace "studentsLessonAssignment", "studentLessonAssignment"

    # Fix implicit any
    $content = $content -replace "filter\(\(a\) =>", "filter((a: any) =>"
    $content = $content -replace "map\(\(a\) =>", "map((a: any) =>"
    $content = $content -replace "reduce\(\(a, b\) =>", "reduce((a: number, b: number) =>"
    $content = $content -replace "reduce\(\(sum, a\) =>", "reduce((sum: number, a: any) =>"

    Set-Content $path $content
}
