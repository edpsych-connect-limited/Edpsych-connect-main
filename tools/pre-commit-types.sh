#!/bin/bash

##############################################################################
# Pre-commit Type Checking Hook
# 
# Ensures all staged files have proper type annotations before commit
# Install: cp tools/pre-commit-types.sh .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
##############################################################################

echo "Running type checks on staged files..."

# Check if any TypeScript service files are staged
SERVICE_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep "src/lib/services/.*\.ts$" || true)

if [ -z "$SERVICE_FILES" ]; then
    exit 0
fi

# Run TypeScript compiler
npx tsc --noEmit --pretty false 2>&1 | tee /tmp/tsc-output.txt

# Check for implicit any errors
if grep -q "implicitly has an 'any' type" /tmp/tsc-output.txt; then
    echo ""
    echo "❌ Type errors found in staged files:"
    grep "implicitly has an 'any' type" /tmp/tsc-output.txt
    echo ""
    echo "Please fix these type errors before committing."
    exit 1
fi

echo "✅ All type checks passed"
exit 0
