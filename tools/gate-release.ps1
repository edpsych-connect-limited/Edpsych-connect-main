# One-command release gate: lint + type-check + clean build + start prod server + Cypress smoke + Cypress regression
# Usage:
#   powershell -ExecutionPolicy Bypass -File tools/gate-release.ps1

param(
    [int]$Port = 3000,
    [string]$Url = "http://localhost:3000",
    [string]$LogPath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# PowerShell 7 can treat native stderr output as an error record when
# $PSNativeCommandUseErrorActionPreference is enabled, which would make
# non-fatal warnings (e.g. console.warn) fail the gate.
# We explicitly disable that behavior so only non-zero exit codes fail.
try {
    $PSNativeCommandUseErrorActionPreference = $false
} catch {
    # Ignore on Windows PowerShell 5.1 where this variable doesn't exist.
}

# Resolve repository root once (used for log paths and artifacts).
$repoRoot = $null
try {
    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
} catch {
    $repoRoot = (Get-Location).Path
}

# Resolve a stable absolute log file path (avoids issues with relative/".." segments on Windows).
if ([string]::IsNullOrWhiteSpace($LogPath)) {
    try {
        $LogPath = Join-Path $repoRoot 'gate-release.log'
    } catch {
        # Fallback: relative to current working directory
        $LogPath = 'gate-release.log'
    }
}

function Write-Log {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        [ConsoleColor]$Color = [ConsoleColor]::Gray
    )

    try {
        Write-Host $Message -ForegroundColor $Color
    } catch {
        Write-Output $Message
    }

    try {
        Add-Content -Path $LogPath -Value $Message
    } catch {
        # Best effort; don't fail the gate just because logging failed.
        # But do surface the first failure to make debugging possible.
        if (-not $script:LogWriteFailed) {
            $script:LogWriteFailed = $true
            try {
                Write-Host "WARNING: Failed to write to log file '$LogPath': $($_.Exception.Message)" -ForegroundColor Yellow
            } catch {
                # ignore
            }
        }
    }
}

try {
    Remove-Item -Path $LogPath -Force -ErrorAction SilentlyContinue
} catch {
    # ignore
}

try {
    New-Item -ItemType File -Path $LogPath -Force -ErrorAction SilentlyContinue | Out-Null
} catch {
    # ignore
}

Write-Log "Gate log: $LogPath" ([ConsoleColor]::DarkGray)

function Import-DotEnv {
    param(
        [string[]]$Paths
    )

    foreach ($path in $Paths) {
        if (-not (Test-Path $path)) {
            continue
        }

        Get-Content $path | ForEach-Object {
            $line = $_.Trim()
            if (-not $line -or $line.StartsWith('#')) { return }

            if ($line.StartsWith('export ')) {
                $line = $line.Substring(7).Trim()
            }

            $idx = $line.IndexOf('=')
            if ($idx -lt 1) { return }

            $key = $line.Substring(0, $idx).Trim()
            $val = $line.Substring($idx + 1).Trim()

            if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
                $val = $val.Substring(1, $val.Length - 2)
            }

            if ($key) {
                Set-Item -Path ("Env:{0}" -f $key) -Value $val | Out-Null
            }
        }
    }
}

function Clear-NextArtifacts {
    param(
        [string[]]$Paths = @('.next', '.next_build'),
        [int]$Port = 3000
    )

    # NOTE: Do NOT blanket-kill all Node.js processes here.
    # This script is invoked via `npm run`, which itself runs in a Node.js process.
    # Killing all `node.exe` would terminate the gate mid-run.
    Write-Log "Ensuring no process is listening on port $Port (best effort)..." ([ConsoleColor]::Yellow)
    try {
        $listeners = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        foreach ($l in $listeners) {
            if ($l.OwningProcess) {
                Stop-Process -Id $l.OwningProcess -Force -ErrorAction SilentlyContinue
            }
        }
    } catch {
        # Best effort
    }

    foreach ($p in $Paths) {
        if (-not (Test-Path $p)) { continue }

        $removed = $false
        for ($i = 1; $i -le 5; $i++) {
            try {
                Remove-Item -Path $p -Recurse -Force -ErrorAction Stop
                $removed = $true
                break
            } catch {
                Write-Log "Cleanup retry $i/5 failed for ${p}: $($_.Exception.Message)" ([ConsoleColor]::Yellow)
                Start-Sleep -Seconds 2
            }
        }

        if (-not $removed -and (Test-Path $p)) {
            Write-Log "Fallback cleanup (takeown/icacls/rd) for $p ..." ([ConsoleColor]::Yellow)
            $escaped = $p.Replace('"', '""')
            cmd /c "takeown /f \"$escaped\" /r /d y >nul 2>&1 && icacls \"$escaped\" /grant %USERNAME%:F /t >nul 2>&1 && rd /s /q \"$escaped\"" | Out-Null
        }

        if (Test-Path $p) {
            throw "Failed to remove $p. A background process may still be holding file handles."
        }
    }
}

function Invoke-NpmScript {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Script,
        [string[]]$Args = @()
    )

    $argsString = ""
    if ($Args -and $Args.Count -gt 0) {
        $argsString = " -- " + ($Args -join ' ')
    }

    Write-Log "==> npm run $Script$argsString" ([ConsoleColor]::Cyan)

    function Quote-CmdArg {
        param([Parameter(Mandatory = $true)][string]$Value)
        # cmd.exe quoting: wrap in quotes if it contains whitespace or shell metacharacters.
        # Double any embedded quotes.
        if ($Value -match '[\s&|<>^\"]') {
            return '"' + ($Value -replace '"', '""') + '"'
        }
        return $Value
    }

    # Run via cmd.exe to avoid PowerShell treating native stderr as an error record.
    # We redirect stderr->stdout *inside* cmd so Tee-Object captures everything.
    $cmdParts = @('npm', 'run', $Script)
    if ($Args -and $Args.Count -gt 0) {
        $cmdParts += '--'
        $cmdParts += $Args
    }

    $cmdText = ($cmdParts | ForEach-Object { Quote-CmdArg $_ }) -join ' '
    $cmdText = $cmdText + ' 2>&1'

    & cmd.exe /d /s /c $cmdText | Tee-Object -FilePath $LogPath -Append
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        throw "npm run $Script failed with exit code $exitCode"
    }
}

try {
    # Load env files in increasing specificity; later files override earlier ones.
    # For a *release* gate we also honor production/preview env files when present,
    # since the gate starts a production server (`next start`).
    Write-Log "Loading environment (.env, .env.local, .env.development.local, .env.production.local, .env.preview.local)..." ([ConsoleColor]::Green)
    Import-DotEnv -Paths @('.env', '.env.local', '.env.development.local', '.env.production.local', '.env.preview.local')

    if (-not $env:DATABASE_URL) {
        Write-Log "DATABASE_URL is not set. Configure it in .env/.env.local or in your shell environment." ([ConsoleColor]::Red)
        exit 1
    }

    # Fail fast if DB credentials are invalid/unreachable. The Cypress smoke suite requires a working DB.
    Invoke-NpmScript -Script "test:db-connectivity"

    # Build into an isolated dist dir during the gate to avoid flakey Windows locks/ACL issues.
    # Keep the dist dir name stable so Next doesn't constantly rewrite tsconfig.json includes.
    # next.config.mjs honors NEXT_DIST_DIR when set.
    if (-not $env:NEXT_DIST_DIR) {
        $env:NEXT_DIST_DIR = ".next_build_gate"
    }

    # Prefer the repo-pinned Node 20 if present (helps keep builds consistent with package.json engines)
    $node20Dir = Join-Path $PSScriptRoot "node20\node-v20.18.0-win-x64"
    $node20Exe = Join-Path $node20Dir "node.exe"
    if (Test-Path $node20Exe) {
        $env:PATH = "$node20Dir;$env:PATH"
        Write-Log "Using local Node.js (repo-pinned):" ([ConsoleColor]::Green)
    } else {
        Write-Log "Using system Node.js (local Node 20 not found under tools/node20)." ([ConsoleColor]::Yellow)
    }

    Write-Log "Node version:" ([ConsoleColor]::Green)
    & node -v 2>&1 | Tee-Object -FilePath $LogPath -Append

    # Fail fast if something is already listening on the port
    try {
        $conn = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        if ($conn.TcpTestSucceeded) {
            Write-Log "Port $Port is already in use. Stop the existing server and retry." ([ConsoleColor]::Red)
            exit 1
        }
    } catch {
        # Ignore and continue
    }

    # Static gates
    Invoke-NpmScript -Script "lint"
    Invoke-NpmScript -Script "type-check"

    # Safety gates (unit-ish)
    Invoke-NpmScript -Script "test:pii-redaction"
    Invoke-NpmScript -Script "test:ai-governance"
    Invoke-NpmScript -Script "test:byod-db-url"
    Invoke-NpmScript -Script "test:video-registry"
    Invoke-NpmScript -Script "test:contextual-help-coverage"
    Invoke-NpmScript -Script "test:audit-integrity"

    # Audit integrity verification (DB-backed). Skips automatically when AUDIT_LOG_INTEGRITY_MODE=off.
    Invoke-NpmScript -Script "verify:audit-integrity"

    # Clean build (best effort)
    Write-Log "Cleaning Next build artifacts..." ([ConsoleColor]::Green)
    try {
        Clear-NextArtifacts -Paths @('.next', $env:NEXT_DIST_DIR) -Port $Port
    } catch {
        # If the gate dist dir itself is locked/undeletable, fall back to a secondary stable dist dir.
        $fallbackDist = ".next_build_gate_alt"
        Write-Log "WARNING: Unable to fully remove .next/$($env:NEXT_DIST_DIR) (Windows file lock/permissions)." ([ConsoleColor]::Yellow)
        Write-Log "If the build fails with a lock error, close VS Code/terminals and retry, or reboot to release file handles." ([ConsoleColor]::Yellow)
        Write-Log "Cleanup error: $($_.Exception.Message)" ([ConsoleColor]::Yellow)

        Write-Log "Falling back to NEXT_DIST_DIR=$fallbackDist for this run." ([ConsoleColor]::Yellow)
        $env:NEXT_DIST_DIR = $fallbackDist
    }

    Invoke-NpmScript -Script "build"

    # Start production server (Next start)
    Write-Log "Starting production server on $Url ..." ([ConsoleColor]::Green)
    $env:NODE_OPTIONS = "--max-old-space-size=4096"
    $serverProcess = $null

    try {
        # Persist server output separately (keeps gate log readable while still capturing full evidence).
        $logsDir = Join-Path $repoRoot 'logs'
        try {
            New-Item -ItemType Directory -Path $logsDir -Force -ErrorAction SilentlyContinue | Out-Null
        } catch {
            # ignore
        }

        $serverLogBase = "gate-server-{0}" -f (Get-Date).ToString('yyyyMMdd_HHmmss')
        $serverOutLogPath = Join-Path $logsDir ("$serverLogBase.out.log")
        $serverErrLogPath = Join-Path $logsDir ("$serverLogBase.err.log")

        $serverProcess = Start-Process -FilePath "node" -ArgumentList @(
            "node_modules/next/dist/bin/next",
            "start",
            "-p",
            "$Port"
        ) -PassThru -NoNewWindow -RedirectStandardOutput $serverOutLogPath -RedirectStandardError $serverErrLogPath

        Write-Log "Server logs: $serverOutLogPath" ([ConsoleColor]::DarkGray)
        Write-Log "            $serverErrLogPath" ([ConsoleColor]::DarkGray)

        Write-Log "Waiting for server readiness..." ([ConsoleColor]::Green)
        # Use wait-on (already in devDependencies) for HTTP-level readiness.
        & npx wait-on -t 120000 "$Url" 2>&1 | Tee-Object -FilePath $LogPath -Append
        $waitOnExitCode = $LASTEXITCODE
        if ($waitOnExitCode -ne 0) {
            throw "Server did not become ready at $Url in time."
        }

        # E2E gates
        # Cypress Electron can be flaky on Windows in headless mode; prefer a stable system browser.
        # Default to Edge (typically installed) unless CYPRESS_BROWSER is explicitly set.
        $cypressBrowser = $env:CYPRESS_BROWSER
        if ([string]::IsNullOrWhiteSpace($cypressBrowser)) {
            $cypressBrowser = "edge"
        }

        Invoke-NpmScript -Script "test:e2e:smoke" -Args @("--browser", $cypressBrowser)
        Invoke-NpmScript -Script "test:e2e:regression" -Args @("--browser", $cypressBrowser)

        Write-Log "\nALL RELEASE GATES PASSED." ([ConsoleColor]::Green)
    } finally {
        if ($null -ne $serverProcess) {
            try {
                if (-not $serverProcess.HasExited) {
                    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
                }
            } catch {
                # Best effort
            }
        }
    }
} catch {
    Write-Log "\nRELEASE GATE FAILED: $($_.Exception.Message)" ([ConsoleColor]::Red)
    if ($_.ScriptStackTrace) {
        Write-Log $_.ScriptStackTrace ([ConsoleColor]::DarkGray)
    }
    exit 1
}
