import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('lint-report.json', 'utf8'));
const severity = {};
const rules = {};
for (const file of report) {
  for (const msg of file.messages) {
    const s = msg.severity;
    severity[s] = (severity[s] || 0) + 1;
    const rule = msg.ruleId || '<unknown>';
    rules[rule] = (rules[rule] || 0) + 1;
  }
}
const top = Object.entries(rules)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);
console.log('severity_counts', JSON.stringify(severity));
console.log('top_rules', top.map(([rule, count]) => `${rule} (${count})`).join(', '));
