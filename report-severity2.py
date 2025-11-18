#!/usr/bin/env python3
import json
import sys

if len(sys.argv) < 2:
    print("Usage: python3 report-severity2.py lint-report.json")
    sys.exit(1)

report_file = sys.argv[1]

with open(report_file, "r", encoding="utf-8") as f:
    data = json.load(f)

severity2 = []
for result in data:
    for msg in result.get("messages", []):
        if msg.get("severity") == 2:
            severity2.append({
                "file": result.get("filePath"),
                "rule": msg.get("ruleId"),
                "message": msg.get("message"),
                "line": msg.get("line"),
                "column": msg.get("column")
            })

# Console output
print(f"Found {len(severity2)} severity‑2 issues:")
for issue in severity2[:50]:  # show first 50 for readability
    print(f"{issue['file']}:{issue['line']}:{issue['column']} "
          f"{issue['rule']} – {issue['message']}")

# Write summary file
summary_file = "severity-summary.txt"
with open(summary_file, "w", encoding="utf-8") as out:
    out.write(f"Found {len(severity2)} severity‑2 issues:\n\n")
    for issue in severity2:
        out.write(f"{issue['file']}:{issue['line']}:{issue['column']} "
                  f"{issue['rule']} – {issue['message']}\n")

print(f"\nSummary written to {summary_file}")

