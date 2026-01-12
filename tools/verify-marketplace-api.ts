
import fetch from 'node-fetch';

async function verify() {
  try {
    console.log('Verifying Marketplace API...');
    const response = await fetch('http://localhost:3000/api/marketplace/professionals/search');
    
    if (response.status === 200) {
      console.log('✅ API is up and running (200 OK)');
      const data = await response.json();
      console.log('Data:', JSON.stringify(data, null, 2).slice(0, 200) + '...');
    } else {
      console.log(`❌ API returned status ${response.status}`);
      console.log(await response.text());
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
  }
}

verify();
