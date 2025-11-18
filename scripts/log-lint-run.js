import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const reportPath = resolve(process.cwd(), 'lint-report.json');
const docReportPath = resolve(process.cwd(), 'docs/ops/ops_run_report.md');
const rootReportPath = resolve(process.cwd(), 'ops_run_report.md');

function parseReport() {
  const raw = readFileSync(reportPath, 'utf8');
  const report = raw.trim().length ? JSON.parse(raw) : [];
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
    .slice(0, 4)
    .map(([rule, count]) => `${rule} (${count})`);
  return { severity, topRules: top };
}

function formatRow(severity, topRules) {
  const severity2 = severity[2] ?? 0;
  const severity1 = severity[1] ?? 0;
  const date = new Date().toISOString().split('T')[0];
  const focus = process.env.LINT_FOCUS || 'lint (tools/run-all.sh)';
  const rulesNote = topRules.length ? topRules.join(', ') : 'No warnings.';
  const notePrefix = severity1 > 0 ? 'Run blocked by `--max-warnings=0`; top rules: ' : 'Top rules: ';
  const notes = `${notePrefix}${rulesNote}`;
  return {
    date,
    focus,
    notes,
    row: `| ${date} | ${focus} | ${severity2} | ${severity1} | ${notes} |`,
  };
}

function insertRow(row, targetPath) {
  const docLines = readFileSync(targetPath, 'utf8').split('\n');
  const headerIndex = docLines.findIndex((line) => line.startsWith('| Date |'));
  if (headerIndex === -1) {
    throw new Error('Unable to find run history table in ops_run_report.md');
  }
  const separatorIndex = docLines.findIndex(
    (line, idx) => idx > headerIndex && line.startsWith('|------'),
  );
  const insertIndex = separatorIndex !== -1 ? separatorIndex + 1 : headerIndex + 2;
  const existingRow = docLines[insertIndex];
  if (existingRow) {
    const existingDate = existingRow.split('|')[1]?.trim();
    const newDate = row.split('|')[1]?.trim();
    if (existingDate === newDate) {
      if (existingRow === row) {
        return;
      }
      docLines[insertIndex] = row;
      writeFileSync(targetPath, docLines.join('\n'));
      return;
    }
  }
  docLines.splice(insertIndex, 0, row);
  writeFileSync(targetPath, docLines.join('\n'));
}

function main() {
  const { severity, topRules } = parseReport();
  const rowData = formatRow(severity, topRules);
  insertRow(rowData.row, docReportPath);
  writeRootReport(severity, topRules, rowData);
}

function writeRootReport(severity, topRules, rowData) {
  const severity2 = severity[2] ?? 0;
  const severity1 = severity[1] ?? 0;
  const { date, focus, notes } = rowData;
  const latestRow = `| ${date} | ${focus} | ${severity2} | ${severity1} | ${notes} |`;
  const content = [
    '# Ops Run Report',
    '',
    '| Date | Focus | Severity 2 | Severity 1 | Notes |',
    '|------|-------|------------|------------|-------|',
    latestRow,
    '',
    '| Example | lint | 0 | 0 | none |',
    '',
  ].join('\n');
  writeFileSync(rootReportPath, content);
}

main();

