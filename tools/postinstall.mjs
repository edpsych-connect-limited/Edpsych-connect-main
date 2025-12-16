// Cross-platform postinstall script.
//
// The previous `postinstall` used a POSIX `test` command:
//   test $SKIP_POSTINSTALL || npx prisma generate
// That breaks on Windows shells.
//
// Behavior match: if SKIP_POSTINSTALL is a non-empty string, skip Prisma generate.

import { spawnSync } from "node:child_process";

const skip = (process.env.SKIP_POSTINSTALL ?? "") !== "";

if (skip) {
  // Keep output minimal/noisy-free for CI.
  process.exit(0);
}

// On Windows, `.cmd` shims (like `npx.cmd`) are not executable unless run via a shell.
// Using `shell: true` keeps this cross-platform and avoids brittle path gymnastics.
const result = spawnSync("npx prisma generate", {
  stdio: "inherit",
  env: process.env,
  shell: true,
});

if (result.error) {
  // eslint-disable-next-line no-console
  console.error("postinstall: failed to run Prisma generate:", result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
