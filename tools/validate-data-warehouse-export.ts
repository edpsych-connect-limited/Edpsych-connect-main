/**
 * Validate Data Warehouse Export capability (repo-verifiable).
 *
 * This is intentionally deterministic and does NOT require a database connection.
 * It asserts that the export route exists, is API-key gated, and is tenant-scoped.
 */

import fs from 'node:fs';
import path from 'node:path';

function mustRead(rel: string): string {
  const abs = path.resolve(process.cwd(), rel);
  const content = fs.readFileSync(abs, 'utf8');
  if (!content) throw new Error(`Empty file: ${rel}`);
  return content;
}

function mustInclude(haystack: string, needle: string, rel: string): void {
  if (!haystack.includes(needle)) {
    throw new Error(`Missing required anchor in ${rel}: ${JSON.stringify(needle)}`);
  }
}

function main(): void {
  const routePath = 'src/app/api/integrations/data-warehouse/export/route.ts';
  const docPath = 'docs/API_ACCESS_DATA_WAREHOUSE_EXPORT.md';

  const route = mustRead(routePath);
  const doc = mustRead(docPath);

  // Route anchors
  mustInclude(route, "export const dynamic = 'force-dynamic'", routePath);
  mustInclude(route, 'DATA_WAREHOUSE_EXPORT_API_KEY', routePath);
  mustInclude(route, 'x-epc-export-key', routePath);

  // Tenant scoping anchors (either naming style may appear)
  if (!/tenantId/.test(route) && !/tenant_id/.test(route)) {
    throw new Error(`Missing tenant scoping anchor in ${routePath}: expected tenantId/tenant_id usage`);
  }

  // Docs anchors
  mustInclude(doc, 'Data Warehouse Export API', docPath);
  mustInclude(doc, 'x-epc-export-key', docPath);
  mustInclude(doc, 'DATA_WAREHOUSE_EXPORT_API_KEY', docPath);

  // Minimal guarantee for warehouse ingestion
  mustInclude(doc, '/api/integrations/data-warehouse/export', docPath);

  // Success
  // eslint-disable-next-line no-console
  console.log('data warehouse export validation passed');
}

main();
