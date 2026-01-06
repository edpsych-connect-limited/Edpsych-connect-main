const fs = require('fs');
const http = require('http');

console.log('Starting Quick Page Audit...');
const BASE_URL = 'http://localhost:3000';

const pages = [
  '/', 
  '/about',
  '/login',
  '/dashboard',
  '/contact'
];

async function checkUrl(url) {
    return new Promise((resolve) => {
        const fullUrl = BASE_URL + url;
        const req = http.get(fullUrl, (res) => {
            res.resume();
            resolve({ url, status: res.statusCode, ok: res.statusCode < 500 });
        });
        req.on('error', (e) => resolve({ url, status: 'ERROR', error: e.message, ok: false }));
        req.setTimeout(120000, () => { req.destroy(); resolve({ url, status: 'TIMEOUT', ok: false }); });
    });
}

async function runAudit() {
    const results = [];
    for (const page of pages) {
        console.log(`Checking ${page}...`);
        const r = await checkUrl(page);
        const line = `${r.ok ? '✅' : '❌'} ${r.url}: ${r.status}\n`;
        results.push(line);
        fs.appendFileSync('quick_audit_results.txt', line);
    }
}

runAudit();
