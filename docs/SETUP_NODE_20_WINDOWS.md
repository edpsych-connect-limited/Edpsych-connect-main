# Windows setup: Node.js 20.x (required)

This repository **requires Node.js 20.x**. CI and `npm run verify:ci` intentionally fail fast on other majors (including newer ones like Node 24).

## Option A (recommended): nvm-windows

1. Install **nvm-windows** (Node Version Manager for Windows).
2. Open a new PowerShell session.
3. Install and use Node 20:
   - `nvm install 20`
   - `nvm use 20`
4. Verify:
   - `node -v` (should be `v20.x.x`)
   - `npm -v`

## Option B: Install Node 20 via the official installer

1. Download a **Node 20.x** Windows installer from Node.js “previous releases”.
2. Install it.
3. Open a new terminal.
4. Verify:
   - `node -v` (should be `v20.x.x`)

## After switching to Node 20

Run:
- `npm run verify:ci`

If you need to work locally *temporarily* on an unsupported Node major, you can bypass the guard:
- `setx ALLOW_UNSUPPORTED_NODE 1`

…but this is not recommended because it defeats build determinism.
