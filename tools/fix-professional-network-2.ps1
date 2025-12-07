
$path = "src/lib/network/professional-network.service.ts"
$content = Get-Content $path -Raw

$content = $content -replace "Prisma.DiscussionWhereInput", "any"
$content = $content -replace "Prisma.DiscussionOrderByWithRelationInput", "any"
$content = $content -replace "this.prisma.helpfulVote", "(this.prisma as any).helpfulVote"
$content = $content -replace "Prisma.SharedResourceWhereInput", "any"
$content = $content -replace "this.prisma.mentoringRelationship", "(this.prisma as any).mentoringRelationship"
$content = $content -replace "this.prisma.mentoringSession", "(this.prisma as any).mentoringSession"
$content = $content -replace "this.prisma.networkEvent", "(this.prisma as any).networkEvent"
$content = $content -replace "this.prisma.eventRegistration", "(this.prisma as any).eventRegistration"

Set-Content -Path $path -Value $content
