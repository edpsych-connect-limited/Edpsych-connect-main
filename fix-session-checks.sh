#!/bin/bash
# Add proper session loading checks to all pages

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

  # Check if file already has the loading check
  if grep -q "if (status === 'loading' || !session)" "$file"; then
    echo "  Already has loading check, skipping"
    continue
  fi

  # Find the line after useSession and add loading check
  awk '
    /const .* = useSession\(\);/ {
      print
      getline
      print
      print "  // Show loading during authentication check"
      print "  if (status === '\''loading'\'' || !session) {"
      print "    return ("
      print "      <div className=\"flex items-center justify-center min-h-screen\">"
      print "        <div className=\"text-lg\">Loading...</div>"
      print "      </div>"
      print "    );"
      print "  }"
      print ""
      next
    }
    {print}
  ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"

  echo "  Added loading check"
done

echo "Done!"
