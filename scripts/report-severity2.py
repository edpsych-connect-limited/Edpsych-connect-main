import json
from pathlib import Path
report = json.loads(Path("lint-report.json").read_text())
severity2 = {}
for file in report:
    for msg in file.get("messages", []):
        if msg.get("severity") == 2:
            rule = msg.get("ruleId") or "<unknown>"
            severity2[rule] = severity2.get(rule, 0) + 1
top = sorted(severity2.items(), key=lambda pair: pair[1], reverse=True)[:10]
print("severity2_top", ", ".join(f"{rule} ({count})" for rule, count in top))
