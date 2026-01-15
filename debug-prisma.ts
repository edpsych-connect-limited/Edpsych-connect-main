
require('dotenv').config();
console.log('Starting debug...');
import { platformPrisma } from './src/lib/prisma';
console.log('Imported platformPrisma');
(async () => {
    try {
        console.log('Querying...');
        await platformPrisma.$queryRaw`SELECT 1`;
        console.log('Query success');
    } catch (e) {
        console.error('Query failed', e);
    }
})();
