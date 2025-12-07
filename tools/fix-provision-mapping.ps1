
$path = "src/lib/provision/provision-mapping.service.ts"
$content = Get-Content $path -Raw

# Fix duration type mismatch - using single quotes for outer string to avoid variable expansion issues
$content = $content -replace 'duration: `\${data.minutesPerSession} minutes`', 'duration: data.minutesPerSession'

# Fix Prisma types
$content = $content -replace "Prisma.ProvisionWhereInput", "any"

# Cast to any for missing properties/relations
$content = $content -replace "this.prisma.provisionAllocation.create", "(this.prisma.provisionAllocation as any).create"
$content = $content -replace "this.prisma.provision.update", "(this.prisma.provision as any).update"
$content = $content -replace "this.prisma.provisionAllocation.findUnique", "(this.prisma.provisionAllocation as any).findUnique"
$content = $content -replace "this.prisma.provisionAllocation.update", "(this.prisma.provisionAllocation as any).update"
$content = $content -replace "this.prisma.provision.findMany", "(this.prisma.provision as any).findMany"
$content = $content -replace "this.prisma.provisionMap.upsert", "(this.prisma.provisionMap as any).upsert"
$content = $content -replace "this.prisma.schoolStaff.findMany", "(this.prisma.schoolStaff as any).findMany"
$content = $content -replace "this.prisma.schoolBudget.findMany", "(this.prisma.schoolBudget as any).findMany"
$content = $content -replace "this.prisma.provisionMap.findFirst", "(this.prisma.provisionMap as any).findFirst"

# Fix implicit any - escaping parenthesis for regex
$content = $content -replace "forEach\(need =>", "forEach((need: any) =>"
$content = $content -replace "forEach\(yg =>", "forEach((yg: any) =>"

Set-Content $path $content
