import { ApiClient } from './tests/integration/api-client';

async function debugHelp() {
  const api = new ApiClient('http://localhost:3000');
  console.log('Fetching categories...');
  const res = await api.get('/api/help?type=categories');
  console.log('Status:', res.status);
  console.log('Data:', JSON.stringify(res.data, null, 2));
}

debugHelp();
