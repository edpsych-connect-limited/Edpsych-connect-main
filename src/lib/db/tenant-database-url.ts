import { decryptFromString } from '@/lib/security/encryption';

export type TenantDatabaseConnectionDetails = {
  provider?: string;
  host: string;
  port?: number;
  database: string;
  username: string;
  password: string;
  ssl_mode?: string;
};

function looksLikeEncryptedString(value: string): boolean {
  // encryptToString produces iv:tag:content
  // We keep this heuristic intentionally simple and safe.
  return value.split(':').length === 3;
}

export function decryptPossiblyEncryptedPassword(storedPassword: string): string {
  if (!storedPassword) return storedPassword;

  if (looksLikeEncryptedString(storedPassword)) {
    try {
      return decryptFromString(storedPassword);
    } catch {
      // If it doesn't decrypt (e.g., legacy plaintext or wrong key), return as-is.
      return storedPassword;
    }
  }

  return storedPassword;
}

export function buildTenantDatabaseUrl(config: TenantDatabaseConnectionDetails): string {
  const provider = config.provider ?? 'postgresql';
  if (provider !== 'postgresql') {
    throw new Error(`Unsupported BYOD database provider: ${provider}`);
  }

  const port = config.port ?? 5432;
  const sslMode = config.ssl_mode ?? 'require';

  const username = encodeURIComponent(config.username);
  const password = encodeURIComponent(decryptPossiblyEncryptedPassword(config.password));
  const host = config.host;
  const database = config.database;

  // Note: we intentionally do not include additional connection params here.
  // If needed, add them in a controlled allowlist later.
  return `postgresql://${username}:${password}@${host}:${port}/${database}?sslmode=${encodeURIComponent(sslMode)}`;
}
