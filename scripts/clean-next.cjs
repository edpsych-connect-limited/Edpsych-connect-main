/*
 * Robust Next build output cleanup.
 *
 * Why this exists:
 * - On Windows (and especially on external drives), Next build artifacts can be locked by
 *   virus scanners, file watchers, or stray Node processes.
 * - Shell globs and rimraf CLI globbing can behave differently across environments.
 *
 * Behaviour:
 * - Best-effort deletion of common Next build folders in the project root.
 * - Retries transient failures.
 * - If deletion fails due to locks, attempts to rename the folder and continues.
 * - Exits 0 even if some folders could not be removed (prints warnings).
 */

const fs = require('node:fs');
const path = require('node:path');

const { rimraf } = require('rimraf');

const PROJECT_ROOT = process.cwd();

const STATIC_DIRS = [
  '.next',
  '.next_temp',
  '.next_build',
  '.next_build_local',
  '.next_build_gate',
];

const PREFIX_DIRS = [
  '.next_build_local_',
  '.next_build_gate',
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function listRootDirs() {
  try {
    return fs.readdirSync(PROJECT_ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return [];
  }
}

function collectTargets() {
  const targets = new Set(STATIC_DIRS);
  const rootDirs = listRootDirs();

  for (const name of rootDirs) {
    if (PREFIX_DIRS.some((p) => name.startsWith(p))) {
      targets.add(name);
    }
  }

  return Array.from(targets)
    .map((rel) => ({ rel, abs: path.join(PROJECT_ROOT, rel) }))
    .filter(({ abs }) => {
      try {
        return fs.existsSync(abs);
      } catch {
        return false;
      }
    });
}

async function tryRimraf(absPath) {
  // rimraf has its own retry logic but we wrap it so we can do a couple of coarse retries too.
  const opts = {
    preserveRoot: false,
    maxRetries: 10,
    retryDelay: 100,
  };

  await rimraf(absPath, opts);
}

async function removeWithRetries(absPath) {
  const attempts = 3;
  let lastErr;

  for (let i = 0; i < attempts; i += 1) {
    try {
      await tryRimraf(absPath);
      return { ok: true };
    } catch (err) {
      lastErr = err;
      // Back off slightly; Windows locks often clear after a short pause.
      await sleep(150 * (i + 1));
    }
  }

  return { ok: false, err: lastErr };
}

async function renameFallback(absPath) {
  const dir = path.dirname(absPath);
  const base = path.basename(absPath);
  const renamed = path.join(dir, `${base}.stale_${Date.now()}`);

  try {
    fs.renameSync(absPath, renamed);
    return { ok: true, renamed };
  } catch (err) {
    return { ok: false, err };
  }
}

async function main() {
  const targets = collectTargets();

  if (targets.length === 0) {
    console.log('[clean:next] Nothing to clean');
    return;
  }

  const failures = [];

  for (const { rel, abs } of targets) {
    console.log(`[clean:next] Removing ${rel} ...`);

    const res = await removeWithRetries(abs);
    if (res.ok) {
      continue;
    }

    // Try rename+delete as a fallback (often works when deep deletion hits transient locks).
    const renamed = await renameFallback(abs);
    if (renamed.ok) {
      console.warn(`[clean:next] Could not fully remove ${rel}. Renamed to ${path.basename(renamed.renamed)} and will retry delete...`);
      const afterRename = await removeWithRetries(renamed.renamed);
      if (!afterRename.ok) {
        failures.push({ target: rel, err: afterRename.err });
      }
      continue;
    }

    failures.push({ target: rel, err: res.err });
  }

  if (failures.length > 0) {
    console.warn(`[clean:next] Completed with ${failures.length} warning(s):`);
    for (const f of failures) {
      const msg = f?.err?.message ? String(f.err.message) : String(f.err);
      console.warn(` - ${f.target}: ${msg}`);
    }
    console.warn('[clean:next] Note: If this persists, ensure no dev server/build is running and no process is holding Next build files open.');
  }
}

main().catch((err) => {
  // We intentionally do not fail the whole workflow on Windows transient locks.
  const msg = err?.message ? String(err.message) : String(err);
  console.warn(`[clean:next] Unexpected error (ignored): ${msg}`);
  process.exit(0);
});
