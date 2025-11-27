#!/bin/bash

#
# Build Validation Pipeline
# Ensures code quality before production deployment
#
# This script is run as part of the build process
# Exit with non-zero status to fail the build
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BUILD_DIR="${1:-.}"
STRICT_MODE="${2:-true}"

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  BUILD-TIME CODE VALIDATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}Validating source code...${NC}\n"

# Run TypeScript compiler with increased memory
echo -e "${BLUE}→ Running TypeScript type checking...${NC}"
export NODE_OPTIONS="--max-old-space-size=4096"
if npx tsc --noEmit --skipLibCheck; then
  echo -e "${GREEN}  ✓ TypeScript compilation passed${NC}\n"
else
  echo -e "${RED}  ✗ TypeScript compilation failed${NC}\n"
  if [ "$STRICT_MODE" = "true" ]; then
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}✗ BUILD VALIDATION FAILED${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}\n"
    exit 1
  fi
fi

# Run ESLint
echo -e "${BLUE}→ Running ESLint...${NC}"
if npx next lint --dir "$BUILD_DIR"; then
  echo -e "${GREEN}  ✓ ESLint passed${NC}\n"
else
  echo -e "${YELLOW}  ⚠ ESLint warnings detected${NC}\n"
  if [ "$STRICT_MODE" = "true" ]; then
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}✗ BUILD VALIDATION FAILED${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════${NC}\n"
    exit 1
  fi
fi

# Check for console.log statements
echo -e "${BLUE}→ Checking for debug statements...${NC}"
CONSOLE_LOGS=$(find "$BUILD_DIR/src" -name "*.ts" -o -name "*.tsx" | xargs grep -l "console\." || true)
if [ -z "$CONSOLE_LOGS" ]; then
  echo -e "${GREEN}  ✓ No console statements found${NC}\n"
else
  echo -e "${YELLOW}  ⚠ Found console statements:${NC}"
  echo "$CONSOLE_LOGS" | while read line; do
    echo -e "${YELLOW}    - $line${NC}"
  done
  echo ""
fi

# Check for TODO comments in services
echo -e "${BLUE}→ Checking for incomplete TODOs...${NC}"
TODOS=$(find "$BUILD_DIR/src/lib/services" -name "*.ts" -o -name "*.tsx" | xargs grep -l "TODO.*implement" || true)
if [ -z "$TODOS" ]; then
  echo -e "${GREEN}  ✓ No incomplete TODOs found${NC}\n"
else
  echo -e "${YELLOW}  ⚠ Found TODOs in services:${NC}"
  echo "$TODOS" | while read line; do
    echo -e "${YELLOW}    - $line${NC}"
  done
  echo ""
fi

echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ BUILD VALIDATION PASSED${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"

exit 0
