
$env:NEXT_DIST_DIR=".next_temp_QA_4"
$env:NODE_OPTIONS="--max-old-space-size=8192"
$env:PORT="3000"

Write-Host "Starting server from $env:NEXT_DIST_DIR..."
# $proc = Start-Process -FilePath "node" -ArgumentList "node_modules/next/dist/bin/next", "start" -Passthru -RedirectStandardOutput "server_debug.log" -RedirectStandardError "server_debug.err"
$proc = Start-Process -FilePath "node" -ArgumentList "scripts/next-cli-patched.cjs", "start" -Passthru -RedirectStandardOutput "server_debug.log" -RedirectStandardError "server_debug.err"

Write-Host "Process ID: $($proc.Id)"

# Loop wait for Ready
$maxWait = 60
$waited = 0
$ready = $false

while ($waited -lt $maxWait) {
    if ($proc.HasExited) { break }
    
    if (Test-Path "server_debug.log") {
        $content = Get-Content "server_debug.log"
        if ($content -match "Ready in") {
            $ready = $true
            Write-Host "Server reported Ready!"
            break
        }
    }
    
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "Waiting... ($waited/$maxWait) - running: $($proc.HasExited -eq $false)"
}

if ($proc.HasExited) {
    Write-Host "Process exited unexpectedly code: $($proc.ExitCode)"
    Write-Host "--- STDOUT ---"
    Get-Content "server_debug.log" -Tail 20
    Write-Host "--- STDERR ---"
    Get-Content "server_debug.err" -Tail 20
} else {
    Write-Host "Process is running."
    Write-Host "Attempting request..."
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 10
        Write-Host "Response: $($response.StatusCode)"
        Write-Host "Body: $($response.Content)"
    } catch {
        Write-Host "Request failed: $_"
    }
    
    # Keep alive for a bit more
    Start-Sleep -Seconds 5
    Stop-Process -Id $proc.Id -Force
}
