import fs from 'fs';
import https from 'https';
import path from 'path';

import { loadLocalEnv } from './lib/load-local-env';

loadLocalEnv({ rootDir: process.cwd() });

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
if (!HEYGEN_API_KEY) {
  throw new Error(
    'HEYGEN_API_KEY environment variable is required. Put it in .env/.env.local so tools can load it automatically.'
  );
}

interface HeyGenListResponse {
  code?: number;
  data?: {
    videos?: unknown[];
    token?: string;
  };
}

async function fetchPage(token?: string): Promise<{ videos: unknown[]; nextToken?: string }> {
  return new Promise((resolve, reject) => {
    const reqPath = `/v1/video.list?limit=100${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    const req = https.request(
      {
        hostname: 'api.heygen.com',
        path: reqPath,
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          Accept: 'application/json',
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data) as HeyGenListResponse;
            if (json.code !== 100 || !json.data?.videos) {
              reject(new Error(`HeyGen API Error: ${data}`));
              return;
            }
            resolve({ videos: json.data.videos, nextToken: json.data.token });
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

function stableSortVideos(videos: any[]): any[] {
  // Deterministic ordering: created_at desc, then video_id asc.
  // (Keeps the file stable across runs, while still roughly chronological.)
  return [...videos].sort((a, b) => {
    const ca = typeof a?.created_at === 'number' ? a.created_at : 0;
    const cb = typeof b?.created_at === 'number' ? b.created_at : 0;
    if (cb !== ca) return cb - ca;
    const ida = String(a?.video_id || '');
    const idb = String(b?.video_id || '');
    return ida.localeCompare(idb);
  });
}

async function main(): Promise<void> {
  console.log('Refreshing HeyGen inventory (paginated)...');

  const all: any[] = [];
  let token: string | undefined;

  do {
    const page = await fetchPage(token);
    all.push(...(page.videos as any[]));
    token = page.nextToken;
  } while (token);

  const outPath = path.join(process.cwd(), 'heygen_videos_list.json');
  const sorted = stableSortVideos(all);

  fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${sorted.length} videos to ${path.relative(process.cwd(), outPath)}`);
}

main().catch((err) => {
  console.error('Failed to refresh HeyGen inventory:', err);
  process.exit(1);
});
