#!/bin/bash
# Fix SSG warnings by wrapping useSession result in null check

for file in \
  src/app/assessments/new/page.tsx \
  src/app/assessments/page.tsx \
  src/app/cases/new/page.tsx \
  src/app/cases/page.tsx \
  src/app/ehcp/new/page.tsx \
  src/app/ehcp/page.tsx \
  src/app/interventions/library/page.tsx \
  src/app/interventions/new/page.tsx \
  src/app/interventions/page.tsx \
  src/app/progress/page.tsx \
  src/app/subscription/page.tsx \
  src/app/training/marketplace/page.tsx
do
  echo "Processing $file..."
  
  # Replace direct destructuring with safe access
  perl -i -pe 's/const \{ data: session, status \} = useSession\(\);/const sessionResult = useSession();\n  const session = sessionResult?.data;\n  const status = sessionResult?.status;/g' "$file"
  
  echo "  Fixed $file"
done

echo "All files processed!"
