#!/usr/bin/env node

/**
 * Hard guard: this repo targets Node.js 20.x.
 *
 * Why: CI and production builds must be deterministic. Some tools will “work” on
 * newer Node versions, then fail later (or worse: behave differently).
 *
 * Opt-out (local only): set ALLOW_UNSUPPORTED_NODE=1
 */

function parseMajor(version) {
  const m = /^v(\d+)\./.exec(String(version || ''));
  return m ? Number(m[1]) : NaN;
}

const expectedMajor = 20;
const major = parseMajor(process.version);
const allow = process.env.ALLOW_UNSUPPORTED_NODE === '1' || process.env.ALLOW_UNSUPPORTED_NODE === 'true';

if (major !== expectedMajor && !allow) {
  // eslint-disable-next-line no-console
  console.error(
    [
      `NODE_VERSION_MISMATCH: Expected Node ${expectedMajor}.x, got ${process.version}.`,
      '',
      'Fix:',
      '  - If you use nvm:      nvm install 20 && nvm use 20',
      '  - If you use fnm:      fnm install 20 && fnm use 20',
      '  - If you use Volta:    volta install node@20',
      '  - On Windows: install Node 20 LTS (or use nvm-windows).',
      '',
      'This repo also includes .nvmrc and .node-version set to 20.',
      'To bypass locally (not recommended): set ALLOW_UNSUPPORTED_NODE=1',
    ].join('\n')
  );
  process.exit(1);
}
