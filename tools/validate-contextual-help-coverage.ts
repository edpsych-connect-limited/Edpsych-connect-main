import { getBestVideoSource } from '../src/lib/training/heygen-video-urls';
import { CONTEXTUAL_HELP_VIDEO_KEYS } from '../src/lib/guidance/contextual-help-video';

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

async function main() {
  const keys = uniq(Object.values(CONTEXTUAL_HELP_VIDEO_KEYS));

  const missing: string[] = [];
  const report: Array<{ key: string; ok: boolean; source?: string }> = [];

  for (const key of keys) {
    const best = getBestVideoSource(key);
    const ok = Boolean(best?.url);

    if (!ok) missing.push(key);

    report.push({
      key,
      ok,
      source: best ? (best.isLocal ? 'local' : 'heygen') : undefined,
    });
  }

  // Deterministic output.
  report.sort((a, b) => a.key.localeCompare(b.key));

  console.log('Contextual Help video coverage:');
  for (const r of report) {
    console.log(`- ${r.key}: ${r.ok ? 'OK' : 'MISSING'}${r.source ? ` (${r.source})` : ''}`);
  }

  if (missing.length > 0) {
    console.error(`\nERROR: Missing video sources for ${missing.length} contextual help key(s):`);
    for (const k of missing.sort()) console.error(`- ${k}`);
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error('validate-contextual-help-coverage failed:', e);
  process.exitCode = 1;
});
