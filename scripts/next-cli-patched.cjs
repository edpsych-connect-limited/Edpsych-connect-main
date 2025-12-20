// Wrapper to patch fs behavior on Windows/mapped drives before running Next.js CLI.
//
// Why this exists:
// - Next/webpack can call fs.readlink on directories on some Windows setups,
//   which throws EISDIR. The patched fs normalizes to EINVAL and retries
//   transient file access errors.
// - We intentionally DO NOT use `node -r` to preload the patch because Next
//   spawns worker processes and may propagate exec args in ways that cause
//   Node to reject `--r=` in NODE_OPTIONS.

require('./patch-fs-runtime.cjs');

const fs = require('node:fs');
const path = require('node:path');

// IMPORTANT: Next.js build uses worker processes for tasks like page-data collection.
// Requiring the patch here only affects the current process; workers won't inherit it
// unless it is preloaded via NODE_OPTIONS.
//
// We intentionally use the long-form `--require=<path>` to avoid issues with short flags
// being rejected in NODE_OPTIONS on some setups.
if (process.platform === 'win32') {
	try {
		const patchAbs = path.join(__dirname, 'patch-fs-runtime.cjs');
		const existing = process.env.NODE_OPTIONS || '';
		const needle = `--require=${patchAbs}`;
		if (!existing.includes(needle)) {
			process.env.NODE_OPTIONS = `${existing} ${needle}`.trim();
		}
	} catch {
		// Best-effort only.
	}
}

// Next.js may rewrite tsconfig.json during build (e.g., adding distDir `types/**` globs).
// Those mutations can balloon the file and even cause `tsc`/editor OOM on Windows.
// Snapshot and restore unless explicitly disabled.
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
let originalTsconfigText = null;
if (process.env.NEXT_PRESERVE_TSCONFIG !== '1') {
	try {
		originalTsconfigText = fs.readFileSync(tsconfigPath, 'utf8');
	} catch {
		originalTsconfigText = null;
	}
}

function restoreTsconfig() {
	if (!originalTsconfigText) return;
	try {
		const current = fs.readFileSync(tsconfigPath, 'utf8');
		if (current !== originalTsconfigText) {
			fs.writeFileSync(tsconfigPath, originalTsconfigText, 'utf8');
		}
	} catch {
		// Best-effort only.
	}
}

// Next.js 16 migration guard:
// If both `src/middleware.*` and `src/proxy.*` exist, Next aborts the build/dev/start.
// The codebase uses `src/proxy.ts` as the canonical entrypoint.
// To avoid breaking local workflows when legacy `src/middleware.ts` exists,
// temporarily move it out of the way for the duration of the Next command.
// (It is restored on process exit.)
const middlewarePath = path.join(process.cwd(), 'src', 'middleware.ts');
const proxyPath = path.join(process.cwd(), 'src', 'proxy.ts');

let movedMiddleware = null;

function moveLegacyMiddlewareOutOfTheWay() {
	try {
		if (!fs.existsSync(proxyPath) || !fs.existsSync(middlewarePath)) return;

		const dir = path.dirname(middlewarePath);
		const base = path.basename(middlewarePath);
		let candidate = path.join(dir, `${base}.legacy`);
		if (fs.existsSync(candidate)) {
			candidate = path.join(dir, `${base}.legacy_${Date.now()}_${process.pid}`);
		}

		fs.renameSync(middlewarePath, candidate);
		movedMiddleware = { from: middlewarePath, to: candidate };
		// eslint-disable-next-line no-console
		console.warn(`[next-cli-patched] Detected both src/middleware.ts and src/proxy.ts. Using proxy.ts; temporarily moved middleware.ts -> ${path.basename(candidate)}`);
	} catch {
		// Best-effort only; if this fails Next will provide a clear error.
	}
}

function restoreLegacyMiddleware() {
	if (!movedMiddleware) return;
	try {
		if (!fs.existsSync(movedMiddleware.to)) return;
		if (fs.existsSync(movedMiddleware.from)) return;
		fs.renameSync(movedMiddleware.to, movedMiddleware.from);
	} catch {
		// Best-effort only.
	}
}

moveLegacyMiddlewareOutOfTheWay();
process.on('exit', () => {
	restoreTsconfig();
	restoreLegacyMiddleware();
});
process.on('SIGINT', () => {
	restoreTsconfig();
	restoreLegacyMiddleware();
	process.exit(130);
});
process.on('SIGTERM', () => {
	restoreTsconfig();
	restoreLegacyMiddleware();
	process.exit(143);
});

const isBuildCommand = process.argv.includes('build');
const isStartCommand = process.argv.includes('start');

// Track whether the caller explicitly set NEXT_DIST_DIR.
const userProvidedDistDir = Boolean(process.env.NEXT_DIST_DIR);

// For `next start`, prefer the last known distDir produced by this wrapper (if any).
// This is particularly important when local Windows builds use a unique distDir.
if (isStartCommand && (!process.env.NEXT_DIST_DIR || process.env.NEXT_DIST_DIR === '.next_build_local')) {
	try {
		const recorded = fs.readFileSync(path.join(process.cwd(), '.next_dist_dir'), 'utf8').trim();
		if (recorded) process.env.NEXT_DIST_DIR = recorded;
	} catch {
		// Best-effort only.
	}
}

// On some Windows/external-drive setups, reusing a stable distDir can lead to
// persistent EPERM/ACL/lock issues. If the caller didn't explicitly request a
// distDir, default to a unique folder for `next build`.
if (isBuildCommand && process.platform === 'win32' && !userProvidedDistDir && !process.env.NEXT_DIST_DIR_UNIQUE) {
	process.env.NEXT_DIST_DIR_UNIQUE = '1';
}

if (!process.env.NEXT_DIST_DIR) {
	process.env.NEXT_DIST_DIR = '.next_build_local';
}

// Legacy compatibility: `.next_build` has been problematic on some Windows setups.
if (process.env.NEXT_DIST_DIR === '.next_build') {
	process.env.NEXT_DIST_DIR = '.next_build_local';
}

if (process.env.NEXT_DIST_DIR_UNIQUE === '1') {
	const suffix = `${Date.now()}_${process.pid}`;
	process.env.NEXT_DIST_DIR = `.next_build_local_${suffix}`;
}

function distDirIsUsable(distDir) {
	if (!distDir) return false;
	const abs = path.join(process.cwd(), distDir);
	try {
		fs.mkdirSync(abs, { recursive: true });
	} catch {
		return false;
	}

	// Next.js uses a lock file inside distDir to prevent concurrent builds.
	// On Windows, a crashed/interrupted build can leave a stale lock behind.
	// Treat any existing lock as “unusable for build” and fall back to another
	// distDir (ideally unique) so builds remain deterministic.
	if (isBuildCommand) {
		try {
			const lockPath = path.join(abs, 'lock');
			if (fs.existsSync(lockPath)) return false;
		} catch {
			return false;
		}
	}

	const typesDir = path.join(abs, 'types');
	try {
		// For build commands, Next may delete/recreate `types/`.
		// Some Windows/external-drive setups allow writing to an existing directory
		// but fail with EPERM when (re)creating it. Probe the *recreate* path.
		if (isBuildCommand) {
			const probeFile = path.join(typesDir, `.probe_${process.pid}_${Date.now()}`);
			if (fs.existsSync(typesDir)) {
				// Verify we can write, then verify we can remove+recreate.
				try {
					fs.accessSync(typesDir, fs.constants.W_OK);
					fs.writeFileSync(probeFile, 'ok', 'utf8');
					fs.unlinkSync(probeFile);
				} catch {
					return false;
				}
				try {
					fs.rmSync(typesDir, { recursive: true, force: true });
				} catch {
					return false;
				}
			}

			try {
				fs.mkdirSync(typesDir, { recursive: true });
				fs.writeFileSync(probeFile, 'ok', 'utf8');
				fs.unlinkSync(probeFile);
				return true;
			} catch {
				return false;
			}
		}

		if (fs.existsSync(typesDir)) {
			fs.accessSync(typesDir, fs.constants.W_OK);
			return true;
		}
		fs.mkdirSync(typesDir, { recursive: true });
		return true;
	} catch {
		return false;
	}
}

function pickDistDirFallback(current) {
	// Prefer a stable alternate distDir to avoid tsconfig churn from timestamped folders.
	const stableAlternates = ['.next_build_gate_alt', '.next_build_gate', '.next_temp', '.next'];
	for (const candidate of stableAlternates) {
		if (candidate === current) continue;
		if (distDirIsUsable(candidate)) return candidate;
	}

	// Last resort: unique distDir.
	const suffix = `${Date.now()}_${process.pid}`;
	return `.next_build_local_${suffix}`;
}

// Some Windows/external-drive setups can leave a distDir in a state where Node cannot
// create or access `${distDir}/types` (EPERM). Detect and fall back.
if (!distDirIsUsable(process.env.NEXT_DIST_DIR)) {
	const previous = process.env.NEXT_DIST_DIR;
	process.env.NEXT_DIST_DIR = pickDistDirFallback(previous);
	// eslint-disable-next-line no-console
	console.warn(`[next-cli-patched] distDir '${previous}' is not usable (types/ not writable). Falling back to '${process.env.NEXT_DIST_DIR}'.`);
}

// Record the chosen dist dir (useful for troubleshooting).
try {
	fs.writeFileSync(path.join(process.cwd(), '.next_dist_dir'), String(process.env.NEXT_DIST_DIR), 'utf8');
} catch {
	// Best-effort only.
}

require('next/dist/bin/next');
