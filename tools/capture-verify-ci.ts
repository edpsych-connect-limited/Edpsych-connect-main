import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function main(): void {
  const logsDir = path.join(process.cwd(), 'logs');
  ensureDir(logsDir);

  const logPath = path.join(logsDir, 'verify_ci_latest.txt');
  const exitPath = path.join(logsDir, 'verify_ci_latest.exit');
  const metaPath = path.join(logsDir, 'verify_ci_latest.meta.json');

  const isWin = process.platform === 'win32';

  // On Windows, antivirus/indexers can temporarily lock files in /logs.
  // Open synchronously so we can fall back to a unique filename instead of crashing.
  let actualLogPath = logPath;
  let fd: number;
  try {
    fd = fs.openSync(logPath, 'w');
  } catch (err) {
    const code = (err as any)?.code;
    if (code === 'EBUSY' || code === 'EPERM') {
      actualLogPath = path.join(logsDir, `verify_ci_${Date.now()}_${process.pid}.txt`);
      fd = fs.openSync(actualLogPath, 'w');
    } else {
      throw err;
    }
  }

  fs.writeFileSync(
    metaPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        logPath: actualLogPath,
      },
      null,
      2
    ) + '\n',
    'utf8'
  );

  const out = fs.createWriteStream(actualLogPath, { fd });

  // On Windows, spawning *.cmd directly with shell=false can throw EINVAL.
  // Use cmd.exe to ensure consistent behaviour.
  const child = isWin
    ? spawn('cmd.exe', ['/d', '/s', '/c', 'npm', 'run', 'verify:ci'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      })
    : spawn('npm', ['run', 'verify:ci'], {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: false,
      });

  child.stdout.on('data', chunk => {
    process.stdout.write(chunk);
    out.write(chunk);
  });

  child.stderr.on('data', chunk => {
    process.stderr.write(chunk);
    out.write(chunk);
  });

  child.on('error', err => {
    out.end();
    const msg = `Failed to run verify:ci: ${String((err as any)?.message || err)}`;
    fs.writeFileSync(exitPath, '1\n', 'utf8');
    // Keep the log file helpful.
    fs.appendFileSync(logPath, `\n${msg}\n`, 'utf8');
    // eslint-disable-next-line no-console
    console.error(msg);
    process.exit(1);
  });

  child.on('close', code => {
    out.end();
    const exitCode = typeof code === 'number' ? code : 1;
    fs.writeFileSync(exitPath, `${exitCode}\n`, 'utf8');

    // Best-effort: keep verify_ci_latest.txt up-to-date for humans/tools.
    if (actualLogPath !== logPath) {
      try {
        fs.copyFileSync(actualLogPath, logPath);
      } catch {
        // Ignore; the meta file still points to the real log.
      }
    }

    process.exit(exitCode);
  });
}

main();
