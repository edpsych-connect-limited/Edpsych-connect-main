
$path = "src/lib/reviews/annual-review.service.ts"
$content = Get-Content $path -Raw

$content = $content -replace "this.prisma.annualReview", "(this.prisma as any).annualReview"
$content = $content -replace "Prisma.AnnualReviewWhereInput", "any"
$content = $content -replace "Prisma.AnnualReviewInclude<DefaultArgs>", "any"
$content = $content -replace "Prisma.AnnualReviewOrderByWithRelationInput", "any"

Set-Content -Path $path -Value $content
