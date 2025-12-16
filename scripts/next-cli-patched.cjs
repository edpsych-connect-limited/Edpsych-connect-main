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
process.on('exit', restoreLegacyMiddleware);
process.on('SIGINT', () => {
	restoreLegacyMiddleware();
	process.exit(130);
});
process.on('SIGTERM', () => {
	restoreLegacyMiddleware();
	process.exit(143);
});

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

	const typesDir = path.join(abs, 'types');
	try {
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
