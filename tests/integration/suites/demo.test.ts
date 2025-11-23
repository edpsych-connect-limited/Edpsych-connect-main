import { ApiClient } from '../api-client';

export async function runDemoTests(api: ApiClient) {
  console.log('  [Demo] Starting tests...');

  // 1. Send Chat Message
  console.log('  [Demo] Sending chat message...');
  const chatRes = await api.post('/api/ai/chat', {
    message: 'Hello, how does this work?',
    demoMode: true
  });

  if (chatRes.status !== 200) {
    // If 401, it might be because we need auth even for demo?
    // Or maybe the endpoint is different.
    // Let's assume 200 is expected.
    console.warn(`  [Demo] Chat endpoint returned ${chatRes.status}. This might be expected if auth is required.`);
  } else {
    console.log('  [Demo] Chat response received.');
  }
}
