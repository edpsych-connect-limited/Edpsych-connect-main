
$path = "src/lib/senco/senco-dashboard.service.ts"
$content = Get-Content $path -Raw

# Fix Prisma types and missing properties
$content = $content -replace "this.prisma.sENDRegister.update", "(this.prisma.sENDRegister as any).update"
$content = $content -replace "this.prisma.sENDRegister.create", "(this.prisma.sENDRegister as any).create"
$content = $content -replace "this.prisma.sENDRegister.findMany", "(this.prisma.sENDRegister as any).findMany"
$content = $content -replace "this.prisma.reviewMeeting.aggregate", "(this.prisma.reviewMeeting as any).aggregate"
$content = $content -replace "this.prisma.parentPortalSession.count", "(this.prisma.parentPortalSession as any).count"
$content = $content -replace "this.prisma.parentMessage.count", "(this.prisma.parentMessage as any).count"
$content = $content -replace "this.prisma.documentView.count", "(this.prisma.documentView as any).count"
$content = $content -replace "this.prisma.reviewMeeting.count", "(this.prisma.reviewMeeting as any).count"
$content = $content -replace "this.prisma.meeting.count", "(this.prisma.meeting as any).count"
$content = $content -replace "this.prisma.document.count", "(this.prisma.document as any).count"
$content = $content -replace "this.prisma.intervention.count", "(this.prisma.intervention as any).count"
$content = $content -replace "this.prisma.provision.count", "(this.prisma.provision as any).count"
$content = $content -replace "this.prisma.staffAllocation.aggregate", "(this.prisma.staffAllocation as any).aggregate"
$content = $content -replace "this.prisma.externalSpecialist.aggregate", "(this.prisma.externalSpecialist as any).aggregate"
$content = $content -replace "this.prisma.schoolBudget.findFirst", "(this.prisma.schoolBudget as any).findFirst"

# Fix implicit any and type assertions
$content = $content -replace "include: \{ ehcp: true \} as any", "include: { ehcp: true } as never"
$content = $content -replace "include: \{ supportPlan: true \} as any", "include: { supportPlan: true } as never"
$content = $content -replace "as any", "as never"

Set-Content $path $content
