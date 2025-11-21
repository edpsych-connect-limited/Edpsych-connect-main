
const fs = require('fs');
const report = JSON.parse(fs.readFileSync('lint_report.json', 'utf8'));
let errorCount = 0;
let warningCount = 0;
const errors = [];

report.forEach(file => {
    errorCount += file.errorCount;
    warningCount += file.warningCount;
    if (file.errorCount > 0) {
        file.messages.forEach(msg => {
            if (msg.severity === 2) {
                errors.push(`${file.filePath}:${msg.line}:${msg.column} - ${msg.message} (${msg.ruleId})`);
            }
        });
    }
});

console.log(`Errors: ${errorCount}, Warnings: ${warningCount}`);
console.log("First 10 errors:");
console.log(errors.slice(0, 10).join('\n'));
