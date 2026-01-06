$env:NODE_OPTIONS="--max-old-space-size=8192"
$process = Start-Process -FilePath "node" -ArgumentList "scripts/next-cli-patched.cjs", "dev" -PassThru -NoNewWindow -RedirectStandardOutput "dev_server.log" -RedirectStandardError "dev_server.err"
Write-Output "Started Node Process with ID: $($process.Id)"
Start-Sleep -Seconds 10
Get-Content -Path "dev_server.log" -Tail 20
