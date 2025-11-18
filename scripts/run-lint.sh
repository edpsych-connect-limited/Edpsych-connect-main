#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
TARGET=${LINT_TARGET:-.}

echo "Running lint (CI-ready) from ${ROOT_DIR}"
cd "$ROOT_DIR"

lint_exit=0
if ! CI=1 npm run lint -- --format json -o lint-report.json --quiet "$TARGET"; then
	lint_exit=$?
fi

echo "Lint report generated at lint-report.json"
node scripts/parse-lint-report.js
node scripts/log-lint-run.js

exit $lint_exit

