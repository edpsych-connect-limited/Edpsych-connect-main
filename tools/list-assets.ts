
import fetch from 'node-fetch';

const API_KEY = process.env.HEYGEN_API_KEY;

if (!API_KEY) {
  throw new Error('HEYGEN_API_KEY environment variable is required');
}

const REQUIRED_API_KEY: string = API_KEY;

async function listAssets() {
  try {
    // 1. List Voices
    console.log('🎧 Fetching Voices...');
    const voicesResp = await fetch('https://api.heygen.com/v2/voices', {
      headers: { 'X-Api-Key': REQUIRED_API_KEY }
    });
    
    if (voicesResp.ok) {
        const data = await voicesResp.json();
        const voices = data.data.voices;
        console.log(`Found ${voices.length} total voices.`);
        
        console.log('First voice object:', JSON.stringify(voices[0], null, 2));

        const languages = new Set(voices.map((v: any) => v.language));
        console.log('Languages:', Array.from(languages).slice(0, 20));

        const ukVoices = voices.filter((v: any) => 
            ['Oliver', 'Harry', 'Sonia', 'Madelyn', 'Brian', 'Amy', 'Arthur', 'Mia'].some(n => v.name.includes(n))
        );
        
        console.log(`\n🇬🇧 Found ${ukVoices.length} UK Voices:`);
        ukVoices.slice(0, 10).forEach((v: any) => {
            console.log(`- ${v.name} (${v.gender}): ${v.voice_id} [${v.language}]`);
        });
    } else {
        console.log('❌ Failed to fetch voices');
    }

    // 2. List Avatars
    console.log('\n👤 Fetching Avatars...');
    const avatarsResp = await fetch('https://api.heygen.com/v2/avatars', {
      headers: { 'X-Api-Key': REQUIRED_API_KEY }
    });

    if (avatarsResp.ok) {
        const data = await avatarsResp.json();
        const avatars = data.data.avatars;
        console.log(`Found ${avatars.length} avatars.`);
        
        console.log('\n--- Sample Avatars ---');
        avatars.slice(0, 15).forEach((a: any) => {
            console.log(`- ${a.avatar_name} (${a.gender}): ${a.avatar_id}`);
        });
    } else {
        console.log('❌ Failed to fetch avatars');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

listAssets();
