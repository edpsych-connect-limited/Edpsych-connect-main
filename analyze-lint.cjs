
const fs = require('fs');

try {
    const report = JSON.parse(fs.readFileSync('lint-report-final.json', 'utf8'));
    const ruleCounts = {};
    const fileCounts = {};
    let totalErrors = 0;
    let totalWarnings = 0;

    report.forEach(file => {
        if (file.messages.length > 0) {
            fileCounts[file.filePath] = file.messages.length;
            file.messages.forEach(msg => {
                if (msg.severity === 2) totalErrors++;
                else totalWarnings++;

                ruleCounts[msg.ruleId] = (ruleCounts[msg.ruleId] || 0) + 1;
            });
        }
    });

    console.log(`Total Errors: ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);
    console.log('\nTop Rules:');
    Object.entries(ruleCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([rule, count]) => console.log(`${rule}: ${count}`));

    console.log('\nTop Files:');
    Object.entries(fileCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([file, count]) => console.log(`${file}: ${count}`));

} catch (e) {
    console.error("Error parsing report:", e);
}
