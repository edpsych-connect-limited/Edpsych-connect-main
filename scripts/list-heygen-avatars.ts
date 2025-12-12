import https from 'https';

const HEYGEN_API_KEY = 'sk_V2_hgu_knMBHTR5eZS_Fh7oPDiRF6jLhvQXFPVXnNlMNG7PkjRj';

const options = {
  hostname: 'api.heygen.com',
  path: '/v2/avatars',
  method: 'GET',
  headers: {
    'X-Api-Key': HEYGEN_API_KEY,
    'Content-Type': 'application/json',
  },
};

console.log('Listing avatars...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      // console.log('Response:', JSON.stringify(json, null, 2));
      if (json.data && json.data.avatars) {
        const targetIds = [
            'd680604a31f34ce096c84bed708774c3',
            'aae2fc783ee247cc9e09bd9517f74e5b',
            '1bc3385dd478439f8a36b9994c6644c6'
        ];
        console.log(`Found ${json.data.avatars.length} avatars.`);
        json.data.avatars.forEach((avatar: any) => {
            if (targetIds.includes(avatar.avatar_id)) {
                console.log(`MATCH FOUND: ID: ${avatar.avatar_id}, Name: ${avatar.avatar_name}, Gender: ${avatar.gender}`);
            }
        });
      } else {
        console.log('No avatars found or different response structure.');
        console.log(JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.error('Error parsing JSON:', e);
    }
  });
});

req.on('error', (e) => {
  console.error('Request error:', e);
});

req.end();
