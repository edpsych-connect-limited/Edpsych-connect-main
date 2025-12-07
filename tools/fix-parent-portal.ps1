
$path = "src/lib/portal/parent-portal.service.ts"
$content = Get-Content $path -Raw

$content = $content -replace "lastLogin: true", "last_login: true"
$content = $content -replace "notificationPreferences: true", "// notificationPreferences: true"
$content = $content -replace "parentIds: \{ has: this.parentId \}", "parent_links: { some: { parent: { user_id: this.parentId } } }"
$content = $content -replace "tenantId: this.tenantId", "tenant_id: this.tenantId"

Set-Content -Path $path -Value $content
