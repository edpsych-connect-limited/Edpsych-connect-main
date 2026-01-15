
$env:NEXT_DIST_DIR=".next_temp_QA_4"
$env:NODE_OPTIONS="--max-old-space-size=8192"
$env:PORT="3000"

Write-Host "Starting server for Cypress..."
# Redirect outputs to files
$proc = Start-Process -FilePath "node" -ArgumentList "scripts/next-cli-patched.cjs", "start" -Passthru -RedirectStandardOutput "server_cypress_final.log" -RedirectStandardError "server_cypress_final.err"

$proc.Id | Out-File "server.pid"
Write-Host "Server started with PID $($proc.Id)"

# Loop wait for Ready
$maxWait = 120
$waited = 0
$ready = $false

while ($waited -lt $maxWait) {
    if ($proc.HasExited) { break }
    
    if (Test-Path "server_cypress_final.log") {
        $content = Get-Content "server_cypress_final.log"
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
    if (Test-Path "server_cypress_final.log") { Get-Content "server_cypress_final.log" -Tail 20 }
    Write-Host "--- STDERR ---"
    if (Test-Path "server_cypress_final.err") { Get-Content "server_cypress_final.err" -Tail 20 }
    exit 1
}

Write-Host "Server is up and running."
exit 0
