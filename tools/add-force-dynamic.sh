#!/bin/bash

# Add export const dynamic = 'force-dynamic' to all API route files
# This prevents Vercel from attempting symlink optimization

count=0
for file in $(find src/app/api -name "route.ts" -type f); do
  # Check if already has force-dynamic
  if grep -q "dynamic.*force-dynamic" "$file"; then
    continue
  fi
  
  # Add after imports (before any other code)
  sed -i "/^import.*from/!b; \$a\\n\\nexport const dynamic = 'force-dynamic';" "$file"
  
  count=$((count + 1))
done

echo "Added force-dynamic to $count API route files"
