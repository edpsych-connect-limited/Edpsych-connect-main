
import fetch from 'node-fetch';

const API_KEY = 'MDZlZGUwYjJlNjQ5NDdiYmJkYjM1ZjM4MmViMzM4OGQtMTc0MDY2NDU1OA==';

async function listAvatars() {
  try {
    console.log('Fetching avatars...');
    const response = await fetch('https://api.heygen.com/v2/avatars', {
      headers: {
        'X-Api-Key': API_KEY,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data.avatars) {
        console.log(`Found ${data.data.avatars.length} avatars.`);
        
        // Filter for potential custom avatars (often don't have 'public' in the name, or we can just list names)
        const customAvatars = data.data.avatars.filter((a) => !a.avatar_id.includes('public'));
        const scottAvatars = data.data.avatars.filter((a) => a.avatar_name.toLowerCase().includes('scott') || a.avatar_id.toLowerCase().includes('scott'));
        
        console.log('\n--- Custom / Non-Public Avatars ---');
        customAvatars.forEach((a) => {
            console.log(`Name: ${a.avatar_name}, ID: ${a.avatar_id}, Gender: ${a.gender}`);
        });

        console.log('\n--- Scott Avatars ---');
        scottAvatars.forEach((a) => {
            console.log(`Name: ${a.avatar_name}, ID: ${a.avatar_id}, Gender: ${a.gender}`);
        });


    } else {
        console.log('No avatars found in response structure:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Error fetching avatars:', error);
  }
}

listAvatars();
