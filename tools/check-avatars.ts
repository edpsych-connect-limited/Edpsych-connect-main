
import fetch from 'node-fetch';

const API_KEY = 'sk_V2_hgu_ky346mdR1EZ_sepM85TUnIexIOSuzpiVI5gXaqMhWDo1';

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
        const customAvatars = data.data.avatars.filter(a => !a.avatar_id.includes('public'));
        
        console.log('\n--- Potential Custom Avatars ---');
        customAvatars.forEach(a => {
            console.log(`Name: ${a.avatar_name}, ID: ${a.avatar_id}, Gender: ${a.gender}`);
        });

        console.log('\n--- First 10 Avatars (All) ---');
        data.data.avatars.slice(0, 10).forEach(a => {
             console.log(`Name: ${a.avatar_name}, ID: ${a.avatar_id}`);
        });
    } else {
        console.log('No avatars found in response structure:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('Error fetching avatars:', error);
  }
}

listAvatars();
