import { Client } from 'pg';

export type ByodPostgresConnectionDetails = {
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  ssl_mode?: string;
};

export type ByodConnectionTestResult =
  | {
      ok: true;
      latencyMs: number;
      serverVersion?: string;
    }
  | {
      ok: false;
      latencyMs: number;
      error: string;
    };

function mapSslMode(sslMode: string | undefined): false | { rejectUnauthorized: boolean } {
  const mode = (sslMode || 'require').toLowerCase();

  // Conservative defaults: we require TLS but do not assume custom CA management.
  // If a customer needs strict verification, we can extend this to accept a CA bundle.
  if (mode === 'disable' || mode === 'off' || mode === 'false') return false;

  // 'require' and 'verify-full' both use TLS; for now we keep rejectUnauthorized=false
  // to support managed Postgres providers that use standard CAs without extra config.
  // A stricter mode can be introduced later with CA pinning.
  return { rejectUnauthorized: false };
}

export function redactByodDetails(details: ByodPostgresConnectionDetails): Omit<ByodPostgresConnectionDetails, 'password'> & { password: '[REDACTED]' } {
  return {
    ...details,
    password: '[REDACTED]',
  };
}

export async function testPostgresConnection(details: ByodPostgresConnectionDetails): Promise<ByodConnectionTestResult> {
  const startedAt = Date.now();

  const client = new Client({
    host: details.host,
    port: details.port ?? 5432,
    database: details.database,
    user: details.username,
    password: details.password,
    ssl: mapSslMode(details.ssl_mode),
    statement_timeout: 5000,
    query_timeout: 5000,
    connectionTimeoutMillis: 5000,
  });

  try {
    await client.connect();

    // Lightweight check that does not require any schema.
    const versionResult = await client.query<{ version: string }>('select version() as version');

    return {
      ok: true,
      latencyMs: Date.now() - startedAt,
      serverVersion: versionResult.rows?.[0]?.version,
    };
  } catch (e) {
    return {
      ok: false,
      latencyMs: Date.now() - startedAt,
      error: e instanceof Error ? e.message : String(e),
    };
  } finally {
    try {
      await client.end();
    } catch {
      // ignore
    }
  }
}
