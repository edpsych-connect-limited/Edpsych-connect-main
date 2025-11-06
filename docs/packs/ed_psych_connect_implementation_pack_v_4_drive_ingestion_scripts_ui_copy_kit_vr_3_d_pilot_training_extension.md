# EdPsych Connect — Implementation Pack v4
**Contents:** Google Drive ingestion scripts (Node.js), UI copy kit (UK), VR/3D pilot brief, training/help extensions, and ops notes.  
**Principle:** Preserve everything, perfect continuously; UK spelling & terminology.

---

## 1) Google Drive Ingestion — Node.js Scripts (read‑only)
**Folder:** `scripts/drive/`

### 1.1 `auth.config.json` (template)
```json
{
  "client_id": "<GOOGLE_CLIENT_ID>",
  "client_secret": "<GOOGLE_CLIENT_SECRET>",
  "redirect_uri": "http://localhost:5173/oauth2/callback",
  "scopes": [
    "https://www.googleapis.com/auth/drive.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly"
  ]
}
```

### 1.2 `oauth.js`
```js
// Lightweight OAuth flow for installed app usage
import http from 'http';
import open from 'open';
import { google } from 'googleapis';
import fs from 'fs/promises';

export async function getAuth(authConfigPath = 'scripts/drive/auth.config.json') {
  const cfg = JSON.parse(await fs.readFile(authConfigPath, 'utf8'));
  const { client_id, client_secret, redirect_uri, scopes } = cfg;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
  const url = oAuth2Client.generateAuthUrl({ access_type: 'offline', scope: scopes });

  console.log('\nOpen this URL to authorise:', url, '\n');
  await open(url);

  const code = await new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, 'http://localhost:5173');
      const code = u.searchParams.get('code');
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Authorised. You can close this tab.');
      srv.close(() => resolve(code));
    }).listen(5173);
  });

  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  console.log('Tokens acquired.');
  return oAuth2Client;
}
```

### 1.3 `export-list.js`
```js
import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import { getAuth } from './oauth.js';

const ROOT_NAME = process.argv[2] || 'EdPsych Connect';
const OUT = process.argv[3] || 'tmp/drive_files.json';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const auth = await getAuth();
  const drive = google.drive({ version: 'v3', auth });

  async function findFolderByName(name) {
    const q = `mimeType='application/vnd.google-apps.folder' and name='${name.replace(/'/g, "\\'")}' and trashed=false`;
    const res = await drive.files.list({ q, fields: 'files(id, name)' });
    return res.data.files?.[0];
  }

  const root = await findFolderByName(ROOT_NAME);
  if (!root) throw new Error(`Folder not found: ${ROOT_NAME}`);

  const out = [];
  let pageToken = undefined;
  do {
    const res = await drive.files.list({
      q: `'${root.id}' in parents and trashed=false`,
      fields: 'nextPageToken, files(id, name, mimeType, md5Checksum, modifiedTime, size)',
      pageSize: 1000,
      pageToken
    });
    out.push(...res.data.files);
    pageToken = res.data.nextPageToken;
    await sleep(200); // gentle rate
  } while (pageToken);

  await fs.mkdir(path.dirname(OUT), { recursive: true });
  await fs.writeFile(OUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${out.length} records to ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
```

### 1.4 `archive.js`
```js
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { google } from 'googleapis';
import { getAuth } from './oauth.js';

const INPUT = process.argv[2] || 'tmp/drive_files.json';
const OUTDIR = process.argv[3] || 'archive';
const MAX_MB = parseInt(process.env.MAX_MB || '500', 10);

function ymd(date) {
  const d = new Date(date); const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth()+1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}/${m}/${day}`;
}

async function sha256(buf) { return crypto.createHash('sha256').update(buf).digest('hex'); }

async function main() {
  const items = JSON.parse(await fs.readFile(INPUT, 'utf8'));
  const auth = await getAuth();
  const drive = google.drive({ version: 'v3', auth });

  for (const f of items) {
    const sizeMB = (parseInt(f.size || '0', 10) / (1024*1024));
    if (sizeMB > MAX_MB) { console.log('Skip large file:', f.name); continue; }
    const res = await drive.files.get({ fileId: f.id, alt: 'media' }, { responseType: 'arraybuffer' });
    const buf = Buffer.from(res.data);
    const hash = await sha256(buf);
    const dir = path.join(OUTDIR, ymd(f.modifiedTime));
    await fs.mkdir(dir, { recursive: true });
    const safe = f.name.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const fp = path.join(dir, `${hash}-${safe}`);
    await fs.writeFile(fp, buf);
    console.log('Archived:', fp);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
```

### 1.5 `index.js` (index into Mongo)
```js
import fs from 'fs/promises';
import path from 'path';
import { MongoClient } from 'mongodb';

const ARCHIVE = process.argv[2] || 'archive';
const MONGO = process.env.MONGODB_URI;

async function walk(dir, files = []) {
  for (const e of await fs.readdir(dir)) {
    const p = path.join(dir, e);
    const st = await fs.stat(p);
    if (st.isDirectory()) await walk(p, files); else files.push(p);
  }
  return files;
}

function classify(name) {
  const low = name.toLowerCase();
  if (low.endsWith('.mp4') || low.endsWith('.mov')) return 'video';
  if (low.endsWith('.pdf')) return 'pdf';
  if (low.endsWith('.doc') || low.endsWith('.docx') || low.endsWith('.gdoc')) return 'doc';
  if (low.endsWith('.ppt') || low.endsWith('.pptx') || low.endsWith('.gslides')) return 'slides';
  return 'other';
}

async function main() {
  const client = await MongoClient.connect(MONGO);
  const db = client.db();
  const coll = db.collection('archive_index');

  const files = await walk(ARCHIVE);
  for (const fp of files) {
    const base = path.basename(fp);
    const [hash] = base.split('-', 1);
    const type = classify(base);
    await coll.updateOne(
      { hash },
      { $setOnInsert: { hash, file: fp, type, indexedAt: new Date() } },
      { upsert: true }
    );
  }
  console.log(`Indexed ${files.length} files.`);
  await client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
```

**Usage**
```bash
node scripts/drive/export-list.js "EdPsych Connect" tmp/drive_files.json
node scripts/drive/archive.js tmp/drive_files.json archive
MONGODB_URI='mongodb+srv://...' node scripts/drive/index.js archive
```

---

## 2) UI Copy Kit (UK English)
**Folder:** `docs/UX/ui-copy-kit.md`
```markdown
# UI Copy Kit (UK)

## Tone
- Calm, respectful, plain English; pupil‑centred; no AI jargon; supportive not evaluative.

## Buttons/Labels
- Sign in • Sign out • Create class • Assign work • Start mission • Save draft • Finalise report • Contact parent • Request consent • Export anonymised data

## Empty States
- “No pupils yet. Add pupils or import from your MIS.”
- “No missions today. Choose a topic to begin.”

## Errors (with next steps)
- “We couldn’t save just now. Please check your connection and try again.”
- “You don’t have permission to view this page. Ask your administrator to update your role.”

## Success Notices
- “Lesson plan saved. You can download a parent brief now.”
- “Consent recorded. You can view it in the timeline.”

## Safeguarding Language
- “We’ve noticed a change in engagement.”
- “Would you like recommended strategies to try first?”
```

---

## 3) VR/3D Pilot Brief (Optional Module)
**Folder:** `docs/VR/vr-pilot-brief.md`
```markdown
# VR/3D Pilot Brief — Spatial Learning Scenes

## Goal
Enhance curiosity and retention with spatial, interactive scenes aligned to UK curriculum (KS2–KS4):
- **STEM:** Ratios with bridges; forces with playground physics.
- **History:** Time capsules; museum artefacts.
- **EP Tools:** Executive function games (working memory, inhibition, cognitive flexibility).

## Tech
- WebGL-first (Three.js + React Three Fibre) for broad access; optional Unity build for schools with headsets.
- Accessibility: alternative 2D mode; motion safety; captions and audio description.

## Safety & Privacy
- No open voice chat; local device input only.
- Age-appropriate content review; teacher controls for pace and content.

## Milestones
1) Prototype 1 (web): KS3 Ratio Bridge Builder (4 weeks)  
2) Prototype 2: Executive Functions Mini‑games (4 weeks)  
3) Classroom pilot: teacher controls + observation tools (2 weeks)
```

---

## 4) Training Extension (→ 30 videos)
**Folder:** `docs/TRAINING/VIDEO_PLAYLIST.md` (append)
- V19 – Narrative Missions: Teacher Controls  
- V20 – EP Recommendation Library  
- V21 – Safeguarding in Practice  
- V22 – Reflective Growth for SLT  
- V23 – Research Hub Deep Dive  
- V24 – Accessibility Power‑User Tips  
- V25 – Class Dashboards: Action Planning  
- V26 – Parent Messaging with Translation  
- V27 – Consent Lifecycle & Records  
- V28 – Neo4j Insights: What Works for Whom  
- V29 – Assessment to Intervention Workflow  
- V30 – Data Exports & Reproducibility Capsules

Scripts for V19–V22 included below; the rest follow the same pattern.

### V19 – Narrative Missions: Teacher Controls (script)
- Configure topic, difficulty bounds, accessibility defaults.
- Preview scenes; lock or shuffle.
- Enable reflective prompts at checkpoints; review learning evidence.

### V20 – EP Recommendation Library (script)
- Browse by need; add to case; customise fidelity; schedule reviews; export to report.

### V21 – Safeguarding in Practice (script)
- Read a signal; see rationale; apply low-risk strategies; log action; escalate when needed.

### V22 – Reflective Growth for SLT (script)
- School heatmaps; trend analysis; CPD nudges; success stories compilation; Ofsted‑ready evidence packs.

---

## 5) Ops Notes — Applying Safely
- Run `db/migrations` then `db/seeds` on *sandbox* first.
- Add `.env.example` with non‑secret placeholders.
- Rotate secrets; enable CI; verify SBOM & dependency-review gates.
- Connect Drive ingestion in **read‑only**; all imports → `archive/` with hashes.

---

## 6) Next Autonomous Steps
- Generate **Figma-ready UX spec pack** (component names, copy, a11y states).  
- Provide **example API handlers** (Node/Express + FastAPI) for `/teacher/plan` & `/learn/mission`.  
- Ship **seed content** for narrative missions (KS1–KS3 starters).  
- Draft **parent communication templates** (UK tone, safeguarding-aware).

