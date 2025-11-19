#!/bin/bash

# This script consolidates [id] dynamic routes into parent route.ts files
# Pattern: Convert from Next.js dynamic params to URL-based ID parsing

set -e

consolidate_group() {
  local parent=$1
  local param=$2
  local dynamic_dir="$parent/[$param]"
  
  if [ ! -d "$dynamic_dir" ]; then
    echo "✓ Skipping $parent - no [$param] subdirectory"
    return 0
  fi
  
  if [ ! -f "$dynamic_dir/route.ts" ]; then
    echo "✗ Missing $dynamic_dir/route.ts"
    return 1
  fi
  
  if [ ! -f "$parent/route.ts" ]; then
    echo "✗ Missing $parent/route.ts"
    return 1
  fi
  
  echo "→ Consolidating $dynamic_dir..."
  
  # CRITICAL: The consolidation is complex and requires proper logic merging
  # For now, just mark it for manual review
  wc -l "$dynamic_dir/route.ts" "$parent/route.ts" | tail -1
  
  return 0
}

# List of dynamic routes to consolidate
echo "Analyzing dynamic routes for consolidation..."
consolidate_group "src/app/api/students" "id"
consolidate_group "src/app/api/cases" "id"
consolidate_group "src/app/api/cpd" "id"
consolidate_group "src/app/api/help" "slug"
consolidate_group "src/app/api/blog" "slug"
consolidate_group "src/app/api/class" "id"
consolidate_group "src/app/api/interventions" "id"
consolidate_group "src/app/api/parent/portal" "childId"
consolidate_group "src/app/api/battle-royale/match" "id"

echo "Manual consolidation needed for each group"
