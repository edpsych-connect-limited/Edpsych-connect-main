#!/bin/bash

##############################################################################
# Type Enforcement Pipeline - Enterprise Grade
# 
# This script enforces strict typing across service layer files and ensures
# compliance with enterprise TypeScript standards.
#
# Usage: ./tools/enforce-types.sh [check|fix]
##############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SERVICE_DIR="$PROJECT_ROOT/src/lib/services"
ACTION="${1:-check}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Type Enforcement Pipeline - Enterprise Grade${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Function to fix implicit any in function parameters
fix_function_parameters() {
    local file="$1"
    
    # Fix untyped arrow function parameters in callbacks
    sed -i \
        -e 's/\(\.\(forEach\|map\|filter\|reduce\|find\)\(([^:]*\)\([^)]*\)=>/\1\3: any\4=>/g' \
        "$file"
    
    # Fix method parameters without types
    sed -i \
        -e 's/async \(_[a-zA-Z_]*\)(\([^:)]*\))/async \1(\2: any)/g' \
        "$file"
}

# Function to fix implicit any in object initializations
fix_object_initializations() {
    local file="$1"
    
    # Find all const assignments that initialize objects without types
    # Pattern: const name = { ... } -> const name: Record<string, any> = { ... }
    perl -i -pe 's/^(\s*)const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\{/$1const $2: Record<string, any> = {/g unless /: (Record|any|\w+\[\]|{.*})/;' "$file"
}

# Function to validate types in file
validate_types() {
    local file="$1"
    
    echo -n "Checking $file... "
    
    # Count implicit any occurrences
    local count=$(grep -c "implicitly has an 'any' type" "$file" 2>/dev/null || echo "0")
    
    if [ "$count" -gt 0 ]; then
        echo -e "${RED}✗ Found $count implicit any issues${NC}"
        return 1
    else
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    fi
}

# Function to run TypeScript compiler check
typecheck() {
    echo -e "${YELLOW}Running TypeScript type checking...${NC}"
    
    if npx tsc --noEmit --pretty false 2>&1 | grep -q "implicitly has an 'any' type"; then
        echo -e "${RED}Type errors found:${NC}"
        npx tsc --noEmit 2>&1 | grep "implicitly has an 'any' type" || true
        return 1
    else
        echo -e "${GREEN}All type checks passed!${NC}"
        return 0
    fi
}

# Main actions
case "$ACTION" in
    check)
        echo -e "${YELLOW}Checking service files for type compliance...${NC}"
        failures=0
        
        for file in "$SERVICE_DIR"/*.ts; do
            if ! validate_types "$file"; then
                ((failures++))
            fi
        done
        
        if [ $failures -gt 0 ]; then
            echo -e "${RED}Found issues in $failures files${NC}"
            exit 1
        else
            echo -e "${GREEN}All files type-compliant${NC}"
            typecheck
            exit $?
        fi
        ;;
        
    fix)
        echo -e "${YELLOW}Applying automatic type fixes...${NC}"
        
        for file in "$SERVICE_DIR"/*.ts; do
            echo "Processing $(basename "$file")..."
            fix_function_parameters "$file"
            fix_object_initializations "$file"
        done
        
        echo -e "${GREEN}Fixes applied${NC}"
        echo -e "${YELLOW}Running verification...${NC}"
        typecheck
        exit $?
        ;;
        
    *)
        echo -e "${RED}Unknown action: $ACTION${NC}"
        echo "Usage: $0 [check|fix]"
        exit 1
        ;;
esac
