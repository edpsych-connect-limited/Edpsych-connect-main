#!/bin/bash

#
# Git Pre-commit Hook: Code Validation
# Validates TypeScript code before allowing commits
#
# Installation:
#   cp tools/pre-commit-validate.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  PRE-COMMIT CODE VALIDATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

# Get list of staged TypeScript files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$' || true)

if [ -z "$STAGED_FILES" ]; then
  echo -e "${GREEN}✓ No TypeScript files to validate${NC}\n"
  exit 0
fi

echo -e "${YELLOW}Validating ${#STAGED_FILES[@]} file(s)...${NC}\n"

# Run validation
VALIDATION_FAILED=0

for FILE in $STAGED_FILES; do
  if [ -f "$FILE" ]; then
    echo -e "${BLUE}→ Checking: $FILE${NC}"
    
    # Run ESLint
    if npx eslint "$FILE" --quiet 2>/dev/null; then
      echo -e "${GREEN}  ✓ ESLint passed${NC}"
    else
      echo -e "${RED}  ✗ ESLint failed${NC}"
      VALIDATION_FAILED=1
    fi
    
    # Run TypeScript compiler
    if npx tsc --noEmit "$FILE" 2>/dev/null; then
      echo -e "${GREEN}  ✓ TypeScript compilation passed${NC}"
    else
      echo -e "${RED}  ✗ TypeScript compilation failed${NC}"
      VALIDATION_FAILED=1
    fi
  fi
done

echo ""

if [ $VALIDATION_FAILED -eq 1 ]; then
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}✗ PRE-COMMIT VALIDATION FAILED${NC}"
  echo -e "${RED}════════════════════════════════════════════════════════════${NC}\n"
  echo "Please fix the errors above and try again."
  echo "To bypass validation (not recommended), use: git commit --no-verify"
  exit 1
fi

echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ ALL VALIDATIONS PASSED${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════${NC}\n"

exit 0
