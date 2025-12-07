
$path = "src/app/api/ehcp/provision-costs/route.ts"
$content = Get-Content $path -Raw

# Fix null index
$content = $content -replace "if \(!acc\[provider\]\)", "if (provider && !acc[provider])"
$content = $content -replace "acc\[provider\] = \[\];", "if (provider) acc[provider] = [];"
$content = $content -replace "acc\[provider\]\.push\(cost\);", "if (provider) acc[provider].push(cost);"

# Fix Prisma model name
$content = $content -replace "prisma.provisionsCost", "prisma.provisionCost"

Set-Content $path $content
