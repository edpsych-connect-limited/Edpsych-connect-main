#!/bin/bash
# Remove duplicate loading/auth checks that appear AFTER the consolidated check

for file in \
  src/app/assessments/new/page.tsx \
  src/app/assessments/page.tsx \
  src/app/cases/page.tsx \
  src/app/ehcp/new/page.tsx \
  src/app/ehcp/page.tsx \
  src/app/interventions/library/page.tsx \
  src/app/interventions/new/page.tsx \
  src/app/interventions/page.tsx \
  src/app/pricing/page.tsx \
  src/app/progress/page.tsx \
  src/app/subscription/page.tsx \
  src/app/training/marketplace/page.tsx
do
  echo "Processing $file..."

  # Use awk to remove duplicate loading/auth checks after our new consolidated check
  awk '
    BEGIN { in_our_check = 0; skip_old_checks = 0; brace_count = 0 }

    # Detect our new loading check
    /if \(status === .loading. \|\| !session\)/ {
      in_our_check = 1
      brace_count = 0
      print
      next
    }

    # Track braces inside our check
    in_our_check && /{/ { brace_count++; print; next }
    in_our_check && /}/ {
      brace_count--
      print
      if (brace_count == 0) {
        in_our_check = 0
        skip_old_checks = 1
      }
      next
    }

    # Skip old duplicate loading checks after our new one
    skip_old_checks && /\/\/ Authentication check/ { next }
    skip_old_checks && /if \(status === .loading.\)/ {
      # Start skipping lines until we close this if block
      depth = 0
      next
    }
    skip_old_checks && /if \(status === .unauthenticated.\)/ {
      depth = 0
      next
    }

    # Print everything else
    { print }
  ' "$file" > "${file}.tmp"

  # Use a simpler approach - just remove lines between the new check and the return statement
  # that contain old auth checks
  python3 -c "
import re

with open('${file}', 'r') as f:
    content = f.read()

# Remove duplicate loading check blocks that appear after our consolidated check
# Pattern: look for our check, then remove any subsequent duplicate checks before the main return

# Find our consolidated check
our_check_pattern = r'if \(status === ['\''']loading['\'''] \|\| !session\) \{[^}]+\}'

# Remove old duplicate auth checks that come after
duplicate_pattern1 = r'\n\s*// Authentication check\s*\n\s*if \(status === ['\''']loading['\'']\) \{[^}]+\}[^}]*\}'
duplicate_pattern2 = r'\n\s*if \(status === ['\''']unauthenticated['\'']\) \{[^}]+\}'

content = re.sub(duplicate_pattern1, '', content)
content = re.sub(duplicate_pattern2, '', content)

with open('${file}.tmp', 'w') as f:
    f.write(content)
"

  mv "${file}.tmp" "$file"
  echo "  Cleaned up duplicates"
done

echo "Done!"
