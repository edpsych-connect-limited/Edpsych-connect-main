import { ApiClient } from '../api-client';

export async function runHelpCenterTests(api: ApiClient) {
  console.log('  [HelpCenter] Starting tests...');

  // 1. Get Categories
  console.log('  [HelpCenter] Fetching categories...');
  const catRes = await api.get('/api/help?type=categories');
  if (catRes.status !== 200) {
    throw new Error(`Failed to fetch categories: ${catRes.status}`);
  }
  
  const categories = catRes.data.categories;
  if (!Array.isArray(categories) || categories.length === 0) {
    console.log('Response data:', catRes.data);
    throw new Error('Categories response is empty or invalid');
  }
  console.log(`  [HelpCenter] Found ${categories.length} categories.`);

  // 2. Search Articles
  console.log('  [HelpCenter] Searching articles...');
  const searchRes = await api.get('/api/help?type=search&q=account');
  if (searchRes.status !== 200) {
    throw new Error(`Search failed: ${searchRes.status}`);
  }
  console.log('  [HelpCenter] Search successful.');
}
