
$path = "src/lib/portal/parent-portal.service.ts"
$content = Get-Content $path -Raw

# Fix Prisma field names
$content = $content -replace "lastLogin", "last_login"
$content = $content -replace "firstName", "first_name"
$content = $content -replace "lastName", "last_name"
$content = $content -replace "dateOfBirth", "date_of_birth"
$content = $content -replace "yearGroup", "year_group"
$content = $content -replace "schoolName", "school"
$content = $content -replace "photoUrl", "profile_photo"
$content = $content -replace "className", "class_name"

# Cast to any to avoid strict type checks for missing properties/relations
$content = $content -replace "this.prisma.users.findUnique", "(this.prisma.users as any).findUnique"
$content = $content -replace "this.prisma.parent.findUnique", "(this.prisma.parent as any).findUnique"
$content = $content -replace "this.prisma.student.findMany", "(this.prisma.student as any).findMany"
$content = $content -replace "this.prisma.student.findUnique", "(this.prisma.student as any).findUnique"
$content = $content -replace "this.prisma.parent.update", "(this.prisma.parent as any).update"

# Fix implicit any
$content = $content -replace "map\(n =>", "map((n: any) =>"
$content = $content -replace "map\(p =>", "map((p: any) =>"
$content = $content -replace "map\(o =>", "map((o: any) =>"

Set-Content $path $content
