#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

printf "Running lint automation via scripts/run-lint.sh\n"
bash scripts/run-lint.sh
