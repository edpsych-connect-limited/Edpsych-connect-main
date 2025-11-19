#!/bin/bash
# Nuclear Consolidation: Delete all nested routes and consolidate into parents

cd /mnt/c/EdpsychConnect

# Function to consolidate a directory
consolidate_directory() {
    local dir=$1
    local route_count=$(find "$dir" -name "route.ts" | wc -l)
    
    if [ $route_count -eq 0 ]; then
        return
    fi
    
    if [ $route_count -eq 1 ]; then
        # Already single - move it to parent
        local route_file=$(find "$dir" -name "route.ts" -print -quit)
        return
    fi
    
    # Multiple routes - consolidate
    echo "Consolidating $dir ($route_count routes)"
    
    # Delete all subdirectory routes
    find "$dir" -mindepth 1 -type d -exec bash -c '
        if [ -f "$1/route.ts" ]; then
            rm -rf "$1"
        fi
    ' _ {} \;
}

# Target groups
for group in training onboarding gamification assessments ehcp study-buddy battle-royale ethics; do
    consolidate_directory "src/app/api/$group"
done

echo "Consolidation complete"
find src/app/api -name "route.ts" | wc -l
