
$url = "http://localhost:3000/api/auth/me"
$maxRetries = 30
$retryCount = 0
$delay = 5

while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Get -UseBasicParsing -ErrorAction Stop
        Write-Host "Server is UP! Status: $($response.StatusCode)"
        exit 0
    } catch {
        Write-Host "Waiting for server... ($($retryCount + 1)/$maxRetries)"
        Start-Sleep -Seconds $delay
        $retryCount++
    }
}

Write-Host "Server timed out."
exit 1
