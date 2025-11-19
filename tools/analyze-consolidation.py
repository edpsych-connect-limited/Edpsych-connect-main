#!/usr/bin/env python3
"""
Mass Route Consolidation Script

Groups routes by directory and consolidates each into a single handler.
This reduces Vercel function count to prevent symlink collision optimizer.
"""

import os
import sys
from pathlib import Path

API_DIR = Path("/mnt/c/EdpsychConnect/src/app/api")

# Route groups to consolidate (largest first)
CONSOLIDATE_GROUPS = [
    "training",
    "onboarding", 
    "gamification",
    "assessments",
    "ehcp",
    "study-buddy",
    "battle-royale",
    "ethics",
    "class",
    "cpd",
    "blog",
    "ai",
    "automation",
    "voice",
    "tokenisation",
    "parent",
    "multi-agency",
    "lessons",
    "interventions",
    "help",
    "cases",
]

def count_routes_in_group(group_dir: Path) -> int:
    """Count route.ts files in a group directory tree."""
    count = 0
    for root, dirs, files in os.walk(group_dir):
        if "route.ts" in files:
            count += 1
    return count

def main():
    print("=" * 70)
    print("CONSOLIDATION ANALYSIS")
    print("=" * 70)
    
    total_before = 0
    total_after = 0
    
    for group in CONSOLIDATE_GROUPS:
        group_path = API_DIR / group
        if group_path.exists():
            count = count_routes_in_group(group_path)
            if count > 1:  # Only consolidate if more than 1 route
                total_before += count
                total_after += 1
                print(f"  {group:25} → {count:2} routes → 1 consolidated handler")
            elif count == 1:
                total_before += 1
                total_after += 1
                print(f"  {group:25} → {count:2} route  (already single)")
    
    print("-" * 70)
    print(f"Total: {total_before} routes → {total_after} handlers")
    print(f"Reduction: {total_before - total_after} routes eliminated")
    print("=" * 70)

if __name__ == "__main__":
    main()
